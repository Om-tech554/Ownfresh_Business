import express from "express";
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
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image is required",
        });
      }

      const { name, price, shortDesc, category } = req.body;

      const product = await Product.create({
        name,
        price,
        shortDesc,
        category, // Should be an ObjectId from frontend
        image: req.file.path,
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
      .limit(limitNum);

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
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

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
      const { name, price, shortDesc, category } = req.body;

      const updateData = {
        name,
        price,
        shortDesc,
        category
      };

      if (req.file) {
        updateData.image = req.file.path;
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
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;