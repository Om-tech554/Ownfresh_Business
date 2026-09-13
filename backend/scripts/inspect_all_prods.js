import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Product from '../models/productModel.js';
import ProductVariant from '../models/productVariantModel.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URL, { dbName: 'OwnFresh' });
  const prods = await Product.find({});
  console.log(`Total Products: ${prods.length}`);
  for (const p of prods) {
    const vars = await ProductVariant.find({ product: p._id });
    console.log(`\nProduct: "${p.name}" (ID: ${p._id})`);
    for (const v of vars) {
      console.log(`   Variant: "${v.name}" | Size: "${v.size}" | price: ${v.price} | salePrice: ${v.salePrice} | status: ${v.status}`);
    }
  }
  await mongoose.disconnect();
}
run();
