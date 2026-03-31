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

    const imageUrl = req.files?.image?.[0]?.path || req.files?.image?.[0]?.url;

    // Use a placeholder if no image exists to avoid crashing while debugging
    const finalImageUrl = imageUrl || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1/blogs/default_placeholder";

    const blog = await Blog.create({
      title,
      description,
      sections: [{ content: description }], 
      category: category ? category.toUpperCase() : "OTHER",
      image: finalImageUrl,
      image1: req.files?.image1?.[0]?.path || req.files?.image1?.[0]?.url || null,
      image2: req.files?.image2?.[0]?.path || req.files?.image2?.[0]?.url || null,
      image3: req.files?.image3?.[0]?.path || req.files?.image3?.[0]?.url || null,
      image4: req.files?.image4?.[0]?.path || req.files?.image4?.[0]?.url || null,
    });

    return res.status(201).json({
      success: true,
      blog,
    });

  } catch (error) {
    console.error("ADD BLOG EXCEPTION:", error);
    return res.status(500).json({ 
        success: false, 
        message: "Detailed Server Error: " + error.message,
        details: error.name
    });
  }
};

// ===================== GET ALL BLOGS (PAGINATED & FILTERED) =====================
export const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 6, search = "", category = "" } = req.query;

    const query = {};

    // 🔍 Handle Title Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // 🏷️ Handle Category Filter
    if (category) {
      query.category = category;
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 6;
    const skip = (pageNum - 1) * limitNum;
    
    const count = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({ 
      success: true, 
      blogs,
      totalPages: Math.ceil(count / limitNum) || 1,
      currentPage: pageNum,
      totalBlogs: count
    });
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
      sections: [{ content: description }],
      category: category ? category.toUpperCase() : "OTHER",
    };

    if (req.files) {
      if (req.files.image?.[0]) updateData.image = req.files.image[0].path || req.files.image[0].url;
      if (req.files.image1?.[0]) updateData.image1 = req.files.image1[0].path || req.files.image1[0].url;
      if (req.files.image2?.[0]) updateData.image2 = req.files.image2[0].path || req.files.image2[0].url;
      if (req.files.image3?.[0]) updateData.image3 = req.files.image3[0].path || req.files.image3[0].url;
      if (req.files.image4?.[0]) updateData.image4 = req.files.image4[0].path || req.files.image4[0].url;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: false, // Turn off for now to prioritize saving
    });

    if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found to update." });
    }

    res.json({ success: true, blog });
    
  } catch (error) {
    console.error("UPDATE BLOG EXCEPTION:", error);
    res.status(500).json({ 
        success: false, 
        message: "Update Error: " + error.message,
        details: error.name
    });
  }
};
