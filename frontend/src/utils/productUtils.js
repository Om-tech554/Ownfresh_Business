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
