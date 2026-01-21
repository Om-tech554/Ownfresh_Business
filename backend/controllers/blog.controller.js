import Blog from "../models/blogModel.js";

// ===================== ADD BLOG =====================
export const addBlog = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and Description are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image upload failed",
      });
    }

    const imageUrl = req.file.path || req.file.url;

    const blog = await Blog.create({
      title,
      description,
      category: category || "Other",
      image: imageUrl,
    });

    return res.status(201).json({
      success: true,
      blog,
    });

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

// ===================== UPDATE BLOG =====================
export const updateBlog = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const updateData = {
      title,
      description,
      category: category || "Other",
    };

    if (req.file) {
      updateData.image = req.file.path || req.file.url;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.json({ success: true, blog });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
