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
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB.");

    const products = await Product.find({
      name: { $regex: /(sunflower|safflower|groundnut|sesame|mustard|coconut|trial|combo)/i }
    }).populate("category");

    console.log(`Found ${products.length} matching products.`);

    for (const p of products) {
      console.log(`\nProduct: ${p.name} | Category: ${p.category?.name} | ID: ${p._id}`);
      const variants = await ProductVariant.find({ product: p._id });
      variants.forEach(v => {
        console.log(`  - Variant: "${v.name}" | SKU: ${v.sku} | Price: ${v.price} | SalePrice: ${v.salePrice} | ID: ${v._id}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

listData();
