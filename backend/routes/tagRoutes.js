import express from "express";
import upload from "../middleware/multer.js";
import {
  getAllTags,
  getActiveTags,
  createTag,
  updateTag,
  deleteTag,
  seedDefaultTags
} from "../controllers/tagController.js";

const router = express.Router();

router.get("/all", getAllTags);
router.get("/public", getActiveTags);
router.post("/add", upload.single("image"), createTag);
router.put("/update/:id", upload.single("image"), updateTag);
router.delete("/delete/:id", deleteTag);
router.post("/seed-defaults", seedDefaultTags);

export default router;
