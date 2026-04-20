import mongoose from "mongoose";
import Category from "../models/categoryModel.js";

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")     // Replace spaces with -
        .replace(/[^\w-]+/g, "")    // Remove all non-word chars
        .replace(/--+/g, "-");    // Replace multiple - with single -
};

export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const slug = slugify(name);

        let image = "";
        if (req.file) {
            image = req.file.path;
        }

        const categoryExists = await Category.findOne({ slug });
        if (categoryExists) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        const category = await Category.create({ name, slug, image, description });
        res.status(201).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updateData = { name, description };

        if (req.file) {
            updateData.image = req.file.path;
        }

        if (name) {
            updateData.slug = slugify(name);
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid Category ID" });
        }
        const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid Category ID" });
        }
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
