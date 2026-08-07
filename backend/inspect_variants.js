import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/productModel.js";
import Category from "./models/categoryModel.js";

dotenv.config();

// Define Variant Schema inline if needed
const variantSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
});

const ProductVariant = mongoose.models.ProductVariant || mongoose.model("ProductVariant", variantSchema);

async function checkVariants() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to DB!");

    const variants = await ProductVariant.find({});
    console.log(`Total Variants in DB: ${variants.length}`);
    variants.forEach(v => console.log(` - Variant: ${v.name}, Product ID: ${v.product}, Price: ₹${v.price}, SalePrice: ₹${v.salePrice}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkVariants();
