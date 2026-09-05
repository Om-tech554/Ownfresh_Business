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
