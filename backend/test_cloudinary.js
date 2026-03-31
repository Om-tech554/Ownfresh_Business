import cloudinary from './utils/cloudinary.js';
import dotenv from 'dotenv';
dotenv.config();

const testCloudinary = async () => {
    try {
        console.log("Config:", cloudinary.config());
        const res = await cloudinary.uploader.upload('https://via.placeholder.com/150', {
            folder: 'test'
        });
        console.log("✅ Cloudinary Success:", res.secure_url);
        process.exit(0);
    } catch (error) {
        console.error("❌ Cloudinary Error:", error);
        process.exit(1);
    }
}

testCloudinary();
