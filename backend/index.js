dotenv.config({ quiet: true })
import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/authrouter.js"
import cors from "cors"
import userRouter from "./routes/userroutes.js"

const app=express()
const port=process.env.port || 5000
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.listen(port,()=>{
    connectDB()
    console.log(`🚀 Server running on port ${port}`);
})