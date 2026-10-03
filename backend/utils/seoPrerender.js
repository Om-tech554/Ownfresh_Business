import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import "../models/productModel.js";
import "../models/productVariantModel.js";
import "../models/categoryModel.js";
import "../models/reviewModel.js";
import "../models/blogModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://myownfresh.com";

// In-memory cache of the base index.html template
let cachedTemplate = null;
let templatePath = null;

export function setTemplatePath(p) {
  templatePath = p;
  cachedTemplate = null;
}

function getTemplate() {
  if (cachedTemplate) return cachedTemplate;
  if (!templatePath) {
    templatePath = path.join(__dirname, "../../frontend/dist/index.html");
  }
  if (fs.existsSync(templatePath)) {
    cachedTemplate = fs.readFileSync(templatePath, "utf-8");
    return cachedTemplate;
  }
  return null;
}

// Clear template cache upon new build
export function clearTemplateCache() {
  cachedTemplate = null;
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// -------------------------------------------------------------
// STATIC PAGES & CATEGORIES SEO KNOWLEDGE BASE
// -------------------------------------------------------------
export const STATIC_SEO = {
  "/": {
    title: "Stone Pressed Oil India | Traditional Granite Churned Oils | OwnFresh",
    description: "Buy 100% pure stone pressed cooking oils online in India. Traditional granite stone churned Groundnut, Mustard, Sesame, Coconut & Safflower oils extracted below 45°C without chemicals. Free delivery ₹999+.",
    canonical: `${BASE_URL}/`,
    h1: "OwnFresh | Authentic Stone Pressed Edible Cooking Oils",
    intro: "Experience the pure heritage of traditional granite stone-churned natural edible oils. Extracted slowly below 45°C without chemicals, heat, or preservatives for peak nutrient retention.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    type: "website"
  },
  "/shop": {
    title: "Buy Stone Pressed Cooking Oils Online India | All Varieties | OwnFresh",
    description: "Explore our complete range of unrefined, chemical-free stone pressed cooking oils. Single oils (Groundnut, Mustard, Sesame, Coconut, Safflower, Sunflower) & multi-oil combo packs.",
    canonical: `${BASE_URL}/shop`,
    h1: "Shop Authentic Stone Pressed Cooking Oils & Combo Packs",
    intro: "Freshly pressed upon order. Unrefined, unbleached, and laboratory-tested edible oils delivered straight from our Pune facility to your home.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    type: "website"
  },
  "/oils": {
    title: "Stone Pressed Edible Oils Range | 100% Pure & Unrefined | OwnFresh",
    description: "Discover our full catalog of cold stone pressed cooking oils. High smoke points, rich natural antioxidants, zero trans fats, and zero solvent extraction.",
    canonical: `${BASE_URL}/oils`,
    h1: "Traditional Stone Pressed Edible Oils Range",
    intro: "Pure single-origin seeds crushed at 14–16 RPM in natural granite stone mills. Discover why Indian households are returning to authentic ghani oils.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    type: "website"
  },
  "/groundnut-oil": {
    title: "Stone Pressed Groundnut Oil (Peanut Oil) Churned Below 45°C | OwnFresh",
    description: "Buy authentic stone pressed groundnut oil online. Churned slowly in granite stone mills using Grade-A Maharashtra peanuts. High smoke point (225°C), zero chemicals or hexane.",
    canonical: `${BASE_URL}/groundnut-oil`,
    h1: "Stone Pressed Groundnut Oil (Traditional Granite Churned Peanut Oil)",
    intro: "Our stone-pressed (Kacchi Ghani) groundnut oil is extracted slowly using natural granite stone mills at room temperature (<45°C). By avoiding heat and chemical solvents, we preserve natural plant sterols, resveratrol, and vitamin E.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010997/products/Groundnut-3.png",
    type: "website",
    categoryKey: "Groundnut Oil",
    faqs: [
      {
        q: "What makes Stone Pressed Groundnut Oil different from refined groundnut oil?",
        a: "Refined groundnut oil is treated with high heat (up to 200°C), chemical bleaching agents, and hexane solvents, which strip nutrients and natural flavor. Stone-pressed groundnut oil is extracted at room temperature in stone mills, retaining all original fatty acids, vitamins, and natural aroma without chemicals."
      },
      {
        q: "Is OwnFresh Groundnut Oil suitable for everyday cooking and deep frying?",
        a: "Yes! Stone-pressed groundnut oil has a naturally high smoke point (around 225°C–230°C), making it exceptional for deep frying, sautéing, tadkas, and traditional regional cooking."
      },
      {
        q: "How should I store stone-pressed groundnut oil?",
        a: "Store in a cool, dry place away from direct sunlight. Because it contains zero chemical preservatives, keeping it tightly capped preserves its fresh aroma for up to 9–12 months."
      }
    ]
  },
  "/mustard-oil": {
    title: "Kacchi Ghani Mustard Oil | Pure Stone Pressed Sarson Ka Tel | OwnFresh",
    description: "Experience the authentic punch of stone-pressed Kacchi Ghani mustard oil. High natural pungency (Allyl Isothiocyanate), unrefined, and chemical-free. Fast Pan-India delivery.",
    canonical: `${BASE_URL}/mustard-oil`,
    h1: "Authentic Stone Pressed Kacchi Ghani Mustard Oil (Sarson Ka Tel)",
    intro: "Experience the genuine zing of authentic Kacchi Ghani mustard oil. Extracted at low speeds in traditional stone presses, it preserves natural allyl isothiocyanates, essential Omega-3 (ALA) and Omega-6 fatty acids.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010978/products/Mustard-3.png",
    type: "website",
    categoryKey: "Mustard Oil",
    faqs: [
      {
        q: "Why is stone pressed mustard oil better for pickles?",
        a: "Traditional stone-pressed mustard oil preserves natural antimicrobial compounds and antioxidants that act as natural food preservatives, keeping your homemade pickles fresh and flavorful without artificial additives."
      },
      {
        q: "What gives authentic Kacchi Ghani mustard oil its strong pungent aroma?",
        a: "The sharp aroma and tears-in-eyes pungency come from naturally occurring Allyl Isothiocyanate, which is preserved only during low-temperature, slow-speed stone milling."
      }
    ]
  },
  "/sesame-oil": {
    title: "Stone Pressed Sesame Oil (Pure Til / Gingelly Oil) | OwnFresh",
    description: "Buy 100% pure stone pressed sesame oil (til ka tel). Slowly extracted from whole sesame seeds in granite kolhus. Rich in natural sesamol antioxidants for cooking and wellness.",
    canonical: `${BASE_URL}/sesame-oil`,
    h1: "Pure Stone Pressed Sesame Oil (Traditional Granite Churned Til Oil)",
    intro: "Revered as the 'Queen of Oils' in Ayurveda, our stone-pressed sesame oil is crushed from the finest whole sesame seeds. Rich in sesamol and sesamolin lignans, it delivers a distinctly warm, nutty taste and deep holistic wellness properties.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011005/products/sesame-3.png",
    type: "website",
    categoryKey: "Sesame Oil",
    faqs: [
      {
        q: "Can I use stone-pressed sesame oil for cooking as well as massage?",
        a: "Yes. Our sesame oil is pure food-grade stone-pressed oil. It is wonderful for dosas, stir-fries, and tadkas, while also pure enough for Ayurvedic Abhyanga massage and oil pulling."
      },
      {
        q: "Does your sesame oil contain palm oil or synthetic additives?",
        a: "No! OwnFresh stone-pressed oils are strictly single-ingredient oils with zero blending, zero palm oil, and zero synthetic additives."
      }
    ]
  },
  "/coconut-oil": {
    title: "Stone Pressed Coconut Oil (Virgin & Edible) | OwnFresh",
    description: "Pure edible stone-pressed coconut oil extracted from sulfur-free sun-dried copra. Rich in Lauric Acid and MCTs with fresh natural coconut aroma. Delivers across India.",
    canonical: `${BASE_URL}/coconut-oil`,
    h1: "Stone Pressed Virgin Coconut Oil (Unrefined & Chemical-Free)",
    intro: "Extracted from premium sulfur-free copra coconuts using traditional stone ghani techniques, our coconut oil is crystal clear with a delicate, fresh coconut aroma. Rich in medium-chain triglycerides (MCTs) and lauric acid.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786876701/products/coconut-3.png",
    type: "website",
    categoryKey: "Coconut Oil",
    faqs: [
      {
        q: "Why does pure coconut oil solidify in winter?",
        a: "Natural unrefined coconut oil has a melting point of approximately 24°C (76°F). Solidification at cooler temperatures is a natural physical property and proof of natural purity with zero liquid paraffin or adulterants."
      },
      {
        q: "Can I use this stone pressed coconut oil for cooking as well as hair care?",
        a: "Yes! It is 100% food-grade pure coconut oil with no chemicals, perfumes, or mineral oil, making it exceptional for South Indian curries, baking, bulletproof coffee, and natural hair nourishment."
      }
    ]
  },
  "/safflower-oil": {
    title: "Stone Pressed Safflower Oil (Kardi Ka Tel) for Heart Health | OwnFresh",
    description: "Authentic cold stone pressed safflower (kardi) oil from Maharashtra. Rich in heart-healthy unsaturated fatty acids. Chemical-free, unrefined, and light for everyday cooking.",
    canonical: `${BASE_URL}/safflower-oil`,
    h1: "Stone Pressed Safflower Oil (Traditional Kardi Oil)",
    intro: "Extracted from locally sourced Maharashtra safflower (Kardi) seeds. Safflower oil is celebrated for its exceptionally high polyunsaturated fatty acid content, low viscosity, and clean neutral flavor that allows the natural spices of your dishes to shine.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786877029/products/Safflower-1.png",
    type: "website",
    categoryKey: "Safflower Oil",
    faqs: [
      {
        q: "What are the key benefits of stone pressed safflower (kardi) oil?",
        a: "Kardi oil is rich in linoleic acid (essential Omega-6) and natural Vitamin E, which support cardiovascular health and lipid management when consumed as part of a wholesome diet."
      },
      {
        q: "Is safflower oil suitable for Indian tadka and sautéing?",
        a: "Yes! Safflower oil has a high smoke point (around 232°C / 450°F), making it stable for everyday cooking, curries, and shallow frying."
      }
    ]
  },
  "/sunflower-oil": {
    title: "Stone Pressed Sunflower Oil (Unrefined & Vitamin E Rich) | OwnFresh",
    description: "Buy unrefined stone pressed sunflower cooking oil. Extracted below 45°C without chemical bleaching or deodorizers. Naturally light, nutrient-dense, and healthy.",
    canonical: `${BASE_URL}/sunflower-oil`,
    h1: "Pure Stone Pressed Sunflower Oil (Unrefined Cooking Oil)",
    intro: "Unlike industrial supermarket sunflower oils that undergo chemical solvent extraction and caustic bleaching, OwnFresh stone-pressed sunflower oil is gently crushed at low RPM. Retains natural golden brilliance and active vitamin E.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010989/products/sunflower-1.png",
    type: "website",
    categoryKey: "Sunflower Oil",
    faqs: [
      {
        q: "How does stone-pressed sunflower oil differ from refined sunflower oil?",
        a: "Refined sunflower oil is bleached and deodorized at 200°C using chemicals, leaving it virtually devoid of natural vitamins. Stone-pressed sunflower oil is extracted without chemicals below 45°C, preserving natural tocopherols (Vitamin E) and natural seed flavor."
      }
    ]
  },
  "/whyownfresh": {
    title: "Why OwnFresh: ACoHI Certified Granite Stone Pressing Process & Purity",
    description: "Discover how OwnFresh produces pure edible oils using traditional granite stone mills at 14-16 RPM below 45°C. Certified by ACoHI for process compliance. FSSAI registered.",
    canonical: `${BASE_URL}/whyownfresh`,
    h1: "Traditional Granite Stone Pressing: Certified Purity Without Compromise",
    intro: "OwnFresh Agro Industries revives the authentic heritage of traditional Indian oil extraction. Handcrafted in Dhayari, Pune, using natural stone kolhus certified by ACoHI.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    type: "website"
  },
  "/contact": {
    title: "Contact OwnFresh Oil Mill Pune | Facility Address & Customer Support",
    description: "Visit or contact the OwnFresh stone pressed oil facility in Dhayari, Pune. Direct mill purchases, wholesale inquiries, and customer support. Call +91 89997 73438.",
    canonical: `${BASE_URL}/contact`,
    h1: "Visit Our Stone Pressed Oil Facility in Dhayari, Pune",
    intro: "Connect directly with our production facility at 1, Vir Maruti Complex, Dhayari, Pune. Call +91 89997 73438 or email contact@myownfresh.com.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    type: "website"
  },
  "/oilinsights": {
    title: "Oil Insights & Health Knowledge Base | OwnFresh Research Guides",
    description: "Explore in-depth scientific articles, culinary guides, and smoke-point comparisons on stone pressed cooking oils. Evidence-backed nutritional information.",
    canonical: `${BASE_URL}/oilinsights`,
    h1: "Oil Insights: The Science & Tradition of Healthy Cooking Oils",
    intro: "Comprehensive nutritional guides, extraction breakdowns, and culinary wisdom curated by OwnFresh to help Indian families make safer cooking choices.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    type: "website"
  },
  "/gallery": {
    title: "Facility Gallery & Verified Quality Certifications | OwnFresh",
    description: "Explore the visual journey of OwnFresh. Raw seed selection, granite stone milling machines, ACoHI culinary certifications, and FSSAI standards.",
    canonical: `${BASE_URL}/gallery`,
    h1: "OwnFresh Visual Journey & Certified Standards",
    intro: "Authentic photographs from our Pune production facility showcasing the granite stone milling process, gravity filtration, and official compliance certificates.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    type: "website"
  },
  "/membership": {
    title: "OwnFresh Prime 1% Membership | Exclusive Member Coin Cashbacks",
    description: "Join the OwnFresh Prime program. Earn 1% Commission Credit Coins on every transaction, redeemable directly on your monthly oil orders.",
    canonical: `${BASE_URL}/membership`,
    h1: "OwnFresh Prime 1% Membership Program",
    intro: "Save on every household oil purchase with 1% coin commissions, priority dispatches, and member-exclusive offers on pure stone pressed oils.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    type: "website"
  },
  "/privacy-policy": {
    title: "Privacy Policy | OwnFresh Agro Industries",
    description: "Read the official privacy policy of OwnFresh Agro Industries. How we safeguard customer data, transaction details, and order information.",
    canonical: `${BASE_URL}/privacy-policy`,
    h1: "Privacy Policy",
    intro: "OwnFresh Agro Industries is committed to respecting your privacy and protecting your personal data across all services.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    type: "website"
  },
  "/terms-and-conditions": {
    title: "Terms and Conditions | OwnFresh Agro Industries",
    description: "Review the terms and conditions governing purchases, deliveries, payments, and services on the OwnFresh online platform.",
    canonical: `${BASE_URL}/terms-and-conditions`,
    h1: "Terms & Conditions",
    intro: "Terms of service and customer agreements for orders placed on myownfresh.com.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    type: "website"
  },
  "/refund-policy": {
    title: "Refund & Return Policy | OwnFresh Agro Industries",
    description: "Learn about our customer-friendly return, replacement, and refund policies for damaged or defective oil shipments.",
    canonical: `${BASE_URL}/refund-policy`,
    h1: "Refund & Cancellation Policy",
    intro: "Our hassle-free guarantee for safe transit, leak-proof packaging, and prompt issue resolution.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    type: "website"
  },
  "/shipping-policy": {
    title: "Shipping & Delivery Policy | OwnFresh Agro Industries",
    description: "Fast Pan-India shipping details. Free delivery on orders above ₹999. Trusted courier partners (Blue Dart, Delhivery, DTDC).",
    canonical: `${BASE_URL}/shipping-policy`,
    h1: "Shipping & Delivery Information",
    intro: "Reliable, leak-proof delivery across India with dispatch within 24 hours of fresh pressing.",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    type: "website"
  }
};

// -------------------------------------------------------------
// DYNAMIC PRERENDER RESOLVER
// -------------------------------------------------------------
export async function resolvePageSEO(reqPath) {
  const cleanPath = reqPath.split("?")[0].replace(/\/+$/, "") || "/";

  // 1. Check Static Routes
  if (STATIC_SEO[cleanPath]) {
    const page = STATIC_SEO[cleanPath];
    let schemaGraph = [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          ...(cleanPath !== "/" ? [{ "@type": "ListItem", "position": 2, "name": page.h1, "item": page.canonical }] : [])
        ]
      }
    ];

    if (page.categoryKey) {
      schemaGraph.push({
        "@type": "CollectionPage",
        "name": page.title,
        "description": page.description,
        "url": page.canonical
      });
    }

    if (page.faqs && page.faqs.length > 0) {
      schemaGraph.push({
        "@type": "FAQPage",
        "mainEntity": page.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": { "@type": "Answer", "text": faq.a }
        }))
      });
    }

    return {
      status: 200,
      title: page.title,
      description: page.description,
      canonical: page.canonical,
      h1: page.h1,
      intro: page.intro,
      image: page.image,
      type: page.type,
      schemaGraph,
      categoryKey: page.categoryKey || null,
      faqs: page.faqs || null
    };
  }

  // 2. Check Dynamic Product Route (/product/:slugOrId)
  if (cleanPath.startsWith("/product/")) {
    const identifier = cleanPath.replace("/product/", "").trim();
    if (!identifier) return { status: 404 };

    try {
      const Product = mongoose.models.Product || mongoose.model("Product");
      const ProductVariant = mongoose.models.ProductVariant || mongoose.model("ProductVariant");
      const Review = mongoose.models.Review || mongoose.model("Review");

      let product = await Product.findOne({ slug: identifier }).populate("category").lean();
      let wasObjectIdLookup = false;

      if (!product && mongoose.Types.ObjectId.isValid(identifier)) {
        product = await Product.findById(identifier).populate("category").lean();
        wasObjectIdLookup = true;
      }

      if (!product) {
        return { status: 404, message: "Product not found" };
      }

      // If requested via old ObjectId and product has a slug, signal 301 redirect
      if (wasObjectIdLookup && product.slug) {
        return {
          status: 301,
          redirectTo: `/product/${product.slug}`
        };
      }

      const variants = await ProductVariant.find({ product: product._id, status: "Active" }).sort({ price: 1 }).lean();
      const defaultVariant = variants[0] || null;
      const finalPrice = defaultVariant ? (defaultVariant.sellingPrice || defaultVariant.salePrice || defaultVariant.price) : 565;
      const inStock = defaultVariant ? (defaultVariant.stockQuantity > 0) : true;
      const canonicalSlug = product.slug || String(product._id);
      const canonicalUrl = `${BASE_URL}/product/${canonicalSlug}`;

      // Genuine Approved Reviews Check (Zero fake reviews)
      const approvedReviews = await Review.find({ product: product._id, status: "APPROVED" }).lean();
      const reviewCount = approvedReviews.length;
      let averageRating = 0;
      if (reviewCount > 0) {
        const sum = approvedReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
        averageRating = Number((sum / reviewCount).toFixed(1));
      }

      const cleanDesc = stripHtml(product.shortDesc || product.description || "100% Pure stone pressed natural edible oil.");
      const productTitle = `${product.name} | Granite Churned | OwnFresh`;
      const metaDesc = cleanDesc.slice(0, 155) + (cleanDesc.length > 155 ? "..." : "");

      const productSchema = {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        "name": product.name,
        "image": [product.image],
        "description": cleanDesc,
        "sku": product.sku || `OF-${canonicalSlug.slice(0, 8).toUpperCase()}`,
        "brand": {
          "@type": "Brand",
          "name": "OwnFresh"
        },
        "manufacturer": {
          "@type": "Organization",
          "name": "OWNFRESH AGRO INDUSTRIES"
        },
        "category": "Food & Beverage > Cooking Oils > Stone Pressed Oils",
        "offers": {
          "@type": "Offer",
          "url": canonicalUrl,
          "priceCurrency": "INR",
          "price": finalPrice,
          "itemCondition": "https://schema.org/NewCondition",
          "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "OwnFresh"
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0",
              "currency": "INR"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "IN"
            }
          }
        }
      };

      // ONLY attach aggregateRating & reviews if real approved reviews exist!
      if (reviewCount > 0) {
        productSchema.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": averageRating,
          "reviewCount": reviewCount
        };
        productSchema.review = approvedReviews.slice(0, 5).map(r => ({
          "@type": "Review",
          "author": { "@type": "Person", "name": r.userName },
          "datePublished": r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "2026-01-01",
          "reviewBody": r.comment,
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": r.rating || 5
          }
        }));
      }

      const schemaGraph = [
        productSchema,
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${BASE_URL}/shop` },
            { "@type": "ListItem", "position": 3, "name": product.name, "item": canonicalUrl }
          ]
        }
      ];

      return {
        status: 200,
        title: productTitle,
        description: metaDesc,
        canonical: canonicalUrl,
        h1: product.name,
        intro: cleanDesc,
        image: product.image,
        type: "product",
        schemaGraph,
        product,
        variants
      };
    } catch (e) {
      console.error("Error prerendering product:", e.message);
      return { status: 500, message: e.message };
    }
  }

  // 3. Check Dynamic Blog Route (/blog/:slugOrId)
  if (cleanPath.startsWith("/blog/")) {
    const identifier = cleanPath.replace("/blog/", "").trim();
    if (!identifier) return { status: 404 };

    try {
      const Blog = mongoose.models.Blog || mongoose.model("Blog");
      let blog = await Blog.findOne({ slug: identifier }).lean();
      let wasObjectId = false;

      if (!blog && mongoose.Types.ObjectId.isValid(identifier)) {
        blog = await Blog.findById(identifier).lean();
        wasObjectId = true;
      }

      if (!blog) {
        return { status: 404, message: "Blog not found" };
      }

      if (wasObjectId && blog.slug) {
        return {
          status: 301,
          redirectTo: `/blog/${blog.slug}`
        };
      }

      const canonicalUrl = `${BASE_URL}/blog/${blog.slug || blog._id}`;
      const cleanDesc = stripHtml(blog.searchDescription || blog.description || blog.title);
      const metaDesc = cleanDesc.slice(0, 155) + (cleanDesc.length > 155 ? "..." : "");
      const blogTitle = `${blog.title} | OwnFresh Insights`;
      const authorName = blog.author && !blog.author.includes("admin") ? blog.author : "Monali Salagare";
      const pubDate = blog.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString();
      const modDate = blog.updatedAt ? new Date(blog.updatedAt).toISOString() : pubDate;

      const schemaGraph = [
        {
          "@type": "Article",
          "@id": `${canonicalUrl}#article`,
          "headline": blog.title,
          "description": metaDesc,
          "image": [blog.image || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png"],
          "datePublished": pubDate,
          "dateModified": modDate,
          "author": {
            "@type": "Person",
            "name": authorName
          },
          "publisher": {
            "@type": "Organization",
            "name": "OwnFresh",
            "logo": {
              "@type": "ImageObject",
              "url": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "Oil Insights", "item": `${BASE_URL}/oilinsights` },
            { "@type": "ListItem", "position": 3, "name": blog.title, "item": canonicalUrl }
          ]
        }
      ];

      return {
        status: 200,
        title: blogTitle,
        description: metaDesc,
        canonical: canonicalUrl,
        h1: blog.title,
        intro: cleanDesc,
        image: blog.image || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
        type: "article",
        schemaGraph,
        blog
      };
    } catch (e) {
      console.error("Error prerendering blog:", e.message);
      return { status: 500, message: e.message };
    }
  }

  // 4. Unknown Path -> 404 (Eliminates Soft 404)
  return { status: 404, message: "Page not found" };
}

// -------------------------------------------------------------
// HTML INJECTION & SSR FALLBACK GENERATOR
// -------------------------------------------------------------
export function renderPrerenderedHTML(pageData) {
  let template = getTemplate();
  if (!template) {
    // Basic fallback if frontend build is missing
    template = `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>OwnFresh</title></head><body><div id="root"></div></body></html>`;
  }

  const {
    title,
    description,
    canonical,
    h1,
    intro,
    image,
    type = "website",
    schemaGraph = []
  } = pageData;

  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeCanonical = escapeHtml(canonical);
  const safeImage = escapeHtml(image);
  const safeH1 = escapeHtml(h1);
  const safeIntro = escapeHtml(intro);

  // 1. Replace Title
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);

  // 2. Replace Primary Meta Tags
  html = html.replace(/<meta\s+name=["']title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="title" content="${safeTitle}" />`);
  html = html.replace(/<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="description" content="${safeDesc}" />`);

  // 3. Inject or Replace Canonical
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i, `<link rel="canonical" href="${safeCanonical}" />`);
  } else {
    html = html.replace("</head>", `  <link rel="canonical" href="${safeCanonical}" />\n</head>`);
  }

  // 4. Replace Open Graph Tags
  html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:title" content="${safeTitle}" />`);
  html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:description" content="${safeDesc}" />`);
  html = html.replace(/<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:url" content="${safeCanonical}" />`);
  html = html.replace(/<meta\s+property=["']og:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image" content="${safeImage}" />`);
  html = html.replace(/<meta\s+property=["']og:type["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:type" content="${type}" />`);

  // 5. Replace Twitter Tags
  html = html.replace(/<meta\s+name=["']twitter:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:title" content="${safeTitle}" />`);
  html = html.replace(/<meta\s+name=["']twitter:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:description" content="${safeDesc}" />`);
  html = html.replace(/<meta\s+name=["']twitter:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:url" content="${safeCanonical}" />`);
  html = html.replace(/<meta\s+name=["']twitter:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:image" content="${safeImage}" />`);

  // 6. Inject Structured Data (@graph) before </head>
  if (schemaGraph && schemaGraph.length > 0) {
    const jsonLdScript = `\n  <!-- Page-Specific Structured Data -->\n  <script type="application/ld+json">\n${JSON.stringify({ "@context": "https://schema.org", "@graph": schemaGraph }, null, 2)}\n  </script>\n`;
    html = html.replace("</head>", `${jsonLdScript}</head>`);
  }

  // 7. Render Semantic Crawler Fallback inside <div id="root">
  const semanticBody = `
    <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 1200px; margin: 0 auto; padding: 24px; color: #1e293b;">
      <header style="margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px;">
        <nav style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px;">
          <a href="/" style="color: #166534; text-decoration: none;">Home</a> •
          <a href="/shop" style="color: #166534; text-decoration: none;">Shop All Oils</a> •
          <a href="/groundnut-oil" style="color: #166534; text-decoration: none;">Groundnut Oil</a> •
          <a href="/mustard-oil" style="color: #166534; text-decoration: none;">Mustard Oil</a> •
          <a href="/sesame-oil" style="color: #166534; text-decoration: none;">Sesame Oil</a> •
          <a href="/coconut-oil" style="color: #166534; text-decoration: none;">Coconut Oil</a> •
          <a href="/safflower-oil" style="color: #166534; text-decoration: none;">Safflower Oil</a> •
          <a href="/sunflower-oil" style="color: #166534; text-decoration: none;">Sunflower Oil</a> •
          <a href="/whyownfresh" style="color: #166534; text-decoration: none;">Why OwnFresh</a> •
          <a href="/oilinsights" style="color: #166534; text-decoration: none;">Health Insights</a> •
          <a href="/contact" style="color: #166534; text-decoration: none;">Contact Pune Facility</a>
        </nav>
        <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; line-height: 1.25;">
          ${safeH1}
        </h1>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0;">
          ${safeIntro}
        </p>
      </header>
      <main style="line-height: 1.7; color: #334155; font-size: 15px;">
        ${pageData.product ? `
          <div style="display: flex; flex-wrap: wrap; gap: 24px; margin-top: 20px;">
            <div style="flex: 1 1 300px; max-width: 400px;">
              <img src="${safeImage}" alt="${safeTitle}" style="width: 100%; height: auto; border-radius: 16px; border: 1px solid #e2e8f0;" />
            </div>
            <div style="flex: 2 1 400px;">
              <p style="font-size: 20px; font-weight: 800; color: #15803d; margin: 0 0 12px 0;">₹${pageData.schemaGraph[0]?.offers?.price || 565} <span style="font-size: 13px; color: #64748b; font-weight: 600;">(Free Shipping ₹999+)</span></p>
              <p><strong>Extraction Method:</strong> Traditional granite stone kolhu (14–16 RPM) extracted below 45°C.</p>
              <p><strong>Purity Standards:</strong> Unrefined, unbleached, zero chemical solvents (hexane-free), zero artificial preservatives.</p>
              <p><strong>Origin & Facility:</strong> Direct from OWNFRESH AGRO INDUSTRIES facility in Dhayari, Pune, Maharashtra.</p>
              <p><a href="/checkout" style="display: inline-block; background: #166534; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 12px;">Order Authentic Oil Online</a></p>
            </div>
          </div>
        ` : ""}
        ${pageData.blog ? `
          <div style="max-width: 800px; margin-top: 20px;">
            <img src="${safeImage}" alt="${safeTitle}" style="width: 100%; max-height: 420px; object-fit: cover; border-radius: 16px; margin-bottom: 24px;" />
            <article>${pageData.blog.sections?.[0]?.content || pageData.blog.description || ""}</article>
          </div>
        ` : ""}
      </main>
    </div>
  `;

  // Replace content inside <div id="root">...</div> with the pre-rendered semantic body
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${semanticBody}</div>`);

  return html;
}

// -------------------------------------------------------------
// STANDALONE 404 NOT FOUND HTML GENERATOR
// -------------------------------------------------------------
export function render404HTML(reqPath) {
  const safePath = escapeHtml(reqPath);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>404 Page Not Found | OwnFresh Stone Pressed Oils</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Poppins', sans-serif; background-color: #fafafa; color: #1e293b; margin: 0; padding: 40px 20px; display: flex; align-items: center; justify-content: center; min-height: 80vh; }
    .card { max-width: 640px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    h1 { font-size: 64px; font-weight: 800; color: #166534; margin: 0 0 12px 0; }
    h2 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; }
    p { font-size: 15px; color: #64748b; line-height: 1.6; margin: 0 0 24px 0; }
    .links { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 24px; }
    .btn { display: inline-block; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; transition: all 0.2s; }
    .btn-primary { background: #166534; color: #ffffff; }
    .btn-primary:hover { background: #14532d; }
    .btn-secondary { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
    .btn-secondary:hover { background: #e2e8f0; }
    .categories { margin-top: 32px; border-top: 1px solid #f1f5f9; pt-20; font-size: 13px; color: #475569; }
    .categories a { color: #166534; text-decoration: none; font-weight: 600; margin: 0 6px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>404</h1>
    <h2>Looking for Pure Stone Pressed Oils?</h2>
    <p>We could not find the page you requested at <code>${safePath}</code>. It may have been moved, renamed, or is temporarily unavailable.</p>
    <div class="links">
      <a href="/" class="btn btn-primary">Return to Homepage</a>
      <a href="/shop" class="btn btn-secondary">Shop All Cooking Oils</a>
      <a href="/contact" class="btn btn-secondary">Contact Pune Facility</a>
    </div>
    <div class="categories" style="padding-top: 24px;">
      <p style="margin-bottom: 8px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">Popular Pure Stone Pressed Oils:</p>
      <a href="/groundnut-oil">Groundnut Oil</a> •
      <a href="/mustard-oil">Mustard Oil</a> •
      <a href="/sesame-oil">Sesame Oil</a> •
      <a href="/coconut-oil">Coconut Oil</a> •
      <a href="/safflower-oil">Safflower Oil</a> •
      <a href="/sunflower-oil">Sunflower Oil</a>
    </div>
  </div>
</body>
</html>`;
}
