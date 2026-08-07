import axios from "axios";

async function fetchAllWpMedia() {
  console.log("Fetching WP Media list...");
  try {
    const res = await axios.get("http://82.112.229.195/wp-json/wp/v2/media?per_page=100", {
      headers: { Host: "myownfresh.com" },
      timeout: 10000
    });
    console.log(`Found ${res.data.length} media items!`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      res.data.slice(0, 10).forEach(m => {
        console.log(` - Media ID ${m.id}: ${m.slug} -> ${m.source_url}`);
      });
    }
  } catch (err) {
    console.error("WP Media fetch error:", err.message);
  }
}

fetchAllWpMedia();
