import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Product from '../models/productModel.js';
import ProductVariant from '../models/productVariantModel.js';

async function verifyCombos() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URL, { dbName: 'OwnFresh' });
  console.log("Connected.");

  const combos = await Product.find({ name: /combo/i });
  console.log(`Verifying ${combos.length} combo products...`);

  assert.strictEqual(combos.length, 8, "Expected 8 combo products");

  for (const c of combos) {
    const activeVariants = await ProductVariant.find({ product: c._id, status: "Active" });
    console.log(`\nProduct: "${c.name}"`);
    console.log(`  Parent Price: ₹${c.price}`);
    console.log(`  Active Variants: ${activeVariants.map(v => `${v.name} (MRP: ₹${v.price}, Sale: ₹${v.salePrice})`).join(", ")}`);

    // Verify only pack options are active
    const validPackNames = ["Standard Pack", "Gift Box Edition", "Eco Packaging Pack"];
    for (const av of activeVariants) {
      assert(validPackNames.includes(av.name), `Unexpected active variant ${av.name} on combo product`);
      assert(av.price > 0, `MRP must be greater than 0`);
      assert(av.salePrice > 0, `Sale price must be greater than 0`);
      assert(av.salePrice <= av.price, `Sale price must be <= MRP`);
    }

    const standardPack = activeVariants.find(v => v.name === "Standard Pack");
    assert(standardPack, "Standard Pack variant must exist");
    assert(standardPack.salePrice > 0, "Standard Pack sale price must be > 0");
    assert(standardPack.price > 0, "Standard Pack MRP must be > 0");
  }

  await mongoose.disconnect();
  console.log("\n🎉 ALL COMBO PACK VERIFICATIONS PASSED WITH ZERO ERRORS!");
}

verifyCombos().catch(err => {
  console.error("Combo verification failed:", err);
  process.exit(1);
});
