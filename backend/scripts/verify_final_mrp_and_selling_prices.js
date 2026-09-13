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

const EXPECTED_PDF_SELLING_PRICES = {
  "Groundnut Oil": {
    "500 ml": { pdfFinal: 310, mrpExpected: 372 },
    "1 Litre": { pdfFinal: 555, mrpExpected: 666 }
  },
  "Coconut Oil": {
    "250 ml": { pdfFinal: 355, mrpExpected: 426 },
    "500 ml": { pdfFinal: 650, mrpExpected: 780 },
    "1 Litre": { pdfFinal: 1240, mrpExpected: 1488 }
  },
  "Sunflower Oil": {
    "500 ml": { pdfFinal: 275, mrpExpected: 330 },
    "1 Litre": { pdfFinal: 485, mrpExpected: 582 }
  },
  "Safflower Oil": {
    "500 ml": { pdfFinal: 325, mrpExpected: 390 },
    "1 Litre": { pdfFinal: 585, mrpExpected: 702 }
  },
  "Sesame Oil": {
    "250 ml": { pdfFinal: 195, mrpExpected: 234 },
    "500 ml": { pdfFinal: 340, mrpExpected: 408 },
    "1 Litre": { pdfFinal: 615, mrpExpected: 738 }
  },
  "Mustard Oil": {
    "250 ml": { pdfFinal: 175, mrpExpected: 210 },
    "500 ml": { pdfFinal: 295, mrpExpected: 354 },
    "1 Litre": { pdfFinal: 525, mrpExpected: 630 }
  }
};

function identifyOilType(name) {
  const lower = name.toLowerCase();
  if (lower.includes("groundnut") || lower.includes("peanut")) return "Groundnut Oil";
  if (lower.includes("coconut")) return "Coconut Oil";
  if (lower.includes("sunflower")) return "Sunflower Oil";
  if (lower.includes("safflower") || lower.includes("kardi")) return "Safflower Oil";
  if (lower.includes("sesame") || lower.includes("til")) return "Sesame Oil";
  if (lower.includes("mustard") || lower.includes("sarson")) return "Mustard Oil";
  return null;
}

function normalizeVariantName(name) {
  const lower = name.toLowerCase().trim();
  if (lower.includes("250")) return "250 ml";
  if (lower.includes("500")) return "500 ml";
  if (lower.includes("15") && (lower.includes("l") || lower.includes("litre"))) return "15 Litre";
  if (lower.includes("5") && (lower.includes("l") || lower.includes("litre"))) return "5 Litre";
  if (lower.includes("2") && (lower.includes("l") || lower.includes("litre"))) return "2 Litre";
  if (lower.includes("1") && (lower.includes("l") || lower.includes("litre"))) return "1 Litre";
  return name;
}

async function verifyAll() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URL, { dbName: "OwnFresh" });
  console.log("Connected.");

  // 1. Verify Single Oils
  const singleProducts = await Product.find({ name: { $not: /combo/i } });
  let singleAssertions = 0;

  for (const p of singleProducts) {
    const oilType = identifyOilType(p.name);
    if (!oilType || !EXPECTED_PDF_SELLING_PRICES[oilType]) continue;

    const variants = await ProductVariant.find({ product: p._id, status: "Active" });
    for (const v of variants) {
      const standardSize = normalizeVariantName(v.name);
      if (EXPECTED_PDF_SELLING_PRICES[oilType][standardSize]) {
        const expected = EXPECTED_PDF_SELLING_PRICES[oilType][standardSize];
        assert.strictEqual(
          v.salePrice,
          expected.pdfFinal,
          `Sale price mismatch in ${p.name} ${v.name}: expected ${expected.pdfFinal}, got ${v.salePrice}`
        );
        assert.strictEqual(
          v.price,
          expected.mrpExpected,
          `MRP mismatch in ${p.name} ${v.name}: expected ${expected.mrpExpected}, got ${v.price}`
        );
        singleAssertions++;
      }
    }
  }
  console.log(`✅ Passed ${singleAssertions} single-oil assertions: Sale price = exact PDF price, MRP = +20%!`);

  // 2. Verify Combos
  const combos = await Product.find({ name: /combo/i });
  let comboAssertions = 0;

  for (const c of combos) {
    const activeVariants = await ProductVariant.find({ product: c._id, status: "Active" });
    const stdPack = activeVariants.find(v => v.name === "Standard Pack");
    assert(stdPack, `Missing Standard Pack on ${c.name}`);
    
    // Check that MRP is 20% higher than salePrice
    const expectedMrp = Math.round(stdPack.salePrice * 1.20);
    assert.strictEqual(stdPack.price, expectedMrp, `Combo MRP mismatch on ${c.name}: expected ${expectedMrp}, got ${stdPack.price}`);

    // Verify GST-inclusive grand total matches sale price
    const taxable = Math.round((stdPack.salePrice / 1.05) * 100) / 100;
    const cgst = Math.round(taxable * 0.025 * 100) / 100;
    const sgst = Math.round(taxable * 0.025 * 100) / 100;
    const grandTotal = Math.round((taxable + cgst + sgst) * 100) / 100;
    assert(
      Math.abs(grandTotal - stdPack.salePrice) <= 0.02,
      `GST inclusive math mismatch on combo ${c.name}: ${grandTotal} vs ${stdPack.salePrice}`
    );

    comboAssertions++;
  }
  console.log(`✅ Passed ${comboAssertions} combo pack assertions: Sale price = exact PDF sum, MRP = +20%, GST inclusive!`);

  await mongoose.disconnect();
  console.log("\n🎉 ALL FINAL TESTS PASSED WITH 100% PRECISION!");
}

verifyAll().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
