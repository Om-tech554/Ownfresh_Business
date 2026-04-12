import Blog from "../models/blogModel.js";
import { bloggerService } from "../utils/bloggerService.js";

// ===================== ADD BLOG =====================
export const addBlog = async (req, res) => {
  try {
    const { title, description, category, labels, status, searchDescription, location, author, publishedAt } = req.body;
    
    // Parse labels if sent as a string
    let labelsArray = [];
    if (labels) {
      labelsArray = typeof labels === "string" ? labels.split(",").map(l => l.trim()) : labels;
    }

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and Description (HTML content) are required",
      });
    }

    const imageUrl = req.files?.image?.[0]?.path || req.files?.image?.[0]?.url;
    const finalImageUrl = imageUrl || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1/blogs/default_placeholder";

    // 1. Sync with Blogger
    const isDraft = status === "DRAFT";
    const bloggerSync = await bloggerService.createPost({
      title,
      content: description,
      labels: labelsArray,
      isDraft,
      location,
      publishedAt
    });

    // 2. Create in MongoDB
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
      bloggerId: bloggerSync?.data?.id || null,
      labels: labelsArray,
      status: status || "LIVE",
      searchDescription,
      location,
      author: author || "Own Fresh Blogs"
    });

    return res.status(201).json({
      success: true,
      blog,
      bloggerSynced: bloggerSync.success,
      bloggerError: bloggerSync.success ? null : bloggerSync.error
    });

  } catch (error) {
    console.error("ADD BLOG EXCEPTION:", error);
    return res.status(500).json({ 
        success: false, 
        message: "Server Error: " + error.message
    });
  }
};

// ===================== GET ALL BLOGS (PAGINATED & FILTERED) =====================
export const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 6, search = "", category = "" } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
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
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    let bloggerDeleted = false;
    if (blog.bloggerId) {
      const sync = await bloggerService.deletePost(blog.bloggerId);
      bloggerDeleted = sync.success;
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true, 
      message: "Blog deleted successfully from CMS",
      bloggerSynced: bloggerDeleted 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== UPDATE BLOG =====================
export const updateBlog = async (req, res) => {
  try {
    const { title, description, category, labels, status, searchDescription, location, author, publishedAt } = req.body;
    
    let labelsArray = [];
    if (labels) {
      labelsArray = typeof labels === "string" ? labels.split(",").map(l => l.trim()) : labels;
    }

    const currentBlog = await Blog.findById(req.params.id);
    if (!currentBlog) {
      return res.status(404).json({ success: false, message: "Blog not found." });
    }

    const updateData = {
      title,
      description,
      sections: [{ content: description }],
      category: category ? category.toUpperCase() : "OTHER",
      labels: labelsArray,
      status: status || "LIVE",
      searchDescription,
      location,
      author: author || "Own Fresh Blogs"
    };

    if (req.files) {
      if (req.files.image?.[0]) updateData.image = req.files.image[0].path || req.files.image[0].url;
      if (req.files.image1?.[0]) updateData.image1 = req.files.image1[0].path || req.files.image1[0].url;
      if (req.files.image2?.[0]) updateData.image2 = req.files.image2[0].path || req.files.image2[0].url;
      if (req.files.image3?.[0]) updateData.image3 = req.files.image3[0].path || req.files.image3[0].url;
      if (req.files.image4?.[0]) updateData.image4 = req.files.image4[0].path || req.files.image4[0].url;
    }

    // 1. Sync with Blogger
    let bloggerSynced = false;
    let bloggerError = null;

    if (currentBlog.bloggerId) {
      const bloggerSync = await bloggerService.updatePost(currentBlog.bloggerId, {
        title,
        content: description,
        labels: labelsArray,
        isDraft: status === "DRAFT",
        location,
        publishedAt
      });
      bloggerSynced = bloggerSync.success;
      bloggerError = bloggerSync.error;
    } else {
      const bloggerSync = await bloggerService.createPost({
        title,
        content: description,
        labels: labelsArray,
        isDraft: status === "DRAFT",
        location,
        publishedAt
      });
      if (bloggerSync.success) {
        updateData.bloggerId = bloggerSync.data.id;
        bloggerSynced = true;
      } else {
        bloggerError = bloggerSync.error;
      }
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({ 
      success: true, 
      blog, 
      bloggerSynced,
      bloggerError
    });
    
  } catch (error) {
    console.error("UPDATE BLOG EXCEPTION:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
