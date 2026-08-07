import axios from "axios";

const IP = "82.112.229.195";

async function testImgVariations() {
  const variations = [
    "/wp-content/uploads/2026/03/The-immune-system-in-action-1024x683.png",
    "/wp-content/uploads/2026/03/The-immune-system-in-action.png",
    "/wp-content/uploads/2026/03/The-immune-system-in-action.jpg",
    "/wp-content/uploads/2026/03/The-immune-system-in-action-1024x683.jpg",
    "/wp-content/uploads/The-immune-system-in-action.png",
    "/wp-content/uploads/2026/03/The-immune-system-in-action-scaled.png",
    "/wp-content/uploads/2026/03/The-immune-system-in-action-scaled.jpg"
  ];

  for (const v of variations) {
    try {
      const res = await axios.get(`http://${IP}${v}`, {
        headers: { Host: "myownfresh.com" },
        timeout: 3000
      });
      console.log(`✅ SUCCESS for ${v} -> Status: ${res.status}, Type: ${res.headers["content-type"]}, Length: ${res.data.length}`);
    } catch (err) {
      console.log(`❌ Failed for ${v} -> ${err.message}`);
    }
  }
}

testImgVariations();
