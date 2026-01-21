import express from "express";
import upload from "../middleware/multer.js";
import Product from "../models/productModel.js";

const router = express.Router();

// -------------------- ADD PRODUCT --------------------
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

      const { name, price } = req.body;

      const product = await Product.create({
        name,
        price,
        image: req.file.path,
      });

      res.status(201).json({
        success: true,
        product,
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// -------------------- GET ALL PRODUCTS --------------------
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------- DELETE PRODUCT --------------------
router.delete("/delete/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------- UPDATE PRODUCT --------------------
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
      const { name, price } = req.body;

      const data = { name, price };

      if (req.file) {
        data.image = req.file.path;
      }

      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        data,
        { new: true }
      );

      res.json({ success: true, product: updated });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

export default router;
