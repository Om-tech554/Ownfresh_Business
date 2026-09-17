import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Product from '../models/productModel.js';
import ProductVariant from '../models/productVariantModel.js';

// Base screenshot selling prices (Customer pays this exact amount)
// Listing Price / MRP is +10% higher so it displays as crossed-out (~MRP~) with -10% OFF badge
export const PRICING_STRUCTURE = {
  "Groundnut Oil": {
    "250 ml": { salePrice: 234, status: "Inactive" },
    "500 ml": { salePrice: 390, status: "Active" },
    "1 Litre": { salePrice: 605, status: "Active" },
    "2 Litre": { salePrice: 1119, status: "Active" },
    "5 Litre": { salePrice: 4840, status: "Active" },
    "15 Litre": { salePrice: 13310, status: "Active" }
  },
  "Coconut Oil": {
    "250 ml": { salePrice: 418, status: "Active" },
    "500 ml": { salePrice: 695, status: "Active" },
    "1 Litre": { salePrice: 1210, status: "Active" },
    "2 Litre": { salePrice: 2239, status: "Active" },
    "5 Litre": { salePrice: 6050, status: "Active" },
    "15 Litre": { salePrice: 18150, status: "Active" }
  },
  "Sunflower Oil": {
    "250 ml": { salePrice: 216, status: "Inactive" },
    "500 ml": { salePrice: 375, status: "Active" },
    "1 Litre": { salePrice: 565, status: "Active" },
    "2 Litre": { salePrice: 1045, status: "Active" },
    "5 Litre": { salePrice: 4520, status: "Active" },
    "15 Litre": { salePrice: 12430, status: "Active" }
  },
  "Safflower Oil": {
    "250 ml": { salePrice: 228, status: "Inactive" },
    "500 ml": { salePrice: 412, status: "Active" },
    "1 Litre": { salePrice: 640, status: "Active" },
    "2 Litre": { salePrice: 1184, status: "Active" },
    "5 Litre": { salePrice: 5120, status: "Active" },
    "15 Litre": { salePrice: 14080, status: "Active" }
  },
  "Sesame Oil": {
    "250 ml": { salePrice: 290, status: "Active" },
    "500 ml": { salePrice: 415, status: "Active" },
    "1 Litre": { salePrice: 650, status: "Active" },
    "2 Litre": { salePrice: 1203, status: "Active" },
    "5 Litre": { salePrice: 5200, status: "Active" },
    "15 Litre": { salePrice: 14300, status: "Active" }
  },
  "Mustard Oil": {
    "250 ml": { salePrice: 175, status: "Active" },
    "500 ml": { salePrice: 380, status: "Active" },
    "1 Litre": { salePrice: 585, status: "Active" },
    "2 Litre": { salePrice: 1082, status: "Active" },
    "5 Litre": { salePrice: 4680, status: "Active" },
    "15 Litre": { salePrice: 12870, status: "Active" }
  }
};

function identifyOilType(name) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('groundnut') || lower.includes('peanut')) return 'Groundnut Oil';
  if (lower.includes('coconut')) return 'Coconut Oil';
  if (lower.includes('sunflower')) return 'Sunflower Oil';
  if (lower.includes('safflower') || lower.includes('kardi')) return 'Safflower Oil';
  if (lower.includes('sesame') || lower.includes('til')) return 'Sesame Oil';
  if (lower.includes('mustard') || lower.includes('sarson')) return 'Mustard Oil';
  return null;
}

function normalizeVariantName(name) {
  const lower = (name || '').toLowerCase().trim();
  if (lower.includes('250')) return '250 ml';
  if (lower.includes('500')) return '500 ml';
  if (lower.includes('15') && (lower.includes('l') || lower.includes('litre'))) return '15 Litre';
  if (lower.includes('5') && (lower.includes('l') || lower.includes('litre'))) return '5 Litre';
  if (lower.includes('2') && (lower.includes('l') || lower.includes('litre'))) return '2 Litre';
  if (lower.includes('1') && (lower.includes('l') || lower.includes('litre'))) return '1 Litre';
  return name;
}

async function applyEcommercePrices() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URL, { dbName: 'OwnFresh' });
  console.log('Connected to OwnFresh DB.');

  const allProducts = await Product.find({});
  const singleProducts = allProducts.filter(p => !p.name.toLowerCase().includes('combo'));
  console.log(`Found ${singleProducts.length} single-oil products to update.`);

  let count = 0;
  for (const prod of singleProducts) {
    const oilType = identifyOilType(prod.name);
    if (!oilType || !PRICING_STRUCTURE[oilType]) continue;

    const rates = PRICING_STRUCTURE[oilType];
    const variants = await ProductVariant.find({ product: prod._id });

    for (const v of variants) {
      const stdName = normalizeVariantName(v.name);
      if (rates[stdName]) {
        const item = rates[stdName];
        const finalSellingPrice = item.salePrice;
        // MRP is +10% higher
        const cutMrp = Math.round(finalSellingPrice * 1.10);

        v.price = cutMrp; // Crossed-out MRP
        v.listingPrice = cutMrp;
        v.salePrice = finalSellingPrice; // Displayed bold payable price (from screenshot)
        v.sellingPrice = finalSellingPrice;
        v.basePrice = finalSellingPrice;
        v.discountPercent = 10;
        v.status = item.status;
        await v.save();
        count++;
        console.log(`Updated ${prod.name} [${v.name}] -> MRP: ₹${v.price} (crossed out) | Sale: ₹${v.salePrice} (-10%) | ${v.status}`);
      }
    }
  }

  console.log(`\nSuccessfully applied 10% cut MRP across ${count} variants!`);
  await mongoose.disconnect();
}

applyEcommercePrices().catch(err => {
  console.error('Error applying ecommerce prices:', err);
  process.exit(1);
});
