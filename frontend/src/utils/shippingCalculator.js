/**
 * FRONTEND SHIPPING CALCULATOR - MyOwnFresh Stone-Pressed Oils
 * Matches authoritative backend shipping calculation rules and weight slabs.
 */

export const FREE_DELIVERY_THRESHOLD = 1000;

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
 * Infer weight in kg from variant attributes if shippingWeight is not explicitly set.
 */
export const inferVariantWeightKg = (variant = {}) => {
  if (variant.shippingWeight && Number(variant.shippingWeight) > 0) {
    return Number(variant.shippingWeight);
  }

  const textToScan = `${variant.name || ''} ${variant.variantName || ''} ${variant.size || ''} ${variant.weight || ''}`.toLowerCase();

  // Litres detection
  if (textToScan.includes("15 litre") || textToScan.includes("15l") || textToScan.includes("15 tin")) return 16.0;
  if (textToScan.includes("5 litre") || textToScan.includes("5l") || textToScan.includes("5 can")) return 5.50;
  if (textToScan.includes("2 litre") || textToScan.includes("2l")) return 2.30;
  if (textToScan.includes("1 litre") || textToScan.includes("1l") || textToScan.includes("1000ml") || textToScan.includes("1000 ml")) return 1.20;
  if (textToScan.includes("500 ml") || textToScan.includes("500ml") || textToScan.includes("500g")) return 0.65;
  if (textToScan.includes("250 ml") || textToScan.includes("250ml") || textToScan.includes("250g")) return 0.35;
  if (textToScan.includes("100 ml") || textToScan.includes("100ml")) return 0.18;

  // Regex for numeric kg or grams
  const kgMatch = textToScan.match(/([\d.]+)\s*kg/);
  if (kgMatch && Number(kgMatch[1]) > 0) {
    return Number(kgMatch[1]) * 1.1;
  }

  const gmMatch = textToScan.match(/([\d.]+)\s*g(?:m|rams)?/);
  if (gmMatch && Number(gmMatch[1]) > 0) {
    return (Number(gmMatch[1]) / 1000) * 1.2;
  }

  const mlMatch = textToScan.match(/([\d.]+)\s*ml/);
  if (mlMatch && Number(mlMatch[1]) > 0) {
    return (Number(mlMatch[1]) / 1000) * 1.2;
  }

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

  const excessKg = Math.ceil(roundedWeight - 10.0);
  const rate = OVER_10KG_BASE_RATE + (excessKg * OVER_10KG_PER_KG_RATE);
  return { rate, label: `10+ kg (${roundedWeight.toFixed(2)} kg)` };
};

/**
 * Main Client-side Shipping Calculation Helper
 */
export const calculateClientShipping = ({
  cartItems = [],
  subtotal = 0,
  deliveryMethodId = "standard"
}) => {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);

  // 1. Calculate Dynamic Shipment Total Weight
  let totalWeight = 0;
  if (Array.isArray(cartItems)) {
    for (const item of cartItems) {
      const qty = Number(item.quantity) || 1;
      const weightPerUnit = inferVariantWeightKg(item);
      totalWeight += weightPerUnit * qty;
    }
  }
  totalWeight = Math.round(totalWeight * 100) / 100;

  // 2. Free delivery status
  const isFreeDelivery = safeSubtotal >= FREE_DELIVERY_THRESHOLD;
  const amountNeeded = isFreeDelivery ? 0 : Math.max(0, FREE_DELIVERY_THRESHOLD - safeSubtotal);
  const progressPercentage = Math.min(100, Math.round((safeSubtotal / FREE_DELIVERY_THRESHOLD) * 100));

  // 3. Base weight rate
  const { rate: baseWeightRate, label: slabLabel } = calculateStandardWeightRate(totalWeight);
  const standardDeliveryCost = isFreeDelivery ? 0 : baseWeightRate;

  let deliveryCost = 0;
  if (deliveryMethodId === "express") {
    deliveryCost = standardDeliveryCost + 150;
  } else if (deliveryMethodId === "priority") {
    deliveryCost = standardDeliveryCost + 300;
  } else {
    deliveryCost = standardDeliveryCost;
  }

  return {
    subtotal: safeSubtotal,
    totalWeight,
    isFreeDelivery,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    amountNeededForFreeDelivery: amountNeeded,
    progressPercentage,
    standardDeliveryCost,
    deliveryCost,
    baseWeightRate,
    slabLabel,
    message: isFreeDelivery
      ? "🎉 Free Delivery Unlocked"
      : `Add ₹${amountNeeded.toLocaleString('en-IN')} more to unlock FREE delivery`
  };
};

export default {
  FREE_DELIVERY_THRESHOLD,
  STANDARD_WEIGHT_SLABS,
  inferVariantWeightKg,
  calculateStandardWeightRate,
  calculateClientShipping
};
