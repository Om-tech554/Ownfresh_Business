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

    // Auto-generate referral code for existing users if missing
    if (!user.referralCode) {
      const gCode = () => "OWN-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      let newCode = gCode();
      while (await User.findOne({ referralCode: newCode })) {
        newCode = gCode();
      }
      user.referralCode = newCode;
      await user.save();
    }

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get current user error ${error}` });
  }
};
