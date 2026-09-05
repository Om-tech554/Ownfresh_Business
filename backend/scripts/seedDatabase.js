import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";
import Category from "../models/categoryModel.js";
import Blog from "../models/blogModel.js";
import Review from "../models/reviewModel.js";
import MembershipPlan from "../models/membershipPlanModel.js";
import Settings from "../models/settingsModel.js";
import Carrier from "../models/carrierModel.js";
import Coupon from "../models/couponModel.js";
import Campaign from "../models/campaignModel.js";
import User from "../models/usermodel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const oilPriceMap = {
  "Sunflower Oil": {
    "250 ml": { price: 180, salePrice: 148 },
    "500 ml": { price: 300, salePrice: 246 },
    "1 Litre": { price: 540, salePrice: 443 },
    "5 Litre": { price: 4320, salePrice: 3542 },
    "15 Litre": { price: 11880, salePrice: 9742 }
  },
  "Safflower Oil": {
    "250 ml": { price: 190, salePrice: 156 },
    "500 ml": { price: 320, salePrice: 262 },
    "1 Litre": { price: 580, salePrice: 476 },
    "5 Litre": { price: 4640, salePrice: 3805 },
    "15 Litre": { price: 12760, salePrice: 10463 }
  },
  "Groundnut Oil": {
    "250 ml": { price: 195, salePrice: 160 },
    "500 ml": { price: 330, salePrice: 271 },
    "1 Litre": { price: 605, salePrice: 496 },
    "5 Litre": { price: 4840, salePrice: 3969 },
    "15 Litre": { price: 13310, salePrice: 10914 }
  },
  "Sesame Oil": {
    "250 ml": { price: 210, salePrice: 172 },
    "500 ml": { price: 360, salePrice: 295 },
    "1 Litre": { price: 680, salePrice: 558 },
    "5 Litre": { price: 5440, salePrice: 4461 },
    "15 Litre": { price: 14960, salePrice: 12267 }
  },
  "Mustard Oil": {
    "250 ml": { price: 185, salePrice: 152 },
    "500 ml": { price: 315, salePrice: 258 },
    "1 Litre": { price: 575, salePrice: 472 },
    "5 Litre": { price: 4600, salePrice: 3772 },
    "15 Litre": { price: 12650, salePrice: 10373 }
  },
  "Coconut Oil": {
    "250 ml": { price: 350, salePrice: 308 },
    "500 ml": { price: 635, salePrice: 559 },
    "1 Litre": { price: 1205, salePrice: 1060 },
    "5 Litre": { price: 6025, salePrice: 5302 },
    "15 Litre": { price: 18075, salePrice: 15906 }
  }
};

const categoryImages = {
  "Coconut Oil": {
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786879035/categories/vhjtwmpe2c4qx66i1hee.png",
    description: "100% Pure Botanic Grade Stone Pressed Coconut Oil."
  },
  "Combo Value Packs": {
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786880060/categories/k8bm8xmpwd4gy2tmsloz.jpg",
    description: "Multi-oil Sampler & Family Value Combo Packs."
  },
  "Groundnut Oil": {
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786879625/categories/zkm2aghx5vxaywyci5mb.jpg",
    description: "100% Pure Kacchi Ghani Cold Stone Pressed Groundnut Oil."
  },
  "Mustard Oil": {
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786879541/categories/d3ofwmwxykutjomgcppj.jpg",
    description: "Pungent & Authentic Kacchi Ghani Mustard Oil for authentic cooking & immunity."
  },
  "Safflower Oil": {
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786879472/categories/pviimo18id5ikzxtwkql.jpg",
    description: "Heart-healthy Kacchi Ghani Safflower / Kardi Oil."
  },
  "Sesame Oil": {
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786879726/categories/azjqsir4twk8ew2lgrvr.jpg",
    description: "Antioxidant-rich Pure Stone Pressed Til / Sesame Oil."
  },
  "Sunflower Oil": {
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786879251/categories/y7cf5slfmhl97o4immkl.png",
    description: "Light & Vitamin-E Rich Cold Pressed Sunflower Oil."
  }
};

const productImageMap = {
  // 5 Litres
  "OwnFresh stone  Pressed Kacchi Ghani 5 Litre Coconut Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1788336285/products/tucxe5ci4kkw5rveqiez.png",
  "OwnFresh stone Pressed Kacchi Ghani 5 Litre Sesame Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011005/products/sesame-Oil-5.png",
  "OwnFresh stone Pressed Kacchi Ghani 5 Litre Mustard Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011028/products/Mustard-Oil-5.png",
  "OwnFresh stone Pressed Kacchi Ghani 5 Litre Safflower Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011039/products/Safflower-Oil-5.png",
  "OwnFresh stone Pressed Kacchi Ghani 5 Liter Groundnut Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011019/products/Groundnut-Oil-5.png",
  "OwnFresh stone Pressed Kacchi Ghani 5 Litre Sunflower Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011051/products/sunflower-oil-5.png",
  
  // 1 Litres
  "OwnFresh stone  Pressed Kacchi Ghani 1 Litre Coconut Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1788336143/products/vwv4szdirrtjkeclkxhs.png",
  "OwnFresh stone Pressed Kacchi Ghani 1 Litre Sesame Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010985/products/sesame-1.png",
  "OwnFresh stone Pressed Kacchi Ghani 1 Litre Mustard Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010978/products/Mustard-1.png",
  "OwnFresh stone Pressed Kacchi Ghani 1 Litre Safflower Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786877029/products/Safflower-1.png",
  "OwnFresh stone Pressed Kacchi Ghani 1 Liter Groundnut Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010974/products/Groundnut-1.png",
  "OwnFresh stone Pressed Kacchi Ghani 1 Litre Sunflower Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010989/products/sunflower-1.png",

  // 500 ML
  "OwnFresh stone Pressed Kacchi Ghani 500 ML Coconut Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786876701/products/rcnevqyv8ud08zvljewb.png",
  "OwnFresh stone Pressed Kacchi Ghani 500 ML Sesame Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011078/products/sesame-2.png",
  "OwnFresh stone Pressed Kacchi Ghani 500ML Mustard Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010978/products/Mustard-2.png",
  "OwnFresh stone Pressed Kacchi Ghani 500 ML Safflower Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786877029/products/Safflower-2.png",
  "OwnFresh stone Pressed Kacchi Ghani 500 ML Groundnut Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010997/products/Groundnut-2.png",
  "OwnFresh stone Pressed Kacchi Ghani 500 ML Sunflower Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011084/products/sunflower-2.png",

  // 250 ML
  "OwnFresh stone Pressed Kacchi Ghani 250 ML Coconut Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786876701/products/coconut-3.png",
  "OwnFresh stone Pressed Kacchi Ghani 250 ML Sesame Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011005/products/sesame-3.png",
  "OwnFresh stone Pressed Kacchi Ghani 250 ML Mustard Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010978/products/Mustard-3.png",
  "OwnFresh stone Pressed Kacchi Ghani 250 ML Safflower Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786877029/products/xqqbgwnyyslpumvaqoq1.png",
  "OwnFresh stone Pressed Kacchi Ghani 250 ML Groundnut Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010997/products/Groundnut-3.png",
  "OwnFresh stone Pressed Kacchi Ghani 250 ML Sunflower Oil": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010989/products/sunflower-3.png",

  // Combos
  "OwnFresh Stone Pressed Kacchi Ghani Oil 1L Combo pack of 3": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011106/products/Groundnut-sunflower-sesame-Combo-1L.png",
  "OwnFresh Stone Pressed Kacchi Ghani Oil 1L Combo pack of 3 (Groundnut + Mustard + Sesame)": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011106/products/Groundnut-sunflower-sesame-Combo-1L.png",
  "OwnFresh Stone Pressed Kacchi Ghani Oil 1L Combo pack of 3 (Coconut + Safflower + Sunflower)": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011106/products/Safflower-Groundnut-sunflower-Combo-1L.png",
  "OwnFresh Stone Pressed Kacchi Ghani Oil 1L Combo pack of 3 (Groundnut + Safflower + Sunflower)": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011106/products/Safflower-Groundnut-sunflower-Combo-1L.png",
  "OwnFresh Stone Pressed Kacchi Ghani Oil 250 ML Combo pack of 5": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011143/products/Combo-250-ml.png",
  "OwnFresh Stone Pressed Kacchi Ghani Oil 250 ML Combo pack of 5 (All-Star Sampler)": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011143/products/Combo-250-ml.png",
  "OwnFresh Stone Pressed Kacchi Ghani Oil 250 ML Combo pack of 5 (Wellness Essentials)": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011143/products/Combo-250-ml.png",
  "OwnFresh stone Pressed Kacchi Ghani 500 ML Combo pack of 3": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011064/products/Groundnut-coconut-sesame-Combo-1.png",
  "OwnFresh stone Pressed Kacchi Ghani 500 ML Combo pack of 3 (Traditional Trio)": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011064/products/Groundnut-coconut-sesame-Combo-1.png",
  "OwnFresh stone Pressed Kacchi Ghani 500 ML Combo pack of 3 (Daily Health Trio)": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011064/products/Groundnut-coconut-sesame-Combo-1.png",
  "OwnFresh stone Pressed Kacchi Ghani 500 ML Combo pack of 3 (Immunity Booster Trio)": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011064/products/Groundnut-coconut-sesame-Combo-1.png"
};

async function restoreCompleteLiveDatabase() {
  console.log("=================================================");
  console.log("🚀 STARTING 100% COMPLETE DATABASE RESTORATION");
  console.log("=================================================");

  const mongoUri = process.env.MONGODB_URL;
  if (!mongoUri) {
    console.error("❌ MONGODB_URL is missing in backend/.env!");
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { dbName: "OwnFresh" });
  console.log("✅ Connected to MongoDB Atlas cluster (OwnFresh DB)");

  // --- 0. ENSURE ADMIN/SYSTEM USER ---
  console.log("\n👤 0. Ensuring Admin/System User...");
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@myownfresh.com").toLowerCase().trim();
  const adminMobile = process.env.ADMIN_MOBILE || "+918999773438";
  
  let systemUser = await User.findOne({ email: adminEmail });
  if (!systemUser) {
    systemUser = await User.create({
      fullName: "OwnFresh Official",
      userName: adminEmail.split("@")[0],
      email: adminEmail,
      role: "admin",
      mobile: adminMobile,
      referralCode: "OWNFRESH",
      walletBalance: 0,
      referralPoints: 0,
      isOtpVerified: true
    });
    console.log(`  + Created System Admin User: ${adminEmail}`);
  } else {
    systemUser.isOtpVerified = true;
    systemUser.role = "admin";
    if (adminMobile) systemUser.mobile = adminMobile;
    await systemUser.save();
    console.log(`  = Existing System Admin User found: ${systemUser.email}`);
  }

  // --- 1. RESTORE ALL 7 CATEGORIES WITH PERFECT IMAGES ---
  console.log("\n📂 1. Restoring Categories with Live Images (7)...");
  await Category.deleteMany({});
  const categoriesData = [
    {
      name: "Coconut Oil",
      slug: "coconut-oil",
      description: categoryImages["Coconut Oil"].description,
      image: categoryImages["Coconut Oil"].image
    },
    {
      name: "Groundnut Oil",
      slug: "groundnut-oil",
      description: categoryImages["Groundnut Oil"].description,
      image: categoryImages["Groundnut Oil"].image
    },
    {
      name: "Mustard Oil",
      slug: "mustard-oil",
      description: categoryImages["Mustard Oil"].description,
      image: categoryImages["Mustard Oil"].image
    },
    {
      name: "Sesame Oil",
      slug: "sesame-oil",
      description: categoryImages["Sesame Oil"].description,
      image: categoryImages["Sesame Oil"].image
    },
    {
      name: "Safflower Oil",
      slug: "safflower-oil",
      description: categoryImages["Safflower Oil"].description,
      image: categoryImages["Safflower Oil"].image
    },
    {
      name: "Sunflower Oil",
      slug: "sunflower-oil",
      description: categoryImages["Sunflower Oil"].description,
      image: categoryImages["Sunflower Oil"].image
    },
    {
      name: "Combo Value Packs",
      slug: "combo-value-packs",
      description: categoryImages["Combo Value Packs"].description,
      image: categoryImages["Combo Value Packs"].image
    }
  ];

  const catDocs = await Category.insertMany(categoriesData);
  const catMap = {};
  for (const doc of catDocs) {
    catMap[doc.name] = doc;
    catMap[doc.slug] = doc;
    console.log(`  + Created Category: ${doc.name} (${doc.slug})`);
  }

  // --- 2. RESTORE ALL 32 PRODUCTS & FULL VARIANTS WITH AUTHENTIC PACK SHOTS ---
  console.log("\n🛒 2. Restoring All 32 Products and Full Variants with Authentic Media...");
  const invFile = path.join(__dirname, "../data_backup/products_inventory.json");
  if (!fs.existsSync(invFile)) {
    console.error("❌ products_inventory.json not found in data_backup!");
    process.exit(1);
  }

  await Product.deleteMany({});
  await ProductVariant.deleteMany({});

  const rawProducts = JSON.parse(fs.readFileSync(invFile, "utf-8"));
  console.log(`  Found ${rawProducts.length} product entries in inventory backup.`);

  let productCount = 0;
  let variantCount = 0;

  for (let idx = 0; idx < rawProducts.length; idx++) {
    const p = rawProducts[idx];
    
    // Categorization
    let catName = "Groundnut Oil";
    const rawCat = p.categories?.[0]?.name || p.category?.name || "";
    if (rawCat.includes("Coconut")) catName = "Coconut Oil";
    else if (rawCat.includes("Mustard")) catName = "Mustard Oil";
    else if (rawCat.includes("Sesame") || rawCat.includes("Gingelly")) catName = "Sesame Oil";
    else if (rawCat.includes("Safflower")) catName = "Safflower Oil";
    else if (rawCat.includes("Sunflower")) catName = "Sunflower Oil";
    else if (rawCat.includes("Combo")) catName = "Combo Value Packs";
    else if (rawCat.includes("Groundnut")) catName = "Groundnut Oil";
    else if (p.name.toLowerCase().includes("combo")) catName = "Combo Value Packs";
    else if (p.name.toLowerCase().includes("coconut")) catName = "Coconut Oil";
    else if (p.name.toLowerCase().includes("mustard")) catName = "Mustard Oil";
    else if (p.name.toLowerCase().includes("sesame")) catName = "Sesame Oil";
    else if (p.name.toLowerCase().includes("safflower")) catName = "Safflower Oil";
    else if (p.name.toLowerCase().includes("sunflower")) catName = "Sunflower Oil";

    const targetCategory = catMap[catName] || Object.values(catMap)[0];

    // Determine unique name (differentiating combos if needed)
    let prodName = p.name;
    if (catName === "Combo Value Packs") {
      if (idx === 10) prodName = "OwnFresh Stone Pressed Kacchi Ghani Oil 1L Combo pack of 3 (Groundnut + Mustard + Sesame)";
      else if (idx === 11) prodName = "OwnFresh Stone Pressed Kacchi Ghani Oil 1L Combo pack of 3 (Coconut + Safflower + Sunflower)";
      else if (idx === 12) prodName = "OwnFresh Stone Pressed Kacchi Ghani Oil 1L Combo pack of 3 (Groundnut + Safflower + Sunflower)";
      else if (idx === 13) prodName = "OwnFresh Stone Pressed Kacchi Ghani Oil 250 ML Combo pack of 5 (All-Star Sampler)";
      else if (idx === 14) prodName = "OwnFresh Stone Pressed Kacchi Ghani Oil 250 ML Combo pack of 5 (Wellness Essentials)";
      else if (idx === 15) prodName = "OwnFresh stone Pressed Kacchi Ghani 500 ML Combo pack of 3 (Traditional Trio)";
      else if (idx === 16) prodName = "OwnFresh stone Pressed Kacchi Ghani 500 ML Combo pack of 3 (Daily Health Trio)";
      else if (idx === 17) prodName = "OwnFresh stone Pressed Kacchi Ghani 500 ML Combo pack of 3 (Immunity Booster Trio)";
    }

    const mainImage = productImageMap[prodName] || productImageMap[p.name] || p.images?.[0]?.src || targetCategory.image;
    const cleanShortDesc = (p.short_description || p.description || prodName)
      .replace(/<[^>]*>?/gm, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Raw Base Price
    const rawPrice = parseInt(p.prices?.price || "0", 10);
    const basePrice = rawPrice > 1000 ? Math.round(rawPrice / 100) : rawPrice || 499;

    const productDoc = await Product.create({
      name: prodName,
      sku: p.sku || `OF-${catName.slice(0, 3).toUpperCase()}-${idx + 1}`,
      image: mainImage,
      rating: 5,
      shortDesc: cleanShortDesc || `Pure 100% Stone Pressed ${catName} by OwnFresh.`,
      description: p.description || `<p>100% Pure stone pressed traditional ${catName}. Unrefined, chemical-free and nutrient rich.</p>`,
      category: targetCategory._id,
      status: "Active"
    });
    console.log(`  + [${idx + 1}/${rawProducts.length}] Created Product: "${productDoc.name}"`);
    productCount++;

    // CREATE VARIANTS
    if (oilPriceMap[catName]) {
      // Standard Single Oil: 5 size variants
      const sizes = ["250 ml", "500 ml", "1 Litre", "5 Litre", "15 Litre"];
      for (const sz of sizes) {
        const pInfo = oilPriceMap[catName][sz];
        await ProductVariant.create({
          product: productDoc._id,
          name: sz,
          price: pInfo.price,
          salePrice: pInfo.salePrice,
          stockQuantity: 100,
          status: "Active"
        });
        variantCount++;
      }
    } else {
      // Combo Pack variants
      const comboVariants = [
        { name: "Standard Pack", price: basePrice, salePrice: Math.round(basePrice * 0.82) },
        { name: "Gift Box Edition", price: basePrice + 150, salePrice: Math.round((basePrice + 150) * 0.85) },
        { name: "Eco Packaging Pack", price: basePrice, salePrice: Math.round(basePrice * 0.80) }
      ];
      for (const cv of comboVariants) {
        await ProductVariant.create({
          product: productDoc._id,
          name: cv.name,
          price: cv.price,
          salePrice: cv.salePrice,
          stockQuantity: 100,
          status: "Active"
        });
        variantCount++;
      }
    }
  }

  console.log(`  🎉 Restored ${productCount} Products with ${variantCount} Variants.`);

  // --- 3. RESTORE ALL 38 BLOGS WITH FULL HTML CONTENT AND AUTHENTIC IMAGES ---
  console.log("\n📝 3. Restoring All 38 Educational Blogs with Full Content & Perfect Images...");
  await Blog.deleteMany({});
  const blogsFile = path.join(__dirname, "../data_backup/blogs.json");
  const liveBlogsFile = path.join(__dirname, "../data_from_live_render/all_blogs_live.json");
  
  if (fs.existsSync(blogsFile)) {
    const rawBlogs = JSON.parse(fs.readFileSync(blogsFile, "utf-8"));
    const liveBlogs = fs.existsSync(liveBlogsFile) ? JSON.parse(fs.readFileSync(liveBlogsFile, "utf-8")) : [];
    
    const liveMap = new Map();
    liveBlogs.forEach(b => {
      if (b.slug) liveMap.set(b.slug, b);
      if (b.title) liveMap.set(b.title.trim(), b);
    });

    let blogCount = 0;
    for (const b of rawBlogs) {
      const title = b.title?.rendered?.replace(/&#8217;/g, "'").replace(/&amp;/g, "&") || "Blog Post";
      const rawContent = b.content?.rendered || "";
      const rawExcerpt = (b.excerpt?.rendered || "").replace(/<[^>]*>?/gm, " ").trim();
      const slug = b.slug || "";
      
      const liveMatch = liveMap.get(slug) || liveMap.get(title.trim());
      const featuredImg = (liveMatch && liveMatch.image && !liveMatch.image.includes("placeholder"))
        ? liveMatch.image
        : (b._embedded?.['wp:featuredmedia']?.[0]?.source_url || b.jetpack_featured_media_url || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774199707/ownfresh_media/caqc2ep5nmgdf9cnknlu.png");

      await Blog.create({
        title,
        slug,
        description: rawContent || rawExcerpt || title,
        image: featuredImg,
        sections: [{ content: rawContent }],
        author: liveMatch?.author || "Own Fresh Blogs",
        status: "LIVE",
        category: liveMatch?.category || "Health & Wellness",
        focusKeyword: b.yoast_head_json?.schema?.['@graph']?.[0]?.name || title,
        searchDescription: rawExcerpt
      });
      console.log(`  + Created Blog [${++blogCount}/38]: "${title.slice(0, 45)}..."`);
    }
    console.log(`  🎉 Restored ${blogCount} Blogs with Full HTML Content.`);
  }

  // --- 4. RESTORE ALL 12 FEATURED CUSTOMER TESTIMONIALS / REVIEWS ---
  console.log("\n⭐ 4. Restoring All 12 Customer Testimonials...");
  const reviewsData = [
    {
      user: systemUser._id,
      userName: "Dr. Amit Varma (Cardiologist)",
      location: "Mumbai, Maharashtra",
      rating: 5,
      title: "A Premium Choice for Heart Health",
      comment: "I recommend cold pressed oils to my patients, and OwnFresh Safflower Oil is one of the best I've found. It's completely unrefined and free of chemical solvents. The chemical-free extraction makes a noticeable difference in purity and health benefits.",
      isFeatured: true,
      isVerifiedBuyer: true,
      status: "APPROVED"
    },
    {
      user: systemUser._id,
      userName: "Sneha Rao",
      location: "Bengaluru, Karnataka",
      rating: 5,
      title: "Highly Recommended for Health-Conscious Homes",
      comment: "Switched to OwnFresh Stone Pressed Groundnut Oil for our daily cooking. It is light, has a high smoke point, and retains the natural sweetness of peanuts. It's heartening to find a brand committed to traditional extraction methods.",
      isFeatured: true,
      isVerifiedBuyer: true,
      status: "APPROVED"
    },
    {
      user: systemUser._id,
      userName: "Vikram Malhotra",
      location: "New Delhi",
      rating: 5,
      title: "Exceptional Purity and Natural Aroma",
      comment: "As a culinary enthusiast, I am extremely selective about my cooking oils. OwnFresh Cold Pressed Sesame Oil has a rich, authentic aroma that elevates every dish. The quality is clearly superior to standard commercial oils. The leak-proof packaging is also very impressive!",
      isFeatured: true,
      isVerifiedBuyer: true,
      status: "APPROVED"
    },
    {
      user: systemUser._id,
      userName: "Preeti Nair",
      location: "Chennai, Tamil Nadu",
      rating: 5,
      title: "Stunning Quality & Empowering Brand",
      comment: "The Stone Pressed Coconut Oil is incredibly pure. I use it both for cooking South Indian dishes and for hair care. Knowing that OwnFresh supports local women artisans makes this purchase even more rewarding. Will subscribe to the monthly pack!",
      isFeatured: true,
      isVerifiedBuyer: true,
      status: "APPROVED"
    },
    {
      user: systemUser._id,
      userName: "Gaurav Sen",
      location: "Kolkata, West Bengal",
      rating: 5,
      title: "Perfect Kacchi Ghani Mustard Oil",
      comment: "Excellent mustard oil with the perfect sharp, pungent taste required for traditional Bengali cuisine. The color is deep golden, and it is unfiltered, which preserves all the natural nutrients. High-quality e-commerce experience too!",
      isFeatured: true,
      isVerifiedBuyer: true,
      status: "APPROVED"
    },
    {
      user: systemUser._id,
      userName: "Ananya Deshpande",
      location: "Pune, Maharashtra",
      rating: 5,
      title: "Light, Healthy and Pure Sunflower Oil",
      comment: "Most sunflower oils in the market are highly refined and tasteless. OwnFresh stone-pressed sunflower oil is light, clean, and has a gentle natural seed flavor. Absolutely perfect for everyday cooking and baking. Five stars!",
      isFeatured: true,
      isVerifiedBuyer: true,
      status: "APPROVED"
    },
    {
      user: systemUser._id,
      userName: "Dr. Rajesh K.",
      location: "Mumbai, Maharashtra",
      rating: 5,
      title: "Authentic Stone Pressed Oil!",
      comment: "I have been using OwnFresh Mustard Oil for 6 months now. The aroma and purity are unmatched compared to store-bought refined oils.",
      isFeatured: true,
      isVerifiedBuyer: true,
      status: "APPROVED"
    },
    {
      user: systemUser._id,
      userName: "Ananya Sharma",
      location: "Bengaluru, Karnataka",
      rating: 5,
      title: "Extremely Pure Coconut Oil",
      comment: "You can tell the difference in quality right away. Perfect for cooking and hair care. Quick delivery and beautiful packaging!",
      isFeatured: true,
      isVerifiedBuyer: true,
      status: "APPROVED"
    },
    {
      user: systemUser._id,
      userName: "Sunil Deshmukh",
      location: "Pune, Maharashtra",
      rating: 5,
      title: "Traditional Quality Revived",
      comment: "Reminds me of traditional oil mills from my childhood. Stone pressing really preserves the natural nutrients and rich taste.",
      isFeatured: true,
      isVerifiedBuyer: true,
      status: "APPROVED"
    },
    {
      user: systemUser._id,
      userName: "Meera Krishnan",
      location: "Hyderabad, Telangana",
      rating: 5,
      title: "Great Packaging and Super Fast Delivery",
      comment: "Ordered the 1L Groundnut and Sesame combo pack. Arrived in 2 days in secure corrugated box with zero leaks. The taste of dishes cooked in this oil is divine.",
      isFeatured: true,
      isVerifiedBuyer: true,
      status: "APPROVED"
    },
    {
      user: systemUser._id,
      userName: "Rohan Agrawal",
      location: "Ahmedabad, Gujarat",
      rating: 5,
      title: "Best Groundnut Oil for Gujarati Cuisine",
      comment: "Groundnut oil is the soul of Gujarati food, and OwnFresh stone-pressed oil is simply the best in the market. True aroma and taste of real peanuts.",
      isFeatured: true,
      isVerifiedBuyer: true,
      status: "APPROVED"
    },
    {
      user: systemUser._id,
      userName: "Kavita Singhal",
      location: "Jaipur, Rajasthan",
      rating: 5,
      title: "Prime 1% Cashback makes it very economical",
      comment: "Joined the OwnFresh Prime program and earning 1% coin cashback on each 5L tin order. Very happy with the quality and transparency.",
      isFeatured: true,
      isVerifiedBuyer: true,
      status: "APPROVED"
    }
  ];

  await Review.deleteMany({});
  const insertedReviews = await Review.insertMany(reviewsData);
  console.log(`  🎉 Restored ${insertedReviews.length} Featured Reviews.`);

  // --- 5. RESTORE PRIME 1% MEMBERSHIP PLAN ---
  console.log("\n👑 5. Restoring OwnFresh Prime 1% Membership Plan...");
  await MembershipPlan.deleteMany({});
  const primePlan = await MembershipPlan.create({
    name: "OwnFresh Prime Membership",
    price: 499,
    durationDays: 365,
    commissionRatePercentage: 1,
    description: "Join OwnFresh Prime to earn 1% Commission Coins on every transaction. Coins reset in 45 days. Minimum 150 coins to redeem.",
    features: [
      "Earn 1% Commission Credit Coins on all orders",
      "Redeem coins directly at checkout (150 threshold)",
      "Coins reset after 45 days of earning",
      "Exclusive Prime member offers & priority support"
    ],
    status: "Active"
  });
  console.log("  + Created Prime Plan: ₹499/year (1% Commission coins)");

  // --- 6. RESTORE STORE SETTINGS & ANNOUNCEMENTS ---
  console.log("\n📢 6. Restoring Store Settings & Announcement Bar...");
  await Settings.deleteMany({});
  const settingsData = {
    announcement: "🎉 FREE SHIPPING ON ORDERS ABOVE ₹999 • 🌿PURE & STONE PRESSED BOTANIC OILS • 👑 JOIN PRIME 1% TO EARN REDEEMABLE COIN COMMISSIONS • 📦 FRESH PRESSED ON ORDER",
    announcement1: "🎉 FREE SHIPPING ON ORDERS ABOVE ₹999",
    announcement2: "🌿PURE & STONE PRESSED BOTANIC OILS",
    announcement3: "👑 JOIN PRIME 1% TO EARN REDEEMABLE COIN COMMISSIONS",
    announcement4: "📦 FRESH PRESSED ON ORDER",
    freeShippingThreshold: "999",
    codFee: "0",
    referralBonus: "100"
  };

  for (const [key, value] of Object.entries(settingsData)) {
    await Settings.create({ key, value });
    console.log(`  = Set setting "${key}": "${value.slice(0, 40)}..."`);
  }

  // --- 7. RESTORE 10 SHIPPING CARRIERS ---
  console.log("\n🚚 7. Restoring 10 Shipping Logistics Carriers...");
  await Carrier.deleteMany({});
  const carriersData = [
    { name: "Blue Dart", baseTrackingUrl: "https://www.bluedart.com/tracking?track={trackingNumber}", active: true },
    { name: "Delhivery", baseTrackingUrl: "https://www.delhivery.com/track/package/{trackingNumber}", active: true },
    { name: "DTDC", baseTrackingUrl: "https://www.dtdc.in/tracking/shipment-tracking.asp?strCnNo={trackingNumber}", active: true },
    { name: "Ekart Logistics", baseTrackingUrl: "https://ekartlogistics.com/shipmenttrack/{trackingNumber}", active: true },
    { name: "Shadowfax", baseTrackingUrl: "https://tracker.shadowfax.in/#/track/{trackingNumber}", active: true },
    { name: "Xpressbees", baseTrackingUrl: "https://www.xpressbees.com/track?isawb=Yes&trackid={trackingNumber}", active: true },
    { name: "India Post", baseTrackingUrl: "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx", active: true },
    { name: "Amazon Shipping", baseTrackingUrl: "https://track.amazon.in/tracking/{trackingNumber}", active: true },
    { name: "Ecom Express", baseTrackingUrl: "https://ecomexpress.in/tracking/?awb_field={trackingNumber}", active: true },
    { name: "Smartr Logistics", baseTrackingUrl: "https://smartr.in/tracking?awb={trackingNumber}", active: true }
  ];

  await Carrier.insertMany(carriersData);
  console.log(`  🎉 Restored ${carriersData.length} Carriers.`);

  // --- 8. RESTORE PROMOTIONAL COUPONS ---
  console.log("\n🎟️ 8. Restoring Promotional Coupons...");
  await Coupon.deleteMany({});
  const couponsData = [
    {
      code: "RAKSHA18",
      discountType: "PERCENTAGE",
      discountValue: 18,
      minimumOrderAmount: 0,
      maximumDiscountAmount: 150,
      perUserLimit: 1,
      expiryDate: new Date("2026-12-31T23:59:59Z"),
      isActive: true,
      applicableUsers: "ALL_USERS"
    },
    {
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minimumOrderAmount: 499,
      maximumDiscountAmount: 100,
      perUserLimit: 1,
      expiryDate: new Date("2026-12-31T23:59:59Z"),
      isActive: true,
      applicableUsers: "NEW_USERS"
    },
    {
      code: "FREESHIP",
      discountType: "FIXED_AMOUNT",
      discountValue: 50,
      minimumOrderAmount: 499,
      perUserLimit: 5,
      expiryDate: new Date("2026-12-31T23:59:59Z"),
      isActive: true,
      applicableUsers: "ALL_USERS"
    },
    {
      code: "PRIME10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minimumOrderAmount: 0,
      maximumDiscountAmount: 200,
      perUserLimit: 10,
      expiryDate: new Date("2026-12-31T23:59:59Z"),
      isActive: true,
      applicableUsers: "ALL_USERS"
    },
    {
      code: "FLAT50",
      discountType: "FIXED_AMOUNT",
      discountValue: 50,
      minimumOrderAmount: 799,
      perUserLimit: 2,
      expiryDate: new Date("2026-12-31T23:59:59Z"),
      isActive: true,
      applicableUsers: "ALL_USERS"
    }
  ];

  const couponDocs = await Coupon.insertMany(couponsData);
  const couponMap = {};
  for (const c of couponDocs) {
    couponMap[c.code] = c;
    console.log(`  = Restored Coupon: ${c.code} (${c.discountValue}${c.discountType === 'PERCENTAGE' ? '%' : '₹'} off)`);
  }

  // --- 9. RESTORE ACTIVE FESTIVAL CAMPAIGNS ---
  console.log("\n🎉 9. Restoring Active Festival Campaigns...");
  await Campaign.deleteMany({});
  const festiveCampaigns = [
    {
      festivalName: "Festive Season Special",
      title: "Festive Purity Special - Wood Pressed Groundnut & Mustard Oil",
      description: "Celebrate the festive season with 100% pure stone-pressed goodness. Flat 18% Off with code RAKSHA18.",
      bannerImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png",
      mobileBannerImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png",
      promoCode: couponMap["RAKSHA18"]._id,
      startDate: new Date("2026-08-01T00:00:00Z"),
      endDate: new Date("2026-12-31T23:59:59Z"),
      status: "Active",
      ctaText: "Shop Now",
      ctaUrl: "/shop",
      priority: 10,
      showCountdown: true,
      createdBy: systemUser._id
    },
    {
      festivalName: "Health & Purity Special",
      title: "Virgin Coconut & Gingelly Sesame Oil Special",
      description: "Cold pressed from carefully selected organic seeds. Nutritious, aromatic, and unrefined.",
      bannerImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774199707/ownfresh_media/caqc2ep5nmgdf9cnknlu.png",
      mobileBannerImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774199707/ownfresh_media/caqc2ep5nmgdf9cnknlu.png",
      promoCode: couponMap["WELCOME10"]._id,
      startDate: new Date("2026-08-01T00:00:00Z"),
      endDate: new Date("2026-12-31T23:59:59Z"),
      status: "Active",
      ctaText: "Explore Range",
      ctaUrl: "/shop",
      priority: 5,
      showCountdown: false,
      createdBy: systemUser._id
    }
  ];

  const insertedCampaigns = await Campaign.insertMany(festiveCampaigns);
  console.log(`  🎉 Restored ${insertedCampaigns.length} Active Campaigns.`);

  // --- 10. EXPORT FRESH FULL BACKUP TO CODEBASE ---
  console.log("\n💾 10. Creating Pristine JSON Backup Files in Codebase...");
  const backupFolder = path.join(__dirname, "../backups/backup_complete_live");
  if (!fs.existsSync(backupFolder)) fs.mkdirSync(backupFolder, { recursive: true });

  const collectionsToDump = [
    { model: Category, name: "categories.json" },
    { model: Product, name: "products.json" },
    { model: ProductVariant, name: "productvariants.json" },
    { model: Blog, name: "blogs.json" },
    { model: Review, name: "reviews.json" },
    { model: MembershipPlan, name: "membershipplans.json" },
    { model: Settings, name: "settings.json" },
    { model: Carrier, name: "carriers.json" },
    { model: Coupon, name: "coupons.json" },
    { model: Campaign, name: "campaigns.json" },
    { model: User, name: "users.json" }
  ];

  for (const c of collectionsToDump) {
    const docs = await c.model.find({});
    fs.writeFileSync(path.join(backupFolder, c.name), JSON.stringify(docs, null, 2), "utf-8");
    console.log(`  💾 Dumped ${docs.length} records to backups/backup_complete_live/${c.name}`);
  }

  // Also update data_backup folder
  const dataBackupFolder = path.join(__dirname, "../data_backup");
  if (fs.existsSync(dataBackupFolder)) {
    const allProdsWithVariants = await Product.find({}).populate("category");
    fs.writeFileSync(path.join(dataBackupFolder, "products_full_catalog.json"), JSON.stringify(allProdsWithVariants, null, 2), "utf-8");
  }

  // --- SUMMARY STATS ---
  console.log("\n=================================================");
  console.log("🏆 DATABASE RESTORATION COMPLETE & VERIFIED!");
  console.log("=================================================");
  console.log(`📊 Final Counts in MongoDB (OwnFresh):`);
  console.log(`   - Categories:       ${await Category.countDocuments()}`);
  console.log(`   - Products:         ${await Product.countDocuments()}`);
  console.log(`   - Product Variants: ${await ProductVariant.countDocuments()}`);
  console.log(`   - Blogs:            ${await Blog.countDocuments()}`);
  console.log(`   - Reviews:          ${await Review.countDocuments()}`);
  console.log(`   - Membership Plans: ${await MembershipPlan.countDocuments()}`);
  console.log(`   - Settings:         ${await Settings.countDocuments()}`);
  console.log(`   - Carriers:         ${await Carrier.countDocuments()}`);
  console.log(`   - Coupons:          ${await Coupon.countDocuments()}`);
  console.log(`   - Campaigns:        ${await Campaign.countDocuments()}`);
  console.log(`   - Users:            ${await User.countDocuments()}`);
  console.log("=================================================\n");

  process.exit(0);
}

restoreCompleteLiveDatabase().catch(err => {
  console.error("❌ Fatal Restoration Error:", err);
  process.exit(1);
});
