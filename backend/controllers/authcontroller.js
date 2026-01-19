import User from "../models/usermodel.js"
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js"
import { sendOtpMail } from "../utils/mail.js"

//--------------signUp----------//
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;

    if (!fullName || !email || !password || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      mobile,
      role: role || "user", // ✅ IMPORTANT
    });

    return res.status(201).json({
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
};
//--------------signIn------------------//
export const signIn = async (req, res) => {
    try {
        const { fullName, email, password, mobile } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "⚠️ User does not exists." })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "⚠️ incorrect password." })
        }
        const token = await genToken(user._id)
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json(`sign in error ${error}`)
    }
}
//--------------signOut----------------//
export const signOut = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "signout successfully" })
    } catch (error) {
        return res.status(500).json(`signout error ${error}`)
    }
}
//--------------sendOtp----------------//
export const sendOtp=async (req,res) => {
    try{
        const {email}=req.body
        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({ message: "⚠️ User does not exists."})
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp=otp
        user.otpExpires=Date.now()+5*60*1000
        user.isOtpVerified=false
        await user.save()
        await sendOtpMail(email,otp)
        return res.status(200).json({message:"Otp sent successfully"})
    }catch(error){
       return res.status(500).json(`send Otp error ${error}`)
    }
}
//--------------VerifyOtp-------------//
export const verifyOtp=async (req,res) =>{
    try {
        const {email,otp}=req.body
        const user=await User.findOne({email})
        if(!user || user.resetOtp!=otp || user.otpExpires<Date.now()){
            return res.status(400).json({message:"invalid Otp/expired Otp"})
        }
        user.isOtpVerified=true
        user.resetOtp=undefined
        user.otpExpires=undefined
        await user.save()
         return res.status(200).json({message:"Otp verfied successfully"})
    } catch (error) {
         return res.status(500).json(`verify Otp error ${error}`)
    }
}
//--------------restPassword---------//
export const resetPassword=async (req,res) => {
    try {
        const {email,password}=req.body
        const user=await User.findOne({email})
        if(!user || !user.isOtpVerified){
            return res.status(400).json({ message: "⚠️ Otp verification required..."})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password=hashedPassword
        user.isOtpVerified=false
        await user.save()
        return res.status(200).json({ message: "Password reset successfully" })

    } catch (error) {
        return res.status(500).json(`Reset password error ${error}`)
    }
}
//----------GoogleAuthenticationSignUP----//
// export const googleAuth=async(req,res) => {
//     try {
//         const{fullName,email,mobile,role}=req.body
//         let user=await User.findOne({email})
//         if(!user){
//             user=await User.create({
//                 fullName,email,mobile,role: role || "user"
//             })
//         }
//          const token = await genToken(user._id)
//         res.cookie("token", token, {
//             secure: false,
//             sameSite: "strict",
//             maxAge: 7 * 24 * 60 * 60 * 1000,
//             httpOnly: true
//         })
//         return res.status(200).json(user)
//     } catch (error) {
//         return res.status(500).json(`Google Auth Error ${error}`)
//     }
// }
// export const googleAuth = async (req, res) => {
//     try {
//         const { fullName, email,mobile } = req.body;
//         let user = await User.findOne({ email });

//         if (!user) {
//             // Create the user without mobile or password
//             user = await User.create({
//                 fullName,
//                 email,
//                 mobile,
//                 role: "user" 
//             });
//         }

//         const token = await genToken(user._id);
//         res.cookie("token", token, {
//             secure: false, // Set to true if using HTTPS
//             sameSite: "strict",
//             maxAge: 7 * 24 * 60 * 60 * 1000,
//             httpOnly: true
//         });

//         return res.status(200).json(user);
//     } catch (error) {
//         // IMPORTANT: Check your BACKEND terminal for this log
//         console.error("GOOGLE_AUTH_DETAILED_ERROR:", error.message);
//         return res.status(400).json({ message: error.message });
//     }
// };

export const googleAuth = async (req, res) => {
    try {
        const { fullName, email, mobile, role } = req.body;
        let user = await User.findOne({ email });

        if (!user) {
            // If user doesn't exist and no mobile is provided, it's an incomplete registration
            if (!mobile) {
                return res.status(400).json({ 
                    message: "User not found. Please Sign Up with your mobile number first." 
                });
            }

            // Create new user if mobile IS provided (from Signup page)
            user = await User.create({
                fullName,
                email,
                mobile,
                role: role || "user"
            });
        }
        // 5. Generate JWT Token
        const token = await genToken(user._id);

        // 6. Set Cookie
        res.cookie("token", token, {
            secure: process.env.NODE_ENV === "production", // Better practice
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        // 7. Success Response
        return res.status(200).json({
            message: `Welcome back, ${user.fullName}`,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                role: user.role
            }
        });

    } catch (error) {
        console.error("GOOGLE_AUTH_ERROR:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};