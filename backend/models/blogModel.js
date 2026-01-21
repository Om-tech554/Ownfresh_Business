import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    
    category: {
      type: String,
      enum: ["Tech", "CNC", "Mechanical", "Industry", "AI", "Other"],
      default: "Other",
    },
  },
  
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
