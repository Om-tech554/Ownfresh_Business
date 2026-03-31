import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import Blog from "./models/blogModel.js"; // Ensure path is correct

dotenv.config();

const WP_API_URL = "https://myownfresh.com/wp-json/wp/v2/posts?_embed&per_page=100";

const migrateBlogs = async () => {
    try {
        if (!process.env.MONGODB_URL) {
            console.error("MONGODB_URL is missing in your .env file!");
            process.exit(1);
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB successfully!");

        console.log(`Fetching WordPress posts from ${WP_API_URL}...`);
        const response = await axios.get(WP_API_URL);
        const wpPosts = response.data;

        if (!wpPosts || wpPosts.length === 0) {
            console.log("No posts found in WordPress.");
            process.exit(0);
        }

        console.log(`Found ${wpPosts.length} posts. Preparing to migrate...`);

        let insertedCount = 0;

        for (const post of wpPosts) {
            // Find the featured image URL (default to fallback if none)
            const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url 
                || "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1";

            // Extract the creation date
            const createdAt = new Date(post.date);

            // Clean title (remove HTML entities if needed or just use rendered string)
            const title = post.title?.rendered || "Untitled Post";

            // Full content
            const contentHTML = post.content?.rendered || "";

            // Create a new Blog document matching the local model
            const newBlog = new Blog({
                title: title,
                description: contentHTML, // The rich text editor outputs HTML just like this
                image: imageUrl,
                category: "Other", // Default category; can be edited in the admin panel later
            });

            // We explicitly set createdAt to retain original post date
            // The schema has { timestamps: true }, so we override the createdAt
            newBlog.createdAt = createdAt;

            await newBlog.save();
            insertedCount++;
            console.log(`[${insertedCount}/${wpPosts.length}] Migrated: ${title}`);
        }

        console.log(`\n✅ Migration complete! Successfully transferred ${insertedCount} blogs.`);
        console.log("You can now safely take down your WordPress website.");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error.message);
        process.exit(1);
    }
};

migrateBlogs();
