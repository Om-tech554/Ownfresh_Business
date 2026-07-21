import express from "express";
import isAuth, { isAdmin } from "../middleware/isAuth.js";
import {
    validateReferralCode,
    applyReferralCodeOnOrder,
    getReferralStats,
    getAdminReferrals,
    getAdminStats,
    exportReferrals,
    approveReferral,
    rejectReferral
} from "../controllers/referralController.js";

const router = express.Router();

// Customer Endpoints
router.post("/validate-code", isAuth, validateReferralCode);
router.post("/apply-code", isAuth, applyReferralCodeOnOrder);
router.get("/stats", isAuth, getReferralStats);

// Admin Endpoints
router.get("/admin/all", isAuth, isAdmin, getAdminReferrals);
router.get("/admin/stats", isAuth, isAdmin, getAdminStats);
router.get("/admin/export", isAuth, isAdmin, exportReferrals);
router.put("/admin/approve/:id", isAuth, isAdmin, approveReferral);
router.put("/admin/reject/:id", isAuth, isAdmin, rejectReferral);

export default router;
