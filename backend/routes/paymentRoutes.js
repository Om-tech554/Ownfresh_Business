import express from "express";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/paymentController.js";
import isAuth from "../middleware/isAuth.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Apply rate limiting specifically for payment endpoints to prevent abuse
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 payment requests per windowMs
  message: "Too many payment requests from this IP, please try again after 15 minutes",
});

router.post("/create-order", isAuth, paymentLimiter, createRazorpayOrder);
router.post("/verify", isAuth, paymentLimiter, verifyRazorpayPayment);

export default router;
