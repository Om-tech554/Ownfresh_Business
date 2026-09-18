/**
 * 1% PRIME MEMBERSHIP UTILITIES
 * Centralized logic for Prime 1% membership status verification,
 * exclusive 10% discount on MRPs calculation, and potential savings metrics.
 */

/**
 * Checks if a user has an active, non-expired 1% Prime Membership.
 * Valid for 3 months (90 days) from activation.
 * @param {Object} user - User object from Redux or API
 * @returns {boolean}
 */
export const isUserActivePrime = (user) => {
  if (!user) return false;
  if (!user.isMember) return false;
  if (!user.membershipExpiresAt) return false;

  const expiry = new Date(user.membershipExpiresAt);
  const now = new Date();
  return expiry > now;
};

/**
 * Calculates item pricing details including standard price, MRP, Prime 10% MRP discount, and savings.
 * @param {Object} itemOrVariant - Product variant, product, or cart item
 * @param {boolean} isPrime - Whether the current viewing user is an active Prime member
 * @returns {Object} Pricing details
 */
export const calculateItemPricing = (itemOrVariant, isPrime = false) => {
  if (!itemOrVariant) {
    return {
      mrp: 0,
      standardPrice: 0,
      finalPrice: 0,
      isPrimeDiscountApplied: false,
      primeSavingsPerUnit: 0,
      discountPercent: 0,
      isDiscounted: false,
      primePrice: 0
    };
  }

  // MRP is represented by variant price or listingPrice
  const mrp = Number(itemOrVariant.listingPrice || itemOrVariant.price || itemOrVariant.mrp || 0);

  // Standard regular selling price for normal users
  const rawSalePrice = itemOrVariant.sellingPrice !== undefined && itemOrVariant.sellingPrice !== null
    ? itemOrVariant.sellingPrice
    : (itemOrVariant.salePrice !== undefined && itemOrVariant.salePrice !== null ? itemOrVariant.salePrice : itemOrVariant.price);
  
  const standardPrice = Number(rawSalePrice) || mrp;

  // 1% Prime Members get exclusive 10% discount on the MRP
  const primePrice = Math.round(mrp * 0.90);

  if (isPrime) {
    // Prime member gets 10% off MRP (or lower if promotional sale is even better)
    const finalPrice = Math.min(standardPrice, primePrice);
    const primeSavingsPerUnit = Math.max(0, standardPrice - finalPrice);
    const discountPercent = mrp > 0 ? Math.round(((mrp - finalPrice) / mrp) * 100) : 10;

    return {
      mrp,
      standardPrice,
      finalPrice,
      primePrice,
      isPrimeDiscountApplied: true,
      primeSavingsPerUnit,
      discountPercent,
      isDiscounted: finalPrice < mrp
    };
  }

  // Normal users receive standard price (no Prime 10% MRP discount)
  const discountPercent = (mrp > 0 && standardPrice < mrp)
    ? Math.round(((mrp - standardPrice) / mrp) * 100)
    : 0;

  return {
    mrp,
    standardPrice,
    finalPrice: standardPrice,
    primePrice,
    isPrimeDiscountApplied: false,
    primeSavingsPerUnit: 0,
    potentialPrimeSavingsPerUnit: Math.max(0, standardPrice - primePrice),
    discountPercent,
    isDiscounted: standardPrice < mrp
  };
};

/**
 * Calculates cart-level totals and Prime savings across all items in cart.
 * @param {Array} cartItems - Array of cart item objects
 * @param {boolean} isPrime - Whether user is an active Prime member
 * @returns {Object} Cart totals
 */
export const calculateCartPrimeTotals = (cartItems = [], isPrime = false) => {
  let subtotal = 0;
  let totalPrimeSavings = 0;
  let potentialPrimeSavings = 0;

  cartItems.forEach((item) => {
    const qty = Number(item.quantity) || 1;
    const pricing = calculateItemPricing(item, isPrime);

    subtotal += pricing.finalPrice * qty;

    if (isPrime) {
      totalPrimeSavings += pricing.primeSavingsPerUnit * qty;
    } else {
      potentialPrimeSavings += (pricing.potentialPrimeSavingsPerUnit || 0) * qty;
    }
  });

  return {
    subtotal,
    totalPrimeSavings,
    potentialPrimeSavings,
    isPrime
  };
};
