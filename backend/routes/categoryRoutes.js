import express from "express";
import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} from "../controllers/categoryController.js";
import isAuth, { isAdmin } from "../middleware/isAuth.js";

import upload from "../middleware/multer.js";
const router = express.Router();

router.get("/all", getAllCategories);
router.post("/add", isAuth, isAdmin, upload.single("image"), createCategory);
router.put("/update/:id", isAuth, isAdmin, upload.single("image"), updateCategory);
router.delete("/delete/:id", isAuth, isAdmin, deleteCategory);

export default router;
