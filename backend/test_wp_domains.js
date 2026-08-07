import axios from "axios";

const IP = "82.112.229.195";

const domains = [
  "myownfresh.com",
  "www.myownfresh.com",
  "old.myownfresh.com",
  "wp.myownfresh.com",
  "blog.myownfresh.com",
  "shop.myownfresh.com",
  "dev.myownfresh.com",
  "admin.myownfresh.com",
  "store.myownfresh.com"
];

async function checkDomains() {
  for (const domain of domains) {
    const headers = { Host: domain, "User-Agent": "Mozilla/5.0" };
    console.log(`\n=================== Testing Host: ${domain} ===================`);
    
    // Check WP REST Posts
    try {
      const res = await axios.get(`http://${IP}/wp-json/wp/v2/posts?_embed&per_page=10`, { headers, timeout: 5000 });
      console.log(`[${domain} /wp-json/wp/v2/posts] STATUS: ${res.status}`);
      if (Array.isArray(res.data)) {
        console.log(`✅ SUCCESS! Found ${res.data.length} posts on ${domain}`);
        res.data.slice(0, 3).forEach((p, idx) => {
          console.log(`  Post #${idx + 1}: ${p.title?.rendered}`);
          console.log(`  Featured Media: ${p._embedded?.['wp:featuredmedia']?.[0]?.source_url}`);
          // Check inline images in post HTML content
          const content = p.content?.rendered || "";
          const imgs = [...content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
          console.log(`  Sub Blog Inline Images (${imgs.length}):`, imgs.slice(0, 3));
        });
      }
    } catch (err) {
      console.log(`[${domain} /wp-json/wp/v2/posts] ERROR: ${err.message} ${err.response ? 'Status: ' + err.response.status : ''}`);
    }

    // Check WP Categories
    try {
      const res = await axios.get(`http://${IP}/wp-json/wp/v2/categories?per_page=100`, { headers, timeout: 5000 });
      if (Array.isArray(res.data)) {
        console.log(`✅ SUCCESS! Found ${res.data.length} Categories on ${domain}`);
        console.log("  Categories:", res.data.map(c => ({ id: c.id, name: c.name, count: c.count })));
      }
    } catch (err) {
      console.log(`[${domain} /wp-json/wp/v2/categories] ERROR: ${err.message}`);
    }

    // Check WC Product Categories
    try {
      const res = await axios.get(`http://${IP}/wp-json/wc/store/v1/products/categories?per_page=100`, { headers, timeout: 5000 });
      if (Array.isArray(res.data)) {
        console.log(`✅ SUCCESS! Found ${res.data.length} WooCommerce Product Categories on ${domain}`);
        console.log("  WC Categories:", res.data.map(c => ({ id: c.id, name: c.name, count: c.count, image: c.images?.[0]?.src })));
      }
    } catch (err) {
      console.log(`[${domain} WooCommerce Store Categories] ERROR: ${err.message}`);
    }

    // Check WC Standard API
    try {
      const res = await axios.get(`http://${IP}/wp-json/wc/v3/products/categories?per_page=100`, { headers, timeout: 5000 });
      if (Array.isArray(res.data)) {
        console.log(`✅ SUCCESS! Found ${res.data.length} WC v3 Categories on ${domain}`);
        console.log("  WC v3 Categories:", res.data.map(c => ({ id: c.id, name: c.name, count: c.count, image: c.image?.src })));
      }
    } catch (err) {
      console.log(`[${domain} WC v3 Categories] ERROR: ${err.message}`);
    }
  }
}

checkDomains();
