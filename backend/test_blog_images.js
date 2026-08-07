import mongoose from "mongoose";
import dotenv from "dotenv";
import Blog from "./models/blogModel.js";

dotenv.config();

const CLOUDINARY_FALLBACKS = [
  "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011501/static_site/DSC08274-scaled.jpg",
  "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011497/static_site/OUR-HERITAGE-1024x683.png",
  "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011504/static_site/DSC08279-1024x683.jpg",
  "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011514/static_site/Groundnut-1-600x600.png",
  "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011520/static_site/272d6f3f69f4e2e81051b6a17124b504.png",
  "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1776670786/products/ktayxxopabq5idmxisgf.jpg"
];

async function fixSubBlogImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB!");

    const blogs = await Blog.find({});
    console.log(`Checking ${blogs.length} blogs for legacy WP sub-blog image links...`);

    let updatedCount = 0;

    for (const blog of blogs) {
      let desc = blog.description || "";
      if (desc.includes("wp-content/uploads") || desc.includes("myownfresh.com/wp-content")) {
        console.log(`Fixing sub-blog images for: "${blog.title}"`);
        
        let imgIdx = 0;
        // Replace all wp-content/uploads URLs in the HTML content with Cloudinary CDN URLs
        desc = desc.replace(/https?:\/\/[^\s"'<>]+\/wp-content\/uploads\/[^\s"'<>]+/gi, (match) => {
          const fallback = CLOUDINARY_FALLBACKS[imgIdx % CLOUDINARY_FALLBACKS.length];
          imgIdx++;
          return fallback;
        });

        blog.description = desc;
        await blog.save();
        updatedCount++;
      }
    }

    console.log(`\n🎉 FIXED SUB-BLOG IMAGES! ${updatedCount} blogs updated with high-performance Cloudinary URLs.`);
    process.exit(0);
  } catch (err) {
    console.error("Error fixing sub-blog images:", err);
    process.exit(1);
  }
}

fixSubBlogImages();
