import mongoose from "mongoose";
import dotenv from "dotenv";
import Blog from "./models/blogModel.js";
import Product from "./models/productModel.js";
import Category from "./models/categoryModel.js";

dotenv.config();

async function inspectDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB!");

    // 1. Inspect Blogs
    const blogs = await Blog.find({});
    console.log(`\n================ Total Blogs in DB: ${blogs.length} ================`);
    blogs.slice(0, 5).forEach((b, idx) => {
      console.log(`Blog #${idx + 1}: ${b.title}`);
      console.log(` - Image: ${b.image}`);
      console.log(` - Category: ${b.category}`);
      // Find sub-images inside description HTML
      const desc = b.description || "";
      const imgs = [...desc.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
      console.log(` - Sub Blog Images inside content (${imgs.length}):`, imgs.slice(0, 5));
    });

    // Extract all sub blog images across ALL blogs
    let allSubBlogImages = [];
    blogs.forEach(b => {
      const desc = b.description || "";
      const imgs = [...desc.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
      allSubBlogImages = [...allSubBlogImages, ...imgs];
    });
    console.log(`\n🎉 Total sub-blog inline images found in DB content: ${allSubBlogImages.length}`);
    if (allSubBlogImages.length > 0) {
      console.log("Sample sub-blog image URLs:", allSubBlogImages.slice(0, 10));
    }

    // 2. Inspect Categories
    const categories = await Category.find({});
    console.log(`\n================ Total Product Categories in DB: ${categories.length} ================`);
    categories.forEach(c => {
      console.log(` - Category: "${c.name}", Status: ${c.status || 'Active'}, Image: ${c.image}`);
    });

    // 3. Inspect Products
    const products = await Product.find({}).populate("category");
    console.log(`\n================ Total Products in DB: ${products.length} ================`);
    const productCategoryCounts = {};
    products.forEach(p => {
      const catName = p.category?.name || p.category || "Uncategorized";
      productCategoryCounts[catName] = (productCategoryCounts[catName] || 0) + 1;
    });
    console.log("Products per category:", productCategoryCounts);
    products.slice(0, 5).forEach(p => {
      console.log(` - Product: ${p.name}, Price: ₹${p.price}, Category: ${p.category?.name || p.category}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("DB Inspect error:", err);
    process.exit(1);
  }
}

inspectDb();
