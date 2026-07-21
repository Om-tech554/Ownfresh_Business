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
