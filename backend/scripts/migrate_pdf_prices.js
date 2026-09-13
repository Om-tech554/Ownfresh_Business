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

export const PDF_PRICE_MAP = {
  "Groundnut Oil": {
    "250 ml": { price: 195, salePrice: 160, status: "Inactive" }, // Marked .-. in PDF
    "500 ml": { price: 310, salePrice: 254, status: "Active" },
    "1 Litre": { price: 555, salePrice: 455, status: "Active" },
    "2 Litre": { price: 1025, salePrice: 840, status: "Active" },
    "5 Litre": { price: 4440, salePrice: 3640, status: "Active" },
    "15 Litre": { price: 12210, salePrice: 10010, status: "Active" }
  },
  "Coconut Oil": {
    "250 ml": { price: 355, salePrice: 312, status: "Active" },
    "500 ml": { price: 650, salePrice: 572, status: "Active" },
    "1 Litre": { price: 1240, salePrice: 1090, status: "Active" },
    "2 Litre": { price: 2295, salePrice: 2020, status: "Active" },
    "5 Litre": { price: 6200, salePrice: 5455, status: "Active" },
    "15 Litre": { price: 18600, salePrice: 16370, status: "Active" }
  },
  "Sunflower Oil": {
    "250 ml": { price: 180, salePrice: 148, status: "Inactive" }, // Marked .-. in PDF
    "500 ml": { price: 275, salePrice: 226, status: "Active" },
    "1 Litre": { price: 485, salePrice: 398, status: "Active" },
    "2 Litre": { price: 895, salePrice: 735, status: "Active" },
    "5 Litre": { price: 3880, salePrice: 3180, status: "Active" },
    "15 Litre": { price: 10670, salePrice: 8750, status: "Active" }
  },
  "Safflower Oil": {
    "250 ml": { price: 190, salePrice: 156, status: "Inactive" }, // Marked .-. in PDF
    "500 ml": { price: 325, salePrice: 267, status: "Active" },
    "1 Litre": { price: 585, salePrice: 480, status: "Active" },
    "2 Litre": { price: 1080, salePrice: 885, status: "Active" },
    "5 Litre": { price: 4680, salePrice: 3840, status: "Active" },
    "15 Litre": { price: 12870, salePrice: 10550, status: "Active" }
  },
  "Sesame Oil": {
    "250 ml": { price: 195, salePrice: 160, status: "Active" },
    "500 ml": { price: 340, salePrice: 279, status: "Active" },
    "1 Litre": { price: 615, salePrice: 504, status: "Active" },
    "2 Litre": { price: 1135, salePrice: 930, status: "Active" },
    "5 Litre": { price: 4920, salePrice: 4035, status: "Active" },
    "15 Litre": { price: 13530, salePrice: 11095, status: "Active" }
  },
  "Mustard Oil": {
    "250 ml": { price: 175, salePrice: 144, status: "Active" },
    "500 ml": { price: 295, salePrice: 242, status: "Active" },
    "1 Litre": { price: 525, salePrice: 431, status: "Active" },
    "2 Litre": { price: 970, salePrice: 795, status: "Active" },
    "5 Litre": { price: 4200, salePrice: 3445, status: "Active" },
    "15 Litre": { price: 11550, salePrice: 9470, status: "Active" }
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

async function migrate() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URL, { dbName: "OwnFresh" });
  console.log("Connected.");

  const products = await Product.find({});
  console.log(`Processing ${products.length} products...`);

  let updatedVariantCount = 0;
  let updatedProductCount = 0;

  for (const product of products) {
    const oilType = identifyOilType(product.name);
    if (!oilType || !PDF_PRICE_MAP[oilType]) {
      console.log(`Skipping product (not recognized oil): ${product.name}`);
      continue;
    }

    const priceConfig = PDF_PRICE_MAP[oilType];
    const variants = await ProductVariant.find({ product: product._id });

    for (const v of variants) {
      const standardSize = normalizeVariantName(v.name);
      if (priceConfig[standardSize]) {
        const target = priceConfig[standardSize];
        v.price = target.price;
        v.salePrice = target.salePrice;
        if (target.status) {
          v.status = target.status;
        }
        await v.save();
        updatedVariantCount++;
        console.log(`  [UPDATED] ${product.name} -> ${v.name}: MRP=₹${v.price}, Sale=₹${v.salePrice}, Status=${v.status}`);
      }
    }

    // Update parent product display price to lowest active variant salePrice or price
    const activeVariants = await ProductVariant.find({ product: product._id, status: "Active" }).sort({ price: 1 });
    if (activeVariants.length > 0) {
      product.price = activeVariants[0].salePrice || activeVariants[0].price;
      await product.save();
      updatedProductCount++;
    }
  }

  console.log(`\nMigration completed!`);
  console.log(`Updated variants: ${updatedVariantCount}`);
  console.log(`Updated products: ${updatedProductCount}`);

  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
