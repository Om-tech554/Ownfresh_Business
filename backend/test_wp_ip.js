import axios from "axios";

const BASE_IP = "http://82.112.229.195";
const headers = { Host: "myownfresh.com" };

async function inspectData() {
  console.log("Inspecting data structure from 82.112.229.195...");

  // 1. WP API root /wp-json/wp/v2/
  try {
    const res = await axios.get(`${BASE_IP}/wp-json/wp/v2/posts?_embed&per_page=5`, { headers });
    console.log("Posts Data Type:", typeof res.data, Array.isArray(res.data) ? "Array" : "Object");
    if (Array.isArray(res.data) && res.data.length > 0) {
      console.log("\n--- Sample Post Object Keys ---");
      console.log("Keys:", Object.keys(res.data[0]));
      console.log("Title:", res.data[0].title);
      console.log("Featured Media Embed:", res.data[0]._embedded?.["wp:featuredmedia"]);
      
      // Extract sub-images in content
      const content = res.data[0].content?.rendered || "";
      const imgMatches = [...content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
      console.log("Images found inside post content:", imgMatches.map(m => m[1]));
    } else {
      console.log("Posts raw sample:", String(res.data).substring(0, 300));
    }
  } catch (err) {
    console.error("Posts error:", err.message);
  }

  // 2. WP Categories
  try {
    const res = await axios.get(`${BASE_IP}/wp-json/wp/v2/categories?per_page=100`, { headers });
    console.log("\nCategories Data Type:", typeof res.data, Array.isArray(res.data) ? "Array" : "Object");
    if (Array.isArray(res.data)) {
      console.log("Categories List:", res.data.map(c => ({ id: c.id, name: c.name, slug: c.slug, count: c.count })));
    } else {
      console.log("Categories raw sample:", String(res.data).substring(0, 300));
    }
  } catch (err) {
    console.error("Categories error:", err.message);
  }

  // 3. WooCommerce Products / Product Categories
  try {
    const res = await axios.get(`${BASE_IP}/wp-json/wc/v3/products/categories?per_page=100`, { headers });
    console.log("\nWC Categories:", res.data);
  } catch (err) {
    console.log("WC v3 Categories error:", err.message);
  }

  // 4. Check all custom post types or taxonomy endpoints
  try {
    const res = await axios.get(`${BASE_IP}/wp-json/wp/v2/types`, { headers });
    console.log("\nAvailable Post Types:", Object.keys(res.data));
  } catch (err) {
    console.log("Types error:", err.message);
  }
}

inspectData();
