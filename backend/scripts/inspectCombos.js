import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/productModel.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const inspect = async () => {
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    await mongoose.connect(MONGODB_URL);
    
    const combos = await Product.find({ name: { $regex: /combo/i } });
    console.log(`Found ${combos.length} combo products:`);
    
    combos.forEach(c => {
      console.log(`\nProduct: "${c.name}" | ID: ${c._id}`);
      console.log(`  SKU: "${c.sku}"`);
      console.log(`  Image: "${c.image}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

inspect();
