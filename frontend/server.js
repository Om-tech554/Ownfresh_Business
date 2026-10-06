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

// 1. Serve robots.txt and sitemap.xml directly from dist or public
app.get("/robots.txt", (req, res) => {
  const robotsPath = path.join(distDir, "robots.txt");
  if (fs.existsSync(robotsPath)) return res.type("text/plain").sendFile(robotsPath);
  res.type("text/plain").send("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /cart\nDisallow: /checkout\nSitemap: https://myownfresh.com/sitemap.xml\n");
});

app.get("/sitemap.xml", (req, res) => {
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
app.get("/:slug", (req, res, next) => {
  const slug = req.params.slug;
  const blogDir = path.join(distDir, "blog", slug, "index.html");
  if (fs.existsSync(blogDir)) {
    return res.redirect(301, `/blog/${slug}`);
  }
  next();
});

// 4. Serve static assets (JS, CSS, images, etc.) with caching
app.use(express.static(distDir, {
  index: false,
  redirect: false,
  maxAge: "1d"
}));

// 5. Clean URL router serving physically prerendered HTML files
app.use((req, res) => {
  const cleanPath = req.path.replace(/^\/+|\/+$/g, "");

  // Root Homepage
  if (!cleanPath) {
    return res.sendFile(defaultIndex);
  }

  // Check if a dedicated prerendered directory exists: dist/<cleanPath>/index.html
  const pageIndexFile = path.join(distDir, cleanPath, "index.html");
  if (fs.existsSync(pageIndexFile)) {
    return res.sendFile(pageIndexFile);
  }

  // Check if a direct HTML file exists: dist/<cleanPath>.html
  const pageDirectFile = path.join(distDir, `${cleanPath}.html`);
  if (fs.existsSync(pageDirectFile)) {
    return res.sendFile(pageDirectFile);
  }

  // Private client routes that should fall back to SPA with noindex
  const privateRoutes = ["cart", "checkout", "admin", "my-orders", "order-details", "signin", "signup", "forgot-password", "referral"];
  if (privateRoutes.some(p => cleanPath === p || cleanPath.startsWith(`${p}/`))) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
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
