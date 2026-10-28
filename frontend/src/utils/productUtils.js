/**
 * Product Utility Helpers
 */

/**
 * Cleans product name by stripping brand and processing prefixes
 * e.g., "OwnFresh stone Pressed Kacchi Ghani 500 ML Groundnut Oil" -> "Kacchi Ghani 500 ML Groundnut Oil"
 * e.g., "OwnFresh Stone Pressed Mustard Oil" -> "Mustard Oil"
 * e.g., "Stone Pressed Sesame Oil" -> "Sesame Oil"
 * @param {string} name 
 * @returns {string} Cleaned product name
 */
export const cleanProductName = (name) => {
  if (!name || typeof name !== "string") return "";
  let cleaned = name.trim();
  
  // 1. Remove "OwnFresh stone  pressed ", "OwnFresh stone pressed ", "OwnFresh " (case-insensitive)
  cleaned = cleaned.replace(/^ownfresh\s+(?:stone\s+pressed\s+)?/i, "");
  
  // 2. Remove leading "Stone Pressed " if still present at the beginning
  cleaned = cleaned.replace(/^stone\s+pressed\s+/i, "");
  
  return cleaned.trim() || name;
};

/**
 * Returns dynamic product display name with variant bottle size integrated
 * e.g., getDynamicName("OwnFresh stone Pressed Kacchi Ghani 500 ml Groundnut Oil", "1 Litre")
 *       -> "Kacchi Ghani 1 Litre Groundnut Oil"
 * @param {string} productName 
 * @param {string|object} variantNameOrObj 
 * @returns {string}
 */
export const getDynamicName = (productName, variantNameOrObj) => {
  if (!productName) return "";
  const cleaned = cleanProductName(productName);
  
  const variantName = typeof variantNameOrObj === "object" && variantNameOrObj !== null
    ? variantNameOrObj.name
    : variantNameOrObj;

  if (!variantName || typeof variantName !== "string") return cleaned;

  const sizeRegex = /\b\d+(?:\.\d+)?\s*(?:ml|l|litre|liter|litres|liters|ltr|ltrs)\b/i;
  if (sizeRegex.test(cleaned)) {
    return cleaned.replace(sizeRegex, variantName.trim());
  }
  
  // If variant name is not already inside the product title, append it
  if (!cleaned.toLowerCase().includes(variantName.toLowerCase())) {
    return `${cleaned} - ${variantName.trim()}`;
  }

  return cleaned;
};

/**
 * Returns effective display price for a product, matching active variants by bottle size or name
 * @param {object} product 
 * @param {string} selectedSize 
 * @returns {number}
 */
export const getProductEffectivePrice = (product, selectedSize = "All") => {
  if (!product) return 0;
  const activeVariants = product.variants?.filter(
    (v) => v.status === "Active" && !v.name?.toLowerCase().includes("gift") && !v.name?.toLowerCase().includes("eco packaging")
  ) || [];

  let matchedVariant = null;

  if (selectedSize && selectedSize !== "All") {
    const sizeClean = selectedSize.toLowerCase().replace(/\s+/g, "");
    matchedVariant = activeVariants.find((v) => {
      const vName = (v.name || "").toLowerCase().replace(/\s+/g, "");
      return vName.includes(sizeClean) || sizeClean.includes(vName);
    });
  }

  if (!matchedVariant && activeVariants.length > 0) {
    const nameLower = (product.name || "").toLowerCase();
    if (nameLower.includes("250")) {
      matchedVariant = activeVariants.find((v) => v.name?.toLowerCase().includes("250"));
    } else if (nameLower.includes("500")) {
      matchedVariant = activeVariants.find((v) => v.name?.toLowerCase().includes("500"));
    } else if (nameLower.includes("1 l") || nameLower.includes("1l") || nameLower.includes("1-l") || nameLower.includes("1 liter") || nameLower.includes("1 litre")) {
      matchedVariant = activeVariants.find((v) => v.name?.toLowerCase().includes("1 l") || v.name?.toLowerCase().includes("1l") || v.name?.toLowerCase().includes("1 liter") || v.name?.toLowerCase().includes("1 litre"));
    } else if (nameLower.includes("5 l") || nameLower.includes("5l") || nameLower.includes("5-l") || nameLower.includes("5 liter") || nameLower.includes("5 litre")) {
      matchedVariant = activeVariants.find((v) => v.name?.toLowerCase().includes("5 l") || v.name?.toLowerCase().includes("5l") || v.name?.toLowerCase().includes("5 liter") || v.name?.toLowerCase().includes("5 litre"));
    } else if (nameLower.includes("15 l") || nameLower.includes("15l") || nameLower.includes("15-l") || nameLower.includes("15 liter") || nameLower.includes("15 litre")) {
      matchedVariant = activeVariants.find((v) => v.name?.toLowerCase().includes("15 l") || v.name?.toLowerCase().includes("15l") || v.name?.toLowerCase().includes("15 liter") || v.name?.toLowerCase().includes("15 litre"));
    }
    if (!matchedVariant) {
      matchedVariant = activeVariants[0];
    }
  }

  if (matchedVariant) {
    const salePrice = matchedVariant.sellingPrice || matchedVariant.salePrice;
    const regPrice = matchedVariant.listingPrice || matchedVariant.price;
    return Number(salePrice || regPrice || 0);
  }

  return Number(product.price || 0);
};
