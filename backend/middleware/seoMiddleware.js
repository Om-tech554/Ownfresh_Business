import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { resolvePageSEO, renderPrerenderedHTML, render404HTML, setTemplatePath } from "../utils/seoPrerender.js";
import Product from "../models/productModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize template path
const distIndexPath = path.join(__dirname, "../../frontend/dist/index.html");
const publicIndexPath = path.join(__dirname, "../../frontend/index.html");

if (fs.existsSync(distIndexPath)) {
  setTemplatePath(distIndexPath);
} else if (fs.existsSync(publicIndexPath)) {
  setTemplatePath(publicIndexPath);
}

// Private transactional routes that must NOT be indexed
const PRIVATE_ROUTES = [
  "/admin",
  "/cart",
  "/checkout",
  "/order-success",
  "/my-orders",
  "/order-details",
  "/signin",
  "/signup",
  "/forgot-password",
  "/referral"
];

export async function seoMiddleware(req, res, next) {
  // Only handle GET requests for web pages
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }

  // Bypass API routes, static asset extensions, and webhook calls
  const rawPath = req.path;
  if (
    rawPath.startsWith("/api/") ||
    rawPath === "/sitemap.xml" ||
    rawPath === "/robots.txt" ||
    rawPath.startsWith("/media/") ||
    rawPath.startsWith("/wp-content/") ||
    /\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|ttf|woff|woff2|eot|map|json|txt|xml)$/i.test(rawPath)
  ) {
    return next();
  }

  // 1. URL Normalization: Remove trailing slashes (301 Permanent Redirect)
  if (rawPath.length > 1 && rawPath.endsWith("/")) {
    const cleanPath = rawPath.replace(/\/+$/, "");
    const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    return res.redirect(301, cleanPath + query);
  }

  // 2. Canonical Category Redirects: /category/:slug & /product-category/:slug -> /:slug
  if (rawPath.startsWith("/category/") || rawPath.startsWith("/product-category/")) {
    const slug = rawPath.replace(/^\/(category|product-category)\//, "").replace(/\/+$/, "");
    if (slug) {
      return res.redirect(301, `/${slug}`);
    }
  }

  // 3. Legacy General 301 Redirects
  if (rawPath === "/about" || rawPath === "/about-2" || rawPath === "/about-us") {
    return res.redirect(301, "/whyownfresh");
  }
  if (rawPath === "/blog" || rawPath === "/blogs") {
    return res.redirect(301, "/oilinsights");
  }

  // 4. Product ObjectId to SEO Slug 301 Redirect
  if (rawPath.startsWith("/product/")) {
    const identifier = rawPath.replace("/product/", "").trim();
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      try {
        const prod = await Product.findById(identifier).select("slug").lean();
        if (prod && prod.slug) {
          return res.redirect(301, `/product/${prod.slug}`);
        }
      } catch (err) {
        console.warn("Product slug lookup error:", err.message);
      }
    }
  }

  // 5. Private / Auth / Checkout Routes (Serve SPA with noindex)
  const isPrivate = PRIVATE_ROUTES.some(r => rawPath === r || rawPath.startsWith(r + "/"));
  if (isPrivate) {
    let template = "";
    if (fs.existsSync(distIndexPath)) {
      template = fs.readFileSync(distIndexPath, "utf-8");
    } else if (fs.existsSync(publicIndexPath)) {
      template = fs.readFileSync(publicIndexPath, "utf-8");
    }

    if (template) {
      // Ensure private pages carry noindex to protect user sessions & crawl budget
      template = template.replace(
        /<meta\s+name=["']robots["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
        `<meta name="robots" content="noindex, nofollow" />`
      );
      return res.status(200).send(template);
    }
    return next();
  }

  // 6. Public Pages: Prerender SEO Metadata, Canonical, and Initial Semantic HTML
  try {
    const pageSEO = await resolvePageSEO(rawPath);

    if (pageSEO.status === 301 && pageSEO.redirectTo) {
      return res.redirect(301, pageSEO.redirectTo);
    }

    if (pageSEO.status === 200) {
      const html = renderPrerenderedHTML(pageSEO);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    }

    // 7. Page Not Found -> True HTTP 404 (Eliminates Soft 404 completely)
    const notFoundHtml = render404HTML(rawPath);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(404).send(notFoundHtml);

  } catch (err) {
    console.error("SEO Prerender engine error:", err);
    return next();
  }
}
