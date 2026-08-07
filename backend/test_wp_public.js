import axios from "axios";

async function testWpPublic() {
  const urls = [
    "https://myownfresh.com/wp-json/wp/v2/posts?_embed&per_page=10",
    "http://myownfresh.com/wp-json/wp/v2/posts?_embed&per_page=10",
    "https://www.myownfresh.com/wp-json/wp/v2/posts?_embed&per_page=10",
    "http://82.112.229.195/wp-json/wp/v2/posts?_embed&per_page=10",
    "https://82.112.229.195/wp-json/wp/v2/posts?_embed&per_page=10"
  ];

  for (const url of urls) {
    console.log(`\nTesting URL: ${url}`);
    try {
      const res = await axios.get(url, { 
        timeout: 5000, 
        headers: { "User-Agent": "Mozilla/5.0" },
        rejectUnauthorized: false
      });
      console.log(`STATUS: ${res.status}`);
      console.log(`Is Array? ${Array.isArray(res.data)}`);
      if (Array.isArray(res.data)) {
        console.log(`✅ FOUND ${res.data.length} WP POSTS!`);
        res.data.forEach(p => console.log(" - Title:", p.title?.rendered));
      } else {
        console.log("Response starts with:", String(res.data).substring(0, 150));
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
  }
}

testWpPublic();
