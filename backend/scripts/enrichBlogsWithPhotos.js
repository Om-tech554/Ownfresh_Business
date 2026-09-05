import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Blog from "../models/blogModel.js";

const wpPhotosDir = path.join(__dirname, "../media/wordpress_photos");
const wpPhotos = fs.readdirSync(wpPhotosDir).filter(f => !f.endsWith('.json'));
const wpPhotoSet = new Set(wpPhotos.map(f => f.toLowerCase()));

// Helper to find existing photo by name
function resolvePhotoFilename(rawName) {
  if (!rawName) return null;
  const base = path.basename(rawName).split('?')[0];
  
  // Exact match
  if (wpPhotoSet.has(base.toLowerCase())) {
    const found = wpPhotos.find(p => p.toLowerCase() === base.toLowerCase());
    return found;
  }
  
  // Strip resolution suffix like -1024x576, -300x169, -768x432, -1536x864, -scaled, url-encoded chars
  const decoded = decodeURIComponent(base);
  if (wpPhotoSet.has(decoded.toLowerCase())) {
    const found = wpPhotos.find(p => p.toLowerCase() === decoded.toLowerCase());
    return found;
  }

  const clean = decoded.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1').replace(/-scaled(\.[a-z0-9]+)$/i, '$1');
  if (wpPhotoSet.has(clean.toLowerCase())) {
    const found = wpPhotos.find(p => p.toLowerCase() === clean.toLowerCase());
    return found;
  }

  // Try partial match
  const nameWithoutExt = clean.replace(/\.[a-z0-9]+$/i, '').toLowerCase();
  const partial = wpPhotos.find(p => p.toLowerCase().startsWith(nameWithoutExt) || p.toLowerCase().includes(nameWithoutExt));
  if (partial) return partial;

  return null;
}

// Format image into beautiful figure HTML
function formatImageFigure(filename, captionText = "") {
  const altText = captionText ? captionText.replace(/"/g, '&quot;') : "OwnFresh Pure Stone Pressed Oil";
  const captionHtml = captionText ? `<figcaption class="text-xs text-gray-500 text-center mt-2 italic font-medium">${captionText}</figcaption>` : "";
  return `\n\n<figure class="wp-block-image my-8 w-full overflow-hidden rounded-2xl shadow-sm border border-gray-100 bg-gray-50 flex flex-col items-center justify-center p-2"><img src="/media/wordpress_photos/${filename}" alt="${altText}" class="w-full object-contain max-h-[500px] rounded-xl" loading="lazy" />${captionHtml}</figure>\n\n`;
}

// Custom curated mapping for headings across all 38 blogs
const headingPhotoRules = [
  // Child Health
  { pattern: /understanding fats.*simple guide/i, photo: "Understanding-fats-for-healthy-living.png", caption: "Understanding dietary fats for healthy growth" },
  { pattern: /hidden dangers in everyday cooking oils/i, photo: "Confusion-over-cooking-oil-choices.png", caption: "Navigating common cooking oil choices safely" },
  { pattern: /traditional cold-pressed.*versus.*refined/i, photo: "Traditional-vs-industrial-oil-extraction.png", caption: "Traditional cold-pressing vs industrial chemical refinement" },
  { pattern: /choosing better oils for your children/i, photo: "Cooking-together-in-a-cozy-kitchen.png", caption: "Pure, stone-pressed oils for wholesome family nourishment" },
  { pattern: /brain development and cognitive growth/i, photo: "Cooking-together-for-a-healthy-future.png", caption: "Essential fatty acids supporting cognitive development" },

  // Diabetes
  { pattern: /understanding diabetes and dietary fat/i, photo: "Healthy-cooking-oil-for-diabetes-friendly-meals.png", caption: "Smart oil choices for diabetes-conscious cooking" },
  { pattern: /role of healthy fats in blood sugar/i, photo: "Cooking-oils-and-fatty-acid-balance.png", caption: "Balancing fatty acids for sustained energy and glucose stability" },
  { pattern: /why refined oils can be problematic/i, photo: "The-dangers-of-refined-oil.png", caption: "Avoiding chemical additives and high-heat refined fats" },
  { pattern: /best traditional oils for a diabetes/i, photo: "Healthy-oil-selection-for-Indian-meals.png", caption: "Traditional unrefined oils suited for diabetic-friendly meals" },

  // Black vs Yellow Mustard
  { pattern: /understanding the two seeds/i, photo: "Seeds-of-flavor-mustard-oil-guide.png", caption: "Black and yellow mustard seeds: distinct flavor profiles" },
  { pattern: /flavor profiles/i, photo: "Mustard-oils-natures-finest-gifts.png", caption: "The rich aroma and pungent punch of cold-pressed mustard oil" },
  { pattern: /cooking uses.*mustard/i, photo: "Mustard-oil-uses-in-cooking-guide.png", caption: "Culinary applications of traditional mustard oil" },
  { pattern: /health benefits.*mustard/i, photo: "Health-benefits-of-mustard-oil.png", caption: "Natural antibacterial and heart-supporting properties" },

  // Heart Health
  { pattern: /understanding cholesterol/i, photo: "Understanding-cholesterol-with-kitchen-analogies.png", caption: "Understanding cholesterol and good dietary fats" },
  { pattern: /good fats versus bad fats/i, photo: "Healthy-fats-vs-unhealthy-fats.png", caption: "Distinguishing wholesome unrefined fats from oxidized oils" },
  { pattern: /heart-healthy cooking habits/i, photo: "Heart-health-through-cooking-oils.jpg", caption: "Traditional heart-protective cooking traditions" },
  { pattern: /practical everyday tips for heart-healthy/i, photo: "Everyday-cooking-tips.png", caption: "Practical kitchen practices for cardiovascular wellness" },

  // Hidden Cost of Refined
  { pattern: /modern refining process/i, photo: "The-process-of-oil-refinement-and-loss.png", caption: "How industrial refining strips away vital natural nutrients" },
  { pattern: /what gets lost during refinement/i, photo: "The-hidden-cost-of-refined-oil.png", caption: "Loss of natural antioxidants, vitamins, and aroma" },
  { pattern: /return to traditional stone-pressed/i, photo: "Refined-vs-Traditional-Kachi-Ghani-oils.png", caption: "The return to slow stone-pressing and uncompromised purity" },
  { pattern: /real health benefits of switching/i, photo: "Oils-showdown-refined-vs-traditional.png", caption: "Comparing refined oils with stone-pressed liquid gold" },

  // Sesame Oil
  { pattern: /timeless indian tradition/i, photo: "Stone-pressed-sesame-oil-process.png", caption: "Slow stone-pressing of premium sesame seeds" },
  { pattern: /nutritional profile of pure sesame/i, photo: "The-Nutritional-Powerhouse-Whats-Inside.png", caption: "Packed with sesamol, natural calcium, and zinc" },
  { pattern: /health benefits of stone-pressed sesame/i, photo: "Sesame-with-props.jpg", caption: "Antioxidant-dense stone-pressed sesame oil" },
  { pattern: /how to use sesame oil in everyday/i, photo: "sesame.png", caption: "Culinary and wellness uses of pure sesame oil" },
  { pattern: /sesame oil in ayurveda|abhyanga/i, photo: "Abhyanta.png", caption: "Ayurvedic Abhyanga body massage with sesame oil" },
  { pattern: /why choose stone-pressed sesame oil for hair/i, photo: "Sesame-with-props.jpg", caption: "Deep hair nourishment with natural sesame seed lipids" },
  { pattern: /key benefits of sesame oil for hair/i, photo: "Stone-pressed-sesame-oil-process.png", caption: "Strengthening roots and scalp conditioning" },
  { pattern: /what makes ownfresh sesame oil different/i, photo: "sesame.png", caption: "100% Unadulterated Ghani pressed Til oil" },

  // Stir Frying
  { pattern: /art of indian stir-frying|bhunao/i, photo: "Balancing-flavors-in-stir-frying.png", caption: "Mastering high-heat stir frying and fragrant tadkas" },
  { pattern: /why oil selection matters for stir-fry/i, photo: "Choosing-the-right-oil-for-stir-fry.png", caption: "High smoke point oils for safe, crispy sauteing" },
  { pattern: /nutrient preservation/i, photo: "Smart-Indian-cooking.png", caption: "Retaining vitamins through smart cooking techniques" },

  // What is Kachi Ghani
  { pattern: /what does kachi ghani.*mean/i, photo: "What-is-kachi-ghani.png", caption: "Kachi Ghani: ancient cold crushing technique" },
  { pattern: /traditional extraction process/i, photo: "Kachi-Ghani-oil-extraction-process.png", caption: "Gentle wooden/stone pestle extraction without heat" },
  { pattern: /why stone-pressed oils are superior/i, photo: "Kachi-Ghani-Traditional-oil-extraction-method.png", caption: "Preserving active nutrients and raw seed vitality" },
  { pattern: /elevate.*food/i, photo: "How-Kachi-Ghani-oil-elevates-food.png", caption: "Enhancing every dish with authentic, unadulterated aroma" },

  // Chana Masala Recipe
  { pattern: /secret to authentic taste/i, photo: "Traditional-oil-extraction-and-spices.png", caption: "Authentic spice blooming in stone-pressed mustard oil" },
  { pattern: /step-by-step authentic/i, photo: "Traditional-stone-pressed-oil-in-kitchen.png", caption: "Slow-simmered home-style Chana Masala" },
  { pattern: /why traditional.*oil makes all the difference/i, photo: "Healthy-oils-for-flavorful-Indian-cooking.png", caption: "The flavor base of authentic North Indian cuisine" },

  // Groundnut Oil Benefits & Sourcing
  { pattern: /understanding groundnut oil/i, photo: "Groundnut-with-props.jpg", caption: "100% Pure stone-pressed groundnut oil" },
  { pattern: /heart health.*groundnut/i, photo: "Groundnut.png", caption: "Rich in MUFA and natural phytosterols" },
  { pattern: /radiant skin.*groundnut/i, photo: "Groundnut-1.png", caption: "Natural Vitamin E for cellular rejuvenation" },
  { pattern: /why groundnut oil is the heart of indian cooking/i, photo: "Groundnut-with-props.jpg", caption: "The golden foundation of traditional Indian dishes" },
  { pattern: /power of stone-pressed extraction/i, photo: "Groundnut-Oil-5.png", caption: "Cold crushing that protects raw aroma and nutrients" },
  { pattern: /why buying online from ownfresh/i, photo: "Groundnut-5Ltr.png", caption: "Direct from press to doorstep in pristine packaging" },
  { pattern: /no harmful chemicals.*cleaner soil/i, photo: "Groundnut-with-props.jpg", caption: "Zero chemical solvents protecting our soil and water" },
  { pattern: /traditional stone-pressing means less pollution/i, photo: "Groundnut.png", caption: "Low-energy traditional extraction methods" },
  { pattern: /sustainable packaging matters/i, photo: "Groundnut-5Ltr.png", caption: "Eco-conscious packaging designed for freshness" },

  // Sunflower Oil
  { pattern: /why sunflower oil.*gift/i, photo: "Sunflower-with-props.jpg", caption: "Golden, light stone-pressed sunflower oil" },
  { pattern: /health benefits of stone-pressed sunflower/i, photo: "sunflower.png", caption: "Naturally rich in Vitamin E and linoleic acid" },
  { pattern: /full of natural nutrients/i, photo: "Sunflower-with-props.jpg", caption: "Natural Vitamin E and essential omega-6 fatty acids" },
  { pattern: /heart-friendly and light on the stomach/i, photo: "sunflower.png", caption: "Clean, non-greasy cooking with pure sunflower oil" },
  { pattern: /no refining.*no chemicals.*no worries/i, photo: "Sunflower-5Ltr.png", caption: "Zero chemical deodorization or bleaching" },
  { pattern: /why choose ownfresh over refined/i, photo: "Sunflower-5Ltr.png", caption: "Free from chemical deodorization and synthetic solvents" },
  { pattern: /adulteration in sunflower oil/i, photo: "Sunflower-with-props.jpg", caption: "Detecting paraffin and cheap adulterants in sunflower oil" },
  { pattern: /why choose ownfresh stone-pressed sunflower/i, photo: "Sunflower-5Ltr.png", caption: "100% Traceable seeds pressed with stone pestles" },

  // Coconut Oil
  { pattern: /what is special about coconut oil/i, photo: "Coconut-with-props.jpg", caption: "Botanical grade pure stone-pressed coconut oil" },
  { pattern: /weight-management|metabolism/i, photo: "Can-coconut-oil-help-you-lose-weight.png", caption: "Medium-chain triglycerides (MCTs) for clean energy" },
  { pattern: /coconut oil for your face|skin/i, photo: "Hydrate.-Soothe.-Shine-Naturally-with-OwnFresh.png", caption: "Deep dermal hydration and barrier protection" },
  { pattern: /what is ghani oil.*coconut/i, photo: "Coconut-with-props.jpg", caption: "Fresh sun-dried copra stone pressing" },
  { pattern: /health benefits of ghani coconut/i, photo: "Coconut-Compile.jpg", caption: "Lauric acid powerhouse supporting cellular vitality" },
  { pattern: /stone-pressed.*ghani oil stands out/i, photo: "Coconut-5Ltr.png", caption: "Pristine virgin aroma without heat alteration" },
  { pattern: /bitter truth about coconut oil adulteration/i, photo: "Coconut-Compile.jpg", caption: "Understanding refined liquid paraffin blends" },
  { pattern: /stone-pressed: the traditional way/i, photo: "Coconut-with-props.jpg", caption: "Traditional unbleached cold copra extraction" },
  { pattern: /how to identify pure coconut oil/i, photo: "Coconut-5Ltr.png", caption: "Solidification test and natural aroma indicators" },

  // Mustard Oil Benefits & Family Care
  { pattern: /boosts immunity the natural way/i, photo: "Health-benefits-of-mustard-oil.png", caption: "Allyl isothiocyanate providing natural antimicrobial defense" },
  { pattern: /supports heart health.*mustard/i, photo: "Mustard-with-props.jpg", caption: "Optimal balance of omega-3 and omega-6 fatty acids" },
  { pattern: /why choose ownfresh stone-pressed mustard/i, photo: "Mustard-Oil-5.png", caption: "Cold stone extraction retaining authentic pungency" },
  { pattern: /role of mustard oil in boosting fertility/i, photo: "Mustard-with-props.jpg", caption: "Rich in vital micronutrients supporting reproductive health" },
  { pattern: /why purity matters for your family/i, photo: "Mustard-Oil-5.png", caption: "Clean, chemical-free cooking for your loved ones" },
  { pattern: /hidden threat of mustard oil adulteration|adulteration in mustard/i, photo: "OwnFreshs-Protecting-your-kitchen.png", caption: "Protecting your family from toxic adulterants" },
  { pattern: /why this matters/i, photo: "Mustard-with-props.jpg", caption: "Why mustard oil purity matters for everyday Indian cooking" },
  { pattern: /spot adulteration at home/i, photo: "Mustard-1.png", caption: "Simple home tests for checking mustard oil authenticity" },
  { pattern: /how ownfresh works to give you peace of mind/i, photo: "Mustard-Oil-5.png", caption: "Our rigorous single-origin seed selection and stone pressing" },
  { pattern: /practical tips when you shop/i, photo: "Mustard.png", caption: "What to look for on labels and certifications" },

  // Adulteration Sesame
  { pattern: /what is sesame oil adulteration/i, photo: "Sesame-5Ltr.png", caption: "Common adulteration practices in commercial sesame oils" },
  { pattern: /how to identify adulterated sesame/i, photo: "Sesame-with-props.jpg", caption: "Sensory tests for pure nutty fragrance and natural amber hue" },
  { pattern: /why stone-pressed sesame oil is the right choice/i, photo: "Stone-pressed-sesame-oil-process.png", caption: "Authentic wood & stone press purity" },

  // Brand Story & Heritage
  { pattern: /what makes stone-pressed oils special/i, photo: "OUR-HERITAGE-1.png", caption: "Slow pressing that preserves raw bio-active properties" },
  { pattern: /health benefits of ownfresh stone-pressed/i, photo: "Groundnut-coconut-sesame-Combo-1.png", caption: "Nourishing your body with authentic botanic oils" },
  { pattern: /supporting traditional practices/i, photo: "Frame-211.png", caption: "Empowering rural artisanal pressing wisdom" },
  { pattern: /from soil to purity|our heritage/i, photo: "OUR-HERITAGE.png", caption: "Our roots: honoring traditional Indian oil pressing heritage" }
];

async function enrichAllBlogs() {
  console.log("=================================================");
  console.log("🚀 STARTING BLOG ENRICHMENT WITH WORDPRESS PHOTOS");
  console.log("=================================================");

  const backupLivePath = path.join(__dirname, "../backups/backup_complete_live/blogs.json");
  const rawBackupPath = path.join(__dirname, "../data_backup/blogs.json");

  const blogs = JSON.parse(fs.readFileSync(backupLivePath, "utf8"));
  console.log(`Loaded ${blogs.length} blogs from backup.`);

  const updatedBlogs = [];

  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i];
    let content = blog.description || "";
    const usedPhotosInPost = new Set();

    // 1. Fix any existing <img> tags pointing to myownfresh.com or relative
    content = content.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
      const resolved = resolvePhotoFilename(src);
      if (resolved) {
        usedPhotosInPost.add(resolved);
        return `<img src="/media/wordpress_photos/${resolved}" alt="${blog.title}" class="w-full object-contain max-h-[500px] rounded-xl my-6" loading="lazy" />`;
      }
      return match;
    });

    // 2. Extract headings and inject matched photos if not already preceded/followed by an image
    const headingSplitRegex = /(<h[2-4][^>]*>.*?<\/h[2-4]>)/gi;
    const parts = content.split(headingSplitRegex);
    let newContent = "";

    for (let pIdx = 0; pIdx < parts.length; pIdx++) {
      const part = parts[pIdx];
      newContent += part;

      const hMatch = part.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/i);
      if (hMatch) {
        const headingText = hMatch[1].replace(/<[^>]+>/g, "").trim();

        // Check if next part already has an <img> or <figure>
        const nextPart = parts[pIdx + 1] || "";
        const hasImmediateImg = /^\s*(?:<div[^>]*>)?\s*(?:<figure[^>]*>)?\s*<img/i.test(nextPart);

        if (!hasImmediateImg && headingText.toLowerCase() !== "table of contents" && !headingText.toLowerCase().startsWith("faqs")) {
          // Find matching rule
          const matchedRule = headingPhotoRules.find(rule => rule.pattern.test(headingText) && !usedPhotosInPost.has(rule.photo));

          if (matchedRule) {
            const photoFile = resolvePhotoFilename(matchedRule.photo);
            if (photoFile) {
              usedPhotosInPost.add(photoFile);
              newContent += formatImageFigure(photoFile, matchedRule.caption || headingText);
            }
          }
        }
      }
    }

    content = newContent;

    // Special fallback for blogs without headings (e.g. blog 29, 34)
    if (blog.slug === "mustard-oil-for-skin-an-age-old-secret-revived-by-ownfresh-stone-pressed-purity" && usedPhotosInPost.size === 0) {
      const p1 = resolvePhotoFilename("Mustard-with-props.jpg");
      const p2 = resolvePhotoFilename("Health-benefits-of-mustard-oil.png");
      if (p1) { usedPhotosInPost.add(p1); content += formatImageFigure(p1, "Pure cold-pressed mustard oil for deep skin nourishment"); }
      if (p2) { usedPhotosInPost.add(p2); content += formatImageFigure(p2, "Natural antioxidants and protective nutrients"); }
    } else if (blog.slug === "from-soil-to-purity-the-story-of-ownfresh" && usedPhotosInPost.size === 0) {
      const p1 = resolvePhotoFilename("DSC08274-scaled.jpg");
      const p2 = resolvePhotoFilename("DSC08279-scaled.jpg");
      if (p1) { usedPhotosInPost.add(p1); content += formatImageFigure(p1, "Our artisan pressing roots and raw seed selection"); }
      if (p2) { usedPhotosInPost.add(p2); content += formatImageFigure(p2, "Pure unrefined golden oil ready for your kitchen"); }
    } else if (blog.slug === "why-your-family-deserves-the-goodness-of-ownfresh-mustard-oil" && usedPhotosInPost.size === 0) {
      const p1 = resolvePhotoFilename("Why-your-family-deserves-the-goodness-of-OwnFresh-mustard-oil.png");
      const p2 = resolvePhotoFilename("Health-benefits-of-mustard-oil.png");
      const p3 = resolvePhotoFilename("Mustard-Oil-5.png");
      if (p1) { usedPhotosInPost.add(p1); }
      if (p2) { usedPhotosInPost.add(p2); content += formatImageFigure(p2, "Immunity and wellness benefits of pure mustard oil"); }
      if (p3) { usedPhotosInPost.add(p3); content += formatImageFigure(p3, "Cold stone-pressed mustard oil crafted for your family"); }
    }

    // 3. Resolve Main Featured Image
    let mainImgFile = resolvePhotoFilename(blog.image);
    if (!mainImgFile && usedPhotosInPost.size > 0) {
      mainImgFile = Array.from(usedPhotosInPost)[0];
    }
    const finalMainImage = mainImgFile ? `/media/wordpress_photos/${mainImgFile}` : blog.image;

    // 4. Resolve Gallery Images (image1..image4)
    const galleryCandidates = Array.from(usedPhotosInPost).filter(f => f !== mainImgFile);
    
    // Add existing image1..4 if any
    [blog.image1, blog.image2, blog.image3, blog.image4].forEach(img => {
      const res = resolvePhotoFilename(img);
      if (res && res !== mainImgFile && !galleryCandidates.includes(res)) {
        galleryCandidates.push(res);
      }
    });

    const finalImage1 = galleryCandidates[0] ? `/media/wordpress_photos/${galleryCandidates[0]}` : null;
    const finalImage2 = galleryCandidates[1] ? `/media/wordpress_photos/${galleryCandidates[1]}` : null;
    const finalImage3 = galleryCandidates[2] ? `/media/wordpress_photos/${galleryCandidates[2]}` : null;
    const finalImage4 = galleryCandidates[3] ? `/media/wordpress_photos/${galleryCandidates[3]}` : null;

    // Build updated blog object
    const updatedBlog = {
      ...blog,
      description: content,
      sections: [{ content: content }],
      image: finalMainImage,
      image1: finalImage1,
      image2: finalImage2,
      image3: finalImage3,
      image4: finalImage4,
    };

    updatedBlogs.push(updatedBlog);
    console.log(`[Blog ${i + 1}/${blogs.length}] Enriched: "${blog.title.slice(0, 45)}..." | Photos attached: ${usedPhotosInPost.size}`);
  }

  // 5. Write to backup files
  fs.writeFileSync(backupLivePath, JSON.stringify(updatedBlogs, null, 2));
  fs.writeFileSync(rawBackupPath, JSON.stringify(updatedBlogs, null, 2));
  console.log("✅ Updated backup files with enriched blogs.");

  // 6. Connect to MongoDB and update documents
  const mongoUri = process.env.MONGODB_URL;
  if (mongoUri) {
    try {
      console.log("🔌 Connecting to MongoDB Atlas...");
      await mongoose.connect(mongoUri, { dbName: "OwnFresh" });
      console.log("✅ Connected to MongoDB.");

      for (const b of updatedBlogs) {
        if (b._id) {
          await Blog.findByIdAndUpdate(b._id, {
            description: b.description,
            sections: b.sections,
            image: b.image,
            image1: b.image1,
            image2: b.image2,
            image3: b.image3,
            image4: b.image4,
          });
        } else if (b.slug) {
          await Blog.findOneAndUpdate({ slug: b.slug }, {
            description: b.description,
            sections: b.sections,
            image: b.image,
            image1: b.image1,
            image2: b.image2,
            image3: b.image3,
            image4: b.image4,
          });
        }
      }
      console.log("✅ Successfully updated all blogs in MongoDB Atlas!");
      await mongoose.disconnect();
    } catch (err) {
      console.error("⚠️ MongoDB update error:", err.message);
    }
  } else {
    console.log("⚠️ MONGODB_URL not found, skipping live DB update.");
  }

  console.log("=================================================");
  console.log("🎉 BLOG ENRICHMENT COMPLETED SUCCESSFULLY!");
  console.log("=================================================");
}

enrichAllBlogs().catch(console.error);
