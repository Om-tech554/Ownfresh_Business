import User from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import { sendOtpMail } from "../utils/mail.js";
import {
  handlePhoneAuth,
  handleGoogleAuth,
  handleSignUp,
  handleSignIn
} from "../services/authService.js";

// Helper to set cookie
const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  });
};

//--------------signUp----------------//
export const signUp = async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress;
    const result = await handleSignUp({
      ...req.body,
      ip
    });

    if (result.requiresVerification) {
      return res.status(200).json(result);
    }

    setAuthCookie(res, result.token);
    return res.status(201).json(result.user);
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(error.statusCode || 500).json({ message: error.message || "Signup failed" });
  }
};

//--------------signIn------------------//
export const signIn = async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress;
    const { email, password, deviceFingerprint } = req.body;

    const result = await handleSignIn({ email, password, deviceFingerprint, ip });

    setAuthCookie(res, result.token);
    return res.status(200).json(result.user);
  } catch (error) {
    console.error("SIGN_IN_ERROR:", error.message);
    return res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
  }
};

//--------------signOut----------------//
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/"
    });
    return res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    console.error("SIGN_OUT_ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//--------------sendOtp----------------//
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User with this email does not exist." });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();
    await sendOtpMail(normalizedEmail, otp);
    return res.status(200).json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    console.error("SEND_OTP_ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//--------------VerifyOtp-------------//
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("VERIFY_OTP_ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//--------------resetPassword---------//
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and new password are required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "OTP verification is required before resetting password" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//--------------googleAuth-------------//
export const googleAuth = async (req, res) => {
  try {
    const { idToken, mobile, deviceFingerprint } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress;

    const result = await handleGoogleAuth({ idToken, mobile, deviceFingerprint, ip });

    setAuthCookie(res, result.token);
    return res.status(200).json(result.user);
  } catch (error) {
    console.error("GOOGLE_AUTH_ERROR:", error.message);
    return res.status(error.statusCode || 500).json({ message: error.message || "Google Authentication failed" });
  }
};

//--------------phoneAuth (NEW SMS OTP)-------------//
export const phoneAuth = async (req, res) => {
  try {
    const { idToken, fullName, referralCode, deviceFingerprint } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress;

    if (!idToken) {
      return res.status(400).json({ message: "Missing Firebase Phone ID token" });
    }

    const result = await handlePhoneAuth({
      idToken,
      fullName,
      referralCode,
      deviceFingerprint,
      ip
    });

    setAuthCookie(res, result.token);
    return res.status(200).json(result.user);
  } catch (error) {
    console.error("PHONE_AUTH_ERROR:", error.message);
    return res.status(error.statusCode || 500).json({ message: error.message || "Phone Authentication failed" });
  }
};

//--------------verifySignupOtp-------------//
export const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isOtpVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }
    if (user.resetOtp !== otp || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully! You can now sign in." });
  } catch (error) {
    console.error("VERIFY_SIGNUP_OTP_ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//--------------resendSignupOtp-------------//
export const resendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isOtpVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOtpMail(normalizedEmail, otp);
    return res.status(200).json({ message: "Verification OTP resent successfully" });
  } catch (error) {
    console.error("RESEND_SIGNUP_OTP_ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
