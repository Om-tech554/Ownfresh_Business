import express from "express"
import { getCurrentUser, getAllUsers, updateUser, deleteUser } from "../controllers/usercontroller.js"
import isAuth, { isAdmin } from "../middleware/isAuth.js"

const userRouter=express.Router()

userRouter.get("/current",isAuth, getCurrentUser)

// Admin routes
userRouter.get("/admin/all", isAuth, isAdmin, getAllUsers)
userRouter.put("/admin/:id", isAuth, isAdmin, updateUser)
userRouter.delete("/admin/:id", isAuth, isAdmin, deleteUser)

export default userRouter