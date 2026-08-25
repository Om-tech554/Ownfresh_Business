import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = "https://myownfresh.com";

    // Static pages
    const staticPages = [
      "",
      "/shop",
      "/whyownfresh",
      "/contact",
      "/gallery",
      "/membership",
      "/privacy-policy",
      "/terms-and-conditions",
      "/refund-policy",
      "/shipping-policy"
    ];

    let staticUrls = staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`).join("");

    // Dynamic Blogs
    let blogUrls = "";
    try {
      const Blog = mongoose.model("Blog");
      const blogs = await Blog.find({ status: "LIVE" }).select("_id slug updatedAt").lean();
      blogUrls = blogs.map(blog => `
  <url>
    <loc>${baseUrl}/blog/${blog.slug || blog._id}</loc>
    <lastmod>${new Date(blog.updatedAt || Date.now()).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join("");
    } catch (e) {
      console.warn("Sitemap blog fetch warning:", e.message);
    }

    // Dynamic Products
    let productUrls = "";
    try {
      const Product = mongoose.model("Product");
      const products = await Product.find({ status: "Active" }).select("_id updatedAt").lean();
      productUrls = products.map(product => `
  <url>
    <loc>${baseUrl}/product/${product._id}</loc>
    <lastmod>${new Date(product.updatedAt || Date.now()).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join("");
    } catch (e) {
      console.warn("Sitemap product fetch warning:", e.message);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${blogUrls}
${productUrls}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
