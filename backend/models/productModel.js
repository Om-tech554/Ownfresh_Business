// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     price: { type: Number, required: true },
//     image: { type: String, required: true }, // Cloudinary URL
//     rating: { type: Number, default: 5 },
//   shortDesc: { type: String, required: true }
//  },
//   { timestamps: true }
// );
// export default mongoose.model("Product", productSchema);


import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, default: "" }, // Optional SKU for the parent product
    image: { type: String, required: true }, // Main display image
    images: [{ type: String }], // Multi-image gallery for product
    rating: { type: Number, default: 5 },
    shortDesc: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    badges: [{ type: String }], // e.g. ["Stone Pressed", "Organic", "Best Seller", "Special Offer"]
    labelImage: { type: String, default: "" }, // Bottle / packaging label image
    certificationImages: [{ type: String }], // Certification stickers/badges
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);