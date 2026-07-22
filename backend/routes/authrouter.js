import express from "express"
import { googleAuth, resetPassword, sendOtp, signIn, signOut, signUp, verifyOtp, verifySignupOtp, resendSignupOtp } from "../controllers/authcontroller.js"

const authRouter=express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/signin",signIn)
authRouter.get("/signout",signOut)
authRouter.post("/send-otp",sendOtp)
authRouter.post("/verify-otp",verifyOtp)
authRouter.post("/reset-password",resetPassword)
authRouter.post("/google-auth", googleAuth)
authRouter.post("/verify-signup-otp", verifySignupOtp)
authRouter.post("/resend-signup-otp", resendSignupOtp)
export default authRouter