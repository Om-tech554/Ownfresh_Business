/**
 * Centralized Pricing Configuration & Calculator.
 * 
 * Formula:
 * 1. basePrice: Exact Base / Original Price from the official PDF.
 * 2. listingPrice: basePrice * 1.20 (+20% markup, rounded). Displayed as MRP on website.
 * 3. discountPercent: Configurable discount percentage (default 10%, supports 10% to 12%).
 * 4. sellingPrice: listingPrice * (1 - discountPercent / 100) (rounded). Actual price customer pays.
 * 
 * Note:
 * - variant.price stores listingPrice (MRP).
 * - variant.salePrice stores sellingPrice (Customer Payable).
 * - variant.basePrice stores basePrice permanently.
 */

export const DEFAULT_DISCOUNT_PERCENT = 10;

/**
 * Calculates all 4 pricing tiers accurately.
 */
export function calculatePricingComponents(basePrice, discountPercent = DEFAULT_DISCOUNT_PERCENT) {
  const safeBase = Math.max(0, Number(basePrice) || 0);
  const safeDiscount = Number(discountPercent) || DEFAULT_DISCOUNT_PERCENT;

  // Website Listing Price: Base Price + 20%
  const listingPrice = Math.round(safeBase * 1.20);

  // Customer Selling Price: Listing Price - Discount%
  const sellingPrice = Math.round(listingPrice * (1 - safeDiscount / 100));

  return {
    basePrice: safeBase,
    listingPrice,
    discountPercent: safeDiscount,
    sellingPrice,
    // Database mapping aliases for backward compatibility with existing cart & checkout
    price: listingPrice,
    salePrice: sellingPrice
  };
}

// Master PDF Base Rates
export const PDF_BASE_RATES = {
  "Groundnut Oil": {
    "250 ml": { basePrice: 195, status: "Inactive" },
    "500 ml": { basePrice: 310, status: "Active" },
    "1 Litre": { basePrice: 555, status: "Active" },
    "2 Litre": { basePrice: 1025, status: "Active" }, // 555 * 1.85
    "5 Litre": { basePrice: 4440, status: "Active" }, // 555 * 8
    "15 Litre": { basePrice: 12210, status: "Active" } // 555 * 22
  },
  "Coconut Oil": {
    "250 ml": { basePrice: 355, status: "Active" },
    "500 ml": { basePrice: 650, status: "Active" },
    "1 Litre": { basePrice: 1240, status: "Active" },
    "2 Litre": { basePrice: 2295, status: "Active" }, // 1240 * 1.85
    "5 Litre": { basePrice: 6200, status: "Active" }, // 1240 * 5
    "15 Litre": { basePrice: 18600, status: "Active" } // 1240 * 15
  },
  "Sunflower Oil": {
    "250 ml": { basePrice: 180, status: "Inactive" },
    "500 ml": { basePrice: 275, status: "Active" },
    "1 Litre": { basePrice: 485, status: "Active" },
    "2 Litre": { basePrice: 895, status: "Active" }, // 485 * 1.85
    "5 Litre": { basePrice: 3880, status: "Active" }, // 485 * 8
    "15 Litre": { basePrice: 10670, status: "Active" } // 485 * 22
  },
  "Safflower Oil": {
    "250 ml": { basePrice: 190, status: "Inactive" },
    "500 ml": { basePrice: 325, status: "Active" },
    "1 Litre": { basePrice: 585, status: "Active" },
    "2 Litre": { basePrice: 1080, status: "Active" }, // 585 * 1.85
    "5 Litre": { basePrice: 4680, status: "Active" }, // 585 * 8
    "15 Litre": { basePrice: 12870, status: "Active" } // 585 * 22
  },
  "Sesame Oil": {
    "250 ml": { basePrice: 195, status: "Active" },
    "500 ml": { basePrice: 340, status: "Active" },
    "1 Litre": { basePrice: 615, status: "Active" },
    "2 Litre": { basePrice: 1135, status: "Active" }, // 615 * 1.85
    "5 Litre": { basePrice: 4920, status: "Active" }, // 615 * 8
    "15 Litre": { basePrice: 13530, status: "Active" } // 615 * 22
  },
  "Mustard Oil": {
    "250 ml": { basePrice: 175, status: "Active" },
    "500 ml": { basePrice: 295, status: "Active" },
    "1 Litre": { basePrice: 525, status: "Active" },
    "2 Litre": { basePrice: 970, status: "Active" }, // 525 * 1.85
    "5 Litre": { basePrice: 4200, status: "Active" }, // 525 * 8
    "15 Litre": { basePrice: 11550, status: "Active" } // 525 * 22
  }
};

// Combo Packs Base Rates (sum of constituent PDF base prices)
export const COMBO_BASE_RATES = [
  {
    // Groundnut (555) + Mustard (525) + Sesame (615) = 1695
    match: (name, img) => name.includes("Groundnut + Mustard + Sesame"),
    basePrice: 1695,
    weight: 3.0
  },
  {
    // Coconut (1240) + Safflower (585) + Sunflower (485) = 2310
    match: (name, img) => name.includes("Coconut + Safflower + Sunflower"),
    basePrice: 2310,
    weight: 3.0
  },
  {
    // Groundnut (555) + Safflower (585) + Sunflower (485) = 1625
    match: (name, img) => name.includes("Groundnut + Safflower + Sunflower"),
    basePrice: 1625,
    weight: 3.0
  },
  {
    // Groundnut (555) + Sunflower (485) + Sesame (615) = 1655
    match: (name, img) => img.includes("Groundnut-sunflower-sesame-Combo-1L") || (name.includes("1L Combo pack of 3") && !name.includes("Coconut") && !name.includes("Mustard")),
    basePrice: 1655,
    weight: 3.0
  },
  {
    // Coconut (1240) + Groundnut (555) + Sesame (615) = 2410
    match: (name, img) => img.includes("Groundnut-coconut-sesame") || (name.includes("1L Combo pack of 3") && name.includes("Coconut")),
    basePrice: 2410,
    weight: 3.0
  },
  {
    // 250 ML Combo pack of 5:
    // Coconut (355) + Sesame (195) + Mustard (175) + Groundnut (175) + Sunflower (150) = 1050
    match: (name, img) => name.includes("250 ML Combo pack of 5"),
    basePrice: 1050,
    weight: 1.25
  }
];
