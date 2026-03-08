import Blog from "../models/blogModel.js";

// ===================== ADD BLOG (NEW) =====================
export const addBlog = async (req, res) => {
  try {
    const { title, sections, category } = req.body;

    if (!title || !sections) {
      return res.status(400).json({
        success: false,
        message: "Title and SEO sections are required",
      });
    }

    const parsedSections = JSON.parse(sections);

    const blog = await Blog.create({
      title,
      sections: parsedSections,
      category: category || "Other",

      image1: req.files?.image1?.[0]?.path || null,
      image2: req.files?.image2?.[0]?.path || null,
      image3: req.files?.image3?.[0]?.path || null,
      image4: req.files?.image4?.[0]?.path || null,
    });

    return res.status(201).json({ success: true, blog });
  } catch (error) {
    console.log("ADD BLOG ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== GET ALL BLOGS =====================
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== GET BLOG BY ID =====================
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== DELETE BLOG =====================
export const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== UPDATE BLOG (NEW) =====================
export const updateBlog = async (req, res) => {
  try {
    const { title, sections, category } = req.body;

    const updateData = {
      title,
      category: category || "Other",
    };

    if (sections) {
      updateData.sections = JSON.parse(sections);
    }

    // Update only the uploaded images
    if (req.files?.image1) updateData.image1 = req.files.image1[0].path;
    if (req.files?.image2) updateData.image2 = req.files.image2[0].path;
    if (req.files?.image3) updateData.image3 = req.files.image3[0].path;
    if (req.files?.image4) updateData.image4 = req.files.image4[0].path;

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({ success: true, blog });
  } catch (error) {
    console.log("UPDATE BLOG ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};