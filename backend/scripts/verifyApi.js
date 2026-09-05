import dotenv from "dotenv";
import express from "express";
import connectDB from "../config/db.js";
import productRoutes from "../routes/productRoutes.js";
import categoryRoutes from "../routes/categoryRoutes.js";
import blogRoutes from "../routes/blogRoutes.js";
import reviewRoutes from "../routes/reviewRoutes.js";
import membershipRoutes from "../routes/membershipRoutes.js";
import settingsRoutes from "../routes/settingsRoutes.js";
import campaignRoutes from "../routes/campaignRoutes.js";
import couponRoutes from "../routes/couponRoutes.js";

dotenv.config();

async function testBackend() {
  await connectDB();
  const app = express();
  app.use(express.json());

  app.use("/api/product", productRoutes);
  app.use("/api/category", categoryRoutes);
  app.use("/api/blog", blogRoutes);
  app.use("/api/review", reviewRoutes);
  app.use("/api/membership", membershipRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/campaign", campaignRoutes);
  app.use("/api/coupon", couponRoutes);

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const base = `http://localhost:${port}`;
    console.log(`\n🧪 Testing local express API on port ${port}...`);

    const tests = [
      { name: "Products List", url: `${base}/api/product/all?limit=50`, check: d => `Products: ${d.products?.length || d.length} (Total: ${d.totalProducts})` },
      { name: "Categories", url: `${base}/api/category/all`, check: d => `Categories: ${(d.categories || d).length}` },
      { name: "Blogs", url: `${base}/api/blog/all?limit=50`, check: d => `Blogs: ${d.blogs?.length || d.length} (Total: ${d.totalBlogs})` },
      { name: "Featured Reviews", url: `${base}/api/review/featured`, check: d => `Testimonials: ${(d.testimonials || d).length}` },
      { name: "Prime Plans", url: `${base}/api/membership/plans`, check: d => `Plans: ${(d.plans || d).length} (${d.plans?.[0]?.name})` },
      { name: "Announcement Bar", url: `${base}/api/settings/announcement`, check: d => `Announcement: ${d.value?.slice(0, 50)}...` },
      { name: "Active Campaign", url: `${base}/api/campaign/active`, check: d => `Campaign: ${d.campaign?.title || d.campaigns?.[0]?.title || 'None'}` }
    ];

    for (const t of tests) {
      try {
        const res = await fetch(t.url);
        const data = await res.json();
        console.log(`  ✅ [${res.status}] ${t.name} => ${t.check(data)}`);
      } catch (err) {
        console.log(`  ❌ ${t.name} failed: ${err.message}`);
      }
    }

    server.close();
    process.exit(0);
  });
}

testBackend().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
