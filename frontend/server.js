import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const distDir = path.join(__dirname, "dist");
const defaultIndex = path.join(distDir, "index.html");
const notFoundHtml = path.join(distDir, "404.html");

const API_URL = (process.env.VITE_API_URL || process.env.API_URL || "https://api.myownfresh.com").replace(/\/+$/, "");

// In-Memory Stale-While-Revalidate Sitemap Cache
let sitemapCache = {
  xml: null,
  timestamp: 0,
  isFetching: false,
  lastFailureTime: 0
};

// Seed sitemap cache from disk if available
try {
  const seedPath = path.join(distDir, "sitemap.xml");
  const fallbackPath = path.join(__dirname, "public", "sitemap.xml");
  const pathToRead = fs.existsSync(seedPath) ? seedPath : (fs.existsSync(fallbackPath) ? fallbackPath : null);
  if (pathToRead) {
    const diskContent = fs.readFileSync(pathToRead, "utf-8");
    if (diskContent && diskContent.includes("<urlset") && diskContent.includes("</urlset>")) {
      sitemapCache.xml = diskContent;
      sitemapCache.timestamp = Date.now();
    }
  }
} catch (e) {
  console.warn("Sitemap seed note:", e.message);
}

// Background refresher for sitemap
async function refreshSitemapInBackground() {
  if (sitemapCache.isFetching) return;
  // If recent fetch failed within the last 60 seconds, do not hammer backend
  if (Date.now() - sitemapCache.lastFailureTime < 60000) return;

  sitemapCache.isFetching = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const apiRes = await fetch(`${API_URL}/sitemap.xml`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (apiRes.ok) {
      const xml = await apiRes.text();
      // Ensure XML is non-empty, contains opening and closing urlset tags
      if (xml && xml.includes("<urlset") && xml.includes("</urlset>")) {
        sitemapCache.xml = xml;
        sitemapCache.timestamp = Date.now();
        sitemapCache.lastFailureTime = 0;
        // Persist to dist/sitemap.xml for future process restarts
        try {
          if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
          fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml, "utf-8");
        } catch (err) {}
      } else {
        sitemapCache.lastFailureTime = Date.now();
      }
    } else {
      sitemapCache.lastFailureTime = Date.now();
    }
  } catch (err) {
    sitemapCache.lastFailureTime = Date.now();
    // Keep serving existing cache without disruption
  } finally {
    sitemapCache.isFetching = false;
  }
}

// 1. Serve robots.txt directly from dist or public
app.get(["/robots.txt", "//robots.txt"], (req, res) => {
  const robotsPath = path.join(distDir, "robots.txt");
  if (fs.existsSync(robotsPath)) return res.type("text/plain").sendFile(robotsPath);
  res.type("text/plain").send("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /cart\nDisallow: /checkout\nSitemap: https://www.myownfresh.com/sitemap.xml\n");
});

// Sitemap on-demand cache bust endpoint (can be triggered by Hermes or admin)
app.all(["/api/sitemap/refresh", "/sitemap/refresh"], async (req, res) => {
  await refreshSitemapInBackground();
  res.json({ success: true, timestamp: sitemapCache.timestamp, cached: !!sitemapCache.xml });
});

// High-speed Stale-While-Revalidate XML sitemap router (Sub-5ms Googlebot response)
app.get(["/sitemap.xml", "//sitemap.xml"], async (req, res) => {
  // If cache is older than 5 minutes, trigger background refresh
  const isStale = (Date.now() - sitemapCache.timestamp) > 5 * 60 * 1000;
  if (isStale) {
    refreshSitemapInBackground();
  }

  // If we have cached XML, deliver instantly (guarantees Googlebot never times out)
  if (sitemapCache.xml) {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=1800, s-maxage=3600");
    return res.status(200).send(sitemapCache.xml);
  }

  // Cold start first-request fallback: try fetching directly up to 8s
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const apiRes = await fetch(`${API_URL}/sitemap.xml`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (apiRes.ok) {
      const xml = await apiRes.text();
      sitemapCache.xml = xml;
      sitemapCache.timestamp = Date.now();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      return res.status(200).send(xml);
    }
  } catch (err) {}

  const sitemapDistPath = path.join(distDir, "sitemap.xml");
  const sitemapPublicPath = path.join(__dirname, "public", "sitemap.xml");
  const pathToServe = fs.existsSync(sitemapDistPath) ? sitemapDistPath : (fs.existsSync(sitemapPublicPath) ? sitemapPublicPath : null);
  if (pathToServe) {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.status(200).sendFile(pathToServe);
  }
  res.status(404).send("Sitemap not found");
});

// 1b. Serve Official Brochure with correct inline headers
app.get(["/OwnFresh-Official-Brochure.pdf", "/ownfresh_product_brochure.pdf", "/brochure"], (req, res) => {
  const brochureDist = path.join(distDir, "OwnFresh-Official-Brochure.pdf");
  const brochurePublic = path.join(__dirname, "public", "OwnFresh-Official-Brochure.pdf");
  const targetPath = fs.existsSync(brochureDist) ? brochureDist : brochurePublic;
  if (fs.existsSync(targetPath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="OwnFresh-Official-Brochure.pdf"');
    return res.sendFile(targetPath);
  }
  res.status(404).send("Brochure not found");
});

// 2. Trailing slash normalization (301 Permanent Redirect)
app.use((req, res, next) => {
  const rawPath = req.path;
  if (rawPath.length > 1 && rawPath.endsWith("/")) {
    const cleanPath = rawPath.replace(/\/+$/, "");
    const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    return res.redirect(301, cleanPath + query);
  }
  next();
});

// 3. Legacy duplicate category redirects (301 Permanent Redirect)
app.get(["/category/:slug", "/product-category/:slug"], (req, res) => {
  return res.redirect(301, `/${req.params.slug}`);
});

app.get(["/blog", "/blogs"], (req, res) => {
  return res.redirect(301, "/oilinsights");
});

// Redirect root-level blog slugs to /blog/:slug if blog exists
app.get("/:slug", async (req, res, next) => {
  const slug = req.params.slug;
  const blogDir = path.join(distDir, "blog", slug, "index.html");
  if (fs.existsSync(blogDir)) {
    return res.redirect(301, `/blog/${slug}`);
  }
  
  // If slug contains hyphens (typical blog post URL), check API dynamically
  if (slug && slug.includes("-") && !slug.includes(".")) {
    try {
      const apiRes = await fetch(`${API_URL}/api/blog/${encodeURIComponent(slug)}`);
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data?.blog) {
          return res.redirect(301, `/blog/${slug}`);
        }
      }
    } catch (e) {
      // Continue to next handler if API is unreachable
    }
  }
  next();
});

// 4. Serve static assets (JS, CSS, images, etc.) with caching
app.use(express.static(distDir, {
  index: false,
  redirect: false,
  maxAge: "1d"
}));

// 5. Clean URL router serving prerendered HTML or on-demand dynamic rendering (ISR)
app.use(async (req, res) => {
  const cleanPath = decodeURIComponent(req.path).replace(/^\/+|\/+$/g, "");

  // Root Homepage
  if (!cleanPath) {
    return res.sendFile(defaultIndex);
  }

  // A. Check if a dedicated prerendered directory exists: dist/<cleanPath>/index.html
  const pageIndexFile = path.join(distDir, cleanPath, "index.html");
  if (fs.existsSync(pageIndexFile)) {
    return res.sendFile(pageIndexFile);
  }

  // B. Check if a direct HTML file exists: dist/<cleanPath>.html
  const pageDirectFile = path.join(distDir, `${cleanPath}.html`);
  if (fs.existsSync(pageDirectFile)) {
    return res.sendFile(pageDirectFile);
  }

  // C. Dynamic Blog Route Resolution (/blog/:slugOrId)
  if (cleanPath.startsWith("blog/")) {
    const slug = cleanPath.replace(/^blog\//, "").trim();

    try {
      // Query backend API to verify the blog exists and get dynamic metadata
      const apiRes = await fetch(`${API_URL}/api/blog/${encodeURIComponent(slug)}`);
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data && data.blog) {
          const blog = data.blog;

          // Inject blog metadata into default index.html for instant SEO & social preview
          if (fs.existsSync(defaultIndex)) {
            let html = fs.readFileSync(defaultIndex, "utf-8");
            const blogTitle = `${blog.title} | OwnFresh Insights`;
            const cleanDesc = (blog.searchDescription || blog.excerpt || blog.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
            const canonicalUrl = `https://www.myownfresh.com/blog/${blog.slug || blog._id}`;

            html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${blogTitle}</title>`);
            html = html.replace(/<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="description" content="${cleanDesc}" />`);
            if (html.includes('rel="canonical"')) {
              html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
            } else {
              html = html.replace("</head>", `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
            }

            // On-demand cache (ISR): write to disk for instantaneous future requests
            const targetDir = path.join(distDir, "blog", slug);
            try {
              if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
              fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf-8");
            } catch (cacheErr) {
              // Ignore cache write error
            }

            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.status(200).send(html);
          }
          return res.sendFile(defaultIndex);
        }
      }
    } catch (err) {
      console.warn("Dynamic blog resolution fallback:", err.message);
      // Fallback: serve defaultIndex so client-side React Router loads it
      return res.sendFile(defaultIndex);
    }

    // Genuinely not found in API -> True HTTP 404
    res.status(404);
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    if (fs.existsSync(notFoundHtml)) {
      return res.sendFile(notFoundHtml);
    }
    return res.send("404 Page Not Found");
  }

  // D. Dynamic Product Route Resolution (/product/:slugOrId)
  if (cleanPath.startsWith("product/")) {
    const slug = cleanPath.replace(/^product\//, "").trim();

    try {
      const apiRes = await fetch(`${API_URL}/api/product/${encodeURIComponent(slug)}`);
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data && data.product) {
          const product = data.product;

          if (fs.existsSync(defaultIndex)) {
            let html = fs.readFileSync(defaultIndex, "utf-8");
            const prodTitle = `${product.name} | Granite Churned | OwnFresh`;
            const cleanDesc = (product.shortDesc || product.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
            const canonicalUrl = `https://www.myownfresh.com/product/${product.slug || product._id}`;

            html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${prodTitle}</title>`);
            html = html.replace(/<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="description" content="${cleanDesc}" />`);

            const targetDir = path.join(distDir, "product", slug);
            try {
              if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
              fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf-8");
            } catch (cacheErr) {}

            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.status(200).send(html);
          }
          return res.sendFile(defaultIndex);
        }
      }
    } catch (err) {
      return res.sendFile(defaultIndex);
    }

    res.status(404);
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    if (fs.existsSync(notFoundHtml)) return res.sendFile(notFoundHtml);
    return res.send("404 Page Not Found");
  }

  // E. Private client routes that should fall back to SPA with noindex
  const privateRoutes = ["cart", "checkout", "admin", "my-orders", "order-details", "signin", "signup", "forgot-password", "referral"];
  if (privateRoutes.some(p => cleanPath === p || cleanPath.startsWith(`${p}/`))) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    return res.sendFile(defaultIndex);
  }

  // F. Known SPA routes fallback (Shop, Oils, etc.)
  const knownClientRoutes = ["shop", "oilinsights", "whyownfresh", "contact", "gallery", "membership", "privacy-policy", "terms-and-conditions", "refund-policy", "shipping-policy"];
  if (knownClientRoutes.includes(cleanPath)) {
    return res.sendFile(defaultIndex);
  }

  // Non-existent page -> Return TRUE HTTP 404 (No Soft 404)
  res.status(404);
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  if (fs.existsSync(notFoundHtml)) {
    return res.sendFile(notFoundHtml);
  }
  return res.send("404 Page Not Found");
});

app.listen(port, () => {
  console.log(`🚀 OwnFresh Frontend Production Server running on port ${port}`);
});
