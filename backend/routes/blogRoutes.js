import express from "express";
import upload from "../middleware/multer.js";

import {
  addBlog,
  getAllBlogs,
  deleteBlog,
  updateBlog,
  getBlogById,
} from "../controllers/blog.controller.js";

const router = express.Router();

// ADD BLOG (supports 4 images)
router.post(
  "/add",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addBlog
);

// GET ALL BLOGS
router.get("/all", getAllBlogs);

// GET SINGLE BLOG
router.get("/:id", getBlogById);

// UPDATE BLOG
router.put(
  "/update/:id",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  updateBlog
);

// DELETE
router.delete("/delete/:id", deleteBlog);

export default router;