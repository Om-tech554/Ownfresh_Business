import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URL, { dbName: "OwnFresh" });
  console.log("Connected to DB");

  const products = await Product.find({}).populate("category");
  console.log(`Found ${products.length} products`);

  for (const p of products) {
    const variants = await ProductVariant.find({ product: p._id }).sort({ price: 1 });
    console.log(`\nPRODUCT: "${p.name}" (ID: ${p._id})`);
    for (const v of variants) {
      console.log(`  - Variant "${v.name}" (Size: "${v.size}"): price (MRP)=${v.price}, salePrice=${v.salePrice}, status=${v.status}`);
    }
  }

  await mongoose.disconnect();
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
