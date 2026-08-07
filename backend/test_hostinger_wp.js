import axios from "axios";

const IP = "82.112.229.195";

async function scanHostinger() {
  const hostHeaders = [
    "myownfresh.com",
    "www.myownfresh.com",
    "main.myownfresh.com",
    "ownfresh.com",
    "www.ownfresh.com",
    "myownfresh.in",
    "www.myownfresh.in",
    "ownfresh.in",
    "www.ownfresh.in"
  ];

  for (const host of hostHeaders) {
    console.log(`\n================ Testing Host: ${host} ================`);
    const headers = { 
      Host: host,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*"
    };

    // Try HTTP /wp-json/wp/v2/posts
    try {
      const res = await axios.get(`http://${IP}/wp-json/wp/v2/posts?_embed&per_page=10`, { headers, timeout: 6000 });
      console.log(`HTTP ${host} Status: ${res.status}`);
      if (Array.isArray(res.data)) {
        console.log(`🎉 SUCCESS ON HTTP! Found ${res.data.length} WP Posts!`);
        res.data.forEach(p => {
          console.log(` - Title: ${p.title?.rendered}`);
          console.log(`   Featured Image: ${p._embedded?.['wp:featuredmedia']?.[0]?.source_url}`);
        });
      } else {
        console.log("Raw response sample:", String(res.data).substring(0, 100));
      }
    } catch (err) {
      console.log(`HTTP ${host} Error: ${err.message}`);
    }

    // Try HTTP /wp-json/wp/v2/categories
    try {
      const res = await axios.get(`http://${IP}/wp-json/wp/v2/categories?per_page=100`, { headers, timeout: 6000 });
      if (Array.isArray(res.data)) {
        console.log(`🎉 SUCCESS ON HTTP CATEGORIES! Found ${res.data.length} Categories!`);
        console.log(res.data.map(c => ({ id: c.id, name: c.name, slug: c.slug, count: c.count })));
      }
    } catch (err) {
      // quiet
    }

    // Try HTTP /wp-json/wc/v3/products/categories (WooCommerce Product Categories)
    try {
      const res = await axios.get(`http://${IP}/wp-json/wc/store/v1/products/categories?per_page=100`, { headers, timeout: 6000 });
      if (Array.isArray(res.data)) {
        console.log(`🎉 SUCCESS ON HTTP WOOCOMMERCE CATEGORIES! Found ${res.data.length} WC Categories!`);
        console.log(res.data.map(c => ({ id: c.id, name: c.name, count: c.count, image: c.images?.[0]?.src })));
      }
    } catch (err) {
      // quiet
    }
  }
}

scanHostinger();
