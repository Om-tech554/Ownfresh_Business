import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Tag from "../models/tagModel.js";
import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";
import Category from "../models/categoryModel.js";
import Settings from "../models/settingsModel.js";
import Review from "../models/reviewModel.js";
import Campaign from "../models/campaignModel.js";

async function runUpdate() {
  try {
    const uri = (process.env.MONGODB_URL || process.env.MONGO_URI || process.env.MONGODB_URI || "").trim();
    if (!uri) {
      console.error("No MongoDB URI found in environment!");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, { dbName: "OwnFresh" });
    console.log("Connected to MongoDB successfully.");

    // 1. Manage Tags: Remove "100% Pure" tag and rename/upsert "Cold Pressed" -> "Stone Pressed"
    console.log("Updating Tags...");
    const pureTag = await Tag.findOne({ $or: [{ name: /100% Pure/i }, { slug: "100-pure" }] });
    const pureTagId = pureTag ? pureTag._id : null;

    if (pureTag) {
      await Tag.findByIdAndDelete(pureTag._id);
      console.log(`Deleted '100% Pure' tag (ID: ${pureTag._id})`);
    }

    // Upsert or update "Stone Pressed" tag
    let stonePressedTag = await Tag.findOne({ slug: "stone-pressed" });
    const coldPressedTag = await Tag.findOne({ $or: [{ name: /Cold Pressed/i }, { slug: "cold-pressed" }] });

    if (coldPressedTag && !stonePressedTag) {
      coldPressedTag.name = "Stone Pressed";
      coldPressedTag.slug = "stone-pressed";
      coldPressedTag.icon = "Award";
      coldPressedTag.bgColor = "#1E971D";
      coldPressedTag.textColor = "#ffffff";
      coldPressedTag.description = "Traditionally extracted with natural stone mill (Kolhu) without heat or chemicals";
      coldPressedTag.isActive = true;
      await coldPressedTag.save();
      stonePressedTag = coldPressedTag;
      console.log(`Updated 'Cold Pressed' tag to 'Stone Pressed' (ID: ${stonePressedTag._id})`);
    } else if (!stonePressedTag) {
      stonePressedTag = await Tag.create({
        name: "Stone Pressed",
        slug: "stone-pressed",
        icon: "Award",
        bgColor: "#1E971D",
        textColor: "#ffffff",
        description: "Traditionally extracted with natural stone mill (Kolhu) without heat or chemicals",
        isActive: true
      });
      console.log(`Created new 'Stone Pressed' tag (ID: ${stonePressedTag._id})`);
      if (coldPressedTag) {
        await Tag.findByIdAndDelete(coldPressedTag._id);
      }
    } else if (coldPressedTag && stonePressedTag && String(coldPressedTag._id) !== String(stonePressedTag._id)) {
      await Tag.findByIdAndDelete(coldPressedTag._id);
      console.log(`Removed duplicate 'Cold Pressed' tag (ID: ${coldPressedTag._id})`);
    }

    // 2. Update Products
    console.log("Updating Products...");
    const products = await Product.find();
    console.log(`Found ${products.length} products to check and update.`);

    for (const prod of products) {
      let changed = false;

      // Update badges
      if (prod.badges && prod.badges.length > 0) {
        let newBadges = prod.badges.filter(b => !/100% Pure/i.test(b));
        newBadges = newBadges.map(b => /Cold Pressed/i.test(b) ? "Stone Pressed" : b);
        if (!newBadges.includes("Stone Pressed")) {
          newBadges.unshift("Stone Pressed");
        }
        // Deduplicate
        newBadges = [...new Set(newBadges)];
        prod.badges = newBadges;
        changed = true;
      } else {
        prod.badges = ["Stone Pressed"];
        changed = true;
      }

      // Update tags array
      if (prod.tags && prod.tags.length > 0) {
        let newTags = prod.tags.filter(t => pureTagId ? String(t) !== String(pureTagId) : true);
        if (stonePressedTag && !newTags.some(t => String(t) === String(stonePressedTag._id))) {
          newTags.push(stonePressedTag._id);
        }
        prod.tags = newTags;
        changed = true;
      } else if (stonePressedTag) {
        prod.tags = [stonePressedTag._id];
        changed = true;
      }

      // Update text fields if containing cold pressed
      if (prod.shortDesc && /cold[- ]pressed/i.test(prod.shortDesc)) {
        prod.shortDesc = prod.shortDesc.replace(/cold[- ]pressed/gi, "stone pressed");
        changed = true;
      }
      if (prod.description && /cold[- ]pressed/i.test(prod.description)) {
        prod.description = prod.description.replace(/cold[- ]pressed/gi, "stone pressed");
        changed = true;
      }

      if (changed) {
        await prod.save();
      }
    }
    console.log("Products updated.");

    // 3. Update Categories
    console.log("Updating Categories...");
    const categories = await Category.find();
    for (const cat of categories) {
      let changed = false;
      if (cat.description && /cold[- ]pressed/i.test(cat.description)) {
        cat.description = cat.description.replace(/cold[- ]pressed/gi, "stone pressed");
        changed = true;
      }
      if (cat.description && /100% pure/i.test(cat.description)) {
        cat.description = cat.description.replace(/100% pure,?/gi, "Traditional");
        changed = true;
      }
      if (changed) {
        await cat.save();
      }
    }
    console.log("Categories updated.");

    // 4. Update Settings announcements
    console.log("Updating Settings...");
    await Settings.findOneAndUpdate(
      { key: "announcement" },
      { value: "🎉 FREE SHIPPING ON ORDERS ABOVE ₹999 | TRADITIONAL STONE PRESSED BOTANIC OILS" },
      { upsert: true }
    );
    await Settings.findOneAndUpdate(
      { key: "announcement2" },
      { value: "🌿 AUTHENTIC TRADITIONAL STONE PRESSED BOTANIC OILS" },
      { upsert: true }
    );
    console.log("Settings announcements updated.");

    // 5. Update Campaigns & Reviews text if needed
    console.log("Updating Campaigns & Reviews...");
    const campaigns = await Campaign.find();
    for (const c of campaigns) {
      if (c.description && /cold[- ]pressed/i.test(c.description)) {
        c.description = c.description.replace(/cold[- ]pressed/gi, "stone pressed");
        await c.save();
      }
    }

    const reviews = await Review.find();
    for (const r of reviews) {
      if (r.comment && /cold[- ]pressed/i.test(r.comment)) {
        r.comment = r.comment.replace(/cold[- ]pressed/gi, "stone pressed");
        await r.save();
      }
    }

    console.log("✅ All database records updated successfully to Stone Pressed, and '100% Pure' tag has been removed!");
    process.exit(0);
  } catch (err) {
    console.error("Error during update:", err);
    process.exit(1);
  }
}

runUpdate();
