import Newsletter from "../models/newsletterModel.js";

export const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check duplicate
    const existingEmail = await Newsletter.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ message: "Already subscribed!" });
    }

    await Newsletter.create({ email });

    res.status(200).json({ message: "Subscribed successfully 🎉" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
