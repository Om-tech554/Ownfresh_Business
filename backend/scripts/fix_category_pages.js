import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");

console.log("Applying Category Page fixes: Removing double footer, removing almond oil, and placing perfect matching pictures...");

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

// 1. CategoryLandingPage.jsx
updateFile("frontend/src/pages/CategoryLandingPage.jsx", (code) => {
  let updated = code;

  // Remove Footer import from top
  updated = updated.replace(/import Footer from ['"]\.\.\/components\/Footer['"];?\r?\n?/, "");

  // Remove <Footer /> from bottom
  updated = updated.replace(/<Footer\s*\/>\s*<\/div>/, "</div>");

  // Remove almond-oil block completely from CATEGORY_DATA
  const almondRegex = /\s*"almond-oil":\s*\{[\s\S]*?\},(?=\s*"[a-z]+-oil":|\s*\};)/;
  updated = updated.replace(almondRegex, "");
  // In case it was the last item
  const almondRegexLast = /\s*"almond-oil":\s*\{[\s\S]*?\}(?=\s*\};)/;
  updated = updated.replace(almondRegexLast, "");

  // Update exact matching high-res product bottle pictures
  updated = updated.replace(
    /"groundnut-oil":\s*\{[\s\S]*?heroImage:\s*"[^"]*",/,
    (match) => match.replace(/heroImage:\s*"[^"]*"/, 'heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010997/products/Groundnut-3.png"')
  );

  updated = updated.replace(
    /"sesame-oil":\s*\{[\s\S]*?heroImage:\s*"[^"]*",/,
    (match) => match.replace(/heroImage:\s*"[^"]*"/, 'heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011005/products/sesame-3.png"')
  );

  updated = updated.replace(
    /"mustard-oil":\s*\{[\s\S]*?heroImage:\s*"[^"]*",/,
    (match) => match.replace(/heroImage:\s*"[^"]*"/, 'heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010978/products/Mustard-3.png"')
  );

  updated = updated.replace(
    /"coconut-oil":\s*\{[\s\S]*?heroImage:\s*"[^"]*",/,
    (match) => match.replace(/heroImage:\s*"[^"]*"/, 'heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786876701/products/coconut-3.png"')
  );

  updated = updated.replace(
    /"safflower-oil":\s*\{[\s\S]*?heroImage:\s*"[^"]*",/,
    (match) => match.replace(/heroImage:\s*"[^"]*"/, 'heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786877029/products/xqqbgwnyyslpumvaqoq1.png"')
  );

  updated = updated.replace(
    /"sunflower-oil":\s*\{[\s\S]*?heroImage:\s*"[^"]*",/,
    (match) => match.replace(/heroImage:\s*"[^"]*"/, 'heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010989/products/sunflower-3.png"')
  );

  // Upgrade the Hero Banner to display the matching bottle picture cleanly beside the title
  const oldHeroBlockRegex = /\{\/\* Hero Section \*\/\}[\s\S]*?\{\/\* Category Selector Tabs \*\/\}/;
  const newHeroBlock = `{/* Hero Section with Perfect Matching Product Bottle Picture */}
        <div className="bg-gradient-to-br from-[#1E971D] via-[#167415] to-[#125511] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden mb-12">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#FFDD00]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/25 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest text-[#FFDD00] border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                {categoryInfo.badge}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {categoryInfo.name}
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-medium">
                {categoryInfo.tagline}
              </p>

              <p className="text-sm text-emerald-50/80 leading-relaxed max-w-2xl pt-2">
                {categoryInfo.intro}
              </p>

              {/* Value Badges */}
              <div className="pt-4 flex flex-wrap gap-2.5 sm:gap-3 text-xs font-bold">
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
                  <ShieldCheck className="w-4 h-4 text-[#FFDD00]" /> Authentic Stone Pressed
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
                  <Droplets className="w-4 h-4 text-[#FFDD00]" /> Unrefined & Chemical Free
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
                  <Award className="w-4 h-4 text-[#FFDD00]" /> Free Delivery on ₹1,000+
                </span>
              </div>
            </div>

            {/* Right Picture Showcase (4 cols on desktop) */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-48 sm:w-56 lg:w-64 aspect-square bg-white/15 dark:bg-black/30 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-white/20 shadow-2xl flex flex-col items-center justify-center group overflow-hidden">
                <img
                  src={categoryInfo.heroImage}
                  alt={categoryInfo.name}
                  className="max-h-[82%] max-w-[82%] object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-105"
                />
                <span className="mt-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-[#FFDD00] border border-white/10 truncate max-w-[90%]">
                  {categoryInfo.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Selector Tabs */}`;

  updated = updated.replace(oldHeroBlockRegex, newHeroBlock);
  return updated;
});

// 2. App.jsx - remove /almond-oil route
updateFile("frontend/src/App.jsx", (code) => {
  return code.replace(/\s*<Route path="\/almond-oil" element=\{<CategoryLandingPage defaultCategory="Almond Oil" \/>\} \/>/, "");
});

// 3. Footer.jsx - remove Sweet Almond Oil from stone-pressed footer links
updateFile("frontend/src/components/Footer.jsx", (code) => {
  return code.replace(/\s*\{\s*name:\s*"Sweet Almond Oil",\s*path:\s*"\/almond-oil"\s*\},?/, "");
});

// 4. index.html - remove Sweet Almond Oil from crawler nav
updateFile("frontend/index.html", (code) => {
  return code.replace(/\s*<a href="\/almond-oil"[^>]*>Sweet Almond Oil<\/a>\s*•?/, "");
});

// 5. public/sitemap.xml - remove /almond-oil
updateFile("frontend/public/sitemap.xml", (code) => {
  return code.replace(/\s*<url>\s*<loc>https:\/\/myownfresh\.com\/almond-oil<\/loc>[\s\S]*?<\/url>/, "");
});

// 6. backend/routes/sitemapRoutes.js - remove /almond-oil
updateFile("backend/routes/sitemapRoutes.js", (code) => {
  return code.replace(/\s*\{\s*path:\s*"\/almond-oil",\s*priority:\s*"0\.8",\s*changefreq:\s*"weekly"\s*\},?/, "");
});

console.log("All requested fixes applied successfully!");
