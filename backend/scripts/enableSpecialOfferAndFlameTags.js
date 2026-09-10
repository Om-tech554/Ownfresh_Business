import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Product from "../models/productModel.js";
import Tag from "../models/tagModel.js";

dotenv.config();

async function run() {
  await connectDB();

  console.log("Connected to MongoDB. Finding or creating Special Offer and Flame tags...");

  // 1. Find or create Special Offer Tag
  let specialOfferTag = await Tag.findOne({
    $or: [
      { name: { $regex: /^special offer$/i } },
      { slug: { $regex: /^special-offer/i } }
    ]
  });

  if (!specialOfferTag) {
    specialOfferTag = await Tag.create({
      name: "Special Offer",
      slug: "special-offer",
      icon: "Sparkles",
      bgColor: "#DC2626", // Eye-catching crimson red
      textColor: "#ffffff",
      description: "Exclusive promotional special offer price",
      isActive: true
    });
    console.log("Created Special Offer Tag:", specialOfferTag._id);
  } else {
    specialOfferTag.name = "Special Offer";
    specialOfferTag.icon = "Sparkles";
    specialOfferTag.bgColor = "#DC2626";
    specialOfferTag.textColor = "#ffffff";
    specialOfferTag.isActive = true;
    await specialOfferTag.save();
    console.log("Found & updated Special Offer Tag:", specialOfferTag._id);
  }

  // 2. Find or create Flame Icon Tag (e.g. Best Seller / Trending)
  let flameTag = await Tag.findOne({
    $or: [
      { name: { $regex: /^best seller$/i } },
      { icon: "Flame" },
      { slug: { $regex: /^best-seller|^flame/i } }
    ]
  });

  if (!flameTag) {
    flameTag = await Tag.create({
      name: "Best Seller",
      slug: "best-seller",
      icon: "Flame",
      bgColor: "#EA580C", // Deep vibrant orange
      textColor: "#ffffff",
      description: "Trending customer top favorite",
      isActive: true
    });
    console.log("Created Flame Tag:", flameTag._id);
  } else {
    flameTag.icon = "Flame";
    flameTag.bgColor = flameTag.bgColor || "#EA580C";
    flameTag.isActive = true;
    await flameTag.save();
    console.log("Found & updated Flame Tag:", flameTag._id);
  }

  // 3. Fetch all products
  const allProducts = await Product.find();
  console.log(`Found ${allProducts.length} products.`);

  // 4. Enable Special Offer on EVERY product
  // 5. Enable Flame tag on some selected products (e.g., top 4 products / best-selling oils)
  for (let i = 0; i < allProducts.length; i++) {
    const product = allProducts[i];
    const tagsSet = new Set((product.tags || []).map(t => t.toString()));

    // Add Special Offer to every product
    tagsSet.add(specialOfferTag._id.toString());

    // Add Flame icon tag to some products (e.g., first 4 products, or products with name matching groundnut, mustard, coconut)
    if (i < 4 || (product.name && (product.name.toLowerCase().includes("groundnut") || product.name.toLowerCase().includes("mustard") || product.name.toLowerCase().includes("coconut")))) {
      tagsSet.add(flameTag._id.toString());
    }

    product.tags = Array.from(tagsSet);
    await product.save();
    console.log(`  ✓ Updated ${product.name} with ${product.tags.length} tags`);
  }

  console.log("🎉 Successfully enabled Special Offer on all products and Flame tag on featured products!");
  process.exit(0);
}

run().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
