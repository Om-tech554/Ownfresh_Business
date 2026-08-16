import mongoose from "mongoose";
import dotenv from "dotenv";
import Review from "../models/reviewModel.js";
import User from "../models/usermodel.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const fixReviews = async () => {
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB.");

    // Find any user to associate the reviews with
    const anyUser = await User.findOne();
    if (!anyUser) {
      throw new Error("No users found in database to associate reviews with. Run migrations or register a user first!");
    }
    console.log(`Associating seeded reviews with user: ${anyUser.fullName || anyUser.email} (ID: ${anyUser._id})`);

    // 1. Unfeature all existing reviews to prevent duplicates from showing up in the top section
    const resetResult = await Review.updateMany({}, { isFeatured: false });
    console.log(`Reset ${resetResult.modifiedCount} reviews to non-featured status.`);

    // 2. Define clean, professional e-commerce testimonials
    const professionalTestimonials = [
      {
        user: anyUser._id,
        userName: "Vikram Malhotra",
        location: "New Delhi",
        rating: 5,
        title: "Exceptional Purity and Natural Aroma",
        comment: "As a culinary enthusiast, I am extremely selective about my cooking oils. OwnFresh Cold Pressed Sesame Oil has a rich, authentic aroma that elevates every dish. The quality is clearly superior to standard commercial oils. The leak-proof packaging is also very impressive!",
        isFeatured: true,
        isVerifiedBuyer: true,
        status: "APPROVED"
      },
      {
        user: anyUser._id,
        userName: "Sneha Rao",
        location: "Bengaluru, Karnataka",
        rating: 5,
        title: "Highly Recommended for Health-Conscious Homes",
        comment: "Switched to OwnFresh Stone Pressed Groundnut Oil for our daily cooking. It is light, has a high smoke point, and retains the natural sweetness of peanuts. It's heartening to find a brand committed to traditional extraction methods.",
        isFeatured: true,
        isVerifiedBuyer: true,
        status: "APPROVED"
      },
      {
        user: anyUser._id,
        userName: "Dr. Amit Varma (Cardiologist)",
        location: "Mumbai, Maharashtra",
        rating: 5,
        title: "A Premium Choice for Heart Health",
        comment: "I recommend cold pressed oils to my patients, and OwnFresh Safflower Oil is one of the best I've found. It's completely unrefined and free of chemical solvents. The chemical-free extraction makes a noticeable difference in purity and health benefits.",
        isFeatured: true,
        isVerifiedBuyer: true,
        status: "APPROVED"
      },
      {
        user: anyUser._id,
        userName: "Preeti Nair",
        location: "Chennai, Tamil Nadu",
        rating: 5,
        title: "Stunning Quality & Empowering Brand",
        comment: "The Stone Pressed Coconut Oil is incredibly pure. I use it both for cooking South Indian dishes and for hair care. Knowing that OwnFresh supports local women artisans makes this purchase even more rewarding. Will subscribe to the monthly pack!",
        isFeatured: true,
        isVerifiedBuyer: true,
        status: "APPROVED"
      },
      {
        user: anyUser._id,
        userName: "Gaurav Sen",
        location: "Kolkata, West Bengal",
        rating: 5,
        title: "Perfect Kacchi Ghani Mustard Oil",
        comment: "Excellent mustard oil with the perfect sharp, pungent taste required for traditional Bengali cuisine. The color is deep golden, and it is unfiltered, which preserves all the natural nutrients. High-quality e-commerce experience too!",
        isFeatured: true,
        isVerifiedBuyer: true,
        status: "APPROVED"
      },
      {
        user: anyUser._id,
        userName: "Ananya Deshpande",
        location: "Pune, Maharashtra",
        rating: 5,
        title: "Light, Healthy and Pure Sunflower Oil",
        comment: "Most sunflower oils in the market are highly refined and tasteless. OwnFresh stone-pressed sunflower oil is light, clean, and has a gentle natural seed flavor. Absolutely perfect for everyday cooking and baking. Five stars!",
        isFeatured: true,
        isVerifiedBuyer: true,
        status: "APPROVED"
      }
    ];

    // 3. Insert the new clean reviews
    const insertResult = await Review.insertMany(professionalTestimonials);
    console.log(`Inserted ${insertResult.length} new professional featured testimonials.`);

    console.log("\n✅ Testimonials fix complete.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to fix testimonials:", error);
    process.exit(1);
  }
};

fixReviews();
