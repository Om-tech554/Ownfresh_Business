import mongoose from "mongoose";
import dotenv from "dotenv";
import Review from "../models/reviewModel.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const inspect = async () => {
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB.");

    const reviews = await Review.find();
    console.log(`Found ${reviews.length} reviews:`);

    reviews.forEach((r, i) => {
      console.log(`\n[${i+1}] Review ID: ${r._id}`);
      console.log(`  User: ${r.userName} | Location: ${r.location}`);
      console.log(`  Rating: ${r.rating} | Title: "${r.title}"`);
      console.log(`  Comment: "${r.comment}"`);
      console.log(`  Status: ${r.status} | Featured: ${r.isFeatured}`);
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

inspect();
