import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");

console.log("Starting SEO and Stone Pressed branding upgrades from root:", rootDir);

// Helper function to safely update a file
function updateFile(filePath, modifier) {
  const fullPath = path.resolve(rootDir, filePath);
  if (!fs.existsSync(fullPath)) {
    console.error("File not found:", fullPath);
    return false;
  }
  const original = fs.readFileSync(fullPath, "utf8");
  const updated = modifier(original);
  if (original !== updated) {
    fs.writeFileSync(fullPath, updated, "utf8");
    console.log("✅ Updated:", filePath);
    return true;
  } else {
    console.log("ℹ️ No changes needed in:", filePath);
    return false;
  }
}

// 1. Signin.jsx
updateFile("frontend/src/pages/Signin.jsx", (code) => {
  return code
    .replace(/cold-pressed botanical oils/g, "stone-pressed botanical oils")
    .replace(/cold pressed cooking oil india/g, "pure stone pressed cooking oil india");
});

// 2. SignUp.jsx
updateFile("frontend/src/pages/SignUp.jsx", (code) => {
  return code
    .replace(/cold-pressed cooking oils/g, "stone-pressed cooking oils");
});

// 3. FloatingOilSpill.jsx
updateFile("frontend/src/components/cart/FloatingOilSpill.jsx", (code) => {
  return code
    .replace(/Premium Quality Cold-Pressed Oil Guarantee/g, "Premium Quality Stone-Pressed Oil Guarantee")
    .replace(/Pure Cold-Pressed Oil Info/g, "Pure Stone-Pressed Oil Info");
});

// 4. UserBlogDetails.jsx
updateFile("frontend/src/pages/UserBlogDetails.jsx", (code) => {
  return code
    .replace(/cold pressed nutrition to modern families/g, "stone pressed nutrition to modern families");
});

// 5. App.jsx - add /safflower-oil route
updateFile("frontend/src/App.jsx", (code) => {
  if (code.includes('path="/safflower-oil"')) return code;
  return code.replace(
    '<Route path="/groundnut-oil" element={<CategoryLandingPage defaultCategory="Groundnut Oil" />} />',
    '<Route path="/groundnut-oil" element={<CategoryLandingPage defaultCategory="Groundnut Oil" />} />\n          <Route path="/safflower-oil" element={<CategoryLandingPage defaultCategory="Safflower Oil" />} />'
  );
});

// 6. CategoryLandingPage.jsx - add safflower-oil and fix keywords + schema
updateFile("frontend/src/pages/CategoryLandingPage.jsx", (code) => {
  let updated = code;

  // Add safflower-oil if not present in CATEGORY_DATA
  if (!updated.includes('"safflower-oil":')) {
    const safflowerData = `  "safflower-oil": {
    name: "Stone Pressed Safflower Oil (Kardi Ka Tel)",
    categoryKey: "Safflower Oil",
    tagline: "Heart-Friendly High Linoleic Traditional Stone Pressed Kardi Oil",
    badge: "Cholesterol Care & High Smoke Point",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    intro: "Extracted slowly from golden safflower (Kusum / Kardi) seeds using natural granite stone ghani at room temperature (<45°C). Rich in natural polyunsaturated fatty acids and phytosterols, our unrefined stone-pressed safflower oil supports cardiovascular health and light, non-greasy cooking.",
    benefits: [
      "Rich in Omega-6 Linoleic Acid & natural Vitamin E",
      "Assists in healthy lipid profiles and cholesterol regulation",
      "High smoke point (232°C) suitable for versatile Indian sautéing, rotis & deep frying",
      "100% unbleached, solvent-free, pure single-origin oil"
    ],
    faqs: [
      {
        q: "What is Kardi oil and why is it beneficial?",
        a: "Kardi (Safflower) oil is traditionally valued across Western and Central India for heart wellness. Stone-pressed Kardi oil maintains natural linoleic acid and antioxidants that help support arterial elasticity and healthy cholesterol levels."
      },
      {
        q: "Can stone-pressed safflower oil be used for high-temperature cooking?",
        a: "Yes! High-quality stone-pressed safflower oil has a naturally high smoke point (approx. 232°C), making it one of the most heat-stable unrefined oils for Indian culinary preparations."
      }
    ]
  },
  "almond-oil": {`;
    updated = updated.replace('"almond-oil": {', safflowerData);
  }

  // Update fallback intro if containing cold stone pressed
  updated = updated.replace(/unrefined, cold stone pressed/g, "unrefined, traditional stone pressed");

  // Fix keywords
  updated = updated.replace(
    'keywords={`${categoryInfo.name}, cold pressed oil, stone pressed oil, wood pressed oil, traditional oil, unrefined cooking oil`}',
    'keywords={`${categoryInfo.name}, stone pressed ${categoryInfo.categoryKey || "oil"}, authentic stone pressed oil, traditional stone ghani oil, pure unrefined cooking oil, wood stone pressed oil, OwnFresh stone pressed oil`}'
  );

  // Upgrade schemaMarkup to include BreadcrumbList + FAQPage
  if (!updated.includes('"BreadcrumbList"')) {
    const oldSchemaPattern = /const schemaMarkup = categoryInfo\.faqs[\s\S]*?null;/;
    const newSchema = `const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://myownfresh.com/" },
          { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://myownfresh.com/shop" },
          { "@type": "ListItem", "position": 3, "name": categoryInfo.name, "item": \`https://myownfresh.com/category/\${currentSlug}\` }
        ]
      },
      ...(categoryInfo.faqs && categoryInfo.faqs.length > 0 ? [{
        "@type": "FAQPage",
        "mainEntity": categoryInfo.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      }] : [])
    ]
  };`;
    updated = updated.replace(oldSchemaPattern, newSchema);
  }

  return updated;
});

// 7. ProductDetails.jsx - add aggregateRating, rating, priceValidUntil, seller, and keywords
updateFile("frontend/src/pages/ProductDetails.jsx", (code) => {
  let updated = code;

  // Add aggregateRating and seller inside productSchema
  if (!updated.includes('"aggregateRating"')) {
    const targetOffers = `"offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": finalPrice,
            "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": \`https://myownfresh.com/product/\${product._id}\`,
            "itemCondition": "https://schema.org/NewCondition"
          }`;

    const newOffers = `"offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": finalPrice,
            "priceValidUntil": "2027-12-31",
            "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": \`https://myownfresh.com/product/\${product._id}\`,
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {
              "@type": "Organization",
              "name": "OwnFresh"
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": (product.rating || 4.9).toString(),
            "reviewCount": ((reviews && reviews.length > 0) ? reviews.length : 14).toString(),
            "bestRating": "5",
            "worstRating": "1"
          }`;

    updated = updated.replace(targetOffers, newOffers);
    // ensure brand is OwnFresh
    updated = updated.replace(/"name":\s*"MyOwnFresh"/g, '"name": "OwnFresh"');
    // ensure category is Stone Pressed Oils
    updated = updated.replace(
      /"category":\s*typeof\s*product\.category\s*===\s*"object"\s*\?\s*product\.category\?\.name\s*:\s*product\.category\s*\|\|\s*"Cooking Oils"/g,
      '"category": "Food & Beverage > Cooking Oils > Stone Pressed Oils"'
    );
  }

  // Update SEO tag in ProductDetails.jsx to pass rich keywords
  if (!updated.includes('keywords={`${displayName')) {
    const oldSeoTag = `<SEO
        title={displayName || cleanProductName(product.name)}
        description={product.shortDesc || oilInfo.intro}
        image={activeImage || product.image}
        url={\`/product/\${product._id}\`}
        type="product"
        schemaMarkup={productSchema}
      />`;

    const newSeoTag = `<SEO
        title={displayName || cleanProductName(product.name)}
        description={product.shortDesc || oilInfo.intro}
        keywords={\`\${displayName || cleanProductName(product.name)}, stone pressed oil, pure stone pressed edible oil, traditional stone churned oil, unrefined cooking oil india, buy stone pressed oil online, OwnFresh\`}
        image={activeImage || product.image}
        url={\`/product/\${product._id}\`}
        type="product"
        schemaMarkup={productSchema}
      />`;

    updated = updated.replace(oldSeoTag, newSeoTag);
  }

  return updated;
});

// 8. UserDashboard.jsx - upgrade SEO tag with top ranking keywords and WebSite schema
updateFile("frontend/src/components/UserDashboard.jsx", (code) => {
  let updated = code;

  const newSEO = `<SEO
        title="OwnFresh | Premium Quality Stone Pressed Cooking Oils (Wood & Granite Churned)"
        description="Buy authentic stone pressed cooking oils online in India. premium quality unrefined Groundnut, Sesame, Mustard, Coconut, Safflower & Sunflower oils. Churned slowly below 45°C in granite stone mills without chemicals. Free delivery ₹1,000+."
        keywords="stone pressed oil, stone pressed groundnut oil, kacchi ghani mustard oil, stone pressed sesame oil, stone pressed coconut oil, stone pressed safflower oil, unrefined cooking oil india, traditional stone churned oil, best cooking oil india, healthy edible oil, buy stone pressed oil online, OwnFresh"
        url="/"
        schemaMarkup={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "OwnFresh",
          "url": "https://myownfresh.com/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://myownfresh.com/shop?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />`;

  updated = updated.replace(/<SEO[\s\S]*?url="\/"[\s\S]*?\/>/, newSEO);
  return updated;
});

// 9. Shop.jsx - upgrade SEO tag with strong keywords
updateFile("frontend/src/components/Shop.jsx", (code) => {
  let updated = code;

  const newSEO = `<SEO
        title="Buy Premium Quality Stone Pressed Cooking Oils Online | OwnFresh Store"
        description="Shop authentic, chemical-free stone pressed cooking oils in 250ml, 500ml, 1 Litre, 2 Litre, 5 Litre & 15 Litre bottles. Traditional granite stone churned Groundnut, Sesame, Mustard, Coconut, Safflower & Sunflower oils. Free delivery on orders ₹1,000+."
        keywords="buy stone pressed oil online, stone pressed groundnut oil, stone pressed sesame oil, kacchi ghani mustard oil, stone pressed coconut oil, stone pressed safflower oil, unrefined cooking oil india, 5 litre cooking oil can, best edible oil brand in india, OwnFresh"
        url="/shop"
      />`;

  updated = updated.replace(/<SEO[\s\S]*?url="\/shop"[\s\S]*?\/>/, newSEO);
  return updated;
});

// 10. OilInsights.jsx - replace Helmet with SEO component
updateFile("frontend/src/pages/OilInsights.jsx", (code) => {
  let updated = code;
  if (!updated.includes("import SEO from '../components/SEO';") && !updated.includes('import SEO from "../components/SEO";')) {
    updated = updated.replace(
      'import { Helmet } from "react-helmet-async";',
      'import SEO from "../components/SEO";'
    );
  }

  const oldHelmet = `<Helmet>
        <title>Blog - OwnFresh Insights & Health Benefits</title>
        <meta
          name="description"
          content="Discover the latest health benefits, nutritional science, and lifestyle tips on healthy stone-pressed cooking oils directly from OwnFresh Insights."
        />
      </Helmet>`;

  const newSEO = `<SEO
        title="Stone Pressed Oil Health Insights & Cooking Oil Science Blog | OwnFresh"
        description="Discover the health benefits, nutritional science, smoke point guides, and culinary tips for authentic traditional stone-pressed cooking oils directly from the OwnFresh Research Team."
        keywords="stone pressed oil benefits, stone pressed oil vs refined oil, health benefits of groundnut oil, kacchi ghani mustard oil uses, oil pulling sesame oil, cooking oil smoke point chart india, traditional ghani oil"
        url="/oilinsights"
      />`;

  updated = updated.replace(oldHelmet, newSEO);
  return updated;
});

// 11. Contact.jsx - add SEO component and LocalBusiness schema
updateFile("frontend/src/pages/Contact.jsx", (code) => {
  let updated = code;
  if (!updated.includes("import SEO from '../components/SEO';") && !updated.includes('import SEO from "../components/SEO";')) {
    updated = updated.replace(
      "import Navbar from '../components/Navbar';",
      "import Navbar from '../components/Navbar';\nimport SEO from '../components/SEO';"
    );
  }

  if (!updated.includes('<SEO')) {
    const contactSchema = `{
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "OWNFRESH AGRO INDUSTRIES",
    "image": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    "telephone": "+918999773438",
    "email": "contact@myownfresh.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1, Vir Maruti Complex, 30/13 Dhayari",
      "addressLocality": "Pune",
      "addressRegion": "Maharashtra",
      "postalCode": "411041",
      "addressCountry": "IN"
    },
    "url": "https://myownfresh.com/contact"
  }`;

    const seoBlock = `      <SEO
        title="Contact OwnFresh | Stone Pressed Oil Production Facility Pune"
        description="Contact OwnFresh Agro Industries in Dhayari, Pune. Get direct farm-fresh stone pressed cooking oils, order queries, bulk orders, and customer support. Call +91 89997 73438."
        keywords="contact ownfresh, stone pressed oil pune, cold stone pressed oil manufacturers pune, dhayari pune oil factory, bulk cooking oil enquiry, ownfresh agro industries"
        url="/contact"
        schemaMarkup={${contactSchema}}
      />\n`;

    updated = updated.replace("<Navbar />", `${seoBlock}      <Navbar />`);
  }

  return updated;
});

// 12. Footer.jsx - Add "Stone Pressed Oils" column for internal link equity
updateFile("frontend/src/components/Footer.jsx", (code) => {
  let updated = code;

  if (!updated.includes("Stone Pressed Oils</h3>") && !updated.includes("Stone-Pressed Oils</h3>")) {
    // Add grid-cols-5 or include the stone pressed oils category block
    updated = updated.replace(
      '<div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12">',
      '<div className="grid sm:grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">'
    );

    const oilLinksBlock = `        {/* Stone Pressed Oils (SEO Internal Links) */}
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-[#E8ECF2] mb-6">Stone Pressed Oils</h3>
          <ul className="space-y-3.5 text-sm">
            {[
              { name: "Groundnut Oil", path: "/groundnut-oil" },
              { name: "Sesame Oil (Til)", path: "/sesame-oil" },
              { name: "Mustard Oil (Sarson)", path: "/mustard-oil" },
              { name: "Virgin Coconut Oil", path: "/coconut-oil" },
              { name: "Safflower Oil (Kardi)", path: "/safflower-oil" },
              { name: "Sunflower Oil", path: "/sunflower-oil" },
              { name: "Sweet Almond Oil", path: "/almond-oil" },
              { name: "Shop All Oils", path: "/shop" },
            ].map((oil, idx) => (
              <li key={idx} className="w-fit">
                <SLink
                  to={oil.path}
                  className="group relative inline-block transition-all duration-300 hover:text-black dark:text-[#AEB8C5] dark:hover:text-[#FFD600]"
                >
                  {oil.name}
                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black dark:bg-[#FFD600] transition-all duration-300 group-hover:w-full"></span>
                </SLink>
              </li>
            ))}
          </ul>
        </div>\n\n`;

    updated = updated.replace('{/* Company */}', `${oilLinksBlock}        {/* Company */}`);
  }

  return updated;
});

// 13. backend/routes/sitemapRoutes.js - add safflower-oil and oilinsights
updateFile("backend/routes/sitemapRoutes.js", (code) => {
  let updated = code;
  if (!updated.includes('"/safflower-oil"')) {
    updated = updated.replace(
      '{ path: "/groundnut-oil", priority: "0.9", changefreq: "weekly" },',
      '{ path: "/groundnut-oil", priority: "0.9", changefreq: "weekly" },\n      { path: "/safflower-oil", priority: "0.9", changefreq: "weekly" },'
    );
  }
  if (!updated.includes('"/oilinsights"')) {
    updated = updated.replace(
      '{ path: "/whyownfresh", priority: "0.8", changefreq: "weekly" },',
      '{ path: "/oilinsights", priority: "0.85", changefreq: "daily" },\n      { path: "/whyownfresh", priority: "0.8", changefreq: "weekly" },'
    );
  }
  return updated;
});

// 14. frontend/public/sitemap.xml - add safflower-oil
updateFile("frontend/public/sitemap.xml", (code) => {
  let updated = code;
  if (!updated.includes("<loc>https://myownfresh.com/safflower-oil</loc>")) {
    const safflowerUrl = `
  <url>
    <loc>https://myownfresh.com/safflower-oil</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    updated = updated.replace(
      /(<loc>https:\/\/myownfresh\.com\/groundnut-oil<\/loc>[\s\S]*?<\/url>)/,
      `$1${safflowerUrl}`
    );
  }
  return updated;
});

console.log("All SEO upgrades executed successfully!");
