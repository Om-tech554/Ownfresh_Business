import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });
import express from 'express';
import http from 'http';
import axios from 'axios';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/productModel.js';
import Blog from '../models/blogModel.js';
import sitemapRoutes from '../routes/sitemapRoutes.js';
import { seoMiddleware } from '../middleware/seoMiddleware.js';
import fs from 'fs';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 OWN FRESH PRODUCTION SEO & GOOGLE INDEXING TEST SUITE');
  console.log('====================================================\n');

  await connectDB();

  // Spin up an Express test server with exact production SEO middleware
  const app = express();
  app.use('/', sitemapRoutes);

  const frontendDist = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist, { index: false }));
  }

  app.use(seoMiddleware);

  const testPort = 5055;
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(testPort, resolve));
  const baseUrl = `http://localhost:${testPort}`;
  console.log(`📡 Test server running at ${baseUrl}\n`);

  const client = axios.create({
    baseURL: baseUrl,
    maxRedirects: 0,
    validateStatus: () => true
  });

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details ? '— ' + details : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: HOMEPAGE METADATA & SSR PRERENDER
    // -------------------------------------------------------------
    console.log('--- TEST GROUP 1: Homepage Prerendering & Metadata ---');
    const homeRes = await client.get('/');
    assert(homeRes.status === 200, 'Homepage returns HTTP 200');
    assert(homeRes.data.includes('<title>Stone Pressed Oil India | Traditional Granite Churned Oils | OwnFresh</title>'), 'Homepage title is present in raw HTML');
    assert(homeRes.data.includes('rel="canonical" href="https://myownfresh.com/"'), 'Homepage canonical points to https://myownfresh.com/');
    assert(homeRes.data.includes('OWNFRESH AGRO INDUSTRIES'), 'Homepage includes verified Pune Organization legalName');
    assert(!homeRes.data.includes('http://localhost'), 'Homepage raw HTML contains NO localhost URLs');

    // -------------------------------------------------------------
    // TEST 2: CANONICAL CATEGORY PAGES & 301 REDIRECTS
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Category Architecture & 301 Redirects ---');
    const categories = [
      'groundnut-oil',
      'mustard-oil',
      'sesame-oil',
      'coconut-oil',
      'safflower-oil',
      'sunflower-oil'
    ];

    for (const cat of categories) {
      const res = await client.get(`/${cat}`);
      assert(res.status === 200, `Category /${cat} returns HTTP 200`);
      assert(res.data.includes(`rel="canonical" href="https://myownfresh.com/${cat}"`), `Category /${cat} canonical is valid`);
      assert(res.data.includes('<h1'), `Category /${cat} contains semantic <h1> in raw HTML`);
      assert(res.data.includes('BreadcrumbList'), `Category /${cat} has BreadcrumbList structured data`);
    }

    // Test 301 redirects from duplicate category routes
    const catRedirect1 = await client.get('/category/groundnut-oil');
    assert(catRedirect1.status === 301, 'GET /category/groundnut-oil returns HTTP 301');
    assert(catRedirect1.headers.location === '/groundnut-oil', 'Redirect location is /groundnut-oil');

    const catRedirect2 = await client.get('/product-category/mustard-oil');
    assert(catRedirect2.status === 301, 'GET /product-category/mustard-oil returns HTTP 301');
    assert(catRedirect2.headers.location === '/mustard-oil', 'Redirect location is /mustard-oil');

    // Test trailing slash redirect
    const slashRedirect = await client.get('/groundnut-oil/');
    assert(slashRedirect.status === 301, 'Trailing slash /groundnut-oil/ returns HTTP 301');
    assert(slashRedirect.headers.location === '/groundnut-oil', 'Trailing slash redirects to normalized URL');

    // -------------------------------------------------------------
    // TEST 3: PRODUCT SLUG RESOLUTION & LEGACY OBJECTID 301 REDIRECT
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Product Slug System & ObjectId 301 Redirects ---');
    const sampleProduct = await Product.findOne({ slug: { $exists: true, $ne: '' } }).lean();
    if (sampleProduct) {
      const slugRes = await client.get(`/product/${sampleProduct.slug}`);
      assert(slugRes.status === 200, `Product slug /product/${sampleProduct.slug} returns HTTP 200`);
      assert(slugRes.data.includes(`rel="canonical" href="https://myownfresh.com/product/${sampleProduct.slug}"`), 'Product canonical points to slug URL');
      assert(slugRes.data.includes('"@type": "Product"') || slugRes.data.includes('"@type":"Product"'), 'Product JSON-LD schema is present');
      assert(slugRes.data.includes('BreadcrumbList'), 'Product has BreadcrumbList schema');

      // Test ObjectId 301 redirect
      const idRes = await client.get(`/product/${sampleProduct._id.toString()}`);
      assert(idRes.status === 301, `Legacy ObjectId /product/${sampleProduct._id} returns HTTP 301 redirect`);
      assert(idRes.headers.location === `/product/${sampleProduct.slug}`, `ObjectId redirects directly to canonical slug /product/${sampleProduct.slug}`);
    } else {
      console.warn('⚠️ No products found with slug for test 3');
    }

    // -------------------------------------------------------------
    // TEST 4: BLOG ARTICLES PRERENDER & METADATA
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Blog Articles & Content SEO ---');
    const sampleBlog = await Blog.findOne({ $or: [{ status: 'LIVE' }, { status: 'Published' }, { isPublished: true }] }).lean();
    if (sampleBlog) {
      const blogRes = await client.get(`/blog/${sampleBlog.slug}`);
      assert(blogRes.status === 200, `Blog /blog/${sampleBlog.slug} returns HTTP 200`);
      assert(blogRes.data.includes(`rel="canonical" href="https://myownfresh.com/blog/${sampleBlog.slug}"`), 'Blog canonical URL is accurate');
      assert(blogRes.data.includes('"@type": "Article"') || blogRes.data.includes('"@type":"Article"'), 'Article JSON-LD schema is present');
      assert(blogRes.data.includes('BreadcrumbList'), 'Blog has BreadcrumbList schema');
    } else {
      console.warn('⚠️ No published blogs found for test 4');
    }

    // -------------------------------------------------------------
    // TEST 5: TRUE HTTP 404 STATUS FOR NON-EXISTENT RESOURCES (NO SOFT 404)
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 5: True HTTP 404 Status Handling (Eliminating Soft 404s) ---');
    const missingPage = await client.get('/this-page-does-not-exist-xyz123');
    assert(missingPage.status === 404, 'Non-existent path returns true HTTP 404');
    assert(missingPage.data.includes('404 Page Not Found') || missingPage.data.includes('<h1>404</h1>'), 'Returns branded helpful 404 page content');
    assert(missingPage.data.includes('<meta name="robots" content="noindex, nofollow" />'), '404 page has noindex, nofollow robots meta tag');

    const missingProduct = await client.get('/product/completely-invalid-slug-99999');
    assert(missingProduct.status === 404, 'Non-existent product returns true HTTP 404');

    const missingBlog = await client.get('/blog/completely-invalid-blog-99999');
    assert(missingBlog.status === 404, 'Non-existent blog returns true HTTP 404');

    // -------------------------------------------------------------
    // TEST 6: SITEMAP.XML & ROBOTS.TXT
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 6: Single Authoritative XML Sitemap & Robots.txt ---');
    const sitemapRes = await client.get('/sitemap.xml');
    assert(sitemapRes.status === 200, '/sitemap.xml returns HTTP 200');
    assert(sitemapRes.headers['content-type'].includes('xml'), '/sitemap.xml has XML content-type');
    assert(sitemapRes.data.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Sitemap is valid XML format');
    assert(sitemapRes.data.includes('https://myownfresh.com/groundnut-oil'), 'Sitemap contains canonical category URL');
    assert(!sitemapRes.data.includes('/category/'), 'Sitemap contains ZERO duplicate /category/ URLs');
    assert(!sitemapRes.data.includes('/product/6'), 'Sitemap contains ZERO 24-character ObjectId URLs');
    assert(!sitemapRes.data.includes('/cart'), 'Sitemap contains ZERO private /cart URLs');
    assert(!sitemapRes.data.includes('/checkout'), 'Sitemap contains ZERO private /checkout URLs');
    assert(!sitemapRes.data.includes('/admin'), 'Sitemap contains ZERO private /admin URLs');

    const robotsRes = await client.get('/robots.txt');
    assert(robotsRes.status === 200, '/robots.txt returns HTTP 200');
    assert(robotsRes.data.includes('Sitemap: https://myownfresh.com/sitemap.xml'), 'robots.txt specifies canonical sitemap URL');
    assert(robotsRes.data.includes('Disallow: /admin'), 'robots.txt blocks /admin');
    assert(robotsRes.data.includes('Disallow: /checkout'), 'robots.txt blocks /checkout');
    assert(robotsRes.data.includes('Disallow: /cart'), 'robots.txt blocks /cart');

    // -------------------------------------------------------------
    // TEST 7: STRUCTURED DATA ENTITY SEPARATION (ZERO FAKE REVIEWS)
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 7: Schema Entity Separation & Zero Fake Ratings ---');
    // Ensure category page does NOT have duplicate Organization
    const catPageHtml = (await client.get('/mustard-oil')).data;
    const orgMatches = (catPageHtml.match(/"@type":\s*"Organization"/g) || []).length;
    assert(orgMatches <= 1, `Category page does not duplicate Organization schema (count: ${orgMatches})`);

    // Ensure products without reviews do NOT have AggregateRating
    const allProducts = await Product.find({ slug: { $exists: true } }).lean();
    let fakeRatingFound = false;
    for (const p of allProducts.slice(0, 5)) {
      const pRes = await client.get(`/product/${p.slug}`);
      if (!p.reviewCount || p.reviewCount === 0) {
        if (pRes.data.includes('"@type": "AggregateRating"')) {
          fakeRatingFound = true;
        }
      }
    }
    assert(!fakeRatingFound, 'Products without genuine customer reviews have NO AggregateRating schema');

    console.log('\n====================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('💥 Test suite crashed with error:', err);
    failed++;
  } finally {
    server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTestSuite();
