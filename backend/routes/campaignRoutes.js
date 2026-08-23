import express from "express";
import isAuth, { isAdmin } from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  patchCampaignStatus,
  deleteCampaign,
  duplicateCampaign,
  getActiveCampaign
} from "../controllers/campaignController.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveCampaign);

// Admin routes (requires authentication & admin privileges)
router.get("/all", isAuth, isAdmin, getAllCampaigns);
router.get("/:id", isAuth, isAdmin, getCampaignById);

router.post(
  "/create",
  isAuth,
  isAdmin,
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "mobileBannerImage", maxCount: 1 }
  ]),
  createCampaign
);

router.put(
  "/:id",
  isAuth,
  isAdmin,
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "mobileBannerImage", maxCount: 1 }
  ]),
  updateCampaign
);

router.patch("/:id/status", isAuth, isAdmin, patchCampaignStatus);
router.delete("/:id", isAuth, isAdmin, deleteCampaign);
router.post("/:id/duplicate", isAuth, isAdmin, duplicateCampaign);

export default router;
