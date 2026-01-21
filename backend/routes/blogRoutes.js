import express from "express";
import upload from "../middleware/multer.js";

import {
  addBlog,
  getAllBlogs,
  deleteBlog,
  updateBlog,
  getBlogById
} from "../controllers/blog.controller.js";

const router = express.Router();

// ADD BLOG
router.post("/add", upload.single("image"), addBlog);

// GET ALL BLOGS
router.get("/all", getAllBlogs);

// GET BLOG BY ID
router.get("/:id", getBlogById);

// DELETE BLOG
router.delete("/delete/:id", deleteBlog);

// UPDATE BLOG
router.put("/update/:id", upload.single("image"), updateBlog);

// ---------------- GET SINGLE BLOG ----------------
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, blog });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


export default router;
