import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

const productKnowledge = {
  groundnut: {
    categoryName: "Groundnut Oil",
    shortDesc: "Traditional stone-pressed groundnut (peanut) oil extracted from sun-dried premium kernels using slow Kolhu stone grinders. Rich in MUFA, Resveratrol, and natural Vitamin E with a high smoke point for daily Indian cooking.",
    features: [
      "Extracted using traditional granite stone Kolhu at slow 14 RPM",
      "Zero heat generation (cold-extracted below 40°C)",
      "High smoke point (~225°C / 437°F) — ideal for deep frying & tadka",
      "Rich in heart-friendly Monounsaturated Fatty Acids (MUFA) & Resveratrol",
      "Naturally filtered through cotton cloth — zero chemical refining or bleaching"
    ],
    extractionSteps: [
      { step: "1", title: "Single-Origin Kernel Selection", desc: "Handpicked, sun-dried Saurashtra & Maharashtra grade-A groundnuts free from aflatoxins." },
      { step: "2", title: "Traditional Stone Pressing (Kolhu)", desc: "Crushed slowly in a heavy granite mortar and pestle at 14–16 RPM without applying external heat." },
      { step: "3", title: "Zero-Heat Cold Flow", desc: "Natural oil seeps out at room temperature (<40°C), preserving delicate antioxidants and authentic nutty aroma." },
      { step: "4", title: "Natural Sedimentation & Cotton Filter", desc: "Settled naturally for 24 hours and passed through food-grade micro-cotton cloth. No chemical bleaching." },
      { step: "5", title: "Airtight Food-Grade Packaging", desc: "Packed in UV-protected food-grade bottles to preserve farm-fresh vitality and prevent oxidation." }
    ],
    culinaryUses: "Best for deep frying (samosas, puris, pakoras), daily vegetable sautéing, Maharashtrian & Gujarati tadka, and crispy stir-fries.",
    smokePoint: "225°C (437°F)",
    shelfLife: "9 to 12 Months from packing (store in cool, dark pantry)",
    healthHighlights: "Heart-healthy Oleic acid, natural plant sterols that lower LDL cholesterol, and Vitamin E for cellular health."
  },

  mustard: {
    categoryName: "Mustard Oil",
    shortDesc: "Authentic Kacchi Ghani stone-pressed mustard oil with natural pungency and intense aroma. Extracted from finest black and yellow mustard seeds without heat, retaining Allyl Isothiocyanate and Omega-3 fatty acids.",
    features: [
      "Traditional Kacchi Ghani stone-pressing preserving natural sharp pungency",
      "Rich in Allyl Isothiocyanate — natural antimicrobial & digestive stimulant",
      "Optimal Omega-3 (ALA) and Omega-6 balance for heart health",
      "High smoke point (~250°C / 482°F) — ideal for curries, pickling & roasting",
      "Zero preservatives, zero synthetic colours, unadulterated & unrefined"
    ],
    extractionSteps: [
      { step: "1", title: "Cleaned Whole Mustard Seeds", desc: "High-grade mature black and brown mustard seeds thoroughly cleaned and sun-dried." },
      { step: "2", title: "Kolhu Stone Extraction", desc: "Slowly crushed in wooden-stone Ghani allowing essential volatile oils (pungency) to remain intact." },
      { step: "3", title: "Cold Friction Release", desc: "Continuous low-temperature extraction ensures volatile Allyl Isothiocyanates do not evaporate." },
      { step: "4", title: "Cloth Filtration", desc: "Gravity-filtered through natural cotton sheets, retaining natural golden-amber micro-nutrients." },
      { step: "5", title: "Leakproof Bottling", desc: "Sealed in food-grade, odor-barrier containers to preserve the signature pungent aroma." }
    ],
    culinaryUses: "Authentic North Indian & Bengali delicacies, fish curries, Sarson ka Saag, natural preservative for mango/lemon pickles, and traditional body massage.",
    smokePoint: "250°C (482°F)",
    shelfLife: "12 Months from packing (natural self-preserving properties)",
    healthHighlights: "Natural immunity booster, promotes blood circulation during massage, supports digestion, and relieves winter respiratory congestion."
  },

  coconut: {
    categoryName: "Coconut Oil",
    shortDesc: "100% natural stone-pressed virgin coconut oil extracted from fresh sun-dried sulfur-free copra. Packed with Medium Chain Triglycerides (50%+ Lauric Acid) for energy, immunity, skin hydration, and hair care.",
    features: [
      "Stone-pressed from 100% sulfur-free natural sun-dried coconut copra",
      "Rich in Medium Chain Triglycerides (MCTs) with 50%+ Lauric Acid",
      "Multi-purpose: delicious edible cooking oil, deep hair conditioning & baby massage",
      "Subtle sweet aroma and crystal-clear consistency when liquefied",
      "Zero chemicals, zero mineral oils, 100% edible and raw"
    ],
    extractionSteps: [
      { step: "1", title: "Sulfur-Free Coconut Copra", desc: "Freshly harvested mature coconuts sun-dried naturally without toxic sulfur smoke treatments." },
      { step: "2", title: "Slow Stone Mashing", desc: "Copra is gently sliced and pressed in a stone Kolhu without generating internal friction heat." },
      { step: "3", title: "Pure Virgin Extraction", desc: "First-press pure coconut oil flows naturally, preserving delicate medium-chain fatty acids." },
      { step: "4", title: "Micro Cotton Filtration", desc: "Filtered through fine multi-layer cotton cloth to separate fine fiber residues without chemical clarification." },
      { step: "5", title: "Fresh Bottling", desc: "Poured into clean, airtight bottles preserving the fresh tropical coconut aroma and moisture barrier." }
    ],
    culinaryUses: "South Indian cooking (Avial, Kerala fish roast, Thoran), baking, bulletproof morning coffee, raw drizzling, deep hair scalp massage, and Ayurvedic Gandusha (oil pulling).",
    smokePoint: "177°C (350°F)",
    shelfLife: "12 Months from packing",
    healthHighlights: "Lauric acid converts into monolaurin for antiviral & antibacterial immunity; MCTs provide instant clean brain & metabolic energy."
  },

  sesame: {
    categoryName: "Sesame Oil",
    shortDesc: "Queen of Ayurvedic oils: authentic stone-pressed sesame (Til / Gingelly) oil extracted from mature sesame seeds. Loaded with unique antioxidants Sesamol and Sesamin, vital trace minerals, and deep warming properties.",
    features: [
      "Extracted with traditional stone mill (Kolhu) preserving raw unroasted goodness",
      "Packed with powerful natural antioxidants: Sesamol & Sesamin",
      "Tridoshic Ayurvedic elixir: balances Vata dosha, promotes joint flexibility",
      "Rich in calcium, zinc, Vitamin E and healthy PUFA/MUFA fats",
      "Warm golden color and earthy, nutty fragrance"
    ],
    extractionSteps: [
      { step: "1", title: "Graded Natural Sesame Seeds", desc: "Hand-harvested, pesticide-free white and brown sesame seeds cleaned thoroughly." },
      { step: "2", title: "Slow Rhythmic Stone Churning", desc: "Seeds are slowly crushed under granite pestles at low speed to prevent oil burning." },
      { step: "3", title: "Natural Low-Temp Seepage", desc: "Raw golden sesame oil emerges without any thermal degradation of polyphenols and lignans." },
      { step: "4", title: "Cloth Settling & Filtration", desc: "Natural 24-hour gravity settling followed by cloth sieve filtration for pure amber brilliance." },
      { step: "5", title: "Sealed Bottle Packaging", desc: "Bottled in food-grade packaging that protects bioactive Sesamol from ambient UV degradation." }
    ],
    culinaryUses: "South Indian tempering (tadka for Sambar, Rasam, Chutneys), Idli-Podi powder paste, traditional pickles, morning oil pulling (Gandusha), and Abhyanga whole-body massage.",
    smokePoint: "210°C (410°F)",
    shelfLife: "9 to 12 Months from packing",
    healthHighlights: "Supports bone mineral density, strengthens gum and oral health, deeply penetrates dermal layers during massage to relieve joint stiffness."
  },

  sunflower: {
    categoryName: "Sunflower Oil",
    shortDesc: "Light, golden, and heart-friendly stone-pressed sunflower oil extracted gently from premium non-GMO sunflower seeds. Naturally loaded with Vitamin E, Polyunsaturated Fatty Acids (Omega-6), and zero trans fats.",
    features: [
      "Extracted through traditional stone pressing without high-heat refining",
      "High natural Vitamin E content for skin health and antioxidant defense",
      "Light, non-sticky texture that allows true food flavors to shine",
      "High smoke point (~225°C / 440°F) suitable for everyday frying and baking",
      "Zero cholesterol, zero chemical bleaching, 100% unadulterated"
    ],
    extractionSteps: [
      { step: "1", title: "Non-GMO Sunflower Seeds", desc: "Cleaned and dehulled sunflower seeds selected from certified sustainable farms." },
      { step: "2", title: "Low-Speed Stone Mill Pressing", desc: "Slow mechanical crushing in stone Ghani without any chemical solvents like hexane." },
      { step: "3", title: "Pure Cold Yield", desc: "Light golden oil streams out with natural micronutrients, selenium, and zinc intact." },
      { step: "4", title: "Natural Cloth Sieve", desc: "Passed through pure cotton cloth sieves to remove natural seed sediment." },
      { step: "5", title: "Hygienic Bottling", desc: "Bottled immediately in airtight containers to preserve freshness and natural light color." }
    ],
    culinaryUses: "Daily family cooking, sautéing vegetables, continental salad dressings, baking, roasting, and light deep-frying where a neutral flavor is preferred.",
    smokePoint: "225°C (440°F)",
    shelfLife: "6 to 9 Months from packing",
    healthHighlights: "High concentration of Linoleic acid and Vitamin E protects cell membranes, supports cardiac wellness, and keeps skin nourished."
  },

  safflower: {
    categoryName: "Safflower Oil",
    shortDesc: "Heart-care specialist: stone-pressed safflower (Kardi) oil crafted from premium safflower seeds. Renowned by health experts for balancing cholesterol and blood sugar levels with high Oleic/Linoleic healthy fats.",
    features: [
      "Traditional stone-pressed Kardi oil extracted under 40°C",
      "Cardiologist-recommended oil for maintaining healthy lipid profiles",
      "Naturally high smoke point (~232°C / 450°F) with neutral aroma",
      "Rich in unsaturated fatty acids (MUFA & PUFA) and Vitamin E",
      "Unrefined, unbleached, and free of synthetic anti-foaming agents"
    ],
    extractionSteps: [
      { step: "1", title: "Quality Safflower (Kardi) Seeds", desc: "Selected high-oil-content safflower seeds cleaned of foreign impurities." },
      { step: "2", title: "Granite Kolhu Extraction", desc: "Crushed gently in traditional stone press at low RPM ensuring zero nutrient damage." },
      { step: "3", title: "Cold Unheated Extraction", desc: "Retains full spectrum of natural sterols and fat-soluble vitamins." },
      { step: "4", title: "Pure Cloth Filtration", desc: "Cotton mesh filtration without industrial chemical processing or bleaching clays." },
      { step: "5", title: "Secure Food-Grade Pack", desc: "Hermetically sealed to safeguard vital healthy fatty acids from light and air." }
    ],
    culinaryUses: "Ideal for health-conscious daily cooking, diabetic-friendly diets, shallow frying, salad dressings, and low-cholesterol meals.",
    smokePoint: "232°C (450°F)",
    shelfLife: "9 to 12 Months from packing",
    healthHighlights: "Aids in blood sugar regulation, reduces arterial inflammation, and supports weight management."
  },

  combo: {
    categoryName: "Combo Pack",
    shortDesc: "Curated farm-fresh stone-pressed oil bundles combining our best-selling Groundnut, Mustard, Coconut, Sesame, and Sunflower oils in multiple bottle sizes. Complete culinary and wellness nourishment for healthy families.",
    features: [
      "Assorted kitchen bundle of traditional stone-pressed oils",
      "Covers all culinary needs: deep frying, tempering, baking, and body wellness",
      "Each bottle extracted in stone Kolhu without heat or chemicals",
      "Delivered in protective, shock-proof packaging",
      "Significant value savings compared to individual bottles"
    ],
    extractionSteps: [
      { step: "1", title: "Multi-Seed Selection", desc: "Finest quality single-origin groundnut, mustard, sesame, and coconut seeds." },
      { step: "2", title: "Dedicated Stone Kolhu Batches", desc: "Each oil variety is pressed in dedicated stone presses to prevent cross-contamination." },
      { step: "3", title: "Zero-Heat Processing", desc: "Pure cold extraction under 40°C across all varieties." },
      { step: "4", title: "Cotton Cloth Filtration", desc: "Naturally filtered through cotton sheets with zero refining." },
      { step: "5", title: "Curated Bundle Boxing", desc: "Packed in reinforced safety-cushioned boxes for direct doorstep delivery." }
    ],
    culinaryUses: "Use Groundnut for daily frying & curries, Mustard for rich tadka & pickles, Coconut for South Indian & hair care, and Sesame for tempering & oil pulling.",
    smokePoint: "Varies by oil type (177°C – 250°C)",
    shelfLife: "9 to 12 Months from packing",
    healthHighlights: "Provides a balanced spectrum of MUFA, PUFA, MCTs, Vitamin E, and natural polyphenols for the entire household."
  }
};

function generateDetailedHtml(info, productName) {
  const stepsHtml = info.extractionSteps.map(s => `
    <div class="method-step-card">
      <div class="step-num">${s.step}</div>
      <div class="step-content">
        <h5 class="step-title">${s.title}</h5>
        <p class="step-desc">${s.desc}</p>
      </div>
    </div>
  `).join("");

  const featuresHtml = info.features.map(f => `<li>${f}</li>`).join("");

  return `
<div class="product-description-container">
  <div class="pro-section mb-6">
    <h4 class="section-heading">🌟 Product Overview</h4>
    <p class="section-lead">${info.shortDesc}</p>
    <ul class="features-list">
      ${featuresHtml}
    </ul>
  </div>

  <div class="pro-section mb-6">
    <h4 class="section-heading">🪵 Traditional Stone-Pressed (Kolhu) Method</h4>
    <p class="text-sm text-slate-600 mb-4">Our oils are extracted using time-honored traditional granite stone mills (Kolhu / Lakdi Ghani) rotating at a gentle 14–16 RPM. No chemical solvents, no artificial refining, and zero external heat.</p>
    <div class="method-steps-grid">
      ${stepsHtml}
    </div>
  </div>

  <div class="pro-section mb-6">
    <h4 class="section-heading">🍳 Culinary Uses & Smoke Point</h4>
    <div class="info-box-grid">
      <div class="info-card">
        <span class="info-label">Smoke Point</span>
        <span class="info-value font-bold">${info.smokePoint}</span>
      </div>
      <div class="info-card">
        <span class="info-label">Shelf Life</span>
        <span class="info-value font-bold">${info.shelfLife}</span>
      </div>
    </div>
    <p class="text-sm text-slate-700 mt-3"><strong>Recommended In:</strong> ${info.culinaryUses}</p>
  </div>

  <div class="pro-section">
    <h4 class="section-heading">💚 Health & Wellness Benefits</h4>
    <p class="text-sm text-slate-700 leading-relaxed">${info.healthHighlights}</p>
  </div>
</div>
  `.trim();
}

async function runDetailsEnrichment() {
  try {
    const uri = (process.env.MONGODB_URL || process.env.MONGO_URI || process.env.MONGODB_URI || "").trim();
    if (!uri) {
      console.error("No MongoDB URI found in environment!");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, { dbName: "OwnFresh" });
    console.log("Connected to MongoDB successfully.");

    const products = await Product.find().populate("category");
    console.log(`Found ${products.length} products to enrich with top details and stone-pressed methods.`);

    for (const prod of products) {
      const nameLower = (prod.name || "").toLowerCase();
      let key = "mustard";
      if (nameLower.includes("groundnut") || nameLower.includes("peanut")) key = "groundnut";
      else if (nameLower.includes("coconut")) key = "coconut";
      else if (nameLower.includes("sesame") || nameLower.includes("til")) key = "sesame";
      else if (nameLower.includes("sunflower")) key = "sunflower";
      else if (nameLower.includes("safflower") || nameLower.includes("kardi")) key = "safflower";
      else if (nameLower.includes("combo")) key = "combo";

      const info = productKnowledge[key];
      prod.shortDesc = info.shortDesc;
      prod.description = generateDetailedHtml(info, prod.name);
      await prod.save();
      console.log(`Updated product: "${prod.name}" with top details & ${key} stone-pressed method.`);
    }

    console.log("✅ All products enriched with the best Product Details and Traditional Stone-Pressed Methods!");
    process.exit(0);
  } catch (err) {
    console.error("Error during enrichment:", err);
    process.exit(1);
  }
}

runDetailsEnrichment();
