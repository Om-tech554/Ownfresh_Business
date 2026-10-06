import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://myownfresh.com";
const API_URL = process.env.PRERENDER_API_URL || "https://api.myownfresh.com";
const distDir = path.join(__dirname, "../dist");
const defaultIndex = path.join(distDir, "index.html");
const notFoundHtml = path.join(distDir, "404.html");

let passed = 0;
let failed = 0;

function assert(condition, message, details = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message} ${details ? "(" + details + ")" : ""}`);
    failed++;
  }
}

async function runRegressionSuite() {
  console.log("=================================================");
  console.log("🧪 RUNNING BLOG SEO INTEGRITY & REGRESSION SUITE");
  console.log("=================================================\n");

  // 1. Fetch live published blogs from API
  console.log("📡 1. Fetching live blog catalog from API...");
  const res = await fetch(`${API_URL}/api/blog/all?limit=200`);
  assert(res.ok, "Blog API responds successfully");
  const data = await res.json();
  const blogs = data.blogs || [];
  assert(blogs.length >= 35, `Published blogs catalog has ${blogs.length} articles (expected >= 35)`);

  // 2. Verify static build artifacts for EVERY blog
  console.log("\n📁 2. Verifying Prerendered HTML Files for ALL Published Blogs...");
  const sitemapXml = fs.readFileSync(path.join(distDir, "sitemap.xml"), "utf-8");

  for (const b of blogs) {
    const slug = b.slug || b._id;
    if (!slug) continue;

    const folderIndex = path.join(distDir, "blog", slug, "index.html");
    const directHtml = path.join(distDir, "blog", `${slug}.html`);

    assert(fs.existsSync(folderIndex), `dist/blog/${slug}/index.html exists`);
    assert(fs.existsSync(directHtml), `dist/blog/${slug}.html exists`);

    const html = fs.readFileSync(folderIndex, "utf-8");

    // Title Check
    const hasUniqueTitle = html.includes(`<title>${b.title} | OwnFresh Insights</title>`) || html.includes(b.title);
    assert(hasUniqueTitle, `Blog [${slug}] has unique article <title>`);

    // Canonical Check
    const expectedCanonical = `<link rel="canonical" href="${BASE_URL}/blog/${slug}" />`;
    assert(html.includes(expectedCanonical), `Blog [${slug}] has accurate canonical URL`);

    // Robots Check
    assert(!html.includes('content="noindex'), `Blog [${slug}] is indexable (no noindex meta tag)`);

    // H1 and Substantial Content Check
    assert(html.includes(`<h1>${b.title}</h1>`) || html.includes(b.title), `Blog [${slug}] has semantic <h1>`);
    assert(html.length > 5000, `Blog [${slug}] has substantial HTML content (${html.length} bytes)`);

    // Structured Data Check
    assert(html.includes('"@type": "BlogPosting"') || html.includes('"@type":"BlogPosting"'), `Blog [${slug}] has BlogPosting JSON-LD`);
    assert(html.includes('"headline":'), `Blog [${slug}] has schema headline`);

    // Interlinking Check
    assert(html.includes('href="/shop"') || html.includes('href="/groundnut-oil"'), `Blog [${slug}] contains internal product links`);

    // Sitemap Inclusion Check
    assert(sitemapXml.includes(`<loc>${BASE_URL}/blog/${slug}</loc>`), `Blog [${slug}] is included in sitemap.xml`);
  }

  // 3. Test Non-existent / Invalid Blog Handling
  console.log("\n🚫 3. Testing Non-existent Blog Handling in Sitemap & Static Files...");
  const fakeSlug = "this-is-a-fake-blog-slug-that-does-not-exist";
  assert(!sitemapXml.includes(`/blog/${fakeSlug}`), "Non-existent blog is NOT in sitemap.xml");
  assert(!fs.existsSync(path.join(distDir, "blog", fakeSlug, "index.html")), "Non-existent blog has no prerendered file");

  // 4. Spin up Express production server and test HTTP response codes
  console.log("\n🌐 4. Testing Live HTTP Server Behavior (200 vs 404)...");
  const app = express();
  
  // Clean URL router matching frontend/server.js
  app.get("/robots.txt", (req, res) => res.type("text/plain").sendFile(path.join(distDir, "robots.txt")));
  app.get("/sitemap.xml", (req, res) => res.type("application/xml").sendFile(path.join(distDir, "sitemap.xml")));
  app.use(express.static(distDir, { index: false, redirect: false }));
  app.use((req, res) => {
    const cleanPath = req.path.replace(/^\/+|\/+$/g, "");
    if (!cleanPath) return res.sendFile(defaultIndex);
    const pageIndexFile = path.join(distDir, cleanPath, "index.html");
    if (fs.existsSync(pageIndexFile)) return res.sendFile(pageIndexFile);
    const pageDirectFile = path.join(distDir, `${cleanPath}.html`);
    if (fs.existsSync(pageDirectFile)) return res.sendFile(pageDirectFile);
    res.status(404);
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    if (fs.existsSync(notFoundHtml)) return res.sendFile(notFoundHtml);
    return res.send("404 Page Not Found");
  });

  const testServer = http.createServer(app);
  await new Promise(r => testServer.listen(6088, r));
  const serverBase = "http://127.0.0.1:6088";

  try {
    // Test Valid Blog (what-is-kachi-ghani-oil)
    const validRes = await fetch(`${serverBase}/blog/what-is-kachi-ghani-oil`);
    assert(validRes.status === 200, "Valid blog returns HTTP 200 OK");
    const validHtml = await validRes.text();
    assert(validHtml.includes("<title>What does kachi ghani mean"), "Valid blog response contains article title");
    assert(validHtml.includes('rel="canonical" href="https://myownfresh.com/blog/what-is-kachi-ghani-oil"'), "Valid blog response has correct canonical");

    // Test Invalid Blog
    const invalidRes = await fetch(`${serverBase}/blog/non-existing-blog-slug`);
    assert(invalidRes.status === 404, "Invalid blog returns TRUE HTTP 404 (eliminates Soft 404!)");
    assert(invalidRes.headers.get("x-robots-tag")?.includes("noindex"), "Invalid blog returns noindex header");

    // Test Robots.txt
    const robotsRes = await fetch(`${serverBase}/robots.txt`);
    assert(robotsRes.status === 200, "robots.txt returns HTTP 200");
    const robotsText = await robotsRes.text();
    assert(robotsText.includes("Allow: /blog/"), "robots.txt explicitly allows /blog/");

    // Test Sitemap.xml
    const sitemapRes = await fetch(`${serverBase}/sitemap.xml`);
    assert(sitemapRes.status === 200, "sitemap.xml returns HTTP 200");
    assert(sitemapRes.headers.get("content-type")?.includes("xml"), "sitemap.xml returns application/xml");
  } finally {
    testServer.close();
  }

  console.log("\n=================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
