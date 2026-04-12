dotenv.config({ quiet: true }) // Force Restart Trigger v2 (Updated Category Enum)
import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/authrouter.js"
import cors from "cors"
import userRouter from "./routes/userroutes.js"
import productRoutes from "./routes/productRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import { initCronJobs } from "./utils/cronJobs.js";
const app=express()
const port=process.env.port || 5000
app.use(cors({
    origin: true,
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/product", productRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/coupon", couponRoutes);
app.listen(port,()=>{
    connectDB()
    initCronJobs() // 🚀 Initialize Background Sync
    console.log(`🚀 Server running on port ${port}`);
})