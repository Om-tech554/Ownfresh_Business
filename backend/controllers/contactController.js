import Contact from "../models/Contact.js";
import { sendContactMail } from "../utils/mail.js";

export const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // 📧 Send email notification
    try {
        await sendContactMail(name, email, message);
    } catch (mailError) {
        console.error("Failed to send contact email:", mailError);
        // We continue because the message was saved to DB
    }

    res.status(201).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
