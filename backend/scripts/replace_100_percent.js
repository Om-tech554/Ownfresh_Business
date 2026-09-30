import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");

console.log("Replacing 100% claims with 'Premium Quality' across codebase...");

function updateFile(filePath, modifier) {
  const fullPath = path.resolve(rootDir, filePath);
  if (!fs.existsSync(fullPath)) {
    console.error("File not found:", fullPath);
    return false;
  }
  const original = fs.readFileSync(fullPath, "utf8");
  const updated = modifier(original);
  if (original !== updated) {
    fs.writeFileSync(fullPath, updated, "utf8");
    console.log("✅ Updated:", filePath);
    return true;
  } else {
    console.log("ℹ️ No changes needed in:", filePath);
    return false;
  }
}

// 1. index.html
updateFile("frontend/index.html", (code) => {
  return code
    .replace(/OwnFresh \|Pure Stone Pressed Cooking Oils/g, "OwnFresh | Premium Quality Stone Pressed Cooking Oils")
    .replace(/OwnFresh \| 100% Pure Stone Pressed Cooking Oils/g, "OwnFresh | Premium Quality Stone Pressed Cooking Oils")
    .replace(/100% unrefined Groundnut/g, "Premium quality unrefined Groundnut")
    .replace(/brand of 100% pure traditional stone pressed cooking oils/g, "brand of premium quality traditional stone pressed cooking oils")
    .replace(/100% pure/gi, "Premium quality");
});

// 2. UserDashboard.jsx
updateFile("frontend/src/components/UserDashboard.jsx", (code) => {
  return code
    .replace(/OwnFresh \| 100% Pure Stone Pressed Cooking Oils/g, "OwnFresh | Premium Quality Stone Pressed Cooking Oils")
    .replace(/100% unrefined Groundnut/g, "Premium quality unrefined Groundnut")
    .replace(/100% pure/gi, "premium quality")
    .replace(/100% Stone Pressed/gi, "Premium Stone Pressed");
});

// 3. Shop.jsx
updateFile("frontend/src/components/Shop.jsx", (code) => {
  return code
    .replace(/Buy 100% Pure Stone Pressed Cooking Oils Online/g, "Buy Premium Quality Stone Pressed Cooking Oils Online")
    .replace(/100% pure/gi, "premium quality")
    .replace(/100% Stone Pressed/gi, "Premium Stone Pressed");
});

// 4. Signin.jsx
updateFile("frontend/src/pages/Signin.jsx", (code) => {
  return code
    .replace(/100% pure stone-pressed botanical oils/g, "premium quality stone-pressed botanical oils")
    .replace(/100% Stone Pressed Purity/g, "Premium Quality Stone Pressed Purity");
});

// 5. SignUp.jsx
updateFile("frontend/src/pages/SignUp.jsx", (code) => {
  return code
    .replace(/100% Single Origin/g, "Premium Single Origin");
});

// 6. FloatingOilSpill.jsx
updateFile("frontend/src/components/cart/FloatingOilSpill.jsx", (code) => {
  return code
    .replace(/100% Pure Stone-Pressed Oil Guarantee/g, "Premium Quality Stone-Pressed Oil Guarantee");
});

// 7. CartPage.jsx
updateFile("frontend/src/pages/CartPage.jsx", (code) => {
  return code
    .replace(/100% Stone-Pressed • Direct from Traditional Kolhu/g, "Premium Stone-Pressed • Direct from Traditional Kolhu");
});

// 8. UserBlogDetails.jsx
updateFile("frontend/src/pages/UserBlogDetails.jsx", (code) => {
  return code
    .replace(/100% pure, chemical-free/gi, "premium quality, chemical-free")
    .replace(/100% Pure, unrefined stone-pressed oil/g, "Premium quality, unrefined stone-pressed oil")
    .replace(/100% Native Whole Seeds/g, "Premium Native Whole Seeds")
    .replace(/100% stone-pressed/gi, "premium stone-pressed")
    .replace(/100% pure/gi, "premium quality");
});

// 9. CategoryLandingPage.jsx
updateFile("frontend/src/pages/CategoryLandingPage.jsx", (code) => {
  return code
    .replace(/100% unbleached, solvent-free/g, "Unbleached, solvent-free")
    .replace(/badge: "100% Natural & Chemical Free"/g, 'badge: "Premium Quality & Chemical Free"')
    .replace(/100% pure single-origin seeds/g, "Premium single-origin seeds")
    .replace(/100% Cold Stone Pressed/g, "Authentic Stone Pressed")
    .replace(/100% Natural/g, "Premium Quality");
});

// 10. OilInsights.jsx
updateFile("frontend/src/pages/OilInsights.jsx", (code) => {
  return code
    .replace(/100% Stone-pressed/g, "Premium stone-pressed")
    .replace(/100% Zero Hexane & Chemical Refining/g, "Zero Hexane & Chemical Refining");
});

// 11. ProductDetails.jsx
updateFile("frontend/src/pages/ProductDetails.jsx", (code) => {
  return code
    .replace(/preserving 100% natural nutty flavor/g, "preserving natural nutty flavor")
    .replace(/100% Sulfur-Free/g, "Sulfur-Free")
    .replace(/proof of 100% unadulterated/g, "proof of unadulterated")
    .replace(/it is 100% gentle/g, "it is gentle")
    .replace(/is 100% single-press/g, "is single-press")
    .replace(/100% Stone Pressed/g, "Premium Stone Pressed")
    .replace(/100% stone-pressed/g, "premium stone-pressed")
    .replace(/100% Single-Origin Kernels/g, "Premium Single-Origin Kernels")
    .replace(/<span className="text-xl sm:text-2xl font-black text-\[#EFDB27\] dark:text-\[#FFD600\] block font-mono">100%<\/span>/g, '<span className="text-xl sm:text-2xl font-black text-[#EFDB27] dark:text-[#FFD600] block font-mono">Pure</span>');
});

// 12. preloadedProducts.json
updateFile("frontend/src/data/preloadedProducts.json", (code) => {
  return code
    .replace(/100% natural stone-pressed/gi, "Premium quality stone-pressed")
    .replace(/100% sulfur-free/gi, "sulfur-free")
    .replace(/100% edible and raw/gi, "edible and raw")
    .replace(/100% unadulterated/gi, "unadulterated")
    .replace(/100% Cold\/Stone Pressed/gi, "Premium Stone Pressed")
    .replace(/100% Stone Pressed/gi, "Premium Stone Pressed");
});

// 13. apply_seo_upgrades.js (keep it consistent)
updateFile("backend/scripts/apply_seo_upgrades.js", (code) => {
  return code
    .replace(/100% Pure/gi, "Premium Quality")
    .replace(/100% unrefined/gi, "premium quality unrefined");
});

console.log("All '100%' claims updated to 'Premium Quality' successfully!");
