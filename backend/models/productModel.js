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
    price: { type: Number, required: true },
    image: { type: String, required: true }, // path or cloudinary URL
    rating: { type: Number, default: 5 },
    shortDesc: { type: String, required: true },
    category: { type: String, required: true, default: "Eating Oil" }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);