import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";
import Category from "../models/categoryModel.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const oilPrices = {
  "Sunflower Oil": {
    "250 ml": { price: 180, salePrice: 147.60 },
    "500 ml": { price: 300, salePrice: 246.00 },
    "1 Litre": { price: 540, salePrice: 442.80 },
    "5 Litre": { price: 4320, salePrice: 3542.40 },
    "15 Litre": { price: 11880, salePrice: 9741.60 }
  },
  "Safflower Oil": {
    "250 ml": { price: 190, salePrice: 155.80 },
    "500 ml": { price: 320, salePrice: 262.40 },
    "1 Litre": { price: 580, salePrice: 475.60 },
    "5 Litre": { price: 4640, salePrice: 3804.80 },
    "15 Litre": { price: 12760, salePrice: 10463.20 }
  },
  "Groundnut Oil": {
    "250 ml": { price: 195, salePrice: 159.90 },
    "500 ml": { price: 330, salePrice: 270.60 },
    "1 Litre": { price: 605, salePrice: 496.10 },
    "5 Litre": { price: 4840, salePrice: 3968.80 },
    "15 Litre": { price: 13310, salePrice: 10914.20 }
  },
  "Sesame Oil": {
    "250 ml": { price: 210, salePrice: 172.20 },
    "500 ml": { price: 360, salePrice: 295.20 },
    "1 Litre": { price: 680, salePrice: 557.60 },
    "5 Litre": { price: 5440, salePrice: 4460.80 },
    "15 Litre": { price: 14960, salePrice: 12267.20 }
  },
  "Mustard Oil": {
    "250 ml": { price: 185, salePrice: 151.70 },
    "500 ml": { price: 315, salePrice: 258.30 },
    "1 Litre": { price: 575, salePrice: 471.50 },
    "5 Litre": { price: 4600, salePrice: 3772.00 },
    "15 Litre": { price: 12650, salePrice: 10373.00 }
  },
  "Coconut Oil": {
    "250 ml": { price: 350, salePrice: 308.00 },
    "500 ml": { price: 635, salePrice: 558.80 },
    "1 Litre": { price: 1205, salePrice: 1060.40 },
    "5 Litre": { price: 6025, salePrice: 5302.00 },
    "15 Litre": { price: 18075, salePrice: 15906.00 }
  }
};

const runMigration = async () => {
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    if (!MONGODB_URL) throw new Error("MONGODB_URL is missing in .env");

    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB.");

    // 1. Fetch categories
    const categories = await Category.find();
    const catMap = {};
    categories.forEach(c => {
      catMap[c._id.toString()] = c.name;
    });

    const products = await Product.find();
    console.log(`Processing ${products.length} products...`);

    for (const p of products) {
      const catName = catMap[p.category?.toString() || ""];
      if (!catName) {
        console.log(`Skipping product ${p.name} - no category`);
        continue;
      }

      // Check if product is a single oil
      if (oilPrices[catName]) {
        console.log(`\nUpdating single oil product: "${p.name}" (Category: ${catName})`);

        // Determine primary size of parent product
        let primarySize = "1 Litre";
        const nameLower = p.name.toLowerCase();
        if (nameLower.includes("250")) {
          primarySize = "250 ml";
        } else if (nameLower.includes("500")) {
          primarySize = "500 ml";
        } else if (nameLower.includes("5 lit")) {
          primarySize = "5 Litre";
        } else if (nameLower.includes("15 lit")) {
          primarySize = "15 Litre";
        }

        console.log(`  Primary size: "${primarySize}"`);

        // Fetch existing variants to preserve IDs if possible, or delete and recreate
        await ProductVariant.deleteMany({ product: p._id });

        // Define sizes to insert
        const allSizes = ["250 ml", "500 ml", "1 Litre", "5 Litre", "15 Litre"];
        
        // Reorder sizes so that primary size is first
        const orderedSizes = [primarySize, ...allSizes.filter(s => s !== primarySize)];

        for (const size of orderedSizes) {
          const priceInfo = oilPrices[catName][size];
          if (!priceInfo) continue;

          await ProductVariant.create({
            product: p._id,
            name: size,
            sku: "",
            price: priceInfo.price,
            salePrice: priceInfo.salePrice,
            stockQuantity: size === primarySize ? 100 : 50,
            status: "Active"
          });
          console.log(`    Created variant "${size}" | Price: ${priceInfo.price} | SalePrice: ${priceInfo.salePrice}`);
        }

      } else if (catName === "Combo Value Packs") {
        console.log(`\nUpdating combo pack: "${p.name}"`);

        // Determine base price and size from title
        const nameLower = p.name.toLowerCase();
        let basePrice = 990; // fallback
        let primarySize = "500 ml";

        // Let's get existing variants to find the original base price
        const oldVariants = await ProductVariant.find({ product: p._id });
        if (oldVariants.length > 0) {
          // Find first variant price
          const sorted = oldVariants.sort((a, b) => a.createdAt - b.createdAt);
          basePrice = sorted[0].price;
          // If the old variant name is 500 ml but price is for 1L or 250ml, let's fix it
          if (nameLower.includes("250")) {
            basePrice = 1125; // PDF Trial combo pack rate
            primarySize = "250 ml";
          } else if (nameLower.includes("1l") || nameLower.includes("1 litre") || nameLower.includes("1 liter")) {
            // Base price is correct
            primarySize = "1 Litre";
          } else {
            primarySize = "500 ml";
          }
        }

        console.log(`  Base Price: ${basePrice} | Primary Size: ${primarySize}`);

        await ProductVariant.deleteMany({ product: p._id });

        const allSizes = ["250 ml", "500 ml", "1 Litre", "5 Litre", "15 Litre"];
        const orderedSizes = [primarySize, ...allSizes.filter(s => s !== primarySize)];

        for (const size of orderedSizes) {
          let factor = 1.0;
          if (size === "250 ml") {
            factor = primarySize === "500 ml" ? 0.6 : (primarySize === "1 Litre" ? 0.35 : 1.0);
          } else if (size === "500 ml") {
            factor = primarySize === "250 ml" ? 1.8 : (primarySize === "1 Litre" ? 0.55 : 1.0);
          } else if (size === "1 Litre") {
            factor = primarySize === "250 ml" ? 3.2 : (primarySize === "500 ml" ? 1.8 : 1.0);
          } else if (size === "5 Litre") {
            factor = primarySize === "250 ml" ? 15.0 : (primarySize === "500 ml" ? 8.0 : (primarySize === "1 Litre" ? 5.0 : 8.0));
          } else if (size === "15 Litre") {
            factor = primarySize === "250 ml" ? 40.0 : (primarySize === "500 ml" ? 22.0 : (primarySize === "1 Litre" ? 15.0 : 22.0));
          }

          const price = Math.round(basePrice * factor);
          const salePrice = Math.round(price * 0.85 * 100) / 100; // 15% discount for combos

          await ProductVariant.create({
            product: p._id,
            name: size,
            sku: "",
            price,
            salePrice,
            stockQuantity: size === primarySize ? 100 : 50,
            status: "Active"
          });
          console.log(`    Created variant "${size}" | Price: ${price} | SalePrice: ${salePrice}`);
        }
      }
    }

    console.log("\n✅ Database pricing migration complete.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

runMigration();
