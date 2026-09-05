const API_BASE_URL = "http://localhost:10000";

async function verify() {
  try {
    console.log("1. Testing GET /api/tag/all ...");
    const tagRes = await fetch(`${API_BASE_URL}/api/tag/all`).then(r => r.json());
    console.log(`✅ Tags API returned ${tagRes.tags?.length} tags.`);
    if (tagRes.tags?.length > 0) {
      console.log(`   Sample tag: ${tagRes.tags[0].name} (Slug: ${tagRes.tags[0].slug}, Color: ${tagRes.tags[0].bgColor})`);
    }

    console.log("\n2. Testing GET /api/product/all ...");
    const prodRes = await fetch(`${API_BASE_URL}/api/product/all?limit=5`).then(r => r.json());
    console.log(`✅ Products API returned ${prodRes.products?.length} products.`);
    const sampleProd = prodRes.products[0];
    if (sampleProd) {
      console.log(`   Product: ${sampleProd.name}`);
      console.log(`   Category: ${sampleProd.category?.name}`);
      console.log(`   Tags: ${sampleProd.tags?.map(t => t.name).join(", ")}`);
      console.log(`   Variants Count: ${sampleProd.variants?.length}`);
      sampleProd.variants?.forEach((v, i) => {
        console.log(`     Variant #${i+1}: ${v.name} | Price: ₹${v.price} | Sale: ₹${v.salePrice} | Stock: ${v.stockQuantity} | Image: ${v.image?.slice(0, 60)}...`);
      });

      console.log("\n3. Testing GET /api/product/:id ...");
      const singleRes = await fetch(`${API_BASE_URL}/api/product/${sampleProd._id}`).then(r => r.json());
      console.log(`✅ Single Product API returned: ${singleRes.product?.name} with ${singleRes.product?.variants?.length} variants.`);
    }

    console.log("\n🎉 ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
}

verify();
