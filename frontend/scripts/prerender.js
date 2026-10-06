import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://myownfresh.com";
// Always default to production API so build gets genuine live database content
const API_URL = process.env.PRERENDER_API_URL || "https://api.myownfresh.com";
const distDir = path.join(__dirname, "../dist");
const baseIndexPath = path.join(distDir, "index.html");

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtml(html = "") {
  return (html || "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Global Knowledge Graph Entities
const ORGANIZATION_ENTITY = {
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  "name": "OwnFresh",
  "legalName": "OWNFRESH AGRO INDUSTRIES",
  "url": BASE_URL,
  "logo": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
  "description": "Manufacturer and direct-to-consumer brand of premium quality traditional stone pressed cooking oils in India.",
  "sameAs": [
    "https://www.instagram.com/ownfresh_official/",
    "https://www.facebook.com/ownfresh.official",
    "https://x.com/ownfresh_off",
    "https://www.youtube.com/@OwnFreshOfficial",
    "https://www.linkedin.com/company/ownfresh/"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-8999773438",
    "contactType": "Customer Service",
    "areaServed": "IN",
    "availableLanguage": ["English", "Hindi", "Marathi"]
  }
};

const WEBSITE_ENTITY = {
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  "url": `${BASE_URL}/`,
  "name": "OwnFresh",
  "publisher": { "@id": `${BASE_URL}/#organization` },
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${BASE_URL}/shop?search={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

const LOCAL_BUSINESS_ENTITY = {
  "@type": "LocalBusiness",
  "@id": `${BASE_URL}/#localbusiness`,
  "name": "OwnFresh Agro Industries",
  "image": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
  "telephone": "+918999773438",
  "priceRange": "₹₹",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "1, Vir Maruti Complex, 30/13 Dhayari",
    "addressLocality": "Pune",
    "addressRegion": "Maharashtra",
    "postalCode": "411041",
    "addressCountry": "IN"
  },
  "url": BASE_URL
};

// Static Core Public Pages Catalog
const STATIC_PAGES = [
  {
    path: "/",
    title: "Stone Pressed Oil India | Traditional Granite Churned Oils | OwnFresh",
    description: "Buy 100% pure stone pressed cooking oils online in India. Traditional granite stone churned Groundnut, Mustard, Sesame, Coconut & Safflower oils extracted below 45°C without chemicals. Free delivery ₹999+.",
    canonical: `${BASE_URL}/`,
    h1: "OwnFresh | Authentic Stone Pressed Edible Cooking Oils",
    intro: "Experience the pure heritage of traditional granite stone-churned natural edible oils. Extracted slowly below 45°C without chemicals, heat, or preservatives for peak nutrient retention.",
    type: "website",
    schema: {
      "@context": "https://schema.org",
      "@graph": [ORGANIZATION_ENTITY, WEBSITE_ENTITY, LOCAL_BUSINESS_ENTITY]
    }
  },
  {
    path: "/shop",
    title: "Buy Stone Pressed Cooking Oils Online India | All Varieties | OwnFresh",
    description: "Explore our complete range of unrefined, chemical-free stone pressed cooking oils. Single oils (Groundnut, Mustard, Sesame, Coconut, Safflower, Sunflower) & multi-oil combo packs.",
    canonical: `${BASE_URL}/shop`,
    h1: "Shop Authentic Stone Pressed Cooking Oils & Combo Packs",
    intro: "Freshly pressed upon order. Unrefined, unbleached, and laboratory-tested edible oils delivered straight from our Pune facility to your home.",
    type: "website",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Shop All Oils", "item": `${BASE_URL}/shop` }
          ]
        }
      ]
    }
  },
  {
    path: "/oils",
    title: "Stone Pressed Edible Oils Range | 100% Pure & Unrefined | OwnFresh",
    description: "Discover our full catalog of cold stone pressed cooking oils. High smoke points, rich natural antioxidants, zero trans fats, and zero solvent extraction.",
    canonical: `${BASE_URL}/oils`,
    h1: "Traditional Stone Pressed Edible Oils Range",
    intro: "Pure single-origin seeds crushed at 14–16 RPM in natural granite stone mills. Discover why Indian households are returning to authentic ghani oils.",
    type: "website",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Edible Oils Catalog", "item": `${BASE_URL}/oils` }
          ]
        }
      ]
    }
  },
  {
    path: "/groundnut-oil",
    title: "Stone Pressed Groundnut Oil | Traditional Granite Churned | OwnFresh",
    description: "Authentic stone-pressed peanut/groundnut oil. Cold churned from premium Saurashtra groundnuts below 45°C. High smoke point, nutty aroma, zero chemicals.",
    canonical: `${BASE_URL}/groundnut-oil`,
    h1: "Stone Pressed Groundnut Oil (Wood & Granite Churned)",
    intro: "Unrefined single-origin peanut oil churned slowly in natural granite stones. Rich in healthy monounsaturated fats (MUFA) and natural vitamin E for daily Indian cooking.",
    type: "collection",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Cooking Oils", "item": `${BASE_URL}/shop` },
            { "@type": "ListItem", "position": 3, "name": "Groundnut Oil", "item": `${BASE_URL}/groundnut-oil` }
          ]
        }
      ]
    }
  },
  {
    path: "/mustard-oil",
    title: "Kacchi Ghani Mustard Oil | Stone Pressed Pure Sarson Tel | OwnFresh",
    description: "Pure stone pressed Kacchi Ghani mustard oil. Pungent aroma, natural allyl isothiocyanate, rich in omega-3 & omega-6 fatty acids. Unheated and unrefined.",
    canonical: `${BASE_URL}/mustard-oil`,
    h1: "Kacchi Ghani Stone Pressed Mustard Oil",
    intro: "Traditional raw mustard seed extraction in stone mortars. Naturally strong pungency, authentic golden color, and zero synthetic preservatives.",
    type: "collection",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Cooking Oils", "item": `${BASE_URL}/shop` },
            { "@type": "ListItem", "position": 3, "name": "Mustard Oil", "item": `${BASE_URL}/mustard-oil` }
          ]
        }
      ]
    }
  },
  {
    path: "/sesame-oil",
    title: "Stone Pressed Sesame Oil | Traditional Gingelly / Til Oil | OwnFresh",
    description: "Pure cold stone pressed sesame oil (Til Tel). Churned from finest black/white sesame seeds. Rich in sesamol, sesamolin antioxidants and calcium.",
    canonical: `${BASE_URL}/sesame-oil`,
    h1: "Stone Pressed Sesame Oil (Gingelly / Til Oil)",
    intro: "Authentic sesame oil pressed at low RPMs. Prized in Ayurvedic cuisine and traditional Indian curries for deep nutty taste and cardiovascular benefits.",
    type: "collection",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Cooking Oils", "item": `${BASE_URL}/shop` },
            { "@type": "ListItem", "position": 3, "name": "Sesame Oil", "item": `${BASE_URL}/sesame-oil` }
          ]
        }
      ]
    }
  },
  {
    path: "/coconut-oil",
    title: "Stone Pressed Coconut Oil | 100% Pure Copra Churned | OwnFresh",
    description: "Unrefined raw stone pressed coconut oil from sun-dried natural copra. Ideal for cooking, baking, hair nourishing, and raw oil pulling. Free of sulphur.",
    canonical: `${BASE_URL}/coconut-oil`,
    h1: "Stone Pressed Pure Coconut Oil",
    intro: "Extracted without heat from sulphur-free coconuts. Rich in lauric acid and medium-chain triglycerides (MCTs) that boost energy and digestion.",
    type: "collection",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Cooking Oils", "item": `${BASE_URL}/shop` },
            { "@type": "ListItem", "position": 3, "name": "Coconut Oil", "item": `${BASE_URL}/coconut-oil` }
          ]
        }
      ]
    }
  },
  {
    path: "/safflower-oil",
    title: "Stone Pressed Safflower Oil (Kardi) | Heart-Healthy Oil | OwnFresh",
    description: "Pure stone pressed safflower oil (Kardi Tel). Exceptionally high smoke point (230°C+), linoleic acid, and light taste. Ideal for Indian deep frying.",
    canonical: `${BASE_URL}/safflower-oil`,
    h1: "Stone Pressed Safflower Oil (Kardi Oil)",
    intro: "Cold extracted from whole safflower seeds. Neutral aroma, heart-friendly fatty acid profile, and exceptional thermal stability for Indian frying.",
    type: "collection",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Cooking Oils", "item": `${BASE_URL}/shop` },
            { "@type": "ListItem", "position": 3, "name": "Safflower Oil", "item": `${BASE_URL}/safflower-oil` }
          ]
        }
      ]
    }
  },
  {
    path: "/sunflower-oil",
    title: "Stone Pressed Sunflower Oil | Cold Extracted & Unrefined | OwnFresh",
    description: "Pure stone pressed sunflower oil. Pressed slowly from non-GMO sunflower seeds. Rich in vitamin E, polyunsaturated fatty acids, and light for daily cooking.",
    canonical: `${BASE_URL}/sunflower-oil`,
    h1: "Stone Pressed Sunflower Oil",
    intro: "Unrefined and solvent-free sunflower oil. Natural golden hue, delicately balanced flavor, and high vitamin E content for everyday family cooking.",
    type: "collection",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Cooking Oils", "item": `${BASE_URL}/shop` },
            { "@type": "ListItem", "position": 3, "name": "Sunflower Oil", "item": `${BASE_URL}/sunflower-oil` }
          ]
        }
      ]
    }
  },
  {
    path: "/whyownfresh",
    title: "Why OwnFresh | Traditional Granite Extraction & Certified Purity",
    description: "Learn how OwnFresh extracts unheated edible cooking oils in Pune, Maharashtra. ACoHI certified, lab-tested seed purity, and traditional cold pressing heritage.",
    canonical: `${BASE_URL}/whyownfresh`,
    h1: "Why Choose OwnFresh Authentic Stone Pressed Oils",
    intro: "Learn our 5-pillar commitment to edible oil purity: zero chemicals, granite stone extraction under 45°C, single-origin seeds, third-party lab testing, and eco-packaging.",
    type: "website",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Why OwnFresh", "item": `${BASE_URL}/whyownfresh` }
          ]
        }
      ]
    }
  },
  {
    path: "/contact",
    title: "Contact OwnFresh | Pune Facility, Customer Support & Wholesale",
    description: "Get in touch with OwnFresh (OWNFRESH AGRO INDUSTRIES), Dhayari, Pune. Phone: +91-8999773438. Direct customer support, bulk orders & facility inquiries.",
    canonical: `${BASE_URL}/contact`,
    h1: "Contact OwnFresh Agro Industries",
    intro: "Visit our Pune processing facility or contact our dedicated customer care team for orders, queries, or distributor partnerships.",
    type: "website",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Contact", "item": `${BASE_URL}/contact` }
          ]
        }
      ]
    }
  },
  {
    path: "/oilinsights",
    title: "Oil Insights | Edible Oil Health Science & Cooking Guides | OwnFresh",
    description: "Evidence-based guides on cooking oils, smoke points, cholesterol, traditional ghani processing, and natural cold pressed nutrition from OwnFresh experts.",
    canonical: `${BASE_URL}/oilinsights`,
    h1: "Oil Insights & Edible Oil Health Science",
    intro: "Deep dive into culinary oil science, smoke points, fatty acid profiles, and evidence-backed health research written by traditional oil experts.",
    type: "website",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Oil Insights", "item": `${BASE_URL}/oilinsights` }
          ]
        }
      ]
    }
  },
  {
    path: "/gallery",
    title: "Production Facility Gallery | Stone Pressed Extraction | OwnFresh",
    description: "Take a visual tour inside our Pune stone-pressed oil facility. See our granite stone mills, seed cleaning process, and hygienic packaging.",
    canonical: `${BASE_URL}/gallery`,
    h1: "OwnFresh Production Facility & Extraction Gallery",
    intro: "Step inside our state-of-the-art traditional granite stone pressing plant in Pune, Maharashtra.",
    type: "website"
  },
  {
    path: "/membership",
    title: "OwnFresh Family Membership | Exclusive Oil Subscriptions & Savings",
    description: "Join the OwnFresh membership club for monthly cold pressed oil deliveries, exclusive discounts, free shipping, and seasonal cold pressed blends.",
    canonical: `${BASE_URL}/membership`,
    h1: "OwnFresh Family Membership Club",
    intro: "Fresh stone pressed oils delivered straight to your home every month on autopilot with subscriber-only benefits.",
    type: "website"
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy | OwnFresh",
    description: "Privacy policy for OwnFresh website users and customers. Learn how we safeguard your personal information and transaction details.",
    canonical: `${BASE_URL}/privacy-policy`,
    h1: "OwnFresh Privacy Policy",
    intro: "Your privacy is important to us. Learn how we protect, store, and process your personal and transaction data.",
    type: "website"
  },
  {
    path: "/terms-and-conditions",
    title: "Terms and Conditions | OwnFresh",
    description: "Terms and conditions of service, sales, and deliveries for OwnFresh Agro Industries.",
    canonical: `${BASE_URL}/terms-and-conditions`,
    h1: "OwnFresh Terms & Conditions",
    intro: "Review our standard terms of use, ordering policies, and delivery agreements.",
    type: "website"
  },
  {
    path: "/refund-policy",
    title: "Refund & Cancellation Policy | OwnFresh",
    description: "Read our transparent refund, cancellation, and return policy for online oil orders.",
    canonical: `${BASE_URL}/refund-policy`,
    h1: "OwnFresh Refund & Return Policy",
    intro: "We stand behind the 100% purity of our oils. Learn about our simple, customer-friendly return and refund process.",
    type: "website"
  },
  {
    path: "/shipping-policy",
    title: "Shipping & Delivery Policy | OwnFresh",
    description: "Delivery times, shipping partners, free shipping thresholds, and tracking policies across India.",
    canonical: `${BASE_URL}/shipping-policy`,
    h1: "OwnFresh Shipping & Delivery Policy",
    intro: "Fast, secure dispatch directly from our Pune plant to households all across India.",
    type: "website"
  }
];

function transformHtml(baseHtml, page) {
  let html = baseHtml;

  // 1. Replace Title
  const safeTitle = escapeHtml(page.title);
  if (html.includes("<title>")) {
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`);
  } else {
    html = html.replace("</head>", `  <title>${safeTitle}</title>\n</head>`);
  }

  // 2. Replace or Insert Meta Description
  const safeDesc = escapeHtml(page.description);
  if (html.includes('<meta name="description"')) {
    html = html.replace(
      /<meta\s+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${safeDesc}" />`
    );
  } else {
    html = html.replace("</head>", `  <meta name="description" content="${safeDesc}" />\n</head>`);
  }

  // 3. Ensure Exact Canonical Tag
  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${page.canonical}" />`
    );
  } else {
    html = html.replace("</head>", `  <link rel="canonical" href="${page.canonical}" />\n</head>`);
  }

  // 4. Update Open Graph Tags
  if (html.includes('property="og:title"')) {
    html = html.replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${safeTitle}" />`);
  }
  if (html.includes('property="og:description"')) {
    html = html.replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${safeDesc}" />`);
  }
  if (html.includes('property="og:url"')) {
    html = html.replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${page.canonical}" />`);
  }
  if (page.image && html.includes('property="og:image"')) {
    html = html.replace(/<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${page.image}" />`);
  }
  if (page.type && html.includes('property="og:type"')) {
    html = html.replace(/<meta\s+property=["']og:type["'][^>]*>/i, `<meta property="og:type" content="${page.type}" />`);
  }

  // 5. Inject Structured Data (JSON-LD)
  if (page.schema) {
    const jsonLdString = JSON.stringify(page.schema, null, 2);
    const schemaTag = `<script type="application/ld+json">\n${jsonLdString}\n  </script>`;
    if (html.includes('<script type="application/ld+json">')) {
      html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, schemaTag);
    } else {
      html = html.replace("</head>", `  ${schemaTag}\n</head>`);
    }
  }

  // 6. Build Rich Semantic Prerendered HTML Content
  const semanticContent = page.customRootHtml || `
    <div style="font-family: 'Poppins', sans-serif; max-width: 1200px; margin: 0 auto; padding: 24px; color: #1e293b;">
      <header style="margin-bottom: 24px;">
        <nav style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 13px; color: #64748b; margin-bottom: 16px;">
          <a href="/" style="color: #166534; text-decoration: none;">Home</a> &gt;
          <a href="/shop" style="color: #166534; text-decoration: none;">Shop</a>
          ${page.breadcrumbsLabel ? ` &gt; <span style="color: #0f172a; font-weight: 600;">${escapeHtml(page.breadcrumbsLabel)}</span>` : ""}
        </nav>
        <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.25;">
          ${escapeHtml(page.h1 || page.title)}
        </h1>
        <p style="font-size: 16px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
          ${escapeHtml(page.intro || page.description)}
        </p>
      </header>
      <main>
        ${page.bodyHtml || ""}
      </main>
      <footer style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
        <p>OwnFresh Agro Industries — Traditional Granite Stone Pressed Cooking Oils, Pune, Maharashtra.</p>
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px;">
          <a href="/shop" style="color: #166534; text-decoration: none;">Shop All Oils</a> •
          <a href="/groundnut-oil" style="color: #166534; text-decoration: none;">Groundnut Oil</a> •
          <a href="/mustard-oil" style="color: #166534; text-decoration: none;">Mustard Oil</a> •
          <a href="/sesame-oil" style="color: #166534; text-decoration: none;">Sesame Oil</a> •
          <a href="/coconut-oil" style="color: #166534; text-decoration: none;">Coconut Oil</a> •
          <a href="/safflower-oil" style="color: #166534; text-decoration: none;">Safflower Oil</a> •
          <a href="/sunflower-oil" style="color: #166534; text-decoration: none;">Sunflower Oil</a> •
          <a href="/oilinsights" style="color: #166534; text-decoration: none;">Oil Insights</a>
        </div>
      </footer>
    </div>
  `;

  // 7. Inject Semantic Content inside <div id="root">
  const rootIndex = html.indexOf('<div id="root">');
  const bodyCloseIndex = html.lastIndexOf('</body>');
  if (rootIndex !== -1 && bodyCloseIndex !== -1) {
    html = html.slice(0, rootIndex) + `<div id="root">\n${semanticContent}\n  </div>\n` + html.slice(bodyCloseIndex);
  }

  return html;
}

async function runPrerender() {
  console.log("=================================================");
  console.log("🚀 STARTING PRODUCTION STATIC PRERENDER ENGINE");
  console.log("=================================================\n");

  if (!fs.existsSync(baseIndexPath)) {
    console.error("❌ Base dist/index.html not found! Run 'vite build' first.");
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(baseIndexPath, "utf-8");
  let totalGenerated = 0;

  // 1. Generate Static Core & Category Pages
  console.log("📦 1. Prerendering Static Core & Category Pages...");
  for (const page of STATIC_PAGES) {
    const html = transformHtml(baseHtml, page);
    if (page.path === "/") {
      fs.writeFileSync(baseIndexPath, html, "utf-8");
      console.log(`  ✅ Generated: / -> dist/index.html`);
    } else {
      const cleanPath = page.path.replace(/^\//, "");
      const pageDir = path.join(distDir, cleanPath);
      fs.mkdirSync(pageDir, { recursive: true });
      // Write both folder index.html and direct .html for universal server compatibility
      fs.writeFileSync(path.join(pageDir, "index.html"), html, "utf-8");
      fs.writeFileSync(path.join(distDir, `${cleanPath}.html`), html, "utf-8");
      console.log(`  ✅ Generated: ${page.path} -> dist/${cleanPath}/index.html & dist/${cleanPath}.html`);
    }
    totalGenerated++;
  }

  // 2. Fetch and Prerender Dynamic Blog Articles
  console.log("\n📰 2. Fetching & Prerendering Blog Articles from API...");
  let blogs = [];
  try {
    const blogRes = await fetch(`${API_URL}/api/blog/all?limit=200`, { signal: AbortSignal.timeout(6000) });
    if (blogRes.ok) {
      const blogData = await blogRes.json();
      blogs = blogData.blogs || [];
      if (blogs.length > 0) {
        fs.writeFileSync(path.join(__dirname, "blogs_cache.json"), JSON.stringify(blogs, null, 2), "utf-8");
        console.log(`  Found and cached ${blogs.length} published blog articles from API.`);
      }
    } else {
      console.warn("  ⚠️ Blog API returned status:", blogRes.status);
    }
  } catch (err) {
    console.warn("  ⚠️ Could not fetch blogs from API:", err.message);
  }

  if (blogs.length === 0) {
    const cachePath = path.join(__dirname, "blogs_cache.json");
    if (fs.existsSync(cachePath)) {
      blogs = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      console.log(`  📦 Loaded ${blogs.length} published blog articles from bundled cache.`);
    }
  }

  if (blogs.length > 0) {
    for (const b of blogs) {
      const slug = b.slug || b._id;
      if (!slug) continue;

      const cleanDesc = stripHtml(b.searchDescription || b.description || b.title).slice(0, 160);
      const cleanTitle = `${b.title} | OwnFresh Insights`;
      const canonicalUrl = `${BASE_URL}/blog/${slug}`;
      const pubDate = b.publishedAt || b.createdAt || "2026-09-01T00:00:00+05:30";
      const modDate = b.updatedAt || pubDate;
      const formattedDate = new Date(pubDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
      const updatedFormatted = new Date(modDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
      const authorName = b.author || "OwnFresh Editorial & Health Research Team";
      const wordCount = stripHtml(b.description || "").split(/\s+/).filter(Boolean).length;
      const readTime = Math.max(2, Math.ceil(wordCount / 200)) + " min read";

      // Pick 3 other published blogs for relevant internal linking
      const relatedBlogs = blogs.filter(other => (other.slug || other._id) !== slug).slice(0, 3);
      const relatedBlogsHtml = relatedBlogs.map(rb => `
        <li style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
          <a href="/blog/${rb.slug || rb._id}" style="color: #166534; font-weight: 700; text-decoration: none; font-size: 16px; display: block; margin-bottom: 4px;">
            ${escapeHtml(rb.title)}
          </a>
          <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
            ${escapeHtml(stripHtml(rb.searchDescription || rb.description || "").slice(0, 120))}...
          </p>
        </li>
      `).join("");

      const blogArticleHtml = `
        <div style="font-family: 'Poppins', sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; color: #1e293b;">
          <header style="margin-bottom: 32px; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px;">
            <nav style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 13px; color: #64748b; margin-bottom: 16px;">
              <a href="/" style="color: #166534; text-decoration: none; font-weight: 500;">Home</a> &gt;
              <a href="/oilinsights" style="color: #166534; text-decoration: none; font-weight: 500;">Oil Insights</a> &gt;
              <span style="color: #0f172a; font-weight: 600;">${escapeHtml(b.title)}</span>
            </nav>
            <h1 style="font-size: 34px; font-weight: 800; color: #0f172a; line-height: 1.3; margin: 0 0 16px 0;">
              ${escapeHtml(b.title)}
            </h1>
            <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 14px; color: #64748b; align-items: center;">
              <span>By <strong>${escapeHtml(authorName)}</strong></span>
              <span>•</span>
              <span>Published: <time datetime="${pubDate}">${formattedDate}</time></span>
              ${b.updatedAt ? `<span>•</span><span>Updated: <time datetime="${modDate}">${updatedFormatted}</time></span>` : ""}
              <span>•</span>
              <span>${readTime}</span>
            </div>
          </header>

          ${b.image ? `
          <div style="margin-bottom: 32px;">
            <img src="${b.image}" alt="${escapeHtml(b.title)} - OwnFresh Stone Pressed Cooking Oils" style="width: 100%; max-height: 500px; object-fit: cover; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);" />
          </div>` : ""}

          <main class="article-body" style="font-size: 16px; line-height: 1.85; color: #334155;">
            ${b.description || `<p>${escapeHtml(cleanDesc)}</p>`}
          </main>

          <!-- Relevant Internal Product & Category Links -->
          <section style="margin-top: 48px; padding: 28px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">
              Experience Authentic Stone Pressed Oils by OwnFresh
            </h3>
            <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
              OwnFresh oils are cold-churned slowly in natural granite stones below 45°C. Unrefined, unbleached, and 100% free of chemical solvents, mineral oils, and preservatives.
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 13px;">
              <a href="/groundnut-oil" style="background: #ffffff; color: #166534; padding: 8px 16px; border: 1px solid #cbd5e1; border-radius: 8px; text-decoration: none; font-weight: 600;">Groundnut Oil</a>
              <a href="/mustard-oil" style="background: #ffffff; color: #166534; padding: 8px 16px; border: 1px solid #cbd5e1; border-radius: 8px; text-decoration: none; font-weight: 600;">Mustard Oil</a>
              <a href="/sesame-oil" style="background: #ffffff; color: #166534; padding: 8px 16px; border: 1px solid #cbd5e1; border-radius: 8px; text-decoration: none; font-weight: 600;">Sesame Oil</a>
              <a href="/coconut-oil" style="background: #ffffff; color: #166534; padding: 8px 16px; border: 1px solid #cbd5e1; border-radius: 8px; text-decoration: none; font-weight: 600;">Coconut Oil</a>
              <a href="/safflower-oil" style="background: #ffffff; color: #166534; padding: 8px 16px; border: 1px solid #cbd5e1; border-radius: 8px; text-decoration: none; font-weight: 600;">Safflower Oil</a>
              <a href="/sunflower-oil" style="background: #ffffff; color: #166534; padding: 8px 16px; border: 1px solid #cbd5e1; border-radius: 8px; text-decoration: none; font-weight: 600;">Sunflower Oil</a>
              <a href="/shop" style="background: #166534; color: #ffffff; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: 600;">Shop All Oils</a>
            </div>
          </section>

          <!-- Related Health Insights & Articles -->
          ${relatedBlogs.length > 0 ? `
          <section style="margin-top: 36px; padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 20px 0;">
              Related Health Insights & Culinary Guides
            </h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${relatedBlogsHtml}
            </ul>
          </section>` : ""}

          <footer style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center;">
            <p>OwnFresh Agro Industries — Traditional Granite Stone Pressed Cooking Oils, Pune, Maharashtra.</p>
          </footer>
        </div>
      `;

      const articleSchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
              { "@type": "ListItem", "position": 2, "name": "Oil Insights", "item": `${BASE_URL}/oilinsights` },
              { "@type": "ListItem", "position": 3, "name": b.title, "item": canonicalUrl }
            ]
          },
          {
            "@type": "BlogPosting",
            "@id": `${canonicalUrl}#article`,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": canonicalUrl
            },
            "headline": b.title,
            "description": cleanDesc,
            "image": b.image ? [b.image] : [],
            "datePublished": pubDate,
            "dateModified": modDate,
            "author": {
              "@type": "Person",
              "name": authorName
            },
            "publisher": { "@id": `${BASE_URL}/#organization` },
            "inLanguage": "en-IN"
          }
        ]
      };

      const pageObj = {
        path: `/blog/${slug}`,
        title: cleanTitle,
        description: cleanDesc,
        canonical: canonicalUrl,
        h1: b.title,
        intro: `Written by ${authorName} • Stone Pressed Cooking Oil Health Insights`,
        breadcrumbsLabel: b.title,
        type: "article",
        image: b.image || undefined,
        schema: articleSchema,
        customRootHtml: blogArticleHtml
      };

      const transformedHtml = transformHtml(baseHtml, pageObj);

      // Write folder/index.html AND direct .html
      const blogDir = path.join(distDir, "blog", slug);
      fs.mkdirSync(blogDir, { recursive: true });
      fs.writeFileSync(path.join(blogDir, "index.html"), transformedHtml, "utf-8");
      fs.writeFileSync(path.join(distDir, "blog", `${slug}.html`), transformedHtml, "utf-8");
      totalGenerated++;
    }
    console.log(`  ✅ Successfully prerendered ${blogs.length} blog pages (dual folder & .html).`);
  }

  // 3. Fetch and Prerender Dynamic Products
  console.log("\n🧴 3. Fetching & Prerendering Products from API...");
  let products = [];
  try {
    const prodRes = await fetch(`${API_URL}/api/product/all?limit=200`, { signal: AbortSignal.timeout(6000) });
    if (prodRes.ok) {
      const prodData = await prodRes.json();
      products = prodData.products || [];
      if (products.length > 0) {
        fs.writeFileSync(path.join(__dirname, "products_cache.json"), JSON.stringify(products, null, 2), "utf-8");
        console.log(`  Found and cached ${products.length} products from API.`);
      }
    } else {
      console.warn("  ⚠️ Product API returned status:", prodRes.status);
    }
  } catch (err) {
    console.warn("  ⚠️ Could not fetch products from API:", err.message);
  }

  if (products.length === 0) {
    const cachePath = path.join(__dirname, "products_cache.json");
    if (fs.existsSync(cachePath)) {
      products = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      console.log(`  📦 Loaded ${products.length} products from bundled cache.`);
    }
  }

  if (products.length > 0) {
    for (const p of products) {
      const slug = p.slug || p._id;
      if (!slug) continue;

      const cleanDesc = stripHtml(p.shortDesc || p.description || p.name).slice(0, 160);
      const cleanTitle = `${p.name} | Granite Churned | OwnFresh`;
      const canonicalUrl = `${BASE_URL}/product/${slug}`;
      const price = p.price || (p.variants && p.variants[0] && p.variants[0].price) || 565;

      const productSchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
              { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${BASE_URL}/shop` },
              { "@type": "ListItem", "position": 3, "name": p.name, "item": canonicalUrl }
            ]
          },
          {
            "@type": "Product",
            "@id": `${canonicalUrl}#product`,
            "name": p.name,
            "image": [p.image],
            "description": cleanDesc,
            "sku": p.sku || `OF-${String(slug).slice(0, 8).toUpperCase()}`,
            "brand": { "@type": "Brand", "name": "OwnFresh" },
            "offers": {
              "@type": "Offer",
              "url": canonicalUrl,
              "priceCurrency": "INR",
              "price": price,
              "itemCondition": "https://schema.org/NewCondition",
              "availability": "https://schema.org/InStock",
              "seller": { "@type": "Organization", "name": "OwnFresh" }
            }
          }
        ]
      };

      const pageObj = {
        path: `/product/${slug}`,
        title: cleanTitle,
        description: cleanDesc,
        canonical: canonicalUrl,
        h1: p.name,
        intro: cleanDesc,
        breadcrumbsLabel: p.name,
        type: "product",
        image: p.image || undefined,
        schema: productSchema,
        bodyHtml: `
          <div style="display: flex; flex-wrap: wrap; gap: 32px; margin-top: 24px;">
            ${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}" style="max-width: 400px; width: 100%; border-radius: 16px; object-fit: cover;" />` : ""}
            <div style="flex: 1; min-width: 280px;">
              <p style="font-size: 24px; font-weight: 800; color: #166534; margin: 0 0 16px 0;">₹${price}</p>
              <p style="font-size: 15px; color: #475569; line-height: 1.6;">${escapeHtml(p.shortDesc || "")}</p>
              <div style="margin-top: 24px;">
                <a href="/shop" style="display: inline-block; background: #166534; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700;">Order on OwnFresh</a>
              </div>
            </div>
          </div>
        `
      };

      const transformedHtml = transformHtml(baseHtml, pageObj);

      // Write folder/index.html AND direct .html
      const prodDir = path.join(distDir, "product", slug);
      fs.mkdirSync(prodDir, { recursive: true });
      fs.writeFileSync(path.join(prodDir, "index.html"), transformedHtml, "utf-8");
      fs.writeFileSync(path.join(distDir, "product", `${slug}.html`), transformedHtml, "utf-8");
      totalGenerated++;
    }
    console.log(`  ✅ Successfully prerendered ${products.length} product pages.`);
  }

  // 4. Generate Branded 404 Page (dist/404.html)
  console.log("\n🚫 4. Generating Branded 404 HTML Page...");
  const notFoundHtml = `<!doctype html>
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
    .btn-secondary { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
    .categories { margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 13px; color: #475569; }
    .categories a { color: #166534; text-decoration: none; font-weight: 600; margin: 0 6px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>404</h1>
    <h2>Looking for Pure Stone Pressed Oils?</h2>
    <p>We could not find the page you requested. It may have been moved, renamed, or does not exist.</p>
    <div class="links">
      <a href="/" class="btn btn-primary">Return to Homepage</a>
      <a href="/shop" class="btn btn-secondary">Shop All Cooking Oils</a>
      <a href="/contact" class="btn btn-secondary">Contact Pune Facility</a>
    </div>
    <div class="categories">
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

  fs.writeFileSync(path.join(distDir, "404.html"), notFoundHtml, "utf-8");
  console.log("  ✅ Generated: dist/404.html");

  // 5. Generate Dynamic Authoritative Sitemap XML
  console.log("\n🗺️ 5. Generating Dynamic Authoritative XML Sitemap...");
  const sitemapUrls = [];

  // Static Pages
  for (const page of STATIC_PAGES) {
    const loc = page.path === "/" ? `${BASE_URL}/` : `${BASE_URL}${page.path}`;
    const priority = page.path === "/" ? "1.0" : (page.type === "collection" ? "0.9" : "0.8");
    const changefreq = page.path === "/" ? "daily" : "weekly";
    sitemapUrls.push(`  <url>\n    <loc>${loc}</loc>\n    <lastmod>2026-10-06</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`);
  }

  // Published Blogs (All verified live blogs)
  for (const b of blogs) {
    const slug = b.slug || b._id;
    if (!slug) continue;
    const lastmod = (b.updatedAt || b.publishedAt || b.createdAt || "2026-10-06").slice(0, 10);
    sitemapUrls.push(`  <url>\n    <loc>${BASE_URL}/blog/${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>`);
  }

  // Published Products
  for (const p of products) {
    const slug = p.slug || p._id;
    if (!slug) continue;
    const lastmod = (p.updatedAt || p.createdAt || "2026-10-06").slice(0, 10);
    sitemapUrls.push(`  <url>\n    <loc>${BASE_URL}/product/${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.95</priority>\n  </url>`);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemapXml, "utf-8");
  fs.writeFileSync(path.join(__dirname, "../public/sitemap.xml"), sitemapXml, "utf-8");
  const rootDist = path.join(__dirname, "../../dist");
  try {
    fs.cpSync(distDir, rootDist, { recursive: true });
    console.log(`  ✅ Synced all files to root dist: ${rootDist}`);
  } catch (e) {
    // ignore
  }

  console.log("\n=================================================");
  console.log(`🎉 PRERENDER COMPLETE! Generated ${totalGenerated} Static HTML Pages + Dynamic Sitemap`);
  console.log("=================================================\n");
}

runPrerender();
