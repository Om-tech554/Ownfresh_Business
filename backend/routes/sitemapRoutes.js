import express from "express";
import mongoose from "mongoose";

const router = express.Router();

/**
 * Technical SEO: Dynamic XML Sitemap for Google Search Console
 * Strictly canonical URLs only:
 * - No duplicate /category/* URLs
 * - No ObjectId product URLs (uses keyword-rich slugs)
 * - No private/transactional URLs (cart, checkout, admin, auth)
 */
router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = "https://myownfresh.com";

    // 1. Core Static Public Pages
    const staticPages = [
      { path: "/", priority: "1.0", changefreq: "daily" },
      { path: "/shop", priority: "0.9", changefreq: "daily" },
      { path: "/oils", priority: "0.9", changefreq: "daily" },
      { path: "/oilinsights", priority: "0.85", changefreq: "daily" },
      { path: "/whyownfresh", priority: "0.8", changefreq: "weekly" },
      { path: "/contact", priority: "0.7", changefreq: "monthly" },
      { path: "/gallery", priority: "0.7", changefreq: "weekly" },
      { path: "/membership", priority: "0.8", changefreq: "weekly" },
      { path: "/privacy-policy", priority: "0.5", changefreq: "monthly" },
      { path: "/terms-and-conditions", priority: "0.5", changefreq: "monthly" },
      { path: "/refund-policy", priority: "0.5", changefreq: "monthly" },
      { path: "/shipping-policy", priority: "0.5", changefreq: "monthly" }
    ];

    // 2. Oil Category Landing Pages (Canonical URLs only)
    const categoryPages = [
      { path: "/groundnut-oil", priority: "0.9", changefreq: "weekly" },
      { path: "/safflower-oil", priority: "0.9", changefreq: "weekly" },
      { path: "/sesame-oil", priority: "0.9", changefreq: "weekly" },
      { path: "/mustard-oil", priority: "0.9", changefreq: "weekly" },
      { path: "/coconut-oil", priority: "0.9", changefreq: "weekly" },
      { path: "/sunflower-oil", priority: "0.8", changefreq: "weekly" }
    ];

    const staticUrls = [...staticPages, ...categoryPages].map(page => `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("\n");

    // 3. Dynamic Live Blog Articles
    let blogUrls = "";
    try {
      const Blog = mongoose.models.Blog || mongoose.model("Blog");
      const blogs = await Blog.find({ status: { $in: ["LIVE", "PUBLISHED", "published", "live"] } })
        .select("_id slug updatedAt")
        .lean();

      blogUrls = (blogs || []).map(blog => {
        const slug = blog.slug || blog._id;
        const lastMod = blog.updatedAt ? new Date(blog.updatedAt).toISOString().split("T")[0] : "2026-09-05";
        return `  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`;
      }).join("\n");
    } catch (e) {
      console.warn("Sitemap blog fetch note:", e.message);
    }

    // 4. Dynamic Active Products (Canonical Slugs Only)
    let productUrls = "";
    try {
      const Product = mongoose.models.Product || mongoose.model("Product");
      const products = await Product.find({ status: { $ne: "Inactive" } })
        .select("_id slug updatedAt name")
        .lean();

      productUrls = (products || []).map(product => {
        const slug = product.slug || String(product._id);
        const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString().split("T")[0] : "2026-09-10";
        return `  <url>
    <loc>${baseUrl}/product/${slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>`;
      }).join("\n");
    } catch (e) {
      console.warn("Sitemap product fetch note:", e.message);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${blogUrls}
${productUrls}
</urlset>`;

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

/**
 * Technical SEO: Dynamic Robots.txt for Search Engines
 * Blocks private and transactional routes, allows all public indexable routes.
 */
router.get("/robots.txt", (req, res) => {
  const robotsTxt = `# MyOwnFresh Robots.txt
# Technical SEO Crawl Rules for Googlebot, Bingbot, & Search Crawlers

User-agent: *
Allow: /
Allow: /shop
Allow: /product/
Allow: /blog/
Allow: /groundnut-oil
Allow: /mustard-oil
Allow: /sesame-oil
Allow: /coconut-oil
Allow: /safflower-oil
Allow: /sunflower-oil
Allow: /whyownfresh
Allow: /contact
Allow: /oilinsights
Allow: /gallery
Allow: /membership

# Disallow Private, Auth & Transactional Routes
Disallow: /admin
Disallow: /admin/
Disallow: /cart
Disallow: /checkout
Disallow: /order-success
Disallow: /my-orders
Disallow: /order-details/
Disallow: /signin
Disallow: /signup
Disallow: /forgot-password
Disallow: /referral
Disallow: /api/

# Authoritative XML Sitemap Location
Sitemap: https://myownfresh.com/sitemap.xml
`;

  res.header("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(robotsTxt);
});

export default router;
