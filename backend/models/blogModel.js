import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },

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
      enum: ["LIVE", "DRAFT"], 
      default: "LIVE" 
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

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);