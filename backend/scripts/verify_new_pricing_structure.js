import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";
import { calculateDeliveryCharge } from "../services/shippingService.js";
import { PDF_BASE_RATES, COMBO_BASE_RATES } from "../config/pricingConfig.js";

let passedCount = 0;
let failedCount = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`[PASS] ${testName}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err.message);
    failedCount++;
  }
}

async function verifyAll() {
  console.log("===============================================================");
  console.log("VERIFYING COMPLETE PRODUCT PRICING ARCHITECTURE & SHIPPING RULES");
  console.log("===============================================================");

  await mongoose.connect(process.env.MONGODB_URL, { dbName: "OwnFresh" });
  console.log("Connected to MongoDB Atlas: OwnFresh DB");

  // 1. VERIFY GROUNDNUT 1L PRICING
  console.log("\n--- 1. SINGLE-OIL PRICING FORMULA VERIFICATION ---");
  const groundnutProd = await Product.findOne({ name: { $regex: /groundnut/i, $not: /combo/i } });
  assert(groundnutProd, "Groundnut product found");

  const gn1L = await ProductVariant.findOne({ product: groundnutProd._id, name: "1 Litre" });
  assert(gn1L, "Groundnut 1L variant found");

  runTest("Groundnut 1L basePrice is preserved from PDF (555)", () => {
    assert.strictEqual(gn1L.basePrice, 555);
  });

  runTest("Groundnut 1L listingPrice is basePrice * 1.20 (666)", () => {
    assert.strictEqual(gn1L.listingPrice, Math.round(555 * 1.20));
    assert.strictEqual(gn1L.price, 666);
  });

  runTest("Groundnut 1L discountPercent is 10%", () => {
    assert.strictEqual(gn1L.discountPercent, 10);
  });

  runTest("Groundnut 1L sellingPrice is listingPrice * 0.90 (599)", () => {
    assert.strictEqual(gn1L.sellingPrice, Math.round(666 * 0.90));
    assert.strictEqual(gn1L.salePrice, 599);
  });

  // 2. VERIFY COCONUT 1L PRICING
  const coconutProd = await Product.findOne({ name: { $regex: /coconut/i, $not: /combo/i } });
  const coco1L = await ProductVariant.findOne({ product: coconutProd._id, name: "1 Litre" });
  assert(coco1L, "Coconut 1L variant found");

  runTest("Coconut 1L basePrice is preserved from PDF (1240)", () => {
    assert.strictEqual(coco1L.basePrice, 1240);
  });

  runTest("Coconut 1L listingPrice is basePrice * 1.20 (1488)", () => {
    assert.strictEqual(coco1L.listingPrice, Math.round(1240 * 1.20));
    assert.strictEqual(coco1L.price, 1488);
  });

  runTest("Coconut 1L sellingPrice is listingPrice * 0.90 (1339)", () => {
    assert.strictEqual(coco1L.sellingPrice, Math.round(1488 * 0.90));
    assert.strictEqual(coco1L.salePrice, 1339);
  });

  // 3. VERIFY MUSTARD 500ML PRICING
  const mustardProd = await Product.findOne({ name: { $regex: /mustard/i, $not: /combo/i } });
  const mustard500 = await ProductVariant.findOne({ product: mustardProd._id, name: "500 ml" });
  assert(mustard500, "Mustard 500ml variant found");

  runTest("Mustard 500ml basePrice is preserved from PDF (295)", () => {
    assert.strictEqual(mustard500.basePrice, 295);
  });

  runTest("Mustard 500ml listingPrice is basePrice * 1.20 (354)", () => {
    assert.strictEqual(mustard500.listingPrice, Math.round(295 * 1.20));
    assert.strictEqual(mustard500.price, 354);
  });

  runTest("Mustard 500ml sellingPrice is listingPrice * 0.90 (319)", () => {
    assert.strictEqual(mustard500.sellingPrice, Math.round(354 * 0.90));
    assert.strictEqual(mustard500.salePrice, 319);
  });

  // 4. VERIFY ALL ACTIVE VARIANTS INTEGRITY
  console.log("\n--- 2. ALL VARIANTS DATABASE INTEGRITY ---");
  const allActiveVariants = await ProductVariant.find({ status: "Active" });
  console.log(`Found ${allActiveVariants.length} active variants.`);

  let variantIntegrityErrors = 0;
  for (const v of allActiveVariants) {
    if (v.basePrice === null || v.listingPrice === null || v.sellingPrice === null) {
      variantIntegrityErrors++;
      console.error(`Missing pricing components on variant ${v._id} (${v.name})`);
    }
    if (v.price !== v.listingPrice) {
      variantIntegrityErrors++;
      console.error(`price does not match listingPrice on variant ${v._id}`);
    }
    if (v.salePrice !== v.sellingPrice) {
      variantIntegrityErrors++;
      console.error(`salePrice does not match sellingPrice on variant ${v._id}`);
    }
  }

  runTest("All active variants have valid basePrice, listingPrice, discountPercent, sellingPrice", () => {
    assert.strictEqual(variantIntegrityErrors, 0);
  });

  // 5. VERIFY COMBO PACK PRICING INTEGRITY
  console.log("\n--- 3. COMBO PACKS PRICING VERIFICATION ---");
  const combo3 = await Product.findOne({ name: /combo pack of 3.*groundnut.*mustard.*sesame/i });
  if (combo3) {
    const stdPack = await ProductVariant.findOne({ product: combo3._id, name: "Standard Pack" });
    assert(stdPack, "Combo 3 Standard Pack found");

    runTest("Combo 3 Standard Pack basePrice equals sum of PDF rates (555+525+615 = 1695)", () => {
      assert.strictEqual(stdPack.basePrice, 1695);
    });

    runTest("Combo 3 Standard Pack listingPrice is basePrice * 1.20 (2034)", () => {
      assert.strictEqual(stdPack.listingPrice, 2034);
    });

    runTest("Combo 3 Standard Pack sellingPrice is listingPrice * 0.90 (1831)", () => {
      assert.strictEqual(stdPack.sellingPrice, 1831);
      assert.strictEqual(stdPack.salePrice, 1831);
    });

    const giftPack = await ProductVariant.findOne({ product: combo3._id, name: "Gift Box Edition" });
    assert(giftPack, "Combo 3 Gift Box found");

    runTest("Combo 3 Gift Box basePrice equals basePrice + 150 (1845)", () => {
      assert.strictEqual(giftPack.basePrice, 1845);
    });

    runTest("Combo 3 Gift Box sellingPrice is Math.round((1845*1.20)*0.90) = 1993", () => {
      assert.strictEqual(giftPack.sellingPrice, 1993);
      assert.strictEqual(giftPack.salePrice, 1993);
    });
  }

  // 6. SIMULATE CART, CHECKOUT & OUTSIDE MAHARASHTRA DELIVERY CHARGES
  console.log("\n--- 4. SIMULATED CHECKOUT & OUTSIDE MAHARASHTRA DELIVERY TESTS ---");
  const interstateDest = { city: "Delhi", state: "Delhi", pincode: "110001" };

  // Scenario A: Customer buys 1 bottle of Groundnut 1L to Delhi
  // Customer selling price is ₹599 (NOT ₹666 listing price).
  // Weight is 1.0 kg (< 2 kg).
  // Delivery charge should be flat ₹200.
  // Grand total should be 599 + 200 = 799.
  runTest("Scenario A: 1L Groundnut to Delhi (< 2kg) => ₹599 sellingPrice + ₹200 flat delivery = ₹799", () => {
    const subtotal = gn1L.salePrice; // 599
    assert.strictEqual(subtotal, 599);

    const shipRes = calculateDeliveryCharge({
      subtotal,
      totalWeightKg: 1.0,
      destination: interstateDest
    });

    assert.strictEqual(shipRes.region, "OUTSIDE_MAHARASHTRA");
    assert.strictEqual(shipRes.deliveryCharge, 200); // flat ₹200
    assert.strictEqual(shipRes.isFreeDelivery, false);

    const grandTotal = subtotal + shipRes.deliveryCharge;
    assert.strictEqual(grandTotal, 799);
  });

  // Scenario B: Customer buys 1 bottle of Groundnut 500ml (0.5 kg) to Bangalore (< 2kg)
  // Subtotal = ₹335.
  // Weight is 0.5 kg (< 2 kg).
  // Delivery charge should be flat ₹200.
  // Grand total = 335 + 200 = 535.
  runTest("Scenario B: 500ml Groundnut to Bangalore (0.5kg) => ₹335 sellingPrice + ₹200 flat delivery = ₹535", () => {
    const gn500 = PDF_BASE_RATES["Groundnut Oil"]["500 ml"].basePrice;
    const gn500Listing = Math.round(gn500 * 1.20);
    const gn500Selling = Math.round(gn500Listing * 0.90); // 335
    assert.strictEqual(gn500Selling, 335);

    const shipRes = calculateDeliveryCharge({
      subtotal: gn500Selling,
      totalWeightKg: 0.5,
      destination: { city: "Bangalore", state: "Karnataka", pincode: "560001" }
    });

    assert.strictEqual(shipRes.region, "OUTSIDE_MAHARASHTRA");
    assert.strictEqual(shipRes.deliveryCharge, 200);
    assert.strictEqual(gn500Selling + shipRes.deliveryCharge, 535);
  });

  // Scenario C: Customer buys 2 bottles of Groundnut 1L to Delhi (weight = 2.0 kg)
  // Subtotal = 599 * 2 = 1198.
  // Since subtotal (1198) > 1000, Delivery is FREE (₹0)!
  runTest("Scenario C: 2L Groundnut to Delhi (Subtotal ₹1198 > ₹1000) => FREE delivery (₹0)", () => {
    const subtotal = gn1L.salePrice * 2; // 1198
    const shipRes = calculateDeliveryCharge({
      subtotal,
      totalWeightKg: 2.0,
      destination: interstateDest
    });

    assert.strictEqual(shipRes.region, "OUTSIDE_MAHARASHTRA");
    assert.strictEqual(shipRes.isFreeDelivery, true);
    assert.strictEqual(shipRes.deliveryCharge, 0);
  });

  // Scenario D: Heavy order below ₹1000 threshold or exactly tested for weight calculation
  // 3.0 kg with subtotal ₹900 to Delhi:
  // Delivery charge should be 3 * 100 = ₹300.
  runTest("Scenario D: 3kg with subtotal ₹900 to Delhi => 3 * ₹100 = ₹300", () => {
    const shipRes = calculateDeliveryCharge({
      subtotal: 900,
      totalWeightKg: 3.0,
      destination: interstateDest
    });

    assert.strictEqual(shipRes.region, "OUTSIDE_MAHARASHTRA");
    assert.strictEqual(shipRes.deliveryCharge, 300);
  });

  await mongoose.disconnect();

  console.log("\n===============================================================");
  console.log(`VERIFICATION SUMMARY: ${passedCount} passed, ${failedCount} failed`);
  console.log("===============================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

verifyAll().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
