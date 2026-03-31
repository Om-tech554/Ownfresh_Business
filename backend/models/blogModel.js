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

    // Category
    category: {
      type: String,
      default: "OTHER",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);