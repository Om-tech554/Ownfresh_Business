import User from "../models/usermodel.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId is not found" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "user is not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get current user error ${error}` });
  }
};

// Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin: Update user details
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, wallet, mobile } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (role) user.role = role;
    if (wallet !== undefined) user.wallet = wallet;
    if (mobile !== undefined) {
      user.mobile = (mobile === null || mobile === "") ? undefined : mobile;
    }

    await user.save();

    return res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Mobile number already in use" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin: Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin: Manually Create a Single Customer Profile
export const createCustomer = async (req, res) => {
  try {
    const { fullName, email, mobile, password, role, wallet } = req.body;

    if (!fullName || (!email && !mobile)) {
      return res.status(400).json({
        success: false,
        message: "Full Name and either Email or Mobile are required"
      });
    }

    // Check existing
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Customer email already exists" });
      }
    }

    if (mobile) {
      const existingMobile = await User.findOne({ mobile: mobile.trim() });
      if (existingMobile) {
        return res.status(400).json({ success: false, message: "Customer mobile number already exists" });
      }
    }

    const bcrypt = (await import("bcryptjs")).default;
    const rawPass = password && password.trim() ? password.trim() : "OwnFresh@123";
    const hashedPassword = await bcrypt.hash(rawPass, 10);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email ? email.toLowerCase().trim() : undefined,
      mobile: mobile ? mobile.trim() : undefined,
      password: hashedPassword,
      role: role || "user",
      wallet: wallet ? Number(wallet) : 0,
      isMember: false
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: "Customer profile created successfully",
      user: userObj
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Duplicate email or mobile number" });
    }
    return res.status(500).json({ success: false, message: "Failed to create customer" });
  }
};

// Admin: Bulk Import Customers from CSV/XLS
export const bulkCreateCustomers = async (req, res) => {
  try {
    const { customers } = req.body; // Array of customer objects

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ success: false, message: "No customer records provided for import" });
    }

    const bcrypt = (await import("bcryptjs")).default;
    const defaultHashedPassword = await bcrypt.hash("OwnFresh@123", 10);

    let createdCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (let i = 0; i < customers.length; i++) {
      const item = customers[i];
      const fullName = (item.fullName || item.name || item.Name || "").toString().trim();
      const email = (item.email || item.Email || "").toString().toLowerCase().trim();
      const mobile = (item.mobile || item.Mobile || item.phone || item.Phone || "").toString().trim();

      if (!fullName) {
        skippedCount++;
        errors.push(`Row ${i + 1}: Missing Full Name`);
        continue;
      }

      if (!email && !mobile) {
        skippedCount++;
        errors.push(`Row ${i + 1} (${fullName}): Needs email or mobile number`);
        continue;
      }

      // Check duplicates
      let isDuplicate = false;
      if (email) {
        const existEmail = await User.findOne({ email });
        if (existEmail) isDuplicate = true;
      }
      if (!isDuplicate && mobile) {
        const existMobile = await User.findOne({ mobile });
        if (existMobile) isDuplicate = true;
      }

      if (isDuplicate) {
        skippedCount++;
        errors.push(`Row ${i + 1} (${fullName}): Duplicate email or mobile`);
        continue;
      }

      const passToUse = item.password && item.password.toString().trim()
        ? await bcrypt.hash(item.password.toString().trim(), 10)
        : defaultHashedPassword;

      await User.create({
        fullName,
        email: email || undefined,
        mobile: mobile || undefined,
        password: passToUse,
        role: "user",
        wallet: Number(item.wallet || 0) || 0
      });

      createdCount++;
    }

    return res.status(200).json({
      success: true,
      message: `Bulk import completed! Successfully imported ${createdCount} customers (${skippedCount} skipped/duplicates).`,
      createdCount,
      skippedCount,
      errors
    });
  } catch (error) {
    console.error("Error bulk creating customers:", error);
    return res.status(500).json({ success: false, message: "Bulk import failed" });
  }
};
