import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/productModel.js";
import Category from "./models/categoryModel.js";

dotenv.config();

const categoriesData = [
  {
    name: "Groundnut Oil",
    slug: "groundnut-oil",
    description: "100% Pure Kacchi Ghani Cold Stone Pressed Groundnut Oil.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011514/static_site/Groundnut-1-600x600.png",
    status: "Active"
  },
  {
    name: "Coconut Oil",
    slug: "coconut-oil",
    description: "100% Pure Botanic Grade Stone Pressed Coconut Oil.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011520/static_site/272d6f3f69f4e2e81051b6a17124b504.png",
    status: "Active"
  },
  {
    name: "Mustard Oil",
    slug: "mustard-oil",
    description: "Pungent & Authentic Kacchi Ghani Mustard Oil for authentic cooking & immunity.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1776670786/products/ktayxxopabq5idmxisgf.jpg",
    status: "Active"
  },
  {
    name: "Sesame Oil",
    slug: "sesame-oil",
    description: "Antioxidant-rich Pure Stone Pressed Til / Sesame Oil.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png",
    status: "Active"
  },
  {
    name: "Safflower Oil",
    slug: "safflower-oil",
    description: "Heart-healthy Kacchi Ghani Safflower / Kardi Oil.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011520/static_site/272d6f3f69f4e2e81051b6a17124b504.png",
    status: "Active"
  },
  {
    name: "Sunflower Oil",
    slug: "sunflower-oil",
    description: "Light & Vitamin-E Rich Cold Pressed Sunflower Oil.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011514/static_site/Groundnut-1-600x600.png",
    status: "Active"
  },
  {
    name: "Combo Value Packs",
    slug: "combo-packs",
    description: "Multi-oil Sampler & Family Value Combo Packs.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011501/static_site/DSC08274-scaled.jpg",
    status: "Active"
  }
];

async function seedCategoriesAndLinkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB!");

    // 1. Seed or Upsert Categories
    const categoryDocMap = {};
    for (const cat of categoriesData) {
      let doc = await Category.findOne({ slug: cat.slug });
      if (!doc) {
        doc = await Category.create(cat);
        console.log(`✅ Created Category: "${cat.name}"`);
      } else {
        doc.image = cat.image;
        doc.description = cat.description;
        await doc.save();
        console.log(`⚡ Updated Category: "${cat.name}"`);
      }
      categoryDocMap[cat.name] = doc._id;
    }

    // 2. Fetch all products and assign categories
    const products = await Product.find({});
    console.log(`\nAssigning categories to ${products.length} products...`);

    let updatedCount = 0;

    for (const prod of products) {
      const titleLower = prod.name.toLowerCase();
      let matchedCategoryName = "Groundnut Oil"; // Default fallback

      if (titleLower.includes("combo")) {
        matchedCategoryName = "Combo Value Packs";
      } else if (titleLower.includes("groundnut")) {
        matchedCategoryName = "Groundnut Oil";
      } else if (titleLower.includes("coconut")) {
        matchedCategoryName = "Coconut Oil";
      } else if (titleLower.includes("mustard")) {
        matchedCategoryName = "Mustard Oil";
      } else if (titleLower.includes("sesame")) {
        matchedCategoryName = "Sesame Oil";
      } else if (titleLower.includes("safflower")) {
        matchedCategoryName = "Safflower Oil";
      } else if (titleLower.includes("sunflower")) {
        matchedCategoryName = "Sunflower Oil";
      }

      const catId = categoryDocMap[matchedCategoryName];
      prod.category = catId;
      await prod.save();
      updatedCount++;
      console.log(` [${updatedCount}/${products.length}] Linked "${prod.name}" -> Category "${matchedCategoryName}"`);
    }

    console.log(`\n🎉 SHOP CATEGORY SEEDING COMPLETE! All ${updatedCount} products successfully categorized.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
}

seedCategoriesAndLinkProducts();
