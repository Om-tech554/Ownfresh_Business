const BASE_URL = "http://localhost:10000";

async function testEndpoints() {
  console.log("=== Testing MyOwnFresh BI & SEO Endpoints ===");

  // 1. Test /sitemap.xml
  try {
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    const text = await sitemapRes.text();
    console.log("✅ /sitemap.xml Status:", sitemapRes.status, "| Length:", text.length, "bytes");
    console.log("   Contains categories:", text.includes("/category/groundnut-oil"));
    console.log("   Contains products:", text.includes("/product/"));
  } catch (e) {
    console.error("❌ /sitemap.xml Error:", e.message);
  }

  // 2. Test /robots.txt
  try {
    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    const text = await robotsRes.text();
    console.log("✅ /robots.txt Status:", robotsRes.status, "| Length:", text.length, "bytes");
    console.log("   Contains Sitemap line:", text.includes("Sitemap: https://myownfresh.com/sitemap.xml"));
  } catch (e) {
    console.error("❌ /robots.txt Error:", e.message);
  }

  // 3. Test /api/feed/google-merchant.xml
  try {
    const feedRes = await fetch(`${BASE_URL}/api/feed/google-merchant.xml`);
    const text = await feedRes.text();
    console.log("✅ /api/feed/google-merchant.xml Status:", feedRes.status, "| Length:", text.length, "bytes");
    console.log("   Contains <rss> & <g:brand>:", text.includes("<g:brand>MyOwnFresh</g:brand>"));
  } catch (e) {
    console.error("❌ /api/feed/google-merchant.xml Error:", e.message);
  }

  // 4. Test /api/analytics/dashboard-metrics
  try {
    const metricsRes = await fetch(`${BASE_URL}/api/analytics/dashboard-metrics`);
    const json = await metricsRes.json();
    console.log("✅ /api/analytics/dashboard-metrics Status:", metricsRes.status);
    console.log("   Total Sales Revenue: ₹", json.data?.sales?.totalSales);
    console.log("   Total Orders:", json.data?.sales?.totalOrdersCount);
    console.log("   Average Order Value: ₹", json.data?.sales?.avgOrderValue);
    console.log("   Free Delivery Orders (>=1k):", json.data?.sales?.freeDeliveryOrdersCount);
    console.log("   Delivery Revenue Collected: ₹", json.data?.sales?.totalDeliveryRevenue);
  } catch (e) {
    console.error("❌ /api/analytics/dashboard-metrics Error:", e.message);
  }

  // 5. Test /api/analytics/export/orders
  try {
    const exportRes = await fetch(`${BASE_URL}/api/analytics/export/orders`);
    const csv = await exportRes.text();
    console.log("✅ /api/analytics/export/orders Status:", exportRes.status, "| Content-Type:", exportRes.headers.get("content-type"));
    console.log("   First line:", csv.split("\n")[0]);
  } catch (e) {
    console.error("❌ /api/analytics/export/orders Error:", e.message);
  }
}

testEndpoints();
