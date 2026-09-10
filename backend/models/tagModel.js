import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", trim: true },
    slug: { type: String, lowercase: true, trim: true },
    icon: { type: String, default: "" }, // e.g., "Star", "Flame", "Leaf", "Award", "ShieldCheck"
    imageUrl: { type: String, default: "" }, // Custom badge/sticker image
    bgColor: { type: String, default: "#1E971D" }, // Badge accent color
    textColor: { type: String, default: "#ffffff" },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.models.Tag || mongoose.model("Tag", tagSchema);
