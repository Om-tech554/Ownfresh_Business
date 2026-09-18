import ProductVariant from "../models/productVariantModel.js";
import PriceHistory from "../models/priceHistoryModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

// Add a variant
export const addVariant = async (req, res) => {
  try {
    const { productId, name, size, sku, price, salePrice, stockQuantity, weight, image, images, labelImage, tags, status } = req.body;

    if (!productId || !name || !price) {
      return res.status(400).json({ success: false, message: "Product ID, Name, and Price are required" });
    }

    const variant = await ProductVariant.create({
      product: productId,
      name: name.trim(),
      size: size || name.trim(),
      sku: sku || "",
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      stockQuantity: Number(stockQuantity) || 0,
      weight: weight || "",
      image: image || (images && images.length > 0 ? images[0] : ""),
      images: Array.isArray(images) ? images : (image ? [image] : []),
      labelImage: labelImage || "",
      tags: Array.isArray(tags) ? tags : [],
      status: status || 'Active'
    });

    res.status(201).json({ success: true, variant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a variant
export const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, size, sku, price, salePrice, stockQuantity, weight, image, images, labelImage, tags, status } = req.body;

    const variant = await ProductVariant.findById(id);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    // Check if price changed to record history
    if (price && Number(price) !== variant.price) {
      await PriceHistory.create({
        variant: variant._id,
        oldPrice: variant.price,
        newPrice: Number(price),
        reason: "Manual Adjustment"
      });
    }

    if (name) {
      variant.name = name.trim();
      if (!size) variant.size = name.trim();
    }
    if (size !== undefined) variant.size = size;
    if (sku !== undefined) variant.sku = sku;
    if (price !== undefined) variant.price = Number(price);
    if (salePrice !== undefined) variant.salePrice = salePrice ? Number(salePrice) : null;
    if (stockQuantity !== undefined) variant.stockQuantity = Number(stockQuantity);
    if (weight !== undefined) variant.weight = weight;
    if (image !== undefined) variant.image = image;
    if (images !== undefined) variant.images = Array.isArray(images) ? images : (image ? [image] : []);
    if (labelImage !== undefined) variant.labelImage = labelImage;
    if (tags !== undefined) variant.tags = Array.isArray(tags) ? tags : [];
    if (status) variant.status = status;

    await variant.save();

    res.json({ success: true, variant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Delete a variant
export const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    await ProductVariant.findByIdAndDelete(id);
    res.json({ success: true, message: "Variant deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get variants for a product
export const getVariants = async (req, res) => {
  try {
    const { productId } = req.params;
    const variants = await ProductVariant.find({ product: productId });
    res.json({ success: true, variants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all variants (for inventory manager)
export const getAllVariants = async (req, res) => {
  try {
    const variants = await ProductVariant.find().populate('product', 'name category').lean();
    res.json({ success: true, variants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk update prices
export const bulkUpdatePrices = async (req, res) => {
  try {
    const { categoryId, percentageIncrease } = req.body;

    if (!categoryId || !percentageIncrease) {
      return res.status(400).json({ success: false, message: "Category ID and Percentage Increase are required" });
    }

    const products = await Product.find({ category: categoryId });
    const productIds = products.map(p => p._id);

    const variants = await ProductVariant.find({ product: { $in: productIds } });

    for (let variant of variants) {
      const oldPrice = variant.price;
      const newPrice = Math.round(oldPrice * (1 + (percentageIncrease / 100)));

      await PriceHistory.create({
        variant: variant._id,
        oldPrice: oldPrice,
        newPrice: newPrice,
        reason: `Bulk Update (${percentageIncrease}%)`
      });

      variant.price = newPrice;
      await variant.save();
    }

    res.json({ success: true, message: `Successfully updated prices for ${variants.length} variants.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// MASTER INTELLIGENT PRICING ENGINE
// =========================================================================

export const DEFAULT_MASTER_RATES = {
  "Groundnut Oil": { "1L": 605, "500ml": 390, "250ml": null },
  "Coconut Oil": { "1L": 1210, "500ml": 695, "250ml": 418 },
  "Sunflower Oil": { "1L": 565, "500ml": 375, "250ml": null },
  "Safflower Oil": { "1L": 640, "500ml": 412, "250ml": null },
  "Sesame Oil": { "1L": 650, "500ml": 415, "250ml": 290 },
  "Mustard Oil": { "1L": 585, "500ml": 380, "250ml": 175 }
};

export const DEFAULT_MULTIPLIERS = {
  "2L": 1.85,
  "3L": 2.8,
  "5L_coconut": 5.0,
  "5L_others": 8.0,
  "15L_coconut": 15.0,
  "15L_others": 22.0
};

export const calculateOilVariantPrices = (oilName, baseRates, multipliers = DEFAULT_MULTIPLIERS) => {
  const isCoconut = oilName.toLowerCase().includes("coconut");
  const p1L = Number(baseRates["1L"]) || 0;
  const p500ml = Number(baseRates["500ml"]) || 0;

  const raw250 = baseRates["250ml"];
  const is250Active = raw250 !== null && raw250 !== undefined && raw250 !== "" && !isNaN(raw250) && Number(raw250) > 0;
  const p250ml = is250Active ? Number(raw250) : Math.round((p500ml || (p1L * 0.6)) * 0.6);

  const m2L = Number(multipliers["2L"]) || 1.85;
  const m3L = Number(multipliers["3L"]) || 2.8;
  const m5L = isCoconut ? (Number(multipliers["5L_coconut"]) || 5.0) : (Number(multipliers["5L_others"]) || 8.0);
  const m15L = isCoconut ? (Number(multipliers["15L_coconut"]) || 15.0) : (Number(multipliers["15L_others"]) || 22.0);

  const p2L = Math.round(p1L * m2L);
  const p3L = Math.round(p1L * m3L);
  const p5L = Math.round(p1L * m5L);
  const p15L = Math.round(p1L * m15L);

  return {
    "250 ml": {
      salePrice: p250ml,
      mrp: Math.round(p250ml * 1.10),
      status: is250Active ? "Active" : "Inactive"
    },
    "500 ml": {
      salePrice: p500ml,
      mrp: Math.round(p500ml * 1.10),
      status: "Active"
    },
    "1 Litre": {
      salePrice: p1L,
      mrp: Math.round(p1L * 1.10),
      status: "Active"
    },
    "2 Litre": {
      salePrice: p2L,
      mrp: Math.round(p2L * 1.10),
      status: "Active"
    },
    "3 Litre": {
      salePrice: p3L,
      mrp: Math.round(p3L * 1.10),
      status: "Active"
    },
    "5 Litre": {
      salePrice: p5L,
      mrp: Math.round(p5L * 1.10),
      status: "Active"
    },
    "15 Litre": {
      salePrice: p15L,
      mrp: Math.round(p15L * 1.10),
      status: "Active"
    }
  };
};

export const getMasterRates = async (req, res) => {
  try {
    const variants = await ProductVariant.find().populate("product", "name category").lean();

    const currentRates = {
      "Groundnut Oil": { "1L": 605, "500ml": 390, "250ml": null },
      "Coconut Oil": { "1L": 1210, "500ml": 695, "250ml": 418 },
      "Sunflower Oil": { "1L": 565, "500ml": 375, "250ml": null },
      "Safflower Oil": { "1L": 640, "500ml": 412, "250ml": null },
      "Sesame Oil": { "1L": 650, "500ml": 415, "250ml": 290 },
      "Mustard Oil": { "1L": 585, "500ml": 380, "250ml": 175 }
    };

    for (const v of variants) {
      const prodName = (v.product?.name || "").toLowerCase();
      const varName = (v.name || v.size || "").toLowerCase();

      let matchedOil = null;
      if (prodName.includes("groundnut")) matchedOil = "Groundnut Oil";
      else if (prodName.includes("coconut")) matchedOil = "Coconut Oil";
      else if (prodName.includes("sunflower")) matchedOil = "Sunflower Oil";
      else if (prodName.includes("safflower")) matchedOil = "Safflower Oil";
      else if (prodName.includes("sesame")) matchedOil = "Sesame Oil";
      else if (prodName.includes("mustard")) matchedOil = "Mustard Oil";

      if (!matchedOil) continue;

      const price = v.salePrice || v.price;
      if (!price) continue;

      if (varName.includes("250") && v.status === "Active") {
        currentRates[matchedOil]["250ml"] = price;
      } else if (varName.includes("500")) {
        currentRates[matchedOil]["500ml"] = price;
      } else if ((varName.includes("1 litre") || varName === "1l") && !varName.includes("15")) {
        currentRates[matchedOil]["1L"] = price;
      }
    }

    const calculatedMatrix = {};
    for (const [oil, rates] of Object.entries(currentRates)) {
      calculatedMatrix[oil] = calculateOilVariantPrices(oil, rates, DEFAULT_MULTIPLIERS);
    }

    res.status(200).json({
      success: true,
      rates: currentRates,
      multipliers: DEFAULT_MULTIPLIERS,
      calculatedMatrix
    });
  } catch (error) {
    console.error("getMasterRates error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMasterRates = async (req, res) => {
  try {
    const { rates, multipliers = DEFAULT_MULTIPLIERS } = req.body;

    if (!rates || typeof rates !== "object") {
      return res.status(400).json({ success: false, message: "Invalid rates provided" });
    }

    const mergedMultipliers = { ...DEFAULT_MULTIPLIERS, ...multipliers };
    const calculatedMatrix = {};

    for (const [oil, oilRates] of Object.entries(rates)) {
      calculatedMatrix[oil] = calculateOilVariantPrices(oil, oilRates, mergedMultipliers);
    }

    const variants = await ProductVariant.find().populate("product", "name category");
    let updatedVariantsCount = 0;
    const historyEntries = [];

    for (const v of variants) {
      const prodName = (v.product?.name || "").toLowerCase();
      const varName = (v.name || v.size || "").toLowerCase();

      let matchedOil = null;
      if (prodName.includes("groundnut")) matchedOil = "Groundnut Oil";
      else if (prodName.includes("coconut")) matchedOil = "Coconut Oil";
      else if (prodName.includes("sunflower")) matchedOil = "Sunflower Oil";
      else if (prodName.includes("safflower")) matchedOil = "Safflower Oil";
      else if (prodName.includes("sesame")) matchedOil = "Sesame Oil";
      else if (prodName.includes("mustard")) matchedOil = "Mustard Oil";

      if (!matchedOil || !calculatedMatrix[matchedOil]) continue;

      let targetSize = null;
      if (varName.includes("250")) targetSize = "250 ml";
      else if (varName.includes("500")) targetSize = "500 ml";
      else if (varName.includes("15")) targetSize = "15 Litre";
      else if (varName.includes("5")) targetSize = "5 Litre";
      else if (varName.includes("3")) targetSize = "3 Litre";
      else if (varName.includes("2")) targetSize = "2 Litre";
      else if (varName.includes("1") || varName.includes("litre")) targetSize = "1 Litre";

      if (!targetSize || !calculatedMatrix[matchedOil][targetSize]) continue;

      const target = calculatedMatrix[matchedOil][targetSize];
      const newSalePrice = target.salePrice;
      const newPrice = target.mrp;
      const newStatus = target.status;

      if (v.salePrice !== newSalePrice || v.price !== newPrice || v.status !== newStatus) {
        historyEntries.push({
          variant: v._id,
          oldPrice: v.price,
          newPrice: newPrice,
          reason: `Intelligent Rate Card Update (${matchedOil} - ${targetSize})`
        });

        v.salePrice = newSalePrice;
        v.price = newPrice;
        v.status = newStatus;
        await v.save();
        updatedVariantsCount++;
      }
    }

    if (historyEntries.length > 0) {
      await PriceHistory.insertMany(historyEntries).catch(() => {});
    }

    // Update parent products base prices to match 1L variant
    const products = await Product.find();
    let updatedProductsCount = 0;

    for (const p of products) {
      const pName = (p.name || "").toLowerCase();
      let matchedOil = null;
      if (pName.includes("groundnut")) matchedOil = "Groundnut Oil";
      else if (pName.includes("coconut")) matchedOil = "Coconut Oil";
      else if (pName.includes("sunflower")) matchedOil = "Sunflower Oil";
      else if (pName.includes("safflower")) matchedOil = "Safflower Oil";
      else if (pName.includes("sesame")) matchedOil = "Sesame Oil";
      else if (pName.includes("mustard")) matchedOil = "Mustard Oil";

      if (!matchedOil || !calculatedMatrix[matchedOil]) continue;

      const base1L = calculatedMatrix[matchedOil]["1 Litre"];
      if (base1L) {
        p.salePrice = base1L.salePrice;
        p.price = base1L.mrp;
        await p.save();
        updatedProductsCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Intelligently updated ${updatedVariantsCount} variants and ${updatedProductsCount} products across all sizes.`,
      updatedVariantsCount,
      updatedProductsCount,
      calculatedMatrix
    });
  } catch (error) {
    console.error("updateMasterRates error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
