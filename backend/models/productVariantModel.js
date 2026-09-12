import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, // e.g., "250ml", "500ml", "1 Litre", "2 Litre", "5 Litre"
    size: { type: String, default: "" }, // e.g., "250ml", "500ml", "1L", "2L", "5L"
    sku: { type: String, default: "" },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: null },
    scheduledPrice: { type: Number, default: null },
    scheduledPriceDate: { type: Date, default: null },
    stockQuantity: { type: Number, default: 0 },
    weight: { type: String, default: "" }, // e.g., "250g", "1kg", "5kg"
    shippingWeight: { type: Number, default: 0 }, // Actual package shipment weight in kg (e.g., 0.35, 0.65, 1.20, 5.50)
    image: { type: String, default: "" }, // Primary bottle image for this size
    images: [{ type: String }], // Multiple images for this size (front, back, side, close-up, packaging, label)
    labelImage: { type: String, default: "" }, // Bottle label specific to this size
    tags: [{ type: String }], // Custom tags/badges for this variant
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
  },
  { timestamps: true }
);

export default mongoose.models.ProductVariant || mongoose.model("ProductVariant", productVariantSchema);

