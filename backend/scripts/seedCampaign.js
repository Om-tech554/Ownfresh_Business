import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Coupon from "../models/couponModel.js";
import Campaign from "../models/campaignModel.js";
import cloudinary from "../utils/cloudinary.js";
import path from "path";
import fs from "fs";

const seed = async () => {
  try {
    await connectDB();
    console.log("Connected to database.");

    // 1) Find or Create Promo Code RAKSHA18
    let coupon = await Coupon.findOne({ code: "RAKSHA18" });
    if (!coupon) {
      coupon = await Coupon.create({
        code: "RAKSHA18",
        discountType: "PERCENTAGE",
        discountValue: 18,
        minimumOrderAmount: 0,
        maximumDiscountAmount: 150,
        usageLimit: null,
        perUserLimit: 1,
        startDate: new Date("2026-08-20T00:00:00Z"),
        expiryDate: new Date("2026-09-30T23:59:59Z"),
        isActive: true,
        applicableUsers: "ALL_USERS"
      });
      console.log("Created coupon RAKSHA18.");
    } else {
      coupon.discountType = "PERCENTAGE";
      coupon.discountValue = 18;
      coupon.maximumDiscountAmount = 150;
      coupon.isActive = true;
      coupon.startDate = new Date("2026-08-20T00:00:00Z");
      coupon.expiryDate = new Date("2026-09-30T23:59:59Z");
      await coupon.save();
      console.log("Updated coupon RAKSHA18 config.");
    }

    // 2) Upload images to Cloudinary
    const desktopImagePath = "C:\\Users\\cchan\\.gemini\\antigravity-ide\\brain\\dad7797e-9cba-414e-b479-e6629e453cf0\\.user_uploaded\\media_1787477270680.jpg";
    const mobileImagePath = "C:\\Users\\cchan\\.gemini\\antigravity-ide\\brain\\dad7797e-9cba-414e-b479-e6629e453cf0\\.user_uploaded\\media_1787477270733.jpg";

    if (!fs.existsSync(desktopImagePath)) {
      throw new Error(`Desktop image not found at ${desktopImagePath}`);
    }
    if (!fs.existsSync(mobileImagePath)) {
      throw new Error(`Mobile image not found at ${mobileImagePath}`);
    }

    console.log("Uploading desktop banner image to Cloudinary...");
    const desktopUpload = await cloudinary.uploader.upload(desktopImagePath, {
      folder: "campaigns"
    });
    console.log("Desktop banner uploaded. URL:", desktopUpload.secure_url);

    console.log("Uploading mobile banner image to Cloudinary...");
    const mobileUpload = await cloudinary.uploader.upload(mobileImagePath, {
      folder: "campaigns"
    });
    console.log("Mobile banner uploaded. URL:", mobileUpload.secure_url);

    // 3) Create or Update Campaigns (We will seed both as active campaigns to show a carousel)
    await Campaign.deleteMany({ festivalName: "Raksha Bandhan" });

    // Seed Campaign 1: Mustard Oil Special
    const campaign1 = await Campaign.create({
      festivalName: "Raksha Bandhan",
      title: "Raksha Bandhan Special - Mustard Oil",
      description: "Happy Raksha Bandhan. Tied with tradition, sealed with love. Bring home purity with OwnFresh Mustard Oil.",
      bannerImage: desktopUpload.secure_url,
      mobileBannerImage: desktopUpload.secure_url,
      promoCode: coupon._id,
      startDate: new Date("2026-08-20T00:00:00Z"),
      endDate: new Date("2026-09-10T23:59:59Z"),
      status: "Active",
      ctaText: "Shop Now",
      ctaUrl: "/shop",
      priority: 10,
      showCountdown: true
    });
    console.log("Created Raksha Bandhan Campaign 1 (Mustard Oil).");

    // Seed Campaign 2: Groundnut Oil Special
    const campaign2 = await Campaign.create({
      festivalName: "Raksha Bandhan",
      title: "Raksha Bandhan Special - Groundnut Oil",
      description: "Happy Raksha Bandhan. Just like Rakhi, our bond is pure - serving you fresh, homemade goodness always.",
      bannerImage: mobileUpload.secure_url,
      mobileBannerImage: mobileUpload.secure_url,
      promoCode: coupon._id,
      startDate: new Date("2026-08-20T00:00:00Z"),
      endDate: new Date("2026-09-10T23:59:59Z"),
      status: "Active",
      ctaText: "Shop Now",
      ctaUrl: "/shop",
      priority: 9,
      showCountdown: true
    });
    console.log("Created Raksha Bandhan Campaign 2 (Groundnut Oil).");

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seed();
