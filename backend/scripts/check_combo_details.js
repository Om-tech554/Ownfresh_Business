import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Product from '../models/productModel.js';
import ProductVariant from '../models/productVariantModel.js';

async function checkAllCombos() {
  await mongoose.connect(process.env.MONGODB_URL, { dbName: 'OwnFresh' });
  const combos = await Product.find({ name: /combo/i });
  for (const c of combos) {
    console.log(`\n======================================================`);
    console.log(`ID: ${c._id}`);
    console.log(`Name: ${c.name}`);
    console.log(`Image: ${c.image}`);
    const variants = await ProductVariant.find({ product: c._id });
    console.log(`Variants:`);
    for (const v of variants) {
      console.log(`  "${v.name}": MRP=${v.price}, Sale=${v.salePrice}`);
    }
  }
  await mongoose.disconnect();
}
checkAllCombos();
