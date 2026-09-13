import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Product from '../models/productModel.js';
import ProductVariant from '../models/productVariantModel.js';

// Exact sum of bottles based on the PDF:
// Groundnut 1L: 555 | 500ml: 310
// Coconut 1L: 1240  | 500ml: 650 | 250ml: 355
// Sunflower 1L: 485 | 500ml: 275
// Safflower 1L: 585 | 500ml: 325
// Sesame 1L: 615    | 500ml: 340 | 250ml: 195
// Mustard 1L: 525   | 500ml: 295 | 250ml: 175

export const COMBO_CONFIGS = [
  {
    // Groundnut (555) + Mustard (525) + Sesame (615) = 1695
    match: (name, img) => name.includes("Groundnut + Mustard + Sesame") || (name.includes("1L Combo pack of 3") && img.includes("Groundnut-mustard-sesame")),
    standardMrp: 1695,
    oils: "Groundnut (₹555) + Mustard (₹525) + Sesame (₹615)",
    shortDesc: "Complete Indian Kitchen 1L Trio: 100% Cold/Stone Pressed Groundnut, Mustard, and Sesame oils (1L each) in one convenient value pack."
  },
  {
    // Coconut (1240) + Safflower (585) + Sunflower (485) = 2310
    match: (name, img) => name.includes("Coconut + Safflower + Sunflower") || (name.includes("1L Combo pack of 3") && img.includes("Coconut-safflower-sunflower")),
    standardMrp: 2310,
    oils: "Coconut (₹1,240) + Safflower (₹585) + Sunflower (₹485)",
    shortDesc: "Health & Heart 1L Trio: 100% Stone Pressed Virgin Coconut, Safflower (Kardi), and Sunflower oils (1L each) for versatile daily culinary and wellness use."
  },
  {
    // Groundnut (555) + Safflower (585) + Sunflower (485) = 1625
    match: (name, img) => name.includes("Groundnut + Safflower + Sunflower") || (name.includes("1L Combo pack of 3") && img.includes("Safflower-Groundnut-sunflower")),
    standardMrp: 1625,
    oils: "Groundnut (₹555) + Safflower (₹585) + Sunflower (₹485)",
    shortDesc: "Everyday Cooking 1L Trio: 100% Stone Pressed Groundnut, Safflower, and Sunflower oils (1L each) providing balanced healthy fats for daily Indian meals."
  },
  {
    // Groundnut (555) + Sunflower (485) + Sesame (615) = 1655
    match: (name, img) => img.includes("Groundnut-sunflower-sesame-Combo-1L") || (name.includes("1L Combo pack of 3") && !name.includes("Coconut") && !name.includes("Mustard")),
    standardMrp: 1655,
    oils: "Groundnut (₹555) + Sunflower (₹485) + Sesame (₹615)",
    shortDesc: "Traditional Aroma 1L Trio: 100% Stone Pressed Groundnut, Sunflower, and Til (Sesame) oils (1L each) for deep frying, sautéing, and authentic tempering."
  },
  {
    // Coconut (1240) + Groundnut (555) + Sesame (615) = 2410
    match: (name, img) => img.includes("Groundnut-coconut-sesame") || (name.includes("1L Combo pack of 3") && name.includes("Coconut")),
    standardMrp: 2410,
    oils: "Coconut (₹1,240) + Groundnut (₹555) + Sesame (₹615)",
    shortDesc: "Premium Coastal & Traditional 1L Trio: 100% Stone Pressed Coconut, Groundnut, and Sesame oils (1L each) for festive dishes, tadkas, and holistic wellness."
  },
  {
    // 250 ML Combo pack of 5:
    // Coconut (355) + Sesame (195) + Mustard (175) + Groundnut (175) + Sunflower (150) = 1050
    match: (name, img) => name.includes("250 ML Combo pack of 5"),
    standardMrp: 1050,
    oils: "Coconut (₹355) + Sesame (₹195) + Mustard (₹175) + Groundnut (₹175) + Sunflower (₹150)",
    shortDesc: "All-Star 250ml Sampler Pack of 5: Experience 100% natural Stone Pressed Coconut, Sesame, Mustard, Groundnut, and Sunflower oils (250ml each)."
  }
];

async function updateCombos() {
  await mongoose.connect(process.env.MONGODB_URL, { dbName: 'OwnFresh' });
  console.log("Connected to MongoDB Atlas.");

  const combos = await Product.find({ name: /combo/i });
  console.log(`Found ${combos.length} combo products.`);

  for (const product of combos) {
    console.log(`\nEvaluating: "${product.name}" (ID: ${product._id})`);
    
    // Find matching configuration
    let config = null;
    for (const c of COMBO_CONFIGS) {
      if (c.match(product.name, product.image || "")) {
        config = c;
        break;
      }
    }

    if (!config) {
      // Default fallback based on product.price or 1L trio
      config = {
        standardMrp: 1695,
        oils: "3x 1L Stone Pressed Oils",
        shortDesc: product.shortDesc
      };
    }

    console.log(`  -> Matched config: ${config.oils} => Standard MRP: ₹${config.standardMrp}`);

    const baseMrp = config.standardMrp;
    const baseSale = Math.round(baseMrp * 0.82); // 18% combo store discount

    const giftBoxMrp = baseMrp + 150;
    const giftBoxSale = Math.round(giftBoxMrp * 0.85); // 15% discount on gift box

    const ecoMrp = baseMrp;
    const ecoSale = Math.round(baseMrp * 0.80); // 20% discount on eco packaging

    // Deactivate accidental size variants on combo products
    const allVariants = await ProductVariant.find({ product: product._id });
    for (const v of allVariants) {
      if (["250 ml", "500 ml", "1 Litre", "2 Litre", "5 Litre", "15 Litre"].includes(v.name)) {
        v.status = "Inactive";
        await v.save();
        console.log(`     [DEACTIVATED single-bottle size variant on combo]: "${v.name}"`);
      }
    }

    // Ensure Standard Pack, Gift Box Edition, Eco Packaging Pack variants exist and are updated
    const packDefs = [
      { name: "Standard Pack", price: baseMrp, salePrice: baseSale, shippingWeight: product.name.includes("250") ? 1.25 : 3.0 },
      { name: "Gift Box Edition", price: giftBoxMrp, salePrice: giftBoxSale, shippingWeight: product.name.includes("250") ? 1.5 : 3.5 },
      { name: "Eco Packaging Pack", price: ecoMrp, salePrice: ecoSale, shippingWeight: product.name.includes("250") ? 1.25 : 3.0 }
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
      console.log(`     [UPDATED combo variant]: "${vDoc.name}" -> MRP=₹${vDoc.price}, Sale=₹${vDoc.salePrice}, Weight=${vDoc.shippingWeight}kg`);
    }

    // Update parent product display price
    product.price = baseSale;
    if (config.shortDesc) {
      product.shortDesc = config.shortDesc;
    }
    await product.save();
    console.log(`  ✅ Parent product updated: price=₹${product.price}`);
  }

  await mongoose.disconnect();
  console.log("\n🎉 ALL COMBOS UPDATED SUCCESSFULLY!");
}

updateCombos().catch(err => {
  console.error("Error updating combos:", err);
  process.exit(1);
});
