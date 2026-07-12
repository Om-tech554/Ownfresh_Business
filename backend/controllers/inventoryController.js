import ProductVariant from "../models/productVariantModel.js";
import PriceHistory from "../models/priceHistoryModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

// Add a variant
export const addVariant = async (req, res) => {
  try {
    const { productId, name, sku, price, salePrice, stockQuantity, status } = req.body;

    if (!productId || !name || !price) {
      return res.status(400).json({ success: false, message: "Product ID, Name, and Price are required" });
    }

    const variant = await ProductVariant.create({
      product: productId,
      name,
      sku,
      price,
      salePrice: salePrice || null,
      stockQuantity: stockQuantity || 0,
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
    const { name, sku, price, salePrice, stockQuantity, status } = req.body;

    const variant = await ProductVariant.findById(id);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    // Check if price changed to record history
    if (price && price !== variant.price) {
      await PriceHistory.create({
        variant: variant._id,
        oldPrice: variant.price,
        newPrice: price,
        reason: "Manual Adjustment"
      });
    }

    if (name) variant.name = name;
    if (sku) variant.sku = sku;
    if (price) variant.price = price;
    if (salePrice !== undefined) variant.salePrice = salePrice;
    if (stockQuantity !== undefined) variant.stockQuantity = stockQuantity;
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
