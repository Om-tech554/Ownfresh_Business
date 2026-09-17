/**
 * =========================================================================
 * CENTRALIZED DELIVERY & SHIPPING CALCULATOR
 * =========================================================================
 * Authoritative destination-based shipping engine for MyOwnFresh Edible Oils.
 *
 * Rules:
 * 1. Destination determines region. Customer's physical GPS/IP has ZERO effect.
 * 2. Zones:
 *    - PUNE: Local delivery (Porter / local courier).
 *    - MAHARASHTRA_OUTSIDE_PUNE: Courier delivery.
 *    - OUTSIDE_MAHARASHTRA: Courier delivery.
 * 3. Free delivery threshold:
 *    - Subtotal > ₹1,000 (₹1,001+ is FREE, ₹1,000 exactly is NOT free).
 * 4. Pune Rates (Subtotal <= ₹1,000):
 *    - Weight < 2 kg: Flat ₹200 minimum consignment charge.
 *    - Weight >= 2 kg: ₹70 per kg (totalWeightKg * 70).
 * 5. Courier Rates (Maharashtra Outside Pune & Outside Maharashtra):
 *    - ₹100 per chargeable kg.
 *    - Any fraction of a kg is rounded UP to the next whole kg (ceiling).
 * 6. Product Weight:
 *    - 1 Litre = 1.0 kg, 500 ml = 0.5 kg, 250 ml = 0.25 kg.
 * =========================================================================
 */

export const FREE_DELIVERY_THRESHOLD = 1500;
export const FREE_DELIVERY_WEIGHT_THRESHOLD = 2.0;

// Configurable Pune local delivery operation boundaries
export const PUNE_DELIVERY_CONFIG = {
  enabled: true,
  // Facility at Dhayari, Pune (Vir Maruti Complex / Laxmi Industrial Estate)
  centerLatitude: 18.4485,
  centerLongitude: 73.8183,
  // Local delivery service radius in km (covers Pune Municipal Corp & PCMC)
  radiusKm: 30,
  // Explicit Pune PIN codes (can be extended by business owner)
  pincodes: [],
  // Recognized local Pune / PCMC localities and municipal terms
  puneKeywords: [
    "pune",
    "pcmc",
    "pimpri",
    "chinchwad",
    "dhayari",
    "hadapsar",
    "kothrud",
    "hinjewadi",
    "hinjawadi",
    "wakad",
    "baner",
    "balewadi",
    "viman nagar",
    "vimannagar",
    "kondhwa",
    "shivajinagar",
    "aundh",
    "bavdhan",
    "katraj",
    "warje",
    "bibvewadi",
    "yerawada",
    "magarpatta",
    "kharadi",
    "nigdi",
    "bhosari",
    "akurdi",
    "chakan",
    "talawade",
    "vadgaon budruk",
    "sinhagad",
    "koregaon park",
    "camp",
    "swargate",
    "deccan"
  ]
};

/**
 * Calculates straight-line distance in kilometers using the Haversine formula.
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 === null || lat1 === undefined ||
    lon1 === null || lon1 === undefined ||
    lat2 === null || lat2 === undefined ||
    lon2 === null || lon2 === undefined
  ) {
    return null;
  }

  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) {
    return null;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = (nLat2 - nLat1) * (Math.PI / 180);
  const dLon = (nLon2 - nLon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(nLat1 * (Math.PI / 180)) *
      Math.cos(nLat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 100) / 100;
};

/**
 * Normalizes input destination into a consistent structured object.
 */
export const normalizeDestination = (destination = {}) => {
  if (!destination) {
    return {
      address: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      latitude: null,
      longitude: null,
      placeId: ""
    };
  }

  if (typeof destination === "string") {
    const raw = destination.trim();
    return {
      address: raw,
      city: "",
      district: "",
      state: raw.toLowerCase().includes("maharashtra") ? "Maharashtra" : "",
      pincode: "",
      latitude: null,
      longitude: null,
      placeId: ""
    };
  }

  const city = (destination.city || destination.areaName || destination.district || "").trim();
  const stateRaw = (destination.state || destination.region || "").trim();
  const pincode = (destination.zipCode || destination.pincode || destination.pinCode || destination.postalCode || "").toString().trim();
  const address = (destination.address || destination.text || destination.street || destination.formatted || "").trim();
  const district = (destination.district || destination.county || "").trim();
  const placeId = (destination.placeId || destination.place_id || "").toString().trim();

  // Normalize state name
  let state = stateRaw;
  const stateLower = stateRaw.toLowerCase();
  if (stateLower === "mh" || stateLower === "maharashtra" || stateLower.includes("maharashtra")) {
    state = "Maharashtra";
  }

  // If state is empty but pincode or city implies Maharashtra
  if (!state) {
    if (pincode.startsWith("40") || pincode.startsWith("41") || pincode.startsWith("42") || pincode.startsWith("43") || pincode.startsWith("44")) {
      state = "Maharashtra";
    } else if (PUNE_DELIVERY_CONFIG.puneKeywords.some(kw => city.toLowerCase().includes(kw) || address.toLowerCase().includes(kw))) {
      state = "Maharashtra";
    }
  }

  const latitude = destination.latitude !== undefined && destination.latitude !== null ? Number(destination.latitude) : null;
  const longitude = destination.longitude !== undefined && destination.longitude !== null ? Number(destination.longitude) : null;

  return {
    address,
    city,
    district,
    state,
    pincode,
    latitude: !isNaN(latitude) ? latitude : null,
    longitude: !isNaN(longitude) ? longitude : null,
    placeId
  };
};

/**
 * Determines delivery region strictly from the DESTINATION.
 *
 * Rules:
 * 1. If geographic coordinates (latitude & longitude) are available:
 *    - Check straight-line distance from configured Pune facility against radiusKm.
 *    - If distance <= radiusKm: return "PUNE".
 *    - If distance > radiusKm: return destination.state === "Maharashtra" ? "MAHARASHTRA_OUTSIDE_PUNE" : "OUTSIDE_MAHARASHTRA".
 * 2. If geographic coordinates are NOT available:
 *    - Check explicit configured Pune PIN codes.
 *    - Check if PIN code starts with 411 (Pune division) and state is Maharashtra.
 *    - Check if city/district/address matches recognized Pune municipal localities and state is Maharashtra.
 *    - Else if state is Maharashtra: return "MAHARASHTRA_OUTSIDE_PUNE".
 *    - Else: return "OUTSIDE_MAHARASHTRA".
 *
 * Returns:
 * - "PUNE"
 * - "MAHARASHTRA_OUTSIDE_PUNE"
 * - "OUTSIDE_MAHARASHTRA"
 */
export const determineDeliveryRegion = (rawDestination) => {
  const dest = normalizeDestination(rawDestination);

  const isMaharashtra =
    dest.state === "Maharashtra" ||
    dest.state.toLowerCase() === "mh" ||
    dest.state.toLowerCase().includes("maharashtra");

  // Rule 1: Coordinate-based geographic boundary detection (preferred & authoritative)
  if (PUNE_DELIVERY_CONFIG.enabled && dest.latitude !== null && dest.longitude !== null) {
    const distance = calculateDistanceKm(
      PUNE_DELIVERY_CONFIG.centerLatitude,
      PUNE_DELIVERY_CONFIG.centerLongitude,
      dest.latitude,
      dest.longitude
    );
    if (distance !== null && distance <= PUNE_DELIVERY_CONFIG.radiusKm) {
      return "PUNE";
    }
    // If coordinates are definitively outside Pune service radius, evaluate by state
    if (isMaharashtra) {
      return "MAHARASHTRA_OUTSIDE_PUNE";
    }
    return "OUTSIDE_MAHARASHTRA";
  }

  // Rule 2: Fallback when coordinates are NOT provided (e.g., text-only address)
  if (PUNE_DELIVERY_CONFIG.enabled) {
    // A. Explicit Configured Pincodes
    if (dest.pincode && PUNE_DELIVERY_CONFIG.pincodes.length > 0) {
      if (PUNE_DELIVERY_CONFIG.pincodes.includes(dest.pincode)) {
        return "PUNE";
      }
    }

    // B. Standard Pune City Postal Division (411xxx)
    const isPunePincode = dest.pincode.startsWith("411");

    // C. Recognized Pune Municipal Keywords
    const cityText = `${dest.city} ${dest.district} ${dest.address}`.toLowerCase();
    const matchesPuneKeyword = PUNE_DELIVERY_CONFIG.puneKeywords.some(kw => cityText.includes(kw));

    if ((matchesPuneKeyword || isPunePincode) && (isMaharashtra || !dest.state)) {
      return "PUNE";
    }
  }

  if (isMaharashtra) {
    return "MAHARASHTRA_OUTSIDE_PUNE";
  }

  return "OUTSIDE_MAHARASHTRA";
};

/**
 * Infers physical product weight in kg from variant attributes.
 *
 * Conversions:
 * 1 Litre / 1L / 1kg = 1.0 kg
 * 500 ml / 500g = 0.5 kg
 * 250 ml / 250g = 0.25 kg
 * 100 ml / 100g = 0.10 kg
 * 2 Litre / 2L / 2kg = 2.0 kg
 * 5 Litre / 5L / 5kg = 5.0 kg
 * 15 Litre / 15L / 15kg = 15.0 kg
 */
export const inferVariantWeightKg = (variant = {}) => {
  const textToScan = `${variant.name || ''} ${variant.variantName || ''} ${variant.size || ''} ${variant.weight || ''}`.toLowerCase();

  // Explicit volume & weight checks
  if (textToScan.includes("15 litre") || textToScan.includes("15l") || textToScan.includes("15 tin") || textToScan.includes("15kg") || textToScan.includes("15 kg")) return 15.0;
  if (textToScan.includes("5 litre") || textToScan.includes("5l") || textToScan.includes("5 can") || textToScan.includes("5kg") || textToScan.includes("5 kg")) return 5.0;
  if (textToScan.includes("2 litre") || textToScan.includes("2l") || textToScan.includes("2kg") || textToScan.includes("2 kg")) return 2.0;
  if (textToScan.includes("1.5 litre") || textToScan.includes("1.5l") || textToScan.includes("1.5kg") || textToScan.includes("1.5 kg")) return 1.5;
  if (textToScan.includes("1 litre") || textToScan.includes("1l") || textToScan.includes("1000ml") || textToScan.includes("1000 ml") || textToScan.includes("1kg") || textToScan.includes("1 kg")) return 1.0;
  if (textToScan.includes("750 ml") || textToScan.includes("750ml") || textToScan.includes("750g") || textToScan.includes("750 g")) return 0.75;
  if (textToScan.includes("500 ml") || textToScan.includes("500ml") || textToScan.includes("500g") || textToScan.includes("500 g") || textToScan.includes("0.5kg") || textToScan.includes("0.5 kg")) return 0.5;
  if (textToScan.includes("250 ml") || textToScan.includes("250ml") || textToScan.includes("250g") || textToScan.includes("250 g") || textToScan.includes("0.25kg") || textToScan.includes("0.25 kg")) return 0.25;
  if (textToScan.includes("100 ml") || textToScan.includes("100ml") || textToScan.includes("100g") || textToScan.includes("100 g") || textToScan.includes("0.1kg") || textToScan.includes("0.1 kg")) return 0.1;

  // Regex patterns for custom numbers
  const litreMatch = textToScan.match(/([\d.]+)\s*(?:l|litre|litres|liter|liters)\b/);
  if (litreMatch && Number(litreMatch[1]) > 0) {
    return Math.round(Number(litreMatch[1]) * 100) / 100;
  }

  const kgMatch = textToScan.match(/([\d.]+)\s*kg\b/);
  if (kgMatch && Number(kgMatch[1]) > 0) {
    return Math.round(Number(kgMatch[1]) * 100) / 100;
  }

  const mlMatch = textToScan.match(/([\d.]+)\s*ml\b/);
  if (mlMatch && Number(mlMatch[1]) > 0) {
    return Math.round((Number(mlMatch[1]) / 1000) * 100) / 100;
  }

  const gMatch = textToScan.match(/([\d.]+)\s*g(?:m|rams)?\b/);
  if (gMatch && Number(gMatch[1]) > 0) {
    return Math.round((Number(gMatch[1]) / 1000) * 100) / 100;
  }

  if (variant.shippingWeight && Number(variant.shippingWeight) > 0) {
    return Math.round(Number(variant.shippingWeight) * 100) / 100;
  }

  return 1.0;
};

/**
 * Normalizes floating-point weight safely to 2 decimal places.
 */
export const normalizeWeight = (weight) => {
  const num = Number(weight) || 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Centralized Delivery Charge Calculation Function.
 *
 * Parameters:
 * - subtotal: Product subtotal (numbers only, strictly excluding delivery charges)
 * - totalWeightKg: Optional explicit total weight. If omitted, calculated from cartItems/items.
 * - cartItems / items: Array of cart items with quantity and product variant details.
 * - destination: Destination object { address, city, district, state, pincode, latitude, longitude, placeId }
 * - deliveryMethodId: "standard" | "express" | "priority"
 *
 * Returns structured result:
 * {
 *   region: "PUNE" | "MAHARASHTRA_OUTSIDE_PUNE" | "OUTSIDE_MAHARASHTRA",
 *   deliveryMethod: "LOCAL" | "COURIER",
 *   deliveryMethodType: "LOCAL" | "COURIER",
 *   deliveryMethodName: "Local Pune Delivery" | "Courier Delivery",
 *   destinationCity: "...",
 *   destinationState: "...",
 *   totalWeightKg: ...,
 *   chargeableWeightKg: ...,
 *   deliveryCharge: ...,
 *   isFreeDelivery: ...,
 *   ...
 * }
 */
export const calculateDeliveryCharge = ({
  cartItems = [],
  items = [],
  totalWeightKg: explicitWeight = null,
  subtotal = 0,
  destination = null,
  deliveryMethodId = "standard"
}) => {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const effectiveItems = (items && items.length > 0) ? items : (cartItems || []);

  // 1. Calculate Total Physical Weight of all products in cart
  let totalWeightKg = 0;
  if (explicitWeight !== null && explicitWeight !== undefined && !isNaN(Number(explicitWeight))) {
    totalWeightKg = normalizeWeight(explicitWeight);
  } else {
    let totalRawWeight = 0;
    if (Array.isArray(effectiveItems)) {
      for (const item of effectiveItems) {
        const qty = Number(item.quantity) || 1;
        const unitWeight = inferVariantWeightKg(item);
        totalRawWeight += unitWeight * qty;
      }
    }
    totalWeightKg = normalizeWeight(totalRawWeight);
  }

  // 2. Determine Destination & Delivery Region
  const normalizedDest = normalizeDestination(destination);
  const region = determineDeliveryRegion(normalizedDest);

    // 3. Free Delivery Eligibility Rule: Invoice Amount over Rs. 1,500/- OR Order Volume 2 Kg & above
  const isFreeDelivery = (safeSubtotal > FREE_DELIVERY_THRESHOLD) || (totalWeightKg >= FREE_DELIVERY_WEIGHT_THRESHOLD);
  const amountNeeded = isFreeDelivery ? 0 : Math.max(0, (FREE_DELIVERY_THRESHOLD + 1) - safeSubtotal);
  const weightNeeded = isFreeDelivery ? 0 : Math.max(0, normalizeWeight(FREE_DELIVERY_WEIGHT_THRESHOLD - totalWeightKg));
  const subtotalProgress = Math.min(100, Math.round((safeSubtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const weightProgress = Math.min(100, Math.round((totalWeightKg / FREE_DELIVERY_WEIGHT_THRESHOLD) * 100));
  const progressPercentage = isFreeDelivery ? 100 : Math.max(subtotalProgress, weightProgress);

  // 4. Calculate Base Delivery Charge according to Region
  let baseDeliveryCharge = 0;
  let chargeableWeightKg = totalWeightKg;
  let deliveryMethod = "COURIER";
  let deliveryMethodType = "COURIER";
  let deliveryMethodName = "Courier Delivery";

  if (region === "PUNE") {
    deliveryMethod = "LOCAL";
    deliveryMethodType = "LOCAL";
    deliveryMethodName = "Local Pune Delivery";
    chargeableWeightKg = totalWeightKg;

    if (totalWeightKg < 2) {
      // Pune minimum consignment rule: Below 2 kg is ₹200
      baseDeliveryCharge = 200;
    } else {
      // 2 kg or more: ₹70 per kg
      baseDeliveryCharge = normalizeWeight(totalWeightKg * 70);
    }
  } else if (region === "OUTSIDE_MAHARASHTRA") {
    deliveryMethod = "COURIER";
    deliveryMethodType = "COURIER";
    deliveryMethodName = "Interstate Courier Delivery";

    if (totalWeightKg <= 0) {
      chargeableWeightKg = 0;
      baseDeliveryCharge = 0;
    } else if (totalWeightKg < 2) {
      // Outside Maharashtra rule: below 2 kg is a flat ₹200 delivery charge
      chargeableWeightKg = totalWeightKg;
      baseDeliveryCharge = 200;
    } else {
      // 2 kg or more: ₹100 per kg (rounded up to next full kg)
      chargeableWeightKg = Math.ceil(totalWeightKg);
      baseDeliveryCharge = chargeableWeightKg * 100;
    }
  } else {
    // MAHARASHTRA_OUTSIDE_PUNE: Courier calculation
    deliveryMethod = "COURIER";
    deliveryMethodType = "COURIER";
    deliveryMethodName = "Courier Delivery";

    // Ceiling rounding: any fraction of a kg is charged as a full kg (min 1 kg if weight > 0)
    chargeableWeightKg = totalWeightKg > 0 ? Math.max(1, Math.ceil(totalWeightKg)) : 0;
    baseDeliveryCharge = chargeableWeightKg * 100;
  }

  // 5. Apply Free Delivery Override
  const standardDeliveryCost = isFreeDelivery ? 0 : baseDeliveryCharge;

  // 6. Delivery Speed Add-ons
  let deliveryCost = standardDeliveryCost;
  if (deliveryMethodId === "express") {
    deliveryCost = standardDeliveryCost + 150;
  } else if (deliveryMethodId === "priority") {
    deliveryCost = standardDeliveryCost + 300;
  }

  const freeDeliveryMessage = isFreeDelivery
    ? "🎉 Free Delivery Unlocked"
    : `Add ₹${amountNeeded.toLocaleString('en-IN')} more (or use Prime 1% for FREE delivery)`;

  return {
    region,
    deliveryMethod,
    deliveryMethodType,
    deliveryMethodName,
    destinationCity: normalizedDest.city || "",
    destinationState: normalizedDest.state || "",
    totalWeightKg,
    totalWeight: totalWeightKg, // For backward compatibility
    chargeableWeightKg,
    deliveryCharge: deliveryCost,
    deliveryCost, // For backward compatibility
    standardDeliveryCost,
    baseDeliveryCharge,
    subtotal: safeSubtotal,
    isFreeDelivery,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    freeDeliveryWeightThreshold: FREE_DELIVERY_WEIGHT_THRESHOLD,
    weightNeededForFreeDelivery: typeof weightNeeded !== "undefined" ? weightNeeded : 0,
    amountNeededForFreeDelivery: amountNeeded,
    progressPercentage,
    message: freeDeliveryMessage,
    freeDeliveryMessage,
    destination: normalizedDest
  };
};

// Aliases for seamless backward compatibility
export const calculateClientShipping = calculateDeliveryCharge;
export const calculateShipping = calculateDeliveryCharge;

export default {
  FREE_DELIVERY_THRESHOLD,
  PUNE_DELIVERY_CONFIG,
  calculateDistanceKm,
  normalizeDestination,
  determineDeliveryRegion,
  inferVariantWeightKg,
  normalizeWeight,
  calculateDeliveryCharge,
  calculateClientShipping,
  calculateShipping
};
