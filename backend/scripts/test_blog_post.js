import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Blog from "../models/blogModel.js";

dotenv.config();

const API_BASE = process.env.TEST_API_URL || "https://api.myownfresh.com";
const API_KEY = process.env.BLOG_API_KEY;

if (!API_KEY) {
  console.error("❌ Error: BLOG_API_KEY is not defined in your .env file.");
  process.exit(1);
}

async function runHermesBlogTest() {
  console.log("=================================================");
  console.log("🚀 HERMES AGENT BLOG PUBLISHING PIPELINE TEST");
  console.log("=================================================");
  console.log(`Target Base URL: ${API_BASE}`);
  console.log(`API Key (first 8 chars): ${API_KEY.slice(0, 8)}...`);

  const testPayload = {
    title: "Cold Pressed Sesame Oil: Benefits for Traditional Cooking",
    slug: "cold-pressed-sesame-oil-benefits-for-traditional-cooking",
    content: "## The Power of Cold-Pressed Sesame Oil\n\nSesame oil extracted using traditional stone-press methods retains maximum natural nutrients, antioxidants, and pure aroma.\n\n### Why Choose Wood/Stone Pressed?\n- **Zero chemical refinement**\n- **Rich in natural sesamol & Vitamin E**\n- **Authentic wood-pressed flavor**",
    excerpt: "Discover the therapeutic and culinary benefits of pure cold pressed sesame oil produced through traditional extraction.",
    tags: ["Sesame Oil", "Cold Pressed", "Ayurvedic Health", "Cooking Tips"],
    category: "Cold Pressed Oils",
    meta: {
      title: "Cold Pressed Sesame Oil Benefits | OwnFresh",
      description: "Discover the therapeutic and culinary benefits of pure cold pressed sesame oil produced through traditional extraction."
    },
    status: "published"
  };

  const endpoint = `${API_BASE.replace(/\/+$/, "")}/api/admin/blogs`;
  console.log(`\n📤 Sending POST request to: ${endpoint}`);
  console.log("Header: x-api-key: [SECURED_KEY]");
  console.log("Payload:", JSON.stringify(testPayload, null, 2));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify(testPayload)
    });

    const status = response.status;
    const body = await response.json();

    console.log(`\n📥 Response Status: ${status}`);
    console.log("📥 Response Body:\n", JSON.stringify(body, null, 2));

    if (status !== 200 && status !== 201) {
      throw new Error(`Failed with HTTP ${status}: ${body.message || "Unknown error"}`);
    }

    if (!body.success || !body.blog || !body.blog.id) {
      throw new Error("Response did not contain expected success status or blog payload");
    }

    console.log("\n✅ Success! The API accepted the payload and published the blog.");
    console.log(`   Blog ID: ${body.blog.id}`);
    console.log(`   Slug: ${body.blog.slug}`);
    console.log(`   Status: ${body.blog.status}`);

    // Verify in MongoDB directly and cleanup test document
    console.log("\n🔍 Verifying in MongoDB...");
    await connectDB();
    const found = await Blog.findOne({ slug: testPayload.slug });
    if (found) {
      console.log(`✅ MongoDB Persistence Confirmed: Title="${found.title}", Category="${found.category}", Tags=[${found.tags.join(", ")}]`);
      
      // Cleanup
      await Blog.deleteOne({ _id: found._id });
      console.log(`🧹 Cleaned up test document (_id: ${found._id}) from database.`);
    } else {
      console.warn("⚠️ Note: Blog was not found in direct DB query (check if connecting to same cluster).");
    }

    await mongoose.disconnect();
    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
    process.exit(0);

  } catch (err) {
    console.error("\n❌ Test Failed:", err.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

runHermesBlogTest();
