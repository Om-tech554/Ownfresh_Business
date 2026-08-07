import mongoose from "mongoose";
import dotenv from "dotenv";
import Blog from "./models/blogModel.js";

dotenv.config();

async function removeSubBlogImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB!");

    const blogs = await Blog.find({});
    console.log(`Processing ${blogs.length} blogs to remove inline sub-blog images...`);

    let updatedCount = 0;
    let totalImagesRemoved = 0;

    for (const blog of blogs) {
      let desc = blog.description || "";
      
      // Count images before removal
      const imgMatches = [...desc.matchAll(/<img[^>]*>/gi)];
      
      if (imgMatches.length > 0) {
        // Remove all <img> tags, figure wrappers, or p wrappers if they only contain an image
        let cleanedDesc = desc.replace(/<figure[^>]*>\s*<img[^>]*>\s*(<figcaption[^>]*>.*?<\/figcaption>)?\s*<\/figure>/gi, "");
        cleanedDesc = cleanedDesc.replace(/<p[^>]*>\s*<img[^>]*>\s*<\/p>/gi, "");
        cleanedDesc = cleanedDesc.replace(/<img[^>]*>/gi, "");

        blog.description = cleanedDesc;
        await blog.save();
        
        updatedCount++;
        totalImagesRemoved += imgMatches.length;
        console.log(`✂️ Removed ${imgMatches.length} inline image(s) from Blog: "${blog.title.substring(0, 40)}..."`);
      }
    }

    console.log(`\n🎉 REMOVAL COMPLETE! Total ${totalImagesRemoved} inline sub-blog images removed across ${updatedCount} blog posts.`);
    console.log("Blog contents are now clean and ready for you to upload images via the Admin Panel!");

    process.exit(0);
  } catch (err) {
    console.error("Error removing sub-blog images:", err);
    process.exit(1);
  }
}

removeSubBlogImages();
