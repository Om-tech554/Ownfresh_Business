import express from "express";
import {
  getGalleryImages,
  adminGetGalleryImages,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from "../controllers/galleryController.js";
import isAuth, { isAdmin } from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Public route to fetch active images
router.get("/", getGalleryImages);

// Admin-only management routes
router.get("/admin", isAuth, isAdmin, adminGetGalleryImages);
router.post("/admin/upload", isAuth, isAdmin, upload.single("image"), uploadGalleryImage);
router.put("/admin/:id", isAuth, isAdmin, updateGalleryImage);
router.delete("/admin/:id", isAuth, isAdmin, deleteGalleryImage);

export default router;
