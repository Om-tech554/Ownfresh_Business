import Blog from "../models/blogModel.js";
import { bloggerService } from "../utils/bloggerService.js";
import * as aiService from "../services/ai/articleAiService.js";
import dns from "dns";
import { promisify } from "util";
import axios from "axios";

const lookupPromise = promisify(dns.lookup);


// ===================== ADD BLOG =====================
export const addBlog = async (req, res) => {
  try {
    const { title, description, category, labels, status, searchDescription, location, author, publishedAt, focusKeyword, slug } = req.body;
    
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
      author: author || "Own Fresh Blogs",
      focusKeyword: focusKeyword || "",
      slug: slug || "",
      language: req.body.language || "en"
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
    const { id } = req.params;
    let blog;
    
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(id);
    } else {
      blog = await Blog.findOne({ slug: id });
    }

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
    const { title, description, category, labels, status, searchDescription, location, author, publishedAt, focusKeyword, slug } = req.body;
    
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
      author: author || "Own Fresh Blogs",
      focusKeyword: focusKeyword || "",
      slug: slug || "",
      language: req.body.language || "en"
    };

    if (req.files) {
      if (req.files.image?.[0]) updateData.image = req.files.image[0].path || req.files.image[0].url;
      if (req.files.image1?.[0]) updateData.image1 = req.files.image1[0].path || req.files.image1[0].url;
      if (req.files.image2?.[0]) updateData.image2 = req.files.image2[0].path || req.files.image2[0].url;
      if (req.files.image3?.[0]) updateData.image3 = req.files.image3[0].path || req.files.image3[0].url;
      if (req.files.image4?.[0]) updateData.image4 = req.files.image4[0].path || req.files.image4[0].url;
    }

    if (req.body.deleteImage === "true") updateData.image = null;
    if (req.body.deleteImage1 === "true") updateData.image1 = null;
    if (req.body.deleteImage2 === "true") updateData.image2 = null;
    if (req.body.deleteImage3 === "true") updateData.image3 = null;
    if (req.body.deleteImage4 === "true") updateData.image4 = null;

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

// ===================== SSRF HELPER & METADATA FETCHING =====================
const isPrivateIp = (ip) => {
  if (!ip) return true;
  if (ip === "::1" || ip === "0.0.0.0" || ip === "localhost") return true;

  const parts = ip.split(".").map(Number);
  if (parts.length === 4) {
    const [p1, p2, p3, p4] = parts;
    if (p1 === 127) return true;
    if (p1 === 10) return true;
    if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
    if (p1 === 192 && p2 === 168) return true;
    if (p1 === 169 && p2 === 254) return true;
    return false;
  }

  if (ip.startsWith("fc00:") || ip.startsWith("fd00:") || ip.startsWith("fe80:") || ip === "::") {
    return true;
  }
  return false;
};

const isSafeUrl = async (urlStr) => {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }
    const { address } = await lookupPromise(url.hostname);
    return !isPrivateIp(address);
  } catch (error) {
    return false;
  }
};

export const fetchBookmarkMetadata = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: "URL is required" });
    }

    const safe = await isSafeUrl(url);
    if (!safe) {
      return res.status(400).json({ success: false, message: "Invalid or unsafe URL requested" });
    }

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      },
      timeout: 5000,
    });

    const html = response.data;
    if (typeof html !== "string") {
      throw new Error("Target did not return a valid HTML body");
    }

    // Extract Title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i) || html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "Link Bookmark";

    // Extract Description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) || html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
    const description = descMatch ? descMatch[1].trim() : "No description available for this link.";

    // Extract Image
    const imageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i) || html.match(/<meta\s+name=["']twitter:image["']\s+content=["'](.*?)["']/i);
    let image = imageMatch ? imageMatch[1] : "";
    if (image && !image.startsWith("http")) {
      const urlObj = new URL(url);
      image = new URL(image, urlObj.origin).href;
    }

    const domain = new URL(url).hostname;

    return res.json({
      success: true,
      metadata: { title, description, image, domain, url }
    });
  } catch (error) {
    console.error("Bookmark Metadata Fetch Error:", error.message);
    return res.status(500).json({ success: false, message: `Could not load page metadata: ${error.message}` });
  }
};

// ===================== LINKS CHECKER =====================
export const checkLinks = async (req, res) => {
  try {
    const { links } = req.body;
    if (!links || !Array.isArray(links)) {
      return res.status(400).json({ success: false, message: "An array of links is required" });
    }

    const results = await Promise.all(
      links.map(async (url) => {
        try {
          if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
            return { url, status: "broken", code: null, message: "Invalid URL protocol" };
          }

          const safe = await isSafeUrl(url);
          if (!safe) {
            return { url, status: "broken", code: 403, message: "Forbidden destination (SSRF protection)" };
          }

          // Try HEAD request
          try {
            const headRes = await axios.head(url, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
              timeout: 4000,
              validateStatus: () => true
            });
            if (headRes.status >= 200 && headRes.status < 400) {
              return { url, status: "working", code: headRes.status };
            }
          } catch (headErr) {
            // Fall back to GET
          }

          // Try GET request
          const getRes = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
            timeout: 4000,
            validateStatus: () => true
          });

          if (getRes.status >= 200 && getRes.status < 400) {
            return { url, status: "working", code: getRes.status };
          } else {
            return { url, status: "broken", code: getRes.status, message: `Status code ${getRes.status}` };
          }
        } catch (err) {
          return { url, status: "broken", code: null, message: err.message };
        }
      })
    );

    return res.json({ success: true, results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== AI ASSISTANT ENDPOINTS =====================
export const aiOutline = async (req, res) => {
  try {
    const { title, focusKeyword, description, content } = req.body;
    const outline = await aiService.generateOutline({ title, focusKeyword, description, content });
    return res.json({ success: true, outline });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const aiBlogPost = async (req, res) => {
  try {
    const { title, focusKeyword, description, content, prompt } = req.body;
    const article = await aiService.generateBlogPost({ title, focusKeyword, description, content, prompt });
    return res.json({ success: true, article });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const aiFAQ = async (req, res) => {
  try {
    const { title, focusKeyword, content } = req.body;
    const faq = await aiService.generateFAQ({ title, focusKeyword, content });
    return res.json({ success: true, faq });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const aiSEOBrief = async (req, res) => {
  try {
    const { title, focusKeyword } = req.body;
    const brief = await aiService.generateSEOBrief({ title, focusKeyword });
    return res.json({ success: true, brief });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const aiKeywords = async (req, res) => {
  try {
    const { title, focusKeyword } = req.body;
    const keywords = await aiService.generateKeywordIdeas({ title, focusKeyword });
    return res.json({ success: true, keywords });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const aiRewrite = async (req, res) => {
  try {
    const { text, tone } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text is required" });
    const result = await aiService.rewriteText({ text, tone });
    return res.json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const aiImprove = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text is required" });
    const result = await aiService.improveText({ text });
    return res.json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const aiExpand = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text is required" });
    const result = await aiService.expandText({ text });
    return res.json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const aiShorten = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text is required" });
    const result = await aiService.shortenText({ text });
    return res.json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const aiMetaDescription = async (req, res) => {
  try {
    const { title, content } = req.body;
    const description = await aiService.generateMetaDescription({ title, content });
    return res.json({ success: true, description });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

