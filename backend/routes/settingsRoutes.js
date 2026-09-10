import express from "express";
import Settings from "../models/settingsModel.js";
import isAuth, { isAdmin } from "../middleware/isAuth.js";

const router = express.Router();

// Default values fallback
const DEFAULTS = {
  announcement: "🎉 FREE SHIPPING ON ORDERS ABOVE ₹999 | TRADITIONAL STONE PRESSED BOTANIC OILS",
  announcement1: "🎉 FREE SHIPPING ON ORDERS ABOVE ₹999",
  announcement2: "🌿 AUTHENTIC TRADITIONAL STONE PRESSED BOTANIC OILS",
  announcement3: "👑 JOIN PRIME 1% TO EARN REDEEMABLE COIN COMMISSIONS",
  announcement4: "📦 EXPRESS 2-DAY DELIVERY ACROSS INDIA",
  announcement_weight: "black"
};

// GET setting by key
router.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ key });
    
    if (!setting) {
      return res.status(200).json({ 
        success: true, 
        key, 
        value: DEFAULTS[key] || "" 
      });
    }

    res.status(200).json({ success: true, key, value: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE/CREATE setting by key (Admin Only)
router.put("/:key", isAuth, isAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({ success: false, message: "Value is required" });
    }

    let setting = await Settings.findOne({ key });

    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = new Settings({ key, value });
      await setting.save();
    }

    res.status(200).json({ success: true, message: "Setting updated successfully", key, value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
