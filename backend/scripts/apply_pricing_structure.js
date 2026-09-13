import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";
import { 
  calculatePricingComponents, 
  PDF_BASE_RATES, 
  COMBO_BASE_RATES,
  DEFAULT_DISCOUNT_PERCENT 
} from "../config/pricingConfig.js";

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

async function migratePricingStructure() {
  console.log("===============================================================");
  console.log("APPLYING PRODUCT PRICING ARCHITECTURE (PDF BASE + 20% LISTING - 10% DISCOUNT)");
  console.log("===============================================================");

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URL, { dbName: "OwnFresh" });
  console.log("Connected to database:", mongoose.connection.name);

  // 1. UPDATE SINGLE-OIL PRODUCTS
  console.log("\n--- 1. UPDATING SINGLE-OIL INVENTORY ---");
  const singleProducts = await Product.find({ name: { $not: /combo/i } });
  console.log(`Found ${singleProducts.length} single-oil products.`);

  let singleVariantCount = 0;
  for (const product of singleProducts) {
    const oilType = identifyOilType(product.name);
    if (!oilType || !PDF_BASE_RATES[oilType]) {
      console.log(`  [SKIP] Could not identify oil rate table for: ${product.name}`);
      continue;
    }

    const rateTable = PDF_BASE_RATES[oilType];
    const variants = await ProductVariant.find({ product: product._id });

    for (const v of variants) {
      const standardSize = normalizeVariantName(v.name);
      if (rateTable[standardSize]) {
        const item = rateTable[standardSize];
        const pricing = calculatePricingComponents(item.basePrice, DEFAULT_DISCOUNT_PERCENT);

        v.basePrice = pricing.basePrice;
        v.listingPrice = pricing.listingPrice;
        v.discountPercent = pricing.discountPercent;
        v.sellingPrice = pricing.sellingPrice;
        v.price = pricing.price; // Stored as listingPrice for MRP
        v.salePrice = pricing.salePrice; // Stored as sellingPrice for checkout
        v.status = item.status;
        await v.save();
        singleVariantCount++;

        console.log(`  [SINGLE] ${product.name} [${v.name}]`);
        console.log(`           Base: ₹${v.basePrice} | Listing/MRP (+20%): ₹${v.listingPrice} | Discount: ${v.discountPercent}% | Selling: ₹${v.sellingPrice} | Status: ${v.status}`);
      }
    }

    // Sync product display price to lowest active variant selling price
    const activeVariants = await ProductVariant.find({ product: product._id, status: "Active" }).sort({ price: 1 });
    if (activeVariants.length > 0) {
      product.price = activeVariants[0].salePrice || activeVariants[0].price;
      await product.save();
    }
  }
  console.log(`Updated ${singleVariantCount} single-oil variants.`);

  // 2. UPDATE COMBO PACK PRODUCTS
  console.log("\n--- 2. UPDATING COMBO PACK INVENTORY ---");
  const comboProducts = await Product.find({ name: /combo/i });
  console.log(`Found ${comboProducts.length} combo products.`);

  for (const product of comboProducts) {
    let comboConfig = null;
    for (const c of COMBO_BASE_RATES) {
      if (c.match(product.name, product.image || "")) {
        comboConfig = c;
        break;
      }
    }

    if (!comboConfig) {
      comboConfig = { basePrice: 1695, weight: 3.0 };
    }

    // Standard pack pricing
    const stdPricing = calculatePricingComponents(comboConfig.basePrice, DEFAULT_DISCOUNT_PERCENT);

    // Gift Box pricing (+150 on base)
    const giftPricing = calculatePricingComponents(comboConfig.basePrice + 150, DEFAULT_DISCOUNT_PERCENT);

    // Eco Packaging pricing
    const ecoPricing = calculatePricingComponents(comboConfig.basePrice, DEFAULT_DISCOUNT_PERCENT);

    // Deactivate single-oil bottle size variants if present on combo
    await ProductVariant.updateMany(
      { product: product._id, name: { $in: ["250 ml", "500 ml", "1 Litre", "2 Litre", "5 Litre", "15 Litre"] } },
      { $set: { status: "Inactive" } }
    );

    const packDefs = [
      { name: "Standard Pack", pricing: stdPricing, shippingWeight: comboConfig.weight },
      { name: "Gift Box Edition", pricing: giftPricing, shippingWeight: comboConfig.weight + 0.5 },
      { name: "Eco Packaging Pack", pricing: ecoPricing, shippingWeight: comboConfig.weight }
    ];

    for (const pDef of packDefs) {
      let vDoc = await ProductVariant.findOne({ product: product._id, name: pDef.name });
      if (!vDoc) {
        vDoc = new ProductVariant({
          product: product._id,
          name: pDef.name,
          basePrice: pDef.pricing.basePrice,
          listingPrice: pDef.pricing.listingPrice,
          discountPercent: pDef.pricing.discountPercent,
          sellingPrice: pDef.pricing.sellingPrice,
          price: pDef.pricing.price,
          salePrice: pDef.pricing.salePrice,
          shippingWeight: pDef.shippingWeight,
          stockQuantity: 100,
          status: "Active"
        });
      } else {
        vDoc.basePrice = pDef.pricing.basePrice;
        vDoc.listingPrice = pDef.pricing.listingPrice;
        vDoc.discountPercent = pDef.pricing.discountPercent;
        vDoc.sellingPrice = pDef.pricing.sellingPrice;
        vDoc.price = pDef.pricing.price;
        vDoc.salePrice = pDef.pricing.salePrice;
        vDoc.shippingWeight = pDef.shippingWeight;
        vDoc.status = "Active";
      }
      await vDoc.save();

      console.log(`  [COMBO] ${product.name} [${vDoc.name}]`);
      console.log(`          Base: ₹${vDoc.basePrice} | Listing/MRP (+20%): ₹${vDoc.listingPrice} | Discount: ${vDoc.discountPercent}% | Selling: ₹${vDoc.sellingPrice}`);
    }

    // Sync product display price
    product.price = stdPricing.sellingPrice;
    await product.save();
  }

  await mongoose.disconnect();
  console.log("\n🎉 COMPLETED PRICING RESTRUCTURE!");
}

migratePricingStructure().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
