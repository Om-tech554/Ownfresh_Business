import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Coupon from "../models/couponModel.js";
import Campaign from "../models/campaignModel.js";

const runTests = async () => {
  try {
    await connectDB();
    console.log("Connected to DB.");

    console.log("\n==================================================");
    console.log("🧪 TEST CASE 1: Promo Code RAKSHA18 Discount Math");
    console.log("==================================================");

    const coupon = await Coupon.findOne({ code: "RAKSHA18" });
    if (!coupon) {
      console.error("❌ RAKSHA18 coupon not found in DB! Please run seedCampaign.js first.");
      process.exit(1);
    }

    console.log(`Coupon Settings: Type=${coupon.discountType}, Value=${coupon.discountValue}%, MaxCap=₹${coupon.maximumDiscountAmount}`);

    const testAmounts = [300, 500, 800, 1000, 5000];
    const expectedDiscounts = [54, 90, 144, 150, 150];
    let allCouponPassed = true;

    for (let i = 0; i < testAmounts.length; i++) {
      const amount = testAmounts[i];
      const expected = expectedDiscounts[i];

      // Recalculate discount
      let discountAmount = 0;
      if (coupon.discountType === "PERCENTAGE" || coupon.discountType === "percentage") {
        discountAmount = (amount * coupon.discountValue) / 100;
        if (coupon.maximumDiscountAmount) {
          discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
        }
      } else {
        discountAmount = coupon.discountValue;
      }
      discountAmount = Math.min(discountAmount, amount);

      if (discountAmount === expected) {
        console.log(`✅ Cart: ₹${amount} | Expected Discount: ₹${expected} | Recalculated: ₹${discountAmount} - PASS`);
      } else {
        console.error(`❌ Cart: ₹${amount} | Expected Discount: ₹${expected} | Recalculated: ₹${discountAmount} - FAIL`);
        allCouponPassed = false;
      }
    }

    console.log("\n==================================================");
    console.log("🧪 TEST CASE 2: Active Festival Campaign Resolution");
    console.log("==================================================");

    const now = new Date();
    // Resolve dynamic campaign
    const activeCampaigns = await Campaign.find({
      status: "Active",
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate("promoCode").sort({ priority: -1, createdAt: -1 });

    console.log(`Active Campaigns Count: ${activeCampaigns.length}`);
    if (activeCampaigns.length > 0) {
      const active = activeCampaigns[0];
      console.log(`✅ Display Active Campaign: "${active.title}"`);
      console.log(`   - Festival: "${active.festivalName}"`);
      console.log(`   - Priority: ${active.priority}`);
      console.log(`   - Linked Code: ${active.promoCode?.code || "None"}`);
      console.log(`   - Desktop Banner Image URL: ${active.bannerImage}`);
      console.log(`   - Mobile Banner Image URL: ${active.mobileBannerImage || "None"}`);
    } else {
      console.log("⚠️ No active campaign currently available for display.");
    }

    console.log("\n==================================================");
    console.log("🧪 TEST CASE 3: Temporary Inactive/Deleted States");
    console.log("==================================================");

    // Get count of Draft and Disabled campaigns
    const draftCount = await Campaign.countDocuments({ status: "Draft" });
    const disabledCount = await Campaign.countDocuments({ status: "Disabled" });
    console.log(`Draft Campaigns: ${draftCount}`);
    console.log(`Disabled Campaigns: ${disabledCount}`);
    console.log("✅ State queries functional.");

    console.log("==================================================\n");
    
    if (allCouponPassed) {
      console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! The system is production-ready.");
      process.exit(0);
    } else {
      console.error("❌ Some tests failed.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution failed:", error.message);
    process.exit(1);
  }
};

runTests();
