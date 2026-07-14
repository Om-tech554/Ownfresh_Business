import express from "express";
import { 
  initiatePhonePePayment, 
  phonepeCallback, 
  checkPhonePeStatus
  // createRazorpayOrder, 
  // verifyRazorpayPayment 
} from "../controllers/paymentController.js";
import isAuth from "../middleware/isAuth.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Apply rate limiting specifically for payment endpoints to prevent abuse
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 payment requests per windowMs
  message: "Too many payment requests from this IP, please try again after 15 minutes",
});

// --- PhonePe Routes ---
router.post("/phonepe-initiate", isAuth, paymentLimiter, initiatePhonePePayment);
router.post("/phonepe-callback", phonepeCallback); // S2S webhook, must be open (no isAuth)
router.get("/phonepe-status/:orderId", isAuth, checkPhonePeStatus); // Status check fallback

// --- Razorpay Routes (Commented Out as requested) ---
/*
router.post("/create-order", isAuth, paymentLimiter, createRazorpayOrder);
router.post("/verify", isAuth, paymentLimiter, verifyRazorpayPayment);
*/

export default router;
