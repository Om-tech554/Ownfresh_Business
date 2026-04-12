import express from "express";
import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} from "../controllers/categoryController.js";
import isAuth, { isAdmin } from "../middleware/isAuth.js";

const router = express.Router();

router.get("/all", getAllCategories);
router.post("/add", isAuth, isAdmin, createCategory);
router.put("/update/:id", isAuth, isAdmin, updateCategory);
router.delete("/delete/:id", isAuth, isAdmin, deleteCategory);

export default router;
