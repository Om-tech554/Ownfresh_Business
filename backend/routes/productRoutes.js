import express from "express";
import mongoose from "mongoose";
import upload from "../middleware/multer.js";
import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";
import Category from "../models/categoryModel.js";
import Tag from "../models/tagModel.js";

const router = express.Router();

/* -------------------------------------------
   ADD PRODUCT
------------------------------------------- */
router.post(
  "/add",
  (req, res, next) => {
    upload.fields([
      { name: "image", maxCount: 1 },
      { name: "labelImage", maxCount: 1 }
    ])(req, res, function (err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Upload Error",
          error: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const {
        name,
        shortDesc,
        description,
        sku,
        category,
        image,
        images,
        tags,
        badges,
        labelImage,
        certificationImages,
        status,
        rating,
        variants
      } = req.body;

      let imageUrl = "";
      if (req.files && req.files.image && req.files.image[0]) {
        imageUrl = req.files.image[0].path;
      } else if (image) {
        imageUrl = image;
      }

      let parsedLabelImage = "";
      if (req.files && req.files.labelImage && req.files.labelImage[0]) {
        parsedLabelImage = req.files.labelImage[0].path;
      } else if (labelImage) {
        parsedLabelImage = labelImage;
      }

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: "Primary product image is required",
        });
      }

      if (!category || category === "") {
        return res.status(400).json({
          success: false,
          message: "Category is required",
        });
      }

      // Parse arrays if sent as JSON strings via FormData
      let parsedImages = [];
      if (typeof images === "string") {
        try { parsedImages = JSON.parse(images); } catch (e) { parsedImages = images ? [images] : []; }
      } else if (Array.isArray(images)) {
        parsedImages = images;
      }

      let parsedTags = [];
      if (typeof tags === "string") {
        try { parsedTags = JSON.parse(tags); } catch (e) { parsedTags = tags ? [tags] : []; }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }

      let parsedBadges = [];
      if (typeof badges === "string") {
        try { parsedBadges = JSON.parse(badges); } catch (e) { parsedBadges = badges ? [badges] : []; }
      } else if (Array.isArray(badges)) {
        parsedBadges = badges;
      }

      let parsedCerts = [];
      if (typeof certificationImages === "string") {
        try { parsedCerts = JSON.parse(certificationImages); } catch (e) { parsedCerts = certificationImages ? [certificationImages] : []; }
      } else if (Array.isArray(certificationImages)) {
        parsedCerts = certificationImages;
      }

      const product = await Product.create({
        name,
        shortDesc,
        description: description || "",
        sku: sku || "",
        status: status || 'Active',
        rating: Number(rating) || 5,
        category,
        image: imageUrl,
        images: parsedImages.length > 0 ? parsedImages : [imageUrl],
        tags: parsedTags,
        badges: parsedBadges,
        labelImage: parsedLabelImage,
        certificationImages: parsedCerts
      });

      // Save initial variants if provided
      let createdVariants = [];
      let parsedVariants = [];
      if (typeof variants === "string") {
        try { parsedVariants = JSON.parse(variants); } catch (e) { parsedVariants = []; }
      } else if (Array.isArray(variants)) {
        parsedVariants = variants;
      }

      if (parsedVariants.length > 0) {
        for (const v of parsedVariants) {
          const vImg = v.image || (v.images && v.images[0]) || imageUrl;
          const vImgs = Array.isArray(v.images) && v.images.length > 0 ? v.images : (vImg ? [vImg] : []);
          const variantRecord = await ProductVariant.create({
            product: product._id,
            name: v.name || "Standard",
            size: v.size || v.name || "Standard",
            sku: v.sku || `${product.sku || 'PRD'}-${v.name || 'STD'}`,
            price: Number(v.price) || 0,
            salePrice: v.salePrice ? Number(v.salePrice) : null,
            stockQuantity: Number(v.stockQuantity) || 0,
            weight: v.weight || "",
            shippingWeight: Number(v.shippingWeight) || 0,
            image: vImg,
            images: vImgs,
            labelImage: v.labelImage || "",
            status: v.status || 'Active'
          });
          createdVariants.push(variantRecord);
        }
      }

      res.status(201).json({
        success: true,
        product,
        variants: createdVariants,
      });
    } catch (error) {
      console.log("ADD PRODUCT ERROR:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/* -------------------------------------------
   GET ALL PRODUCTS (PAGINATED & SEARCH)
------------------------------------------- */
router.get("/all", async (req, res) => {
  try {
    const { page = 1, limit = 1000, search = "", category = "" } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { shortDesc: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      const foundCategory = await Category.findOne({ name: { $regex: category, $options: "i" } });
      if (foundCategory) {
        query.category = foundCategory._id;
      } else if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        query.category = null;
      }
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 1000;
    const skip = (pageNum - 1) * limitNum;

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category")
      .populate("tags")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Fetch variants for these products
    const productIds = products.map(p => p._id);
    const variants = await ProductVariant.find({ product: { $in: productIds } }).sort({ price: 1 }).lean();
    
    products.forEach(p => {
      p.variants = variants.filter(v => v.product.toString() === p._id.toString());
      p.variants.forEach(v => {
        if (!v.image) {
          v.image = (v.images && v.images.length > 0 ? v.images[0] : p.image);
        }
      });
      // Assign default price
      p.price = p.variants.length > 0 ? (p.variants[0].salePrice || p.variants[0].price) : (p.price || 0);
    });

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(count / limitNum) || 1,
      currentPage: pageNum,
      totalProducts: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* -------------------------------------------
   ⭐ GET SINGLE PRODUCT (IMPORTANT)
------------------------------------------- */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Product ID" });
    }
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("tags")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const variants = await ProductVariant.find({ product: product._id }).sort({ price: 1 }).lean();
    variants.forEach(v => {
      if (!v.image) {
        v.image = (v.images && v.images.length > 0 ? v.images[0] : product.image);
      }
    });
    product.variants = variants;
    product.price = variants.length > 0 ? (variants[0].salePrice || variants[0].price) : (product.price || 0);

    res.json({ success: true, product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* -------------------------------------------
   UPDATE PRODUCT
------------------------------------------- */
router.put(
  "/update/:id",
  (req, res, next) => {
    upload.fields([
      { name: "image", maxCount: 1 },
      { name: "labelImage", maxCount: 1 }
    ])(req, res, function (err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Upload Error",
          error: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const {
        name,
        shortDesc,
        description,
        sku,
        category,
        image,
        images,
        tags,
        badges,
        labelImage,
        certificationImages,
        status,
        rating,
        variants
      } = req.body;

      const updateData = {};
      if (name) updateData.name = name;
      if (shortDesc !== undefined) updateData.shortDesc = shortDesc;
      if (description !== undefined) updateData.description = description;
      if (sku !== undefined) updateData.sku = sku;
      if (status) updateData.status = status;
      if (rating !== undefined) updateData.rating = Number(rating);

      if (category && category !== "") {
        updateData.category = category;
      }

      if (req.files && req.files.image && req.files.image[0]) {
        updateData.image = req.files.image[0].path;
      } else if (image) {
        updateData.image = image;
      }

      if (req.files && req.files.labelImage && req.files.labelImage[0]) {
        updateData.labelImage = req.files.labelImage[0].path;
      } else if (labelImage !== undefined) {
        updateData.labelImage = labelImage;
      }

      if (images !== undefined) {
        if (typeof images === "string") {
          try { updateData.images = JSON.parse(images); } catch (e) { updateData.images = images ? [images] : []; }
        } else if (Array.isArray(images)) {
          updateData.images = images;
        }
      }

      if (tags !== undefined) {
        if (typeof tags === "string") {
          try { updateData.tags = JSON.parse(tags); } catch (e) { updateData.tags = tags ? [tags] : []; }
        } else if (Array.isArray(tags)) {
          updateData.tags = tags;
        }
      }

      if (badges !== undefined) {
        if (typeof badges === "string") {
          try { updateData.badges = JSON.parse(badges); } catch (e) { updateData.badges = badges ? [badges] : []; }
        } else if (Array.isArray(badges)) {
          updateData.badges = badges;
        }
      }

      if (certificationImages !== undefined) {
        if (typeof certificationImages === "string") {
          try { updateData.certificationImages = JSON.parse(certificationImages); } catch (e) { updateData.certificationImages = certificationImages ? [certificationImages] : []; }
        } else if (Array.isArray(certificationImages)) {
          updateData.certificationImages = certificationImages;
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate("category").populate("tags");

      // Sync variants if provided
      if (variants !== undefined) {
        let parsedVariants = [];
        if (typeof variants === "string") {
          try { parsedVariants = JSON.parse(variants); } catch (e) { parsedVariants = []; }
        } else if (Array.isArray(variants)) {
          parsedVariants = variants;
        }

        const existingVariantIds = [];
        for (const v of parsedVariants) {
          const vImg = v.image || (v.images && v.images[0]) || updatedProduct.image || "";
          const vImgs = Array.isArray(v.images) && v.images.length > 0 ? v.images : (vImg ? [vImg] : []);

          if (v._id && mongoose.Types.ObjectId.isValid(v._id)) {
            const updatedV = await ProductVariant.findByIdAndUpdate(
              v._id,
              {
                name: v.name || "Standard",
                size: v.size || v.name || "Standard",
                sku: v.sku || "",
                price: Number(v.price) || 0,
                salePrice: v.salePrice ? Number(v.salePrice) : null,
                stockQuantity: Number(v.stockQuantity) || 0,
                weight: v.weight || "",
                shippingWeight: Number(v.shippingWeight) || 0,
                image: vImg,
                images: vImgs,
                labelImage: v.labelImage || "",
                status: v.status || 'Active'
              },
              { new: true }
            );
            if (updatedV) existingVariantIds.push(updatedV._id.toString());
          } else {
            const newV = await ProductVariant.create({
              product: updatedProduct._id,
              name: v.name || "Standard",
              size: v.size || v.name || "Standard",
              sku: v.sku || `${updatedProduct.sku || 'PRD'}-${v.name || 'STD'}`,
              price: Number(v.price) || 0,
              salePrice: v.salePrice ? Number(v.salePrice) : null,
              stockQuantity: Number(v.stockQuantity) || 0,
              weight: v.weight || "",
              shippingWeight: Number(v.shippingWeight) || 0,
              image: vImg,
              images: vImgs,
              labelImage: v.labelImage || "",
              status: v.status || 'Active'
            });
            existingVariantIds.push(newV._id.toString());
          }
        }
      }

      res.json({ success: true, product: updatedProduct });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/* -------------------------------------------
   DELETE PRODUCT
------------------------------------------- */
router.delete("/delete/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Product ID" });
    }
    await Product.findByIdAndDelete(req.params.id);
    await ProductVariant.deleteMany({ product: req.params.id });
    res.json({ success: true, message: "Product and associated variants deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;