import express from "express";
import { 
  createCoupon, 
  getAllCoupons, 
  deleteCoupon, 
  validateCoupon,
  getPublicCoupons
} from "../controllers/couponController.js";

const router = express.Router();

// Admin routes
router.post("/create", createCoupon);
router.get("/all", getAllCoupons);
router.delete("/:id", deleteCoupon);

// User routes
router.post("/validate", validateCoupon);
router.get("/public", getPublicCoupons);

export default router;
