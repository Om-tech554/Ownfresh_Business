import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import Blog from "./models/blogModel.js";

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const WP_IP = "82.112.229.195";

async function downloadAndUploadToCloudinary(wpImgUrl) {
  try {
    // Extract path relative to wp-content/uploads/
    const urlObj = new URL(wpImgUrl);
    const relativePath = urlObj.pathname; // e.g. /wp-content/uploads/2026/03/foo.png

    // Fetch binary from WP IP with Host header
    const response = await axios.get(`http://${WP_IP}${relativePath}`, {
      headers: { Host: "myownfresh.com" },
      responseType: "arraybuffer",
      timeout: 10000
    });

    const buffer = Buffer.from(response.data);
    const base64Str = `data:${response.headers["content-type"] || "image/png"};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const uploadRes = await cloudinary.v2.uploader.upload(base64Str, {
      folder: "ownfresh_subblog_photos",
      resource_type: "image"
    });

    return uploadRes.secure_url;
  } catch (error) {
    console.error(`❌ Failed to process ${wpImgUrl}:`, error.message);
    return null;
  }
}

async function migrateSubBlogPhotos() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB database!");

    const blogs = await Blog.find({});
    console.log(`Found ${blogs.length} blogs in database.`);

    const urlCache = new Map(); // Prevent duplicate uploads of identical images
    let totalReplaced = 0;

    for (const blog of blogs) {
      let desc = blog.description || "";
      const matches = [...desc.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];

      if (matches.length === 0) continue;

      let blogModified = false;

      for (const match of matches) {
        const originalUrl = match[1];

        if (originalUrl.includes("wp-content/uploads") || originalUrl.includes("myownfresh.com/wp-content")) {
          console.log(`Processing image for Blog "${blog.title.substring(0, 30)}...": ${originalUrl}`);

          let cloudinaryUrl = urlCache.get(originalUrl);

          if (!cloudinaryUrl) {
            cloudinaryUrl = await downloadAndUploadToCloudinary(originalUrl);
            if (cloudinaryUrl) {
              urlCache.set(originalUrl, cloudinaryUrl);
              console.log(` ✅ Uploaded -> ${cloudinaryUrl}`);
            }
          } else {
            console.log(` ⚡ Used cached URL -> ${cloudinaryUrl}`);
          }

          if (cloudinaryUrl) {
            desc = desc.split(originalUrl).join(cloudinaryUrl);
            blogModified = true;
            totalReplaced++;
          }
        }
      }

      if (blogModified) {
        blog.description = desc;
        await blog.save();
        console.log(`💾 Saved updated blog: "${blog.title}"`);
      }
    }

    console.log(`\n🎉 SUB-BLOG IMAGE MIGRATION COMPLETE! Total ${totalReplaced} sub-blog images updated to Cloudinary.`);
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrateSubBlogPhotos();
