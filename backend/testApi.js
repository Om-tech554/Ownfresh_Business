import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/productModel.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB Connected");
  } catch (error) {
    console.log("DB Error:", error.message);
    process.exit(1);
  }
};

const run = async () => {
    await connectDB();
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        console.log("Found products:", products.length);
        console.log(JSON.stringify(products, null, 2));
    } catch(err) {
        console.log("Find error:", err.message);
    }
    process.exit(0);
}

run();
