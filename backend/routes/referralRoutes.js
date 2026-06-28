import express from "express";
import { 
    getReferralStats, 
    generateAffiliateCoupon, 
    getAffiliateData, 
    adminGetAffiliateStats, 
    updateAffiliateSettings, 
    unlockAffiliateViaSubscription,
    applyReferral,
    updateCustomReferralCode
} from "../controllers/referralController.js";
import isAuth, { isAdmin } from "../middleware/isAuth.js";

const router = express.Router();

// User Routes
router.get("/stats", isAuth, getReferralStats);
router.post("/apply-referral", isAuth, applyReferral);
router.post("/update-code", isAuth, updateCustomReferralCode);
router.post("/generate-coupon", isAuth, generateAffiliateCoupon);
router.get("/affiliate-data", isAuth, getAffiliateData);
router.post("/unlock-affiliate", isAuth, unlockAffiliateViaSubscription);

// Admin Routes
router.get("/admin/stats", isAuth, isAdmin, adminGetAffiliateStats);
router.put("/admin/settings", isAuth, isAdmin, updateAffiliateSettings);

export default router;
