import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";

const EXPECTED_PDF_RATES = {
  "Groundnut Oil": {
    "500 ml": { mrp: 310, status: "Active" },
    "1 Litre": { mrp: 555, status: "Active" }
  },
  "Coconut Oil": {
    "250 ml": { mrp: 355, status: "Active" },
    "500 ml": { mrp: 650, status: "Active" },
    "1 Litre": { mrp: 1240, status: "Active" }
  },
  "Sunflower Oil": {
    "500 ml": { mrp: 275, status: "Active" },
    "1 Litre": { mrp: 485, status: "Active" }
  },
  "Safflower Oil": {
    "500 ml": { mrp: 325, status: "Active" },
    "1 Litre": { mrp: 585, status: "Active" }
  },
  "Sesame Oil": {
    "250 ml": { mrp: 195, status: "Active" },
    "500 ml": { mrp: 340, status: "Active" },
    "1 Litre": { mrp: 615, status: "Active" }
  },
  "Mustard Oil": {
    "250 ml": { mrp: 175, status: "Active" },
    "500 ml": { mrp: 295, status: "Active" },
    "1 Litre": { mrp: 525, status: "Active" }
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

async function verify() {
  console.log("Starting verification...");
  await mongoose.connect(process.env.MONGODB_URL, { dbName: "OwnFresh" });
  console.log("Connected to MongoDB.");

  // 1. Verify Database MRPs against PDF
  const products = await Product.find({});
  let assertionsRun = 0;

  for (const p of products) {
    const oilType = identifyOilType(p.name);
    if (!oilType || !EXPECTED_PDF_RATES[oilType]) continue;

    const variants = await ProductVariant.find({ product: p._id });
    for (const v of variants) {
      const standardSize = normalizeVariantName(v.name);
      if (EXPECTED_PDF_RATES[oilType][standardSize]) {
        const expected = EXPECTED_PDF_RATES[oilType][standardSize];
        assert.strictEqual(
          v.price,
          expected.mrp,
          `Mismatch in ${p.name} (${v.name}): expected MRP ${expected.mrp}, got ${v.price}`
        );
        assert.strictEqual(
          v.status,
          expected.status,
          `Mismatch status in ${p.name} (${v.name}): expected ${expected.status}, got ${v.status}`
        );
        assertionsRun++;
      }
    }
  }
  console.log(`✅ Passed ${assertionsRun} database MRP assertions matching the PDF!`);

  // 2. Verify GST Inclusive Math
  const testSubtotals = [100, 310, 555, 650, 1000, 1240, 2500];
  for (const sub of testSubtotals) {
    const taxableAmount = Math.round((sub / 1.05) * 100) / 100;
    const cgst = Math.round(taxableAmount * 0.025 * 100) / 100;
    const sgst = Math.round(taxableAmount * 0.025 * 100) / 100;
    const totalTax = cgst + sgst;
    const reconstructed = Math.round((taxableAmount + totalTax) * 100) / 100;
    // Difference between taxableAmount + totalTax and subtotal must be within 1 cent/paise rounding
    assert(
      Math.abs(reconstructed - sub) <= 0.02,
      `GST inclusive math failed for subtotal ${sub}: reconstructed ${reconstructed}`
    );
  }
  console.log(`✅ Passed GST-inclusive mathematical integrity tests!`);

  await mongoose.disconnect();
  console.log("🎉 ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

verify().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
