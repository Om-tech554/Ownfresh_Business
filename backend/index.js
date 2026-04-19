import dotenv from "dotenv"
dotenv.config() // Load env vars FIRST before anything else
import express from "express"
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
import categoryRoutes from "./routes/categoryRoutes.js";
import { initCronJobs } from "./utils/cronJobs.js";
const app = express()
const port = process.env.PORT || 10000

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Render health checks)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/product", productRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/category", categoryRoutes);
app.listen(port, () => {
    connectDB()
    initCronJobs() // 🚀 Initialize Background Sync
    console.log(`🚀 Server running on port ${port}`);
})