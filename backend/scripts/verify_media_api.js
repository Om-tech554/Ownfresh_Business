import axios from 'axios';

async function verify() {
  console.log("=== VERIFYING API AND MEDIA SERVING ===");
  
  // 1. Test backend media static serving
  try {
    const resMedia = await axios.get('http://localhost:10000/media/wordpress_photos/Cooking-together-for-a-healthy-future.png', {
      responseType: 'arraybuffer'
    });
    console.log("✅ Backend /media static serving status:", resMedia.status, "| Size:", resMedia.data.length, "bytes");
  } catch (e) {
    console.error("❌ Backend /media test failed:", e.message);
  }

  // 2. Test backend fallback for legacy /wp-content/uploads/
  try {
    const resLegacy = await axios.get('http://localhost:10000/wp-content/uploads/2026/05/Cooking-together-for-a-healthy-future.png', {
      responseType: 'arraybuffer'
    });
    console.log("✅ Backend legacy /wp-content/uploads fallback status:", resLegacy.status, "| Size:", resLegacy.data.length, "bytes");
  } catch (e) {
    console.error("❌ Backend legacy fallback test failed:", e.message);
  }

  // 3. Test API /api/blog/all
  try {
    const resBlogs = await axios.get('http://localhost:10000/api/blog/all?limit=5');
    console.log("✅ GET /api/blog/all status:", resBlogs.status, "| Returned blogs:", resBlogs.data.blogs?.length);
    const sample = resBlogs.data.blogs[0];
    console.log("   Sample Blog Title:", sample.title);
    console.log("   Sample Blog Main Image:", sample.image);
    console.log("   Sample Blog Gallery Images:", [sample.image1, sample.image2, sample.image3, sample.image4].filter(Boolean));
    const hasImagesInDesc = sample.description.includes('/media/wordpress_photos/');
    console.log("   Contains /media/wordpress_photos/ in description:", hasImagesInDesc);
  } catch (e) {
    console.error("❌ GET /api/blog/all failed:", e.message);
  }

  // 4. Test single blog by slug / id
  try {
    const resSingle = await axios.get('http://localhost:10000/api/blog/choosing-the-right-cooking-oil-matters-child-health');
    console.log("✅ GET single blog status:", resSingle.status, "| Title:", resSingle.data.blog?.title);
  } catch (e) {
    console.error("❌ GET single blog failed:", e.message);
  }
}

verify();
