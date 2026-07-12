import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, // e.g., "100ml", "1 Liter"
    sku: { type: String, default: "" },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: null },
    scheduledPrice: { type: Number, default: null },
    scheduledPriceDate: { type: Date, default: null },
    stockQuantity: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
  },
  { timestamps: true }
);

export default mongoose.model("ProductVariant", productVariantSchema);
