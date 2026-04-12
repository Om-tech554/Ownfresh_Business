import mongoose from "mongoose";
import dotenv from "dotenv";
import Blog from "../models/blogModel.js";
import { bloggerService } from "../utils/bloggerService.js";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const syncBlogs = async () => {
    try {
        console.log("🚀 Starting Bulk Blog Sync to Blogger...");
        
        // 1. Connect to Database
        const MONGODB_URL = process.env.MONGODB_URL;
        if (!MONGODB_URL) throw new Error("MONGODB_URL is missing in .env");
        
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to MongoDB.");

        // 2. Fetch blogs that are NOT yet synced (missing bloggerId)
        const result = await bloggerService.syncAllPendingBlogs();
        
        if (result.success) {
            console.log(`\n--- Sync Summary ---`);
            console.log(`✅ Successfully Synced: ${result.count}`);
            console.log(`📊 Total Pending Processed.`);
            console.log("---------------------\n");
        } else {
            console.error("❌ Sync Script Failed:", result.error);
        }

        process.exit(0);

    } catch (error) {
        console.error("🔥 Critical Error during sync script execution:", error);
        process.exit(1);
    }
};

syncBlogs();
