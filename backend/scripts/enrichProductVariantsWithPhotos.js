import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";
import Tag from "../models/tagModel.js";
import Category from "../models/categoryModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const variantImageMap = {
  mustard: {
    "250 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010978/products/Mustard-3.png",
    "500 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010978/products/Mustard-2.png",
    "1 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010978/products/Mustard-1.png",
    "2 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010978/products/Mustard-1.png",
    "5 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011028/products/Mustard-Oil-5.png",
    "15 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011028/products/Mustard-Oil-5.png",
  },
  groundnut: {
    "250 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010997/products/Groundnut-3.png",
    "500 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010997/products/Groundnut-2.png",
    "1 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010974/products/Groundnut-1.png",
    "2 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010974/products/Groundnut-1.png",
    "5 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011019/products/Groundnut-Oil-5.png",
    "15 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011019/products/Groundnut-Oil-5.png",
  },
  sesame: {
    "250 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011005/products/sesame-3.png",
    "500 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011078/products/sesame-2.png",
    "1 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010985/products/sesame-1.png",
    "2 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010985/products/sesame-1.png",
    "5 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011005/products/sesame-Oil-5.png",
    "15 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011005/products/sesame-Oil-5.png",
  },
  sunflower: {
    "250 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010989/products/sunflower-3.png",
    "500 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011084/products/sunflower-2.png",
    "1 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010989/products/sunflower-1.png",
    "2 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010989/products/sunflower-1.png",
    "5 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011051/products/sunflower-oil-5.png",
    "15 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011051/products/sunflower-oil-5.png",
  },
  coconut: {
    "250 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786876701/products/coconut-3.png",
    "500 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786876701/products/rcnevqyv8ud08zvljewb.png",
    "1 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1788336143/products/vwv4szdirrtjkeclkxhs.png",
    "2 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1788336143/products/vwv4szdirrtjkeclkxhs.png",
    "5 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1788336285/products/tucxe5ci4kkw5rveqiez.png",
    "15 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1788336285/products/tucxe5ci4kkw5rveqiez.png",
  },
  safflower: {
    "250 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786877029/products/xqqbgwnyyslpumvaqoq1.png",
    "500 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786877029/products/xqqbgwnyyslpumvaqoq1.png",
    "1 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786877029/products/xqqbgwnyyslpumvaqoq1.png",
    "2 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786877029/products/xqqbgwnyyslpumvaqoq1.png",
    "5 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011039/products/Safflower-Oil-5.png",
    "15 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011039/products/Safflower-Oil-5.png",
  },
  combo: {
    "250 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011143/products/Combo-250-ml.png",
    "500 ml": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011143/products/Combo-250-ml.png",
    "1 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011106/products/Groundnut-sunflower-sesame-Combo-1L.png",
    "5 Litre": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011064/products/Groundnut-coconut-sesame-Combo-1.png",
  }
};

const defaultTagsList = [
  {
    name: "Best Seller",
    slug: "best-seller",
    icon: "Flame",
    bgColor: "#EA580C",
    textColor: "#ffffff",
    description: "Customer favorite top seller",
    isActive: true
  },
  {
    name: "Stone Pressed",
    slug: "stone-pressed",
    icon: "Award",
    bgColor: "#1E971D",
    textColor: "#ffffff",
    description: "Traditionally extracted with natural stone mill (Kolhu) without heat or chemicals",
    isActive: true
  },
  {
    name: "Organic",
    slug: "organic",
    icon: "Leaf",
    bgColor: "#15803D",
    textColor: "#ffffff",
    description: "Naturally grown non-GMO seeds",
    isActive: true
  },
  {
    name: "Special Offer",
    slug: "special-offer",
    icon: "Sparkles",
    bgColor: "#DC2626",
    textColor: "#ffffff",
    description: "Promotional festival discounted price",
    isActive: true
  },
  {
    name: "New Arrival",
    slug: "new-arrival",
    icon: "Star",
    bgColor: "#4F46E5",
    textColor: "#ffffff",
    description: "Newly launched batch",
    isActive: true
  }
];

async function runEnrichment() {
  try {
    let uri = (process.env.MONGODB_URL || process.env.MONGO_URI || process.env.MONGODB_URI || "").trim();
    if (!uri) {
      console.error("No MongoDB URI found in environment!");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, { dbName: "OwnFresh" });
    console.log("Connected to MongoDB successfully.");

    // 1. Seed Tags
    console.log("Seeding / Ensuring default tags...");
    const createdTags = [];
    for (const dt of defaultTagsList) {
      const tag = await Tag.findOneAndUpdate({ slug: dt.slug }, dt, { upsert: true, new: true });
      createdTags.push(tag);
    }
    console.log(`Created/Verified ${createdTags.length} tags.`);

    const bestSellerTag = createdTags.find(t => t.slug === "best-seller");
    const stonePressedTag = createdTags.find(t => t.slug === "stone-pressed");
    const organicTag = createdTags.find(t => t.slug === "organic");

    // 2. Fetch all products
    const products = await Product.find().populate("category");
    console.log(`Found ${products.length} products to enrich.`);

    for (const product of products) {
      const nameLower = (product.name || "").toLowerCase();
      let oilType = "mustard";
      if (nameLower.includes("groundnut") || nameLower.includes("peanut")) oilType = "groundnut";
      else if (nameLower.includes("coconut")) oilType = "coconut";
      else if (nameLower.includes("sesame") || nameLower.includes("til")) oilType = "sesame";
      else if (nameLower.includes("sunflower")) oilType = "sunflower";
      else if (nameLower.includes("safflower") || nameLower.includes("kardi")) oilType = "safflower";
      else if (nameLower.includes("combo")) oilType = "combo";

      // Assign tags & badges to product
      const productTags = [stonePressedTag?._id].filter(Boolean);
      if (oilType === "groundnut" || oilType === "mustard") {
        if (bestSellerTag) productTags.push(bestSellerTag._id);
      }
      if (oilType === "coconut" || oilType === "sesame") {
        if (organicTag) productTags.push(organicTag._id);
      }

      product.tags = productTags;
      product.badges = ["Stone Pressed"];
      if (oilType === "groundnut" || oilType === "mustard") product.badges.push("Best Seller");
      if (oilType === "coconut") product.badges.push("Organic");

      // Set product images gallery
      const typeMap = variantImageMap[oilType] || variantImageMap.mustard;
      const galleryImages = [
        product.image,
        typeMap["1 Litre"] || product.image,
        typeMap["5 Litre"] || product.image,
        typeMap["500 ml"] || product.image,
        typeMap["250 ml"] || product.image
      ].filter((img, idx, arr) => img && arr.indexOf(img) === idx);

      product.images = galleryImages;
      await product.save();

      // 3. Fetch or create all standard bottle variants for this product
      const standardSizes = [
        { name: "250 ml", size: "250ml", weight: "250g", defaultPrice: 180, defaultSale: 150, stock: 45 },
        { name: "500 ml", size: "500ml", weight: "500g", defaultPrice: 320, defaultSale: 260, stock: 60 },
        { name: "1 Litre", size: "1L", weight: "1kg", defaultPrice: 580, defaultSale: 475, stock: 120 },
        { name: "2 Litre", size: "2L", weight: "2kg", defaultPrice: 1100, defaultSale: 920, stock: 35 },
        { name: "5 Litre", size: "5L", weight: "5kg", defaultPrice: 4600, defaultSale: 3800, stock: 25 },
        { name: "15 Litre", size: "15L", weight: "15kg", defaultPrice: 12500, defaultSale: 10400, stock: 10 }
      ];

      const existingVariants = await ProductVariant.find({ product: product._id });

      for (const sizeDef of standardSizes) {
        let matchingVariant = existingVariants.find(v => {
          const vName = (v.name || "").toLowerCase().replace(/\s+/g, "");
          const sName = sizeDef.name.toLowerCase().replace(/\s+/g, "");
          return vName.includes(sName) || sName.includes(vName);
        });

        const bottleImg = typeMap[sizeDef.name] || typeMap["1 Litre"] || product.image;
        const variantGallery = [
          bottleImg,
          typeMap["5 Litre"] || bottleImg,
          typeMap["1 Litre"] || bottleImg,
          product.image
        ].filter((img, idx, arr) => img && arr.indexOf(img) === idx);

        if (matchingVariant) {
          matchingVariant.size = sizeDef.size;
          matchingVariant.weight = sizeDef.weight;
          matchingVariant.image = bottleImg;
          matchingVariant.images = variantGallery;
          if (!matchingVariant.stockQuantity || matchingVariant.stockQuantity === 0) {
            matchingVariant.stockQuantity = sizeDef.stock;
          }
          await matchingVariant.save();
        } else {
          // Create variant
          await ProductVariant.create({
            product: product._id,
            name: sizeDef.name,
            size: sizeDef.size,
            sku: `${product.sku || 'OF'}-${sizeDef.size.toUpperCase()}`,
            price: sizeDef.defaultPrice,
            salePrice: sizeDef.defaultSale,
            stockQuantity: sizeDef.stock,
            weight: sizeDef.weight,
            image: bottleImg,
            images: variantGallery,
            status: 'Active'
          });
        }
      }
    }

    console.log("Enrichment complete! All products now have dynamic variant images, galleries, and tags.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Enrichment error:", error);
    process.exit(1);
  }
}

runEnrichment();
