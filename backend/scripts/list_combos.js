import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Product from '../models/productModel.js';
import ProductVariant from '../models/productVariantModel.js';
import Category from '../models/categoryModel.js';

async function listAllCombos() {
  await mongoose.connect(process.env.MONGODB_URL, { dbName: 'OwnFresh' });
  const combos = await Product.find({ name: /combo/i });
  console.log(`Total Combo Products: ${combos.length}`);
  for (const c of combos) {
    console.log(`\nProduct ID: ${c._id}`);
    console.log(`Name: "${c.name}"`);
    const variants = await ProductVariant.find({ product: c._id });
    for (const v of variants) {
      console.log(`  Variant: "${v.name}" (price: ${v.price}, salePrice: ${v.salePrice}, status: ${v.status})`);
    }
  }
  await mongoose.disconnect();
}
listAllCombos();
