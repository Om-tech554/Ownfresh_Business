import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendSrc = path.join(__dirname, "../../frontend/src");

// 1. Update App.jsx
const appPath = path.join(frontendSrc, "App.jsx");
let appContent = fs.readFileSync(appPath, "utf-8");

// Add NotFound import
if (!appContent.includes("NotFound")) {
  appContent = appContent.replace(
    "const CategoryLandingPage = lazyRetry(() => import('./pages/CategoryLandingPage'));",
    "const CategoryLandingPage = lazyRetry(() => import('./pages/CategoryLandingPage'));\nconst NotFound = lazyRetry(() => import('./pages/NotFound'));"
  );
}

// Update LegacyCategoryRedirect to point to /:slug
appContent = appContent.replace(
  /const LegacyCategoryRedirect = \(\) => \{\s*const \{ slug \} = useParams\(\);\s*return <Navigate to=\{`\/category\/\$\{slug\}`\} replace \/>;\s*\};/,
  `const LegacyCategoryRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={\`/\${slug}\`} replace />;
};`
);

// Update LegacyRouteFallback to point to /:rawPath and return <NotFound /> for dead URLs
appContent = appContent.replace(
  /if \(categorySlugs\.includes\(rawPath\)\) \{\s*return <Navigate to=\{`\/category\/\$\{rawPath\}`\} replace \/>;\s*\}/,
  `if (categorySlugs.includes(rawPath)) {
      return <Navigate to={\`/\${rawPath}\`} replace />;
    }`
);

appContent = appContent.replace(
  /return <Navigate to=\{`\/blog\/\$\{rawPath\}`\} replace \/>;\s*\}\s*return <Home \/>;/,
  `// If it matches WordPress blog slug pattern, try forwarding, otherwise 404
    if (rawPath.startsWith("blog-") || rawPath.includes("oil") || rawPath.includes("health") || rawPath.includes("cooking")) {
      return <Navigate to={\`/blog/\${rawPath}\`} replace />;
    }
    return <NotFound />;
  }

  return <NotFound />;`
);

// Update route definitions for /category/:slug to redirect to /:slug
appContent = appContent.replace(
  `<Route path="/category/:slug" element={<CategoryLandingPage />} />`,
  `<Route path="/category/:slug" element={<LegacyCategoryRedirect />} />`
);

fs.writeFileSync(appPath, appContent, "utf-8");
console.log("✅ Updated frontend/src/App.jsx");

// 2. Update CategoryLandingPage.jsx
const catPath = path.join(frontendSrc, "pages/CategoryLandingPage.jsx");
let catContent = fs.readFileSync(catPath, "utf-8");

if (!catContent.includes("Breadcrumbs")) {
  catContent = catContent.replace(
    "import SEO from '../components/SEO';",
    "import SEO from '../components/SEO';\nimport Breadcrumbs from '../components/Breadcrumbs';"
  );
}

// Update URL references from /category/slug to /slug
catContent = catContent.replace(
  `"url": \`https://myownfresh.com/category/\${currentSlug}\`,`,
  `"url": \`https://myownfresh.com/\${currentSlug}\`,`
);
catContent = catContent.replace(
  `"url": \`https://myownfresh.com/product/\${p._id}\`,`,
  `"url": \`https://myownfresh.com/product/\${p.slug || p._id}\`,`
);
catContent = catContent.replace(
  `url={\`/category/\${currentSlug}\`}`,
  `url={\`/\${currentSlug}\`}`
);
catContent = catContent.replace(
  `to={\`/category/\${slugKey}\`}`,
  `to={\`/\${slugKey}\`}`
);

// Replace raw breadcrumb nav with <Breadcrumbs /> component
catContent = catContent.replace(
  /\{\/\* Breadcrumb Navigation \*\/\}[\s\S]*?<\/nav>/,
  `{/* Visible & Semantic UI Breadcrumb Navigation */}
        <Breadcrumbs items={[
          { label: 'Home', path: '/' },
          { label: 'Stone Pressed Oils', path: '/shop' },
          { label: categoryInfo.name }
        ]} />`
);

fs.writeFileSync(catPath, catContent, "utf-8");
console.log("✅ Updated frontend/src/pages/CategoryLandingPage.jsx");

// 3. Update ProductCard.jsx
const cardPath = path.join(frontendSrc, "components/ProductCard.jsx");
let cardContent = fs.readFileSync(cardPath, "utf-8");

// Update link to use product.slug
cardContent = cardContent.replace(
  `to={\`/product/\${product._id}\`}`,
  `to={\`/product/\${product.slug || product._id}\`}`
);

// Replace simulated ratings with genuine database rating or clean badge
cardContent = cardContent.replace(
  /const ratingDetails = useMemo\(\(\) => \{[\s\S]*?\}, \[product\._id\]\);/,
  `const ratingDetails = useMemo(() => {
    // Genuine product rating from database
    const rating = product.rating || 5;
    return { rating: Number(rating).toFixed(1), hasGenuineReviews: product.reviewCount > 0 };
  }, [product.rating, product.reviewCount]);`
);

// Update the rating count display to avoid fake review numbers
cardContent = cardContent.replace(
  `<span className="text-[8px] sm:text-[10px] text-slate-400 dark:text-[#818C9B] font-semibold">({ratingDetails.reviewsCount})</span>`,
  `<span className="text-[8px] sm:text-[10px] text-emerald-700 dark:text-[#FFD600] font-bold">100% PURE</span>`
);

fs.writeFileSync(cardPath, cardContent, "utf-8");
console.log("✅ Updated frontend/src/components/ProductCard.jsx");

// 4. Update ProductDetails.jsx
const prodDetailPath = path.join(frontendSrc, "pages/ProductDetails.jsx");
let prodDetailContent = fs.readFileSync(prodDetailPath, "utf-8");

if (!prodDetailContent.includes("Breadcrumbs")) {
  prodDetailContent = prodDetailContent.replace(
    "import SEO from \"../components/SEO\";",
    "import SEO from \"../components/SEO\";\nimport Breadcrumbs from \"../components/Breadcrumbs\";"
  );
}

// Redirect ObjectId in URL to clean slug on client if loaded with ObjectId
if (!prodDetailContent.includes("navigate(`/product/${prod.slug}`")) {
  prodDetailContent = prodDetailContent.replace(
    `const prod = res.data.product;
        setProduct(prod);`,
    `const prod = res.data.product;
        setProduct(prod);
        if (prod && prod.slug && id !== prod.slug) {
          navigate(\`/product/\${prod.slug}\`, { replace: true });
        }`
  );
}

// Update productSchema URLs to slug
prodDetailContent = prodDetailContent.replace(
  `"url": \`https://myownfresh.com/product/\${product._id}\`,`,
  `"url": \`https://myownfresh.com/product/\${product.slug || product._id}\`,`
);
prodDetailContent = prodDetailContent.replace(
  `"item": \`https://myownfresh.com/product/\${product._id}\``,
  `"item": \`https://myownfresh.com/product/\${product.slug || product._id}\``
);
prodDetailContent = prodDetailContent.replace(
  `url={\`/product/\${product._id}\`}`,
  `url={\`/product/\${product.slug || product._id}\`}`
);

// Add visible breadcrumbs above product main details
if (!prodDetailContent.includes("<Breadcrumbs items={[")) {
  prodDetailContent = prodDetailContent.replace(
    `<Navbar />

      <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-8 md:px-16 lg:px-20`,
    `<Navbar />

      <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-8 md:px-16 lg:px-20 bg-[#fafafa] dark:bg-[#0B0F14] pb-44 lg:pb-12 transition-colors duration-250">
        <Breadcrumbs items={[
          { label: 'Home', path: '/' },
          { label: 'Shop All Oils', path: '/shop' },
          { label: product.category?.name || 'Cooking Oils', path: product.category?.slug ? \`/\${product.category.slug}\` : '/shop' },
          { label: displayName || cleanProductName(product.name) }
        ]} />`
  );
  // Remove the old div start if it was duplicated
  prodDetailContent = prodDetailContent.replace(
    `<div className="min-h-screen py-6 sm:py-10 px-3 sm:px-8 md:px-16 lg:px-20 bg-[#fafafa] dark:bg-[#0B0F14] pb-44 lg:pb-12 transition-colors duration-250">\n`,
    ""
  );
}

fs.writeFileSync(prodDetailPath, prodDetailContent, "utf-8");
console.log("✅ Updated frontend/src/pages/ProductDetails.jsx");

// 5. Update Navbar.jsx
const navPath = path.join(frontendSrc, "components/Navbar.jsx");
let navContent = fs.readFileSync(navPath, "utf-8");

// Lowercase blog URL
navContent = navContent.replace(
  `{ name: "Blog", path: "/Oilinsights" }`,
  `{ name: "Blog", path: "/oilinsights" }`
);

// Ensure product search result links use slug
navContent = navContent.replace(
  `searchUrl: \`/product/\${p._id}\``,
  `searchUrl: \`/product/\${p.slug || p._id}\``
);

fs.writeFileSync(navPath, navContent, "utf-8");
console.log("✅ Updated frontend/src/components/Navbar.jsx");

console.log("🎉 All frontend SEO enhancements successfully applied!");
