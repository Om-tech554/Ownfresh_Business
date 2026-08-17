import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";
import Category from "../models/categoryModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const dumpData = async () => {
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    await mongoose.connect(MONGODB_URL);

    const categories = await Category.find();
    const products = await Product.find().populate("category");
    
    let output = "";
    output += `--- Categories (${categories.length}) ---\n`;
    categories.forEach(c => {
      output += `- ${c.name} (ID: ${c._id})\n`;
    });

    output += `\n--- Products (${products.length}) ---\n`;
    for (const p of products) {
      output += `\nProduct: "${p.name}"\n  Category: ${p.category?.name}\n  ID: ${p._id}\n  Status: ${p.status}\n`;
      const variants = await ProductVariant.find({ product: p._id });
      output += `  Variants (${variants.length}):\n`;
      variants.forEach(v => {
        output += `    - "${v.name}" | Price: ${v.price} | Sale Price: ${v.salePrice} | Stock: ${v.stockQuantity} | Status: ${v.status} | ID: ${v._id}\n`;
      });
    }

    fs.writeFileSync(path.join(__dirname, "product_dump.txt"), output);
    console.log("Dump written to product_dump.txt successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

dumpData();
