import express from "express";
import { verifyBlogApiKey } from "../middleware/apiKeyAuth.js";
import { publishAdminBlog, getAdminBlogs } from "../controllers/adminBlogController.js";

const router = express.Router();

/**
 * Routes protected by header `x-api-key: process.env.BLOG_API_KEY`
 * - POST /api/admin/blogs (and alias /api/posts)
 * - GET  /api/admin/blogs (and alias /api/posts)
 */
router.post("/", verifyBlogApiKey, publishAdminBlog);
router.get("/", verifyBlogApiKey, getAdminBlogs);

export default router;
