import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Blog from './models/blogModel.js';
import Product from './models/productModel.js';

dotenv.config();

const testDB = async () => {
    try {
        console.log("Connecting to:", process.env.MONGODB_URL);
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ Connected");
        
        const blogCount = await Blog.countDocuments({});
        const productCount = await Product.countDocuments({});
        
        console.log("Blog Count:", blogCount);
        console.log("Product Count:", productCount);
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

testDB();
