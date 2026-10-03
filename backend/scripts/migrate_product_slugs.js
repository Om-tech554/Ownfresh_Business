import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Product from '../models/productModel.js';

export function generateProductSlug(name) {
  let cleaned = name
    .toLowerCase()
    .replace(/^ownfresh\s*/i, "")
    .replace(/kacchi\s*ghani/gi, "")
    .replace(/(\d+)\s*liters?\b/gi, "$1-litre")
    .replace(/(\d+)\s*litres?\b/gi, "$1-litre")
    .replace(/(\d+)\s*l\b/gi, "$1-litre")
    .replace(/(\d+)\s*ml\b/gi, "$1ml")
    .replace(/[+&]/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");

  if (!cleaned.startsWith("stone-pressed")) {
    cleaned = "stone-pressed-" + cleaned.replace(/^stone-pressed-/, "");
  }

  return cleaned;
}

async function migrate() {
  const mongoUri = process.env.MONGODB_URL;
  if (!mongoUri) {
    console.error("❌ MONGODB_URL is missing!");
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { dbName: "OwnFresh" });
  console.log("Connected to MongoDB");

  const products = await Product.find({});
  console.log(`Found ${products.length} products to check/assign slugs.`);

  const usedSlugs = new Set();

  for (const p of products) {
    let baseSlug = generateProductSlug(p.name);
    let slug = baseSlug;
    let counter = 1;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${++counter}`;
    }
    usedSlugs.add(slug);
    p.slug = slug;
    await p.save();
    console.log(`  + Assigned slug: "${p.name}" -> /product/${slug}`);
  }

  console.log("✅ All product slugs successfully verified and saved!");
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
