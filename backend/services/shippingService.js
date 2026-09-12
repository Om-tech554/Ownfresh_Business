/**
 * SHIPPING SERVICE - MyOwnFresh Stone-Pressed Oils
 * Authoritative backend weight-based shipping rate engine & free-delivery rule calculator.
 */

export const FREE_DELIVERY_THRESHOLD = 1000;

// Standard delivery weight slabs configuration (Weight in kg -> Base Rate in INR)
export const STANDARD_WEIGHT_SLABS = [
  { maxWeight: 0.5, rate: 50, label: "0 - 0.5 kg" },
  { maxWeight: 1.0, rate: 70, label: "0.5 - 1 kg" },
  { maxWeight: 2.0, rate: 90, label: "1 - 2 kg" },
  { maxWeight: 3.0, rate: 120, label: "2 - 3 kg" },
  { maxWeight: 5.0, rate: 160, label: "3 - 5 kg" },
  { maxWeight: 10.0, rate: 240, label: "5 - 10 kg" },
];

export const OVER_10KG_BASE_RATE = 240;
export const OVER_10KG_PER_KG_RATE = 25;

/**
 * Infer weight in kg from variant attributes if shippingWeight is not explicitly set in the database.
 * Stone-pressed edible oil bottles include glass/PET packaging and caps.
 */
export const inferVariantWeightKg = (variant = {}) => {
  if (variant.shippingWeight && Number(variant.shippingWeight) > 0) {
    return Number(variant.shippingWeight);
  }

  const textToScan = `${variant.name || ''} ${variant.size || ''} ${variant.weight || ''}`.toLowerCase();

  // Litres detection
  if (textToScan.includes("15 litre") || textToScan.includes("15l") || textToScan.includes("15 tin")) return 16.0;
  if (textToScan.includes("5 litre") || textToScan.includes("5l") || textToScan.includes("5 can")) return 5.50;
  if (textToScan.includes("2 litre") || textToScan.includes("2l")) return 2.30;
  if (textToScan.includes("1 litre") || textToScan.includes("1l") || textToScan.includes("1000ml") || textToScan.includes("1000 ml")) return 1.20;
  if (textToScan.includes("500 ml") || textToScan.includes("500ml") || textToScan.includes("500g")) return 0.65;
  if (textToScan.includes("250 ml") || textToScan.includes("250ml") || textToScan.includes("250g")) return 0.35;
  if (textToScan.includes("100 ml") || textToScan.includes("100ml")) return 0.18;

  // Regex for numeric grams or kg
  const kgMatch = textToScan.match(/([\d.]+)\s*kg/);
  if (kgMatch && Number(kgMatch[1]) > 0) {
    return Number(kgMatch[1]) * 1.1; // Add 10% for packaging
  }

  const gmMatch = textToScan.match(/([\d.]+)\s*g(?:m|rams)?/);
  if (gmMatch && Number(gmMatch[1]) > 0) {
    return (Number(gmMatch[1]) / 1000) * 1.2; // Add 20% packaging for smaller units
  }

  const mlMatch = textToScan.match(/([\d.]+)\s*ml/);
  if (mlMatch && Number(mlMatch[1]) > 0) {
    return (Number(mlMatch[1]) / 1000) * 1.2;
  }

  // Default fallback weight for standard bottle
  return 1.20;
};

/**
 * Calculates standard weight-based rate for given total weight in kg.
 */
export const calculateStandardWeightRate = (totalWeightKg) => {
  const roundedWeight = Math.max(0.1, Math.round(totalWeightKg * 100) / 100);

  for (const slab of STANDARD_WEIGHT_SLABS) {
    if (roundedWeight <= slab.maxWeight) {
      return { rate: slab.rate, label: slab.label };
    }
  }

  // Above 10kg
  const excessKg = Math.ceil(roundedWeight - 10.0);
  const rate = OVER_10KG_BASE_RATE + (excessKg * OVER_10KG_PER_KG_RATE);
  return { rate, label: `10+ kg (${roundedWeight.toFixed(2)} kg)` };
};

/**
 * Main Authoritative Shipping Calculation Engine.
 *
 * @param {Object} params
 * @param {Array} params.items - Cart or order items with variant info / shippingWeight
 * @param {number} params.subtotal - Eligible merchandise subtotal (Excl. Tax & discounts)
 * @param {string} params.deliveryMethodId - 'standard' | 'express' | 'priority'
 * @param {string} params.pincode - Optional delivery pincode for future zone routing
 * @param {string} params.state - Optional delivery state
 * @returns {Object} Full shipping calculation breakdown
 */
export const calculateShipping = ({
  items = [],
  subtotal = 0,
  deliveryMethodId = "standard",
  pincode = "",
  state = ""
}) => {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);

  // 1. Calculate Dynamic Shipment Total Weight
  let totalWeight = 0;
  if (Array.isArray(items)) {
    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      const weightPerUnit = inferVariantWeightKg(item);
      totalWeight += weightPerUnit * qty;
    }
  }
  totalWeight = Math.round(totalWeight * 100) / 100; // 2 decimal places

  // 2. Determine Free Delivery Eligibility
  const isFreeDelivery = safeSubtotal >= FREE_DELIVERY_THRESHOLD;
  const amountNeededForFreeDelivery = isFreeDelivery ? 0 : Math.max(0, FREE_DELIVERY_THRESHOLD - safeSubtotal);

  // 3. Calculate Base Weight Rate
  const { rate: baseWeightRate, label: slabLabel } = calculateStandardWeightRate(totalWeight);

  let standardShippingFee = isFreeDelivery ? 0 : baseWeightRate;
  let finalDeliveryCharge = 0;
  let deliveryMethodName = "Standard Delivery";

  if (deliveryMethodId === "express") {
    deliveryMethodName = "Express Delivery";
    // Express premium (+₹150 standard flat add-on)
    finalDeliveryCharge = standardShippingFee + 150;
  } else if (deliveryMethodId === "priority") {
    deliveryMethodName = "Priority Delivery";
    // Priority premium (+₹300 flat add-on)
    finalDeliveryCharge = standardShippingFee + 300;
  } else {
    // Standard Delivery
    deliveryMethodName = "Standard Delivery";
    finalDeliveryCharge = standardShippingFee;
  }

  return {
    subtotal: safeSubtotal,
    totalWeight,
    isFreeDelivery,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    amountNeededForFreeDelivery,
    deliveryCharge: finalDeliveryCharge,
    baseWeightRate,
    deliveryMethodId,
    deliveryMethodName,
    slabLabel,
    message: isFreeDelivery
      ? "🎉 Free Delivery Unlocked"
      : `Add ₹${amountNeededForFreeDelivery} more to unlock FREE delivery`
  };
};

export default {
  FREE_DELIVERY_THRESHOLD,
  STANDARD_WEIGHT_SLABS,
  inferVariantWeightKg,
  calculateStandardWeightRate,
  calculateShipping
};
