import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Campaign from "../models/campaignModel.js";

const debug = async () => {
  try {
    await connectDB();
    console.log("Connected to DB.");

    const campaigns = await Campaign.find({});
    console.log(`Found ${campaigns.length} campaigns in DB.`);

    for (const c of campaigns) {
      console.log(`\n----------------------------------------`);
      console.log(`Campaign: ID=${c._id}, Title="${c.title}", Status="${c.status}"`);
      console.log(`festivalName: "${c.festivalName}"`);
      console.log(`bannerImage: "${c.bannerImage}"`);
      console.log(`promoCode: "${c.promoCode}"`);
      console.log(`startDate: ${c.startDate}`);
      console.log(`endDate: ${c.endDate}`);

      // Try validating the document
      try {
        await c.validate();
        console.log("✅ Mongoose validation: PASSED");
      } catch (valErr) {
        console.error("❌ Mongoose validation: FAILED");
        console.error(valErr);
      }

      // Try updating status and saving
      try {
        const nextStatus = c.status === "Active" ? "Disabled" : "Active";
        console.log(`Attempting status toggle: "${c.status}" -> "${nextStatus}"...`);
        c.status = nextStatus;
        await c.save();
        console.log("✅ Database save: SUCCESS");
        
        // Toggle back to keep original state
        c.status = nextStatus === "Active" ? "Disabled" : "Active";
        await c.save();
        console.log("✅ Database save (revert): SUCCESS");
      } catch (saveErr) {
        console.error("❌ Database save: FAILED");
        console.error(saveErr);
      }
    }

    console.log(`\nDebug run completed.`);
    process.exit(0);
  } catch (error) {
    console.error("Debug script failed:", error);
    process.exit(1);
  }
};

debug();
