import assert from 'assert';
import {
  determineDeliveryRegion,
  calculateDeliveryCharge,
  inferVariantWeightKg,
  normalizeWeight,
  PUNE_DELIVERY_CONFIG
} from '../services/shippingService.js';

console.log('===============================================================');
console.log('DESTINATION-BASED SHIPPING & DELIVERY ENGINE VERIFICATION SUITE');
console.log('===============================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(description, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`[PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${description}`);
    console.error(`       Error: ${err.message}`);
  }
}

// ----------------------------------------------------------------------------
// 1. DESTINATION DETECTION TESTS (Section 23 of Business Requirements)
// ----------------------------------------------------------------------------
console.log('--- 1. DESTINATION DETECTION INDEPENDENT OF CUSTOMER CURRENT LOCATION ---');

// TEST 1: Customer Current: Bangalore -> Selected Delivery: Mumbai
runTest('TEST 1: Bangalore customer -> Mumbai destination => MAHARASHTRA_OUTSIDE_PUNE', () => {
  const destination = {
    address: 'Marine Drive, Nariman Point',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400021',
    latitude: 18.9220,
    longitude: 72.8223
  };
  const region = determineDeliveryRegion(destination);
  assert.strictEqual(region, 'MAHARASHTRA_OUTSIDE_PUNE');
});

// TEST 2: Customer Current: Bangalore -> Selected Delivery: Pune (within 30 km range)
runTest('TEST 2: Bangalore customer -> Pune destination (Kothrud) => PUNE', () => {
  const destination = {
    address: 'Near MIT College, Paud Road, Kothrud',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411038',
    latitude: 18.5074,
    longitude: 73.8077 // ~7 km from center
  };
  const region = determineDeliveryRegion(destination);
  assert.strictEqual(region, 'PUNE');
});

// TEST 3: Customer Current: Delhi -> Selected Delivery: Pune
runTest('TEST 3: Delhi customer -> Pune destination (Hinjewadi) => PUNE', () => {
  const destination = {
    address: 'Phase 1, Rajiv Gandhi Infotech Park, Hinjawadi',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    latitude: 18.5913,
    longitude: 73.7389 // ~18 km from center
  };
  const region = determineDeliveryRegion(destination);
  assert.strictEqual(region, 'PUNE');
});

// TEST 4: Customer Current: Pune -> Selected Delivery: Nashik
runTest('TEST 4: Pune customer -> Nashik destination => MAHARASHTRA_OUTSIDE_PUNE', () => {
  const destination = {
    address: 'College Road, Gangapur Road',
    city: 'Nashik',
    state: 'Maharashtra',
    pincode: '422005',
    latitude: 19.9975,
    longitude: 73.7898 // ~175 km from center
  };
  const region = determineDeliveryRegion(destination);
  assert.strictEqual(region, 'MAHARASHTRA_OUTSIDE_PUNE');
});

// TEST 5: Customer Current: Mumbai -> Selected Delivery: Nagpur
runTest('TEST 5: Mumbai customer -> Nagpur destination => MAHARASHTRA_OUTSIDE_PUNE', () => {
  const destination = {
    address: 'Civil Lines, Dharampeth',
    city: 'Nagpur',
    state: 'Maharashtra',
    pincode: '440001',
    latitude: 21.1458,
    longitude: 79.0882 // ~600 km from center
  };
  const region = determineDeliveryRegion(destination);
  assert.strictEqual(region, 'MAHARASHTRA_OUTSIDE_PUNE');
});

// TEST 6: Customer Current: Pune -> Selected Delivery: Delhi
runTest('TEST 6: Pune customer -> Delhi destination => OUTSIDE_MAHARASHTRA', () => {
  const destination = {
    address: 'Connaught Place, Barakhamba',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    latitude: 28.6315,
    longitude: 77.2167
  };
  const region = determineDeliveryRegion(destination);
  assert.strictEqual(region, 'OUTSIDE_MAHARASHTRA');
});

// ----------------------------------------------------------------------------
// 2. DELIVERY CALCULATION TESTS (Section 24 of Business Requirements)
// ----------------------------------------------------------------------------
console.log('\n--- 2. PUNE LOCAL DELIVERY CALCULATION TESTS ---');

const puneDest = {
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '411041',
  latitude: 18.4485,
  longitude: 73.8183
};

runTest('PUNE: 0.25 kg + ₹500 => ₹200 minimum charge', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 0.25, destination: puneDest });
  assert.strictEqual(res.deliveryCharge, 200);
  assert.strictEqual(res.region, 'PUNE');
  assert.strictEqual(res.deliveryMethod, 'LOCAL');
});

runTest('PUNE: 0.5 kg + ₹500 => ₹200 minimum charge', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 0.5, destination: puneDest });
  assert.strictEqual(res.deliveryCharge, 200);
});

runTest('PUNE: 1 kg + ₹500 => ₹200 minimum charge', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 1.0, destination: puneDest });
  assert.strictEqual(res.deliveryCharge, 200);
});

runTest('PUNE: 1.5 kg + ₹900 => ₹200 minimum charge', () => {
  const res = calculateDeliveryCharge({ subtotal: 900, totalWeightKg: 1.5, destination: puneDest });
  assert.strictEqual(res.deliveryCharge, 200);
});

runTest('PUNE: 1.99 kg + ₹900 => ₹200 minimum charge', () => {
  const res = calculateDeliveryCharge({ subtotal: 900, totalWeightKg: 1.99, destination: puneDest });
  assert.strictEqual(res.deliveryCharge, 200);
});

runTest('PUNE: 2 kg + ₹900 => 2 * 70 = ₹140', () => {
  const res = calculateDeliveryCharge({ subtotal: 900, totalWeightKg: 2.0, destination: puneDest });
  assert.strictEqual(res.deliveryCharge, 140);
});

runTest('PUNE: 3 kg + ₹900 => 3 * 70 = ₹210', () => {
  const res = calculateDeliveryCharge({ subtotal: 900, totalWeightKg: 3.0, destination: puneDest });
  assert.strictEqual(res.deliveryCharge, 210);
});

runTest('PUNE: 5 kg + ₹900 => 5 * 70 = ₹350', () => {
  const res = calculateDeliveryCharge({ subtotal: 900, totalWeightKg: 5.0, destination: puneDest });
  assert.strictEqual(res.deliveryCharge, 350);
});

runTest('PUNE: 1 kg + ₹1,000 EXACT => ₹200 (₹1,000 exactly is NOT free)', () => {
  const res = calculateDeliveryCharge({ subtotal: 1000, totalWeightKg: 1.0, destination: puneDest });
  assert.strictEqual(res.deliveryCharge, 200);
  assert.strictEqual(res.isFreeDelivery, false);
  assert.strictEqual(res.amountNeededForFreeDelivery, 1);
});

runTest('PUNE: 1 kg + ₹1,001 => ₹0 (Subtotal > ₹1,000 is FREE)', () => {
  const res = calculateDeliveryCharge({ subtotal: 1001, totalWeightKg: 1.0, destination: puneDest });
  assert.strictEqual(res.deliveryCharge, 0);
  assert.strictEqual(res.isFreeDelivery, true);
  assert.strictEqual(res.amountNeededForFreeDelivery, 0);
});

console.log('\n--- 3. MAHARASHTRA OUTSIDE PUNE COURIER DELIVERY TESTS ---');

const mhDest = {
  city: 'Nashik',
  state: 'Maharashtra',
  pincode: '422001',
  latitude: 19.9975,
  longitude: 73.7898
};

runTest('MAHARASHTRA_OUTSIDE_PUNE: 0.25 kg + ₹500 => ceil(0.25)=1kg => ₹100', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 0.25, destination: mhDest });
  assert.strictEqual(res.deliveryCharge, 100);
  assert.strictEqual(res.chargeableWeightKg, 1);
  assert.strictEqual(res.deliveryMethod, 'COURIER');
});

runTest('MAHARASHTRA_OUTSIDE_PUNE: 0.5 kg + ₹500 => ceil(0.5)=1kg => ₹100', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 0.5, destination: mhDest });
  assert.strictEqual(res.deliveryCharge, 100);
});

runTest('MAHARASHTRA_OUTSIDE_PUNE: 1 kg + ₹500 => 1kg => ₹100', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 1.0, destination: mhDest });
  assert.strictEqual(res.deliveryCharge, 100);
});

runTest('MAHARASHTRA_OUTSIDE_PUNE: 1.1 kg + ₹500 => ceil(1.1)=2kg => ₹200', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 1.1, destination: mhDest });
  assert.strictEqual(res.deliveryCharge, 200);
  assert.strictEqual(res.chargeableWeightKg, 2);
});

runTest('MAHARASHTRA_OUTSIDE_PUNE: 1.5 kg + ₹500 => ceil(1.5)=2kg => ₹200', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 1.5, destination: mhDest });
  assert.strictEqual(res.deliveryCharge, 200);
});

runTest('MAHARASHTRA_OUTSIDE_PUNE: 1.99 kg + ₹500 => ceil(1.99)=2kg => ₹200', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 1.99, destination: mhDest });
  assert.strictEqual(res.deliveryCharge, 200);
});

runTest('MAHARASHTRA_OUTSIDE_PUNE: 2 kg + ₹500 => 2kg => ₹200', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 2.0, destination: mhDest });
  assert.strictEqual(res.deliveryCharge, 200);
});

runTest('MAHARASHTRA_OUTSIDE_PUNE: 2.1 kg + ₹500 => ceil(2.1)=3kg => ₹300', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 2.1, destination: mhDest });
  assert.strictEqual(res.deliveryCharge, 300);
  assert.strictEqual(res.chargeableWeightKg, 3);
});

runTest('MAHARASHTRA_OUTSIDE_PUNE: 3 kg + ₹500 => 3kg => ₹300', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 3.0, destination: mhDest });
  assert.strictEqual(res.deliveryCharge, 300);
});

runTest('MAHARASHTRA_OUTSIDE_PUNE: 3 kg + ₹1,001 => ₹0 (Subtotal > ₹1,000 is FREE)', () => {
  const res = calculateDeliveryCharge({ subtotal: 1001, totalWeightKg: 3.0, destination: mhDest });
  assert.strictEqual(res.deliveryCharge, 0);
  assert.strictEqual(res.isFreeDelivery, true);
});

console.log('\n--- 4. OUTSIDE MAHARASHTRA INTERSTATE COURIER TESTS ---');

const interstateDest = {
  city: 'Delhi',
  state: 'Delhi',
  pincode: '110001',
  latitude: 28.6139,
  longitude: 77.2090
};

runTest('OUTSIDE_MAHARASHTRA: 0.5 kg + ₹500 => < 2kg => flat ₹200', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 0.5, destination: interstateDest });
  assert.strictEqual(res.deliveryCharge, 200);
  assert.strictEqual(res.region, 'OUTSIDE_MAHARASHTRA');
});

runTest('OUTSIDE_MAHARASHTRA: 1 kg + ₹500 => < 2kg => flat ₹200', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 1.0, destination: interstateDest });
  assert.strictEqual(res.deliveryCharge, 200);
});

runTest('OUTSIDE_MAHARASHTRA: 1.5 kg + ₹500 => < 2kg => flat ₹200', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 1.5, destination: interstateDest });
  assert.strictEqual(res.deliveryCharge, 200);
});

runTest('OUTSIDE_MAHARASHTRA: 1.99 kg + ₹500 => < 2kg => flat ₹200', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 1.99, destination: interstateDest });
  assert.strictEqual(res.deliveryCharge, 200);
});

runTest('OUTSIDE_MAHARASHTRA: 2 kg + ₹500 => 2kg => ₹200 (₹100/kg)', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 2.0, destination: interstateDest });
  assert.strictEqual(res.deliveryCharge, 200);
});

runTest('OUTSIDE_MAHARASHTRA: 2.1 kg + ₹500 => ceil(2.1)=3kg => ₹300', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 2.1, destination: interstateDest });
  assert.strictEqual(res.deliveryCharge, 300);
});

runTest('OUTSIDE_MAHARASHTRA: 3 kg + ₹500 => 3kg => ₹300', () => {
  const res = calculateDeliveryCharge({ subtotal: 500, totalWeightKg: 3.0, destination: interstateDest });
  assert.strictEqual(res.deliveryCharge, 300);
});

runTest('OUTSIDE_MAHARASHTRA: 3 kg + ₹1,001 => ₹0 (Subtotal > ₹1,000 is FREE)', () => {
  const res = calculateDeliveryCharge({ subtotal: 1001, totalWeightKg: 3.0, destination: interstateDest });
  assert.strictEqual(res.deliveryCharge, 0);
  assert.strictEqual(res.isFreeDelivery, true);
});

console.log('\n--- 5. PACKAGE WEIGHT & FLOATING POINT SAFETY TESTS ---');

runTest('Variant weight inference: 1L => 1.0 kg', () => {
  assert.strictEqual(inferVariantWeightKg({ variantName: '1 Litre Bottle' }), 1.0);
  assert.strictEqual(inferVariantWeightKg({ size: '1L' }), 1.0);
});

runTest('Variant weight inference: 500ml => 0.5 kg', () => {
  assert.strictEqual(inferVariantWeightKg({ variantName: '500 ml Bottle' }), 0.5);
  assert.strictEqual(inferVariantWeightKg({ size: '500ml' }), 0.5);
});

runTest('Variant weight inference: 250ml => 0.25 kg', () => {
  assert.strictEqual(inferVariantWeightKg({ variantName: '250 ml Glass' }), 0.25);
});

runTest('Floating-point weight normalization: 1.999999999999 => 2.00 kg', () => {
  assert.strictEqual(normalizeWeight(1.999999999999), 2.00);
});

runTest('Floating-point weight normalization: 2.000000000001 => 2.00 kg', () => {
  assert.strictEqual(normalizeWeight(2.000000000001), 2.00);
});

console.log('\n===============================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('===============================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
