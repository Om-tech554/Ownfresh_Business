import express from "express";
import {
  googleAuth,
  phoneAuth,
  resetPassword,
  sendOtp,
  signIn,
  signOut,
  signUp,
  verifyOtp,
  verifySignupOtp,
  resendSignupOtp
} from "../controllers/authcontroller.js";
import { authLimiter, otpLimiter } from "../middleware/rateLimiter.js";

const authRouter = express.Router();

// Apply auth rate limiter on credential-based endpoints
authRouter.post("/signup", authLimiter, signUp);
authRouter.post("/signin", authLimiter, signIn);
authRouter.get("/signout", signOut);

// Apply strict OTP rate limiter to prevent spamming
authRouter.post("/send-otp", otpLimiter, sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", authLimiter, resetPassword);

// OAuth / Token-based sign-in endpoints
authRouter.post("/google-auth", authLimiter, googleAuth);
authRouter.post("/phone-auth", authLimiter, phoneAuth);

// Domain signup OTP handlers
authRouter.post("/verify-signup-otp", verifySignupOtp);
authRouter.post("/resend-signup-otp", otpLimiter, resendSignupOtp);

export default authRouter;