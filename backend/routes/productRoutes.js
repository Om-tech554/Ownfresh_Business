import express from "express";
import mongoose from "mongoose";
import upload from "../middleware/multer.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

const router = express.Router();

/* -------------------------------------------
   ADD PRODUCT
------------------------------------------- */
router.post(
  "/add",
  (req, res, next) => {
    upload.single("image")(req, res, function (err) {
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
      const { name, shortDesc, description, sku, category, image, status } = req.body;

      let imageUrl = "";
      if (req.file) {
        imageUrl = req.file.path;
      } else if (image) {
        imageUrl = image;
      }

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: "Image is required",
        });
      }

      if (!category || category === "") {
        return res.status(400).json({
          success: false,
          message: "Category is required",
        });
      }

      const product = await Product.create({
        name,
        shortDesc,
        description,
        sku,
        status: status || 'Active',
        category, // Should be an ObjectId string
        image: imageUrl,
      });

      res.status(201).json({
        success: true,
        product,
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
    const { page = 1, limit = 6, search = "", category = "" } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { shortDesc: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      const foundCategory = await Category.findOne({ name: { $regex: category, $options: "i" } });
      if (foundCategory) {
        query.category = foundCategory._id;
      } else {
        query.category = null;
      }
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 6;
    const skip = (pageNum - 1) * limitNum;

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category") // Populate category data
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(); // Lean for modifying object

    // Fetch variants for these products
    const productIds = products.map(p => p._id);
    const ProductVariant = mongoose.model("ProductVariant");
    const variants = await ProductVariant.find({ product: { $in: productIds } }).lean();
    
    products.forEach(p => {
      p.variants = variants.filter(v => v.product.toString() === p._id.toString());
      // Assign a default price for backward compatibility in product listings
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
    const product = await Product.findById(req.params.id).populate("category").lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const ProductVariant = mongoose.model("ProductVariant");
    const variants = await ProductVariant.find({ product: product._id }).lean();
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
    upload.single("image")(req, res, function (err) {
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
      const { name, shortDesc, description, sku, category, status } = req.body;

      const updateData = {
        name,
        shortDesc,
        description,
        sku,
        status
      };

      if (category && category !== "") {
        updateData.category = category;
      } else if (category === "") {
        return res.status(400).json({
          success: false,
          message: "Category cannot be empty",
        });
      }

      if (req.file) {
        updateData.image = req.file.path;
      } else if (req.body.image) {
        updateData.image = req.body.image;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

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
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;