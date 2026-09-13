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

async function inspectCombos() {
  await mongoose.connect(process.env.MONGODB_URL, { dbName: 'OwnFresh' });
  
  const comboCategory = await Category.findOne({ name: /combo/i });
  console.log("Combo category:", comboCategory ? comboCategory.name : "None");

  const combos = await Product.find({
    $or: [
      { category: comboCategory ? comboCategory._id : null },
      { name: /combo/i }
    ]
  }).populate('category');

  console.log(`Found ${combos.length} combo products in DB:\n`);

  for (const c of combos) {
    console.log(`================================================================`);
    console.log(`ID: ${c._id}`);
    console.log(`Product Name: "${c.name}"`);
    console.log(`Category: "${c.category?.name}"`);
    console.log(`Parent Product Price: ₹${c.price}`);
    console.log(`Short Desc: "${c.shortDesc}"`);

    const variants = await ProductVariant.find({ product: c._id });
    console.log(`Variants (${variants.length}):`);
    for (const v of variants) {
      console.log(`   - "${v.name}" (Size: "${v.size}"): MRP (price)=₹${v.price}, salePrice=₹${v.salePrice}, shippingWeight=${v.shippingWeight}kg, status=${v.status}`);
    }
  }

  await mongoose.disconnect();
}

inspectCombos().catch(console.error);
