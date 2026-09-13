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

// Exact PDF prices (Selling Prices / Final Customer Grand Total)
// MRP is increased by 20% (+20%) so customers see the higher MRP crossed out
// and the exact PDF price as the final amount payable.
export const PDF_RATES = {
  "Groundnut Oil": {
    "250 ml": { pdfPrice: 195, status: "Inactive" },
    "500 ml": { pdfPrice: 310, status: "Active" },
    "1 Litre": { pdfPrice: 555, status: "Active" },
    "2 Litre": { pdfPrice: 1025, status: "Active" }, // 555 * 1.85
    "5 Litre": { pdfPrice: 4440, status: "Active" }, // 555 * 8
    "15 Litre": { pdfPrice: 12210, status: "Active" } // 555 * 22
  },
  "Coconut Oil": {
    "250 ml": { pdfPrice: 355, status: "Active" },
    "500 ml": { pdfPrice: 650, status: "Active" },
    "1 Litre": { pdfPrice: 1240, status: "Active" },
    "2 Litre": { pdfPrice: 2295, status: "Active" }, // 1240 * 1.85
    "5 Litre": { pdfPrice: 6200, status: "Active" }, // 1240 * 5
    "15 Litre": { pdfPrice: 18600, status: "Active" } // 1240 * 15
  },
  "Sunflower Oil": {
    "250 ml": { pdfPrice: 180, status: "Inactive" },
    "500 ml": { pdfPrice: 275, status: "Active" },
    "1 Litre": { pdfPrice: 485, status: "Active" },
    "2 Litre": { pdfPrice: 895, status: "Active" }, // 485 * 1.85
    "5 Litre": { pdfPrice: 3880, status: "Active" }, // 485 * 8
    "15 Litre": { pdfPrice: 10670, status: "Active" } // 485 * 22
  },
  "Safflower Oil": {
    "250 ml": { pdfPrice: 190, status: "Inactive" },
    "500 ml": { pdfPrice: 325, status: "Active" },
    "1 Litre": { pdfPrice: 585, status: "Active" },
    "2 Litre": { pdfPrice: 1080, status: "Active" }, // 585 * 1.85
    "5 Litre": { pdfPrice: 4680, status: "Active" }, // 585 * 8
    "15 Litre": { pdfPrice: 12870, status: "Active" } // 585 * 22
  },
  "Sesame Oil": {
    "250 ml": { pdfPrice: 195, status: "Active" },
    "500 ml": { pdfPrice: 340, status: "Active" },
    "1 Litre": { pdfPrice: 615, status: "Active" },
    "2 Litre": { pdfPrice: 1135, status: "Active" }, // 615 * 1.85
    "5 Litre": { pdfPrice: 4920, status: "Active" }, // 615 * 8
    "15 Litre": { pdfPrice: 13530, status: "Active" } // 615 * 22
  },
  "Mustard Oil": {
    "250 ml": { pdfPrice: 175, status: "Active" },
    "500 ml": { pdfPrice: 295, status: "Active" },
    "1 Litre": { pdfPrice: 525, status: "Active" },
    "2 Litre": { pdfPrice: 970, status: "Active" }, // 525 * 1.85
    "5 Litre": { pdfPrice: 4200, status: "Active" }, // 525 * 8
    "15 Litre": { pdfPrice: 11550, status: "Active" } // 525 * 22
  }
};

export const COMBO_RATES = [
  {
    // Groundnut (555) + Mustard (525) + Sesame (615) = 1695
    match: (name, img) => name.includes("Groundnut + Mustard + Sesame"),
    finalPrice: 1695,
    weight: 3.0
  },
  {
    // Coconut (1240) + Safflower (585) + Sunflower (485) = 2310
    match: (name, img) => name.includes("Coconut + Safflower + Sunflower"),
    finalPrice: 2310,
    weight: 3.0
  },
  {
    // Groundnut (555) + Safflower (585) + Sunflower (485) = 1625
    match: (name, img) => name.includes("Groundnut + Safflower + Sunflower"),
    finalPrice: 1625,
    weight: 3.0
  },
  {
    // Groundnut (555) + Sunflower (485) + Sesame (615) = 1655
    match: (name, img) => img.includes("Groundnut-sunflower-sesame-Combo-1L") || (name.includes("1L Combo pack of 3") && !name.includes("Coconut") && !name.includes("Mustard")),
    finalPrice: 1655,
    weight: 3.0
  },
  {
    // Coconut (1240) + Groundnut (555) + Sesame (615) = 2410
    match: (name, img) => img.includes("Groundnut-coconut-sesame") || (name.includes("1L Combo pack of 3") && name.includes("Coconut")),
    finalPrice: 2410,
    weight: 3.0
  },
  {
    // 250 ML Combo pack of 5:
    // Coconut (355) + Sesame (195) + Mustard (175) + Groundnut (175) + Sunflower (150) = 1050
    match: (name, img) => name.includes("250 ML Combo pack of 5"),
    finalPrice: 1050,
    weight: 1.25
  }
];

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

async function updateAllInventory() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URL, { dbName: "OwnFresh" });
  console.log("Connected.");

  // ==========================================
  // 1. UPDATE SINGLE-OIL INVENTORY
  // ==========================================
  console.log("\n--- UPDATING SINGLE-OIL INVENTORY ---");
  const singleProducts = await Product.find({ name: { $not: /combo/i } });
  console.log(`Found ${singleProducts.length} single-oil products.`);

  let singleVariantCount = 0;
  for (const product of singleProducts) {
    const oilType = identifyOilType(product.name);
    if (!oilType || !PDF_RATES[oilType]) continue;

    const rateTable = PDF_RATES[oilType];
    const variants = await ProductVariant.find({ product: product._id });

    for (const v of variants) {
      const standardSize = normalizeVariantName(v.name);
      if (rateTable[standardSize]) {
        const item = rateTable[standardSize];
        const finalPrice = item.pdfPrice;
        // MRP increased by 20%
        const mrp = Math.round(finalPrice * 1.20);

        v.price = mrp;
        v.salePrice = finalPrice;
        v.status = item.status;
        await v.save();
        singleVariantCount++;

        console.log(`  [SINGLE] ${product.name} -> ${v.name}: MRP(price)=₹${v.price} (+20%), FinalSale(salePrice)=₹${v.salePrice}, status=${v.status}`);
      }
    }
  }
  console.log(`Updated ${singleVariantCount} single-oil variants.`);

  // ==========================================
  // 2. UPDATE COMBO PACK INVENTORY
  // ==========================================
  console.log("\n--- UPDATING COMBO PACK INVENTORY ---");
  const comboProducts = await Product.find({ name: /combo/i });
  console.log(`Found ${comboProducts.length} combo products.`);

  for (const product of comboProducts) {
    let comboConfig = null;
    for (const c of COMBO_RATES) {
      if (c.match(product.name, product.image || "")) {
        comboConfig = c;
        break;
      }
    }

    if (!comboConfig) {
      comboConfig = { finalPrice: 1695, weight: 3.0 };
    }

    const finalGrandTotal = comboConfig.finalPrice;
    const comboMrp = Math.round(finalGrandTotal * 1.20); // +20% MRP

    const giftBoxFinal = finalGrandTotal + 150;
    const giftBoxMrp = Math.round(giftBoxFinal * 1.20);

    const ecoFinal = finalGrandTotal;
    const ecoMrp = comboMrp;

    // Deactivate single-oil bottle size variants
    await ProductVariant.updateMany(
      { product: product._id, name: { $in: ["250 ml", "500 ml", "1 Litre", "2 Litre", "5 Litre", "15 Litre"] } },
      { $set: { status: "Inactive" } }
    );

    // Update / ensure 3 pack options
    const packDefs = [
      { name: "Standard Pack", price: comboMrp, salePrice: finalGrandTotal, shippingWeight: comboConfig.weight },
      { name: "Gift Box Edition", price: giftBoxMrp, salePrice: giftBoxFinal, shippingWeight: comboConfig.weight + 0.5 },
      { name: "Eco Packaging Pack", price: ecoMrp, salePrice: ecoFinal, shippingWeight: comboConfig.weight }
    ];

    for (const pDef of packDefs) {
      let vDoc = await ProductVariant.findOne({ product: product._id, name: pDef.name });
      if (!vDoc) {
        vDoc = new ProductVariant({
          product: product._id,
          name: pDef.name,
          price: pDef.price,
          salePrice: pDef.salePrice,
          shippingWeight: pDef.shippingWeight,
          stockQuantity: 100,
          status: "Active"
        });
      } else {
        vDoc.price = pDef.price;
        vDoc.salePrice = pDef.salePrice;
        vDoc.shippingWeight = pDef.shippingWeight;
        vDoc.status = "Active";
      }
      await vDoc.save();
      console.log(`  [COMBO] ${product.name} -> ${vDoc.name}: MRP=₹${vDoc.price} (+20%), FinalSale=₹${vDoc.salePrice}`);
    }
  }

  await mongoose.disconnect();
  console.log("\n🎉 COMPLETED INVENTORY REALIGNMENT!");
}

updateAllInventory().catch(err => {
  console.error("Update error:", err);
  process.exit(1);
});
