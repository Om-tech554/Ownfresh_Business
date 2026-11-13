import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String }, // HTML body for existing UI
    content: { type: String }, // Raw HTML or Markdown content
    excerpt: { type: String }, // Short summary / excerpt
    tags: [{ type: String }], // Array of tags
    meta: {
      title: { type: String },
      description: { type: String },
    },
    image: { 
      type: String, 
      default: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png" 
    },

    // Multiple SEO content blocks
    sections: [
      {
        content: { type: String }, // HTML body
      },
    ],

    // Accept up to 4 images
    image1: { type: String },
    image2: { type: String },
    image3: { type: String },
    image4: { type: String },

    // Blogger Sync & Metadata
    bloggerId: { type: String },
    labels: [{ type: String }],
    status: { 
      type: String, 
      enum: ["LIVE", "DRAFT", "published", "draft", "PUBLISHED", "archived"], 
      default: "published" 
    },
    searchDescription: { type: String }, // For SEO meta tags
    location: { type: String }, // Geographic context
    author: { type: String, default: "Own Fresh Blogs" },

    // Category
    category: {
      type: String,
      default: "OTHER",
    },

    // RankMath SEO fields
    focusKeyword: { type: String, default: "" },
    slug: { type: String, default: "" },
    language: { type: String, default: "en" },
  },
  { timestamps: true }
);

// Pre-save middleware to keep Hermes schema fields and legacy fields synchronized
blogSchema.pre("save", async function () {
  // 1. Slug handling: Never overwrite an existing valid slug unless explicitly modified
  if (!this.slug || !this.slug.trim()) {
    const raw = (this.title || String(this._id || "article")).toString();
    let baseSlug = raw
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!baseSlug) baseSlug = `article-${Date.now()}`;

    let uniqueSlug = baseSlug;
    let counter = 1;
    const BlogModel = this.constructor;
    try {
      if (mongoose.connection?.readyState === 1 && BlogModel?.exists) {
        while (await BlogModel.exists({ slug: uniqueSlug, _id: { $ne: this._id } })) {
          uniqueSlug = `${baseSlug}-${counter++}`;
        }
      }
    } catch {
      // Fallback to baseSlug
    }
    this.slug = uniqueSlug;
  } else if (this.isModified("slug")) {
    let cleanSlug = this.slug
      .toString()
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let uniqueSlug = cleanSlug;
    let counter = 1;
    const BlogModel = this.constructor;
    try {
      if (mongoose.connection?.readyState === 1 && BlogModel?.exists) {
        while (await BlogModel.exists({ slug: uniqueSlug, _id: { $ne: this._id } })) {
          uniqueSlug = `${cleanSlug}-${counter++}`;
        }
      }
    } catch {
      // Fallback to cleanSlug
    }
    this.slug = uniqueSlug;
  }
  // Existing slugs without modification remain 100% UNTOUCHED!

  if (!this.description && this.content) {
    this.description = this.content;
  }
  if (!this.content && this.description) {
    this.content = this.description;
  }
  if (!this.searchDescription) {
    this.searchDescription = this.meta?.description || this.excerpt || (this.description ? this.description.replace(/<[^>]+>/g, "").slice(0, 160) : "");
  }
  if (!this.excerpt && this.searchDescription) {
    this.excerpt = this.searchDescription;
  }
  if ((!this.labels || this.labels.length === 0) && this.tags && this.tags.length > 0) {
    this.labels = this.tags;
  }
  if ((!this.tags || this.tags.length === 0) && this.labels && this.labels.length > 0) {
    this.tags = this.labels;
  }
  if (!this.sections || this.sections.length === 0) {
    this.sections = [{ content: this.description || this.content || "" }];
  }
  if (!this.meta) {
    this.meta = {
      title: this.title || "",
      description: this.searchDescription || this.excerpt || ""
    };
  } else {
    if (!this.meta.title) this.meta.title = this.title || "";
    if (!this.meta.description) this.meta.description = this.searchDescription || this.excerpt || "";
  }
});

// Automatic sitemap cache invalidation hook on any blog save
blogSchema.post("save", function () {
  try {
    const frontendUrl = (process.env.FRONTEND_URL || "https://www.myownfresh.com").replace(/\/+$/, "");
    fetch(`${frontendUrl}/api/sitemap/refresh`).catch(() => {});
  } catch (err) {}
});

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);