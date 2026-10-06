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
blogSchema.pre("save", function () {
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

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);