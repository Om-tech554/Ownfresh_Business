import express from "express";
import { 
  createCoupon, 
  getAllCoupons, 
  deleteCoupon, 
  validateCoupon 
} from "../controllers/couponController.js";

const router = express.Router();

// Admin routes
router.post("/create", createCoupon);
router.get("/all", getAllCoupons);
router.delete("/:id", deleteCoupon);

// User routes
router.post("/validate", validateCoupon);

export default router;
