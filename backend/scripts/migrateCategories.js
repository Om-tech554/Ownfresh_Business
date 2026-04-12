import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

dotenv.config();

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");
};

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected successfully!");

        // 1. Find all unique category names currently used in products
        // (Note: Since I changed the model, this might be tricky if it validation fails)
        // I should have done this BEFORE changing the model, but I can use an untyped query or temporary model.

        // Let's use a temporary model to read the old data if needed, 
        // but Mongoose usually allows reading even if validation fails if we don't save.

        // Find all products
        const products = await Product.find({});
        console.log(`Found ${products.length} products.`);

        const uniqueCategoryNames = ["Eating Oil"]; // Default
        products.forEach(p => {
            if (typeof p.category === 'string' && !uniqueCategoryNames.includes(p.category)) {
                uniqueCategoryNames.push(p.category);
            }
        });

        console.log("Unique Categories found:", uniqueCategoryNames);

        // 2. Create Category documents
        const categoryMap = {};
        for (const name of uniqueCategoryNames) {
            const slug = slugify(name);
            let category = await Category.findOne({ slug });
            if (!category) {
                category = await Category.create({ name, slug });
                console.log(`Created category: ${name}`);
            }
            categoryMap[name] = category._id;
        }

        // 3. Update products to use ObjectId
        // Since I changed the model to mongoose.Schema.Types.ObjectId, 
        // Mongoose might complain if I try to find products with string category.
        // I'll bypass validation for the update.

        for (const product of products) {
            if (typeof product.category === 'string') {
                const catId = categoryMap[product.category] || categoryMap["Eating Oil"];
                await Product.collection.updateOne(
                    { _id: product._id },
                    { $set: { category: catId } }
                );
                console.log(`Updated product ${product.name} to category ID ${catId}`);
            }
        }

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
