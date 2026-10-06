import { marked } from "marked";
import Blog from "../models/blogModel.js";

/**
 * Helper to generate a clean URL-safe slug
 */
const slugify = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric
    .replace(/[\s_-]+/g, "-") // collapse whitespace and underscores to hyphens
    .replace(/^-+|-+$/g, ""); // trim hyphens
};

/**
 * Helper to strip HTML tags
 */
const stripHtml = (html = "") => {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
};

/**
 * POST /api/admin/blogs (or /api/posts)
 * Secured via `x-api-key: process.env.BLOG_API_KEY`
 */
export const publishAdminBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      tags,
      category,
      meta,
      status,
      image,
      author
    } = req.body;

    // 1. Validation
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: 'title' is required and must be a non-empty string.",
      });
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: 'content' is required and must be a non-empty string (HTML or Markdown).",
      });
    }

    // 2. Slug generation
    const finalSlug = slugify(slug && slug.trim() ? slug : title);

    if (!finalSlug) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Unable to generate a valid slug from the provided title or slug.",
      });
    }

    // 3. Render HTML from content (handles Markdown or raw HTML transparently)
    let htmlContent = "";
    try {
      htmlContent = marked.parse(content);
    } catch (err) {
      console.warn("Markdown parsing fallback:", err.message);
      htmlContent = content;
    }

    // 4. Meta & Excerpt resolution
    const resolvedExcerpt = (
      excerpt && typeof excerpt === "string" && excerpt.trim()
        ? excerpt.trim()
        : (meta?.description || stripHtml(htmlContent).slice(0, 160))
    );

    const resolvedMeta = {
      title: (meta?.title && typeof meta.title === "string" ? meta.title.trim() : title.trim()),
      description: (meta?.description && typeof meta.description === "string" ? meta.description.trim() : resolvedExcerpt)
    };

    // 5. Tags normalization
    let tagsList = [];
    if (Array.isArray(tags)) {
      tagsList = tags.map(t => String(t).trim()).filter(Boolean);
    } else if (typeof tags === "string") {
      tagsList = tags.split(",").map(t => t.trim()).filter(Boolean);
    }

    // 6. Category & Status
    const resolvedCategory = (category && typeof category === "string" ? category.trim() : "OTHER");
    const resolvedStatus = (status && typeof status === "string" ? status.trim().toLowerCase() : "published");

    // 7. Check if blog already exists with this slug (idempotent upsert support)
    let blog = await Blog.findOne({ slug: finalSlug });

    if (blog) {
      // Update existing
      blog.title = title.trim();
      blog.slug = finalSlug;
      blog.content = content;
      blog.description = htmlContent;
      blog.excerpt = resolvedExcerpt;
      blog.searchDescription = resolvedMeta.description || resolvedExcerpt;
      blog.tags = tagsList;
      blog.labels = tagsList;
      blog.category = resolvedCategory;
      blog.meta = resolvedMeta;
      blog.status = resolvedStatus;
      blog.sections = [{ content: htmlContent }];
      if (image) blog.image = image;
      if (author) blog.author = author;

      await blog.save();

      return res.status(200).json({
        success: true,
        action: "updated",
        message: "Blog post successfully updated",
        blog: {
          id: blog._id,
          title: blog.title,
          slug: blog.slug,
          content: blog.content,
          excerpt: blog.excerpt,
          tags: blog.tags,
          category: blog.category,
          meta: blog.meta,
          status: blog.status,
          createdAt: blog.createdAt,
          updatedAt: blog.updatedAt,
        },
      });
    }

    // Create new blog
    blog = await Blog.create({
      title: title.trim(),
      slug: finalSlug,
      content,
      description: htmlContent,
      excerpt: resolvedExcerpt,
      searchDescription: resolvedMeta.description || resolvedExcerpt,
      tags: tagsList,
      labels: tagsList,
      category: resolvedCategory,
      meta: resolvedMeta,
      status: resolvedStatus,
      sections: [{ content: htmlContent }],
      image: image || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
      author: author || "OwnFresh Editorial",
    });

    return res.status(201).json({
      success: true,
      action: "created",
      message: "Blog post successfully published",
      blog: {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt,
        tags: blog.tags,
        category: blog.category,
        meta: blog.meta,
        status: blog.status,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      },
    });

  } catch (error) {
    console.error("❌ [publishAdminBlog Exception]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

/**
 * GET /api/admin/blogs
 * Secured via `x-api-key: process.env.BLOG_API_KEY`
 * Allows pipeline healthcheck and querying published posts
 */
export const getAdminBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, blogs] = await Promise.all([
      Blog.countDocuments(),
      Blog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select("title slug excerpt category tags status createdAt updatedAt")
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      blogs,
    });
  } catch (error) {
    console.error("❌ [getAdminBlogs Exception]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};
