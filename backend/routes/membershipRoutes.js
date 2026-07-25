import express from "express";
import {
  getPlans,
  purchaseMembership,
  getMyMembershipStatus,
  validateAndRedeemCoins,
  adminUpdateUserMembership,
  adminGetMembershipDashboard,
  adminUpdatePlan,
  initiateMembershipPhonePePayment,
  checkMembershipPhonePeStatus,
  phonepeMembershipCallback,
  deactivateAllExistingMembers
} from "../controllers/membershipController.js";
import isAuth, { isAdmin } from "../middleware/isAuth.js";

const router = express.Router();

// Public Routes
router.get("/plans", getPlans);
router.post("/phonepe-callback", phonepeMembershipCallback); // S2S webhook

// User Protected Routes
router.get("/my-status", isAuth, getMyMembershipStatus);
router.post("/purchase", isAuth, purchaseMembership);
router.post("/initiate-phonepe-payment", isAuth, initiateMembershipPhonePePayment);
router.get("/phonepe-status/:txnId", isAuth, checkMembershipPhonePeStatus);
router.post("/redeem-coins", isAuth, validateAndRedeemCoins);

// Admin Protected Routes
router.get("/admin/dashboard", isAuth, isAdmin, adminGetMembershipDashboard);
router.put("/admin/plan", isAuth, isAdmin, adminUpdatePlan);
router.put("/admin/user-membership", isAuth, isAdmin, adminUpdateUserMembership);
router.post("/admin/deactivate-all-members", isAuth, isAdmin, deactivateAllExistingMembers);

export default router;
