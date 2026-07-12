import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema(
  {
    variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
    oldPrice: { type: Number, required: true },
    newPrice: { type: Number, required: true },
    reason: { type: String, default: "" }, // e.g. "Bulk Update", "Manual Adjustment"
  },
  { timestamps: true }
);

export default mongoose.model("PriceHistory", priceHistorySchema);
