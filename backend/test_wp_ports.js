import axios from "axios";

const IP = "82.112.229.195";

async function probeWp() {
  const ports = [80, 443, 8080, 8000, 8443, 8888];
  const paths = [
    "/wp-json/wp/v2/posts",
    "/wp-json/wp/v2/categories",
    "/wp-json/wp/v2/media",
    "/wp-json/wc/v3/products/categories",
    "/wp-login.php",
    "/wp-admin"
  ];
  const hostHeaders = ["", "myownfresh.com", "wordpress.myownfresh.com", "blog.myownfresh.com", "shop.myownfresh.com", "localhost"];

  for (const host of hostHeaders) {
    for (const port of [80, 443, 8080]) {
      const proto = port === 443 || port === 8443 ? "https" : "http";
      const url = `${proto}://${IP}:${port}/wp-login.php`;
      const headers = host ? { Host: host } : {};
      try {
        const res = await axios.get(url, { headers, timeout: 3000, maxRedirects: 2 });
        console.log(`SUCCESS: ${url} (Host: "${host}") -> Status: ${res.status}, Length: ${res.data.length}`);
        if (res.data.includes("wp-submit") || res.data.includes("WordPress") || res.data.includes("wp-")) {
          console.log("🔥 CONFIRMED WORDPRESS DETECTED AT:", url, "Host:", host);
        }
      } catch (err) {
        // quiet
      }
    }
  }
}

probeWp();
