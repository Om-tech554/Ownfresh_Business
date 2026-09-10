import express from "express";
import upload from "../middleware/multer.js";
import isAuth, { isAdmin } from "../middleware/isAuth.js";
import {
  getAllTags,
  getActiveTags,
  createTag,
  updateTag,
  deleteTag,
  seedDefaultTags
} from "../controllers/tagController.js";

const router = express.Router();

router.get("/all", isAuth, isAdmin, getAllTags);
router.get("/public", getActiveTags);
router.post("/add", isAuth, isAdmin, upload.single("image"), createTag);
router.put("/update/:id", isAuth, isAdmin, upload.single("image"), updateTag);
router.delete("/delete/:id", isAuth, isAdmin, deleteTag);
router.post("/seed-defaults", isAuth, isAdmin, seedDefaultTags);

export default router;
