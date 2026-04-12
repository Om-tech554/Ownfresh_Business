import mongoose from "mongoose";
import dotenv from "dotenv";
import Blog from "./models/blogModel.js";

dotenv.config();

const checkCount = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const count = await Blog.countDocuments();
        const unsynced = await Blog.countDocuments({ 
            $or: [
                { bloggerId: { $exists: false } },
                { bloggerId: null },
                { bloggerId: "" }
            ]
        });
        console.log(`Total blogs in DB: ${count}`);
        console.log(`Unsynced blogs: ${unsynced}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCount();
