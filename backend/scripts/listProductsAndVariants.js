import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";
import Category from "../models/categoryModel.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const listData = async () => {
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    if (!MONGODB_URL) throw new Error("MONGODB_URL is missing in .env");
    
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB.");

    const categories = await Category.find();
    console.log(`\n--- Categories (${categories.length}) ---`);
    categories.forEach(c => console.log(`- ${c.name} (ID: ${c._id})`));

    const products = await Product.find().populate("category");
    console.log(`\n--- Products (${products.length}) ---`);
    for (const p of products) {
      console.log(`\nProduct: ${p.name} | Category: ${p.category?.name} | Status: ${p.status} | ID: ${p._id}`);
      const variants = await ProductVariant.find({ product: p._id });
      console.log(`  Variants (${variants.length}):`);
      variants.forEach(v => {
        console.log(`    - ${v.name} | Price: ${v.price} | Sale Price: ${v.salePrice} | Stock: ${v.stockQuantity} | Status: ${v.status} | ID: ${v._id}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

listData();
