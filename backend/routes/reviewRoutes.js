import express from "express";
import isAuth, { isAdmin } from "../middleware/isAuth.js";
import {
  addReview,
  getProductReviews,
  getFeaturedTestimonials,
  getAllReviewsAdmin,
  updateReviewStatusAdmin,
  deleteReviewAdmin
} from "../controllers/reviewController.js";

const router = express.Router();

// Public routes
router.get("/featured", getFeaturedTestimonials);
router.get("/product/:productId", getProductReviews);

// User routes
router.post("/add", isAuth, addReview);

// Admin routes
router.get("/admin/all", isAuth, isAdmin, getAllReviewsAdmin);
router.put("/admin/status/:id", isAuth, isAdmin, updateReviewStatusAdmin);
router.delete("/admin/:id", isAuth, isAdmin, deleteReviewAdmin);

export default router;
