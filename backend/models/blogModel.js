import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    // Multiple SEO content blocks
    sections: [
      {
        content: { type: String, required: true }, // HTML from Tiptap
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
      enum: ["Tech", "CNC", "Mechanical", "Industry", "AI", "Other"],
      default: "Other",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);