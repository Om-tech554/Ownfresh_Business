import User from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";
import Wallet from "../models/walletModel.js";
import adminApp from "../config/firebaseAdmin.js";
import { getAuth } from "firebase-admin/auth";
import { generateUniqueCode } from "../controllers/referralController.js";
import ReferralCode from "../models/referralCodeModel.js";
import ReferralUsage from "../models/referralUsageModel.js";

/**
 * =========================================================================
 * AUTH SERVICE (MCV Business Logic Layer)
 * =========================================================================
 */

/**
 * Verifies any Firebase ID Token (Google or Phone) via Firebase Admin SDK
 */
export const verifyFirebaseToken = async (idToken) => {
  if (!idToken) {
    throw new Error("Missing Firebase ID Token");
  }
  if (!adminApp) {
    throw new Error("Firebase Admin SDK is not initialized");
  }
  return await getAuth(adminApp).verifyIdToken(idToken);
};

/**
 * Handles Phone Number Authentication (1-Click Login / Signup via SMS OTP)
 */
export const handlePhoneAuth = async ({ idToken, fullName, referralCode, deviceFingerprint, ip }) => {
  const decodedToken = await verifyFirebaseToken(idToken);

  const rawPhone = decodedToken.phone_number;
  if (!rawPhone) {
    throw new Error("Phone number not found in verified Firebase Token");
  }

  // Extract clean 10-digit mobile number and full E.164 phone
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const mobileNumber = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
  const dummyEmail = `${mobileNumber}@phone.myownfresh.com`;

  // Find user by clean mobile number OR phone email OR firebase UID
  let user = await User.findOne({
    $or: [
      { mobile: mobileNumber },
      { email: dummyEmail }
    ]
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const generatedName = fullName?.trim() || `User ${mobileNumber.slice(-4)}`;
    const generatedUserName = `user_${mobileNumber.slice(-6)}_${Math.random().toString(36).substring(2, 5)}`;

    user = await User.create({
      fullName: generatedName,
      userName: generatedUserName,
      email: dummyEmail,
      mobile: mobileNumber,
      role: "user",
      isOtpVerified: true,
      lastIpAddress: ip,
      lastDeviceFingerprint: deviceFingerprint
    });

    // Create user wallet
    await Wallet.create({
      userId: user._id,
      balance: 0,
      totalEarned: 0,
      totalRedeemed: 0
    });

    // Auto-generate Referral Code for the new user
    const code = await generateUniqueCode(generatedName);
    await new ReferralCode({ userId: user._id, code }).save();
    user.referralCode = code;

    // Apply Referral Code if invited by another user
    if (referralCode && typeof referralCode === "string" && referralCode.trim().length > 0) {
      const cleanRef = referralCode.trim().toUpperCase();
      const parentRefDoc = await ReferralCode.findOne({ code: cleanRef });
      if (parentRefDoc && parentRefDoc.userId.toString() !== user._id.toString()) {
        await new ReferralUsage({
          referrerUserId: parentRefDoc.userId,
          refereeUserId: user._id,
          referralCode: cleanRef,
          status: "Pending"
        }).save();
      }
    }

    await user.save();
  } else {
    // Existing user: update tracking info
    user.lastIpAddress = ip;
    if (deviceFingerprint) user.lastDeviceFingerprint = deviceFingerprint;
    if (!user.mobile) user.mobile = mobileNumber;
    await user.save();
  }

  // Generate JWT Token
  const token = await genToken(user._id);
  const userObj = user.toObject ? user.toObject() : { ...user };
  userObj.token = token;
  userObj.isNewUser = isNewUser;

  return { user: userObj, token };
};

/**
 * Handles Google Authentication (1-Click Google OAuth)
 */
export const handleGoogleAuth = async ({ idToken, mobile, deviceFingerprint, ip }) => {
  const decodedToken = await verifyFirebaseToken(idToken);
  const { email, name: fullName } = decodedToken;

  if (!email) {
    throw new Error("Email not found in Google Token");
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const generatedUserName = normalizedEmail.split("@")[0] + Math.random().toString(36).substring(2, 6);

    user = await User.create({
      fullName: fullName || "Google User",
      userName: generatedUserName,
      email: normalizedEmail,
      mobile: mobile || undefined,
      role: "user",
      isOtpVerified: true,
      lastIpAddress: ip,
      lastDeviceFingerprint: deviceFingerprint
    });

    // Create wallet for the new user
    await Wallet.create({ userId: user._id, balance: 0, totalEarned: 0, totalRedeemed: 0 });

    // Auto-generate Referral Code
    const code = await generateUniqueCode(fullName || normalizedEmail.split("@")[0]);
    await new ReferralCode({ userId: user._id, code }).save();
    user.referralCode = code;
    await user.save();
  } else {
    user.lastIpAddress = ip;
    if (deviceFingerprint) user.lastDeviceFingerprint = deviceFingerprint;
    await user.save();
  }

  const token = await genToken(user._id);
  const userObj = user.toObject ? user.toObject() : { ...user };
  userObj.token = token;
  userObj.isNewUser = isNewUser;

  return { user: userObj, token };
};

/**
 * Standard Email/Password Signup Service
 */
export const handleSignUp = async ({ fullName, email, password, mobile, deviceFingerprint, ip }) => {
  if (!fullName || !email || !password || !mobile) {
    throw new Error("All fields are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  // Enforce OTP verification for company domain
  if (normalizedEmail.endsWith("@myownfresh.com")) {
    if (existingUser && existingUser.isOtpVerified) {
      const err = new Error("Email already exists");
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let user = existingUser;

    if (user) {
      user.fullName = fullName;
      user.password = hashedPassword;
      user.mobile = mobile;
      user.role = "user";
      user.lastIpAddress = ip;
      user.lastDeviceFingerprint = deviceFingerprint;
    } else {
      user = new User({
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        mobile,
        role: "user",
        isOtpVerified: false,
        lastIpAddress: ip,
        lastDeviceFingerprint: deviceFingerprint
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOtpMail(normalizedEmail, otp);

    return {
      requiresVerification: true,
      email: normalizedEmail,
      message: "Verification OTP sent to your email"
    };
  }

  if (existingUser) {
    const err = new Error("Email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email: normalizedEmail,
    password: hashedPassword,
    mobile,
    role: "user",
    isOtpVerified: true,
    lastIpAddress: ip,
    lastDeviceFingerprint: deviceFingerprint
  });

  await Wallet.create({ userId: user._id, balance: 0, totalEarned: 0, totalRedeemed: 0 });

  const code = await generateUniqueCode(fullName);
  await new ReferralCode({ userId: user._id, code }).save();
  user.referralCode = code;
  await user.save();

  const token = await genToken(user._id);
  const userObj = user.toObject ? user.toObject() : { ...user };
  userObj.token = token;

  return { user: userObj, token };
};

/**
 * Standard Email/Password Signin Service
 */
export const handleSignIn = async ({ email, password, deviceFingerprint, ip }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const err = new Error("User does not exist. Please sign up.");
    err.statusCode = 400;
    throw err;
  }

  if (user.email.endsWith("@myownfresh.com") && !user.isOtpVerified) {
    const err = new Error("Email verification is pending. Please verify your email.");
    err.statusCode = 400;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Incorrect password. Please try again.");
    err.statusCode = 400;
    throw err;
  }

  user.lastIpAddress = ip;
  if (deviceFingerprint) user.lastDeviceFingerprint = deviceFingerprint;
  await user.save();

  const token = await genToken(user._id);
  const userObj = user.toObject ? user.toObject() : { ...user };
  userObj.token = token;

  return { user: userObj, token };
};
