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

// 1. Serve robots.txt and sitemap.xml directly from dist or public
app.get("/robots.txt", (req, res) => {
  const robotsPath = path.join(distDir, "robots.txt");
  if (fs.existsSync(robotsPath)) return res.type("text/plain").sendFile(robotsPath);
  res.type("text/plain").send("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /cart\nDisallow: /checkout\nSitemap: https://myownfresh.com/sitemap.xml\n");
});

app.get("/sitemap.xml", async (req, res) => {
  try {
    const apiRes = await fetch(`${API_URL}/sitemap.xml`);
    if (apiRes.ok) {
      const xml = await apiRes.text();
      res.type("application/xml").send(xml);
      return;
    }
  } catch (err) {
    // If backend is unreachable, fallback to static dist/sitemap.xml
  }

  const sitemapPath = path.join(distDir, "sitemap.xml");
  if (fs.existsSync(sitemapPath)) return res.type("application/xml").sendFile(sitemapPath);
  res.status(404).send("Sitemap not found");
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
            const canonicalUrl = `https://myownfresh.com/blog/${blog.slug || blog._id}`;

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
            const canonicalUrl = `https://myownfresh.com/product/${product.slug || product._id}`;

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
