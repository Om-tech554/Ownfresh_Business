import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 120
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  hasResults: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}, { timestamps: true });

searchLogSchema.index({ query: 1, createdAt: -1 });
searchLogSchema.index({ createdAt: -1 });

export default mongoose.models.SearchLog || mongoose.model("SearchLog", searchLogSchema);
