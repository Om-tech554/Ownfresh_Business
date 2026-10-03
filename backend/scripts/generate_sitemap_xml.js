import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Product from "../models/productModel.js";
import Blog from "../models/blogModel.js";

async function generate() {
  const mongoUri = process.env.MONGODB_URL;
  if (!mongoUri) {
    console.error("MONGODB_URL missing");
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { dbName: "OwnFresh" });
  console.log("Connected to MongoDB for sitemap generation");

  const baseUrl = "https://myownfresh.com";

  // 1. Static Pages
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

  // 2. Canonical Category Pages Only
  const categoryPages = [
    { path: "/groundnut-oil", priority: "0.9", changefreq: "weekly" },
    { path: "/safflower-oil", priority: "0.9", changefreq: "weekly" },
    { path: "/sesame-oil", priority: "0.9", changefreq: "weekly" },
    { path: "/mustard-oil", priority: "0.9", changefreq: "weekly" },
    { path: "/coconut-oil", priority: "0.9", changefreq: "weekly" },
    { path: "/sunflower-oil", priority: "0.8", changefreq: "weekly" }
  ];

  const staticUrls = [...staticPages, ...categoryPages].map(p => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n");

  // 3. Blog URLs
  const blogs = await Blog.find({ status: { $in: ["LIVE", "PUBLISHED", "published", "live"] } })
    .select("_id slug updatedAt")
    .lean();

  const blogUrls = blogs.map(b => {
    const slug = b.slug || b._id;
    const lastMod = b.updatedAt ? new Date(b.updatedAt).toISOString().split("T")[0] : "2026-09-05";
    return `  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`;
  }).join("\n");

  // 4. Product URLs (Using Canonical Slugs Only)
  const products = await Product.find({ status: { $ne: "Inactive" } })
    .select("_id slug updatedAt name")
    .lean();

  const productUrls = products.map(p => {
    const slug = p.slug || String(p._id);
    const lastMod = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : "2026-09-10";
    return `  <url>
    <loc>${baseUrl}/product/${slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${blogUrls}
${productUrls}
</urlset>`;

  const targetPath = path.join(__dirname, "../../frontend/public/sitemap.xml");
  fs.writeFileSync(targetPath, xml, "utf-8");
  console.log(`✅ Saved sitemap with ${staticPages.length + categoryPages.length} static pages, ${blogs.length} blogs, and ${products.length} product slugs to: ${targetPath}`);

  await mongoose.disconnect();
}

generate().catch(err => {
  console.error("Sitemap generation error:", err);
  process.exit(1);
});
