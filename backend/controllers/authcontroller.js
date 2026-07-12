import User from "../models/usermodel.js"
import Referral from "../models/referralModel.js"
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js"
import { sendOtpMail } from "../utils/mail.js"
import Wallet from "../models/walletModel.js"
import ReferralSettings from "../models/referralSettingsModel.js"
//--------------signUp----------//
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role, referralCode, deviceFingerprint } = req.body;

    if (!fullName || !email || !password || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Check for referrer
    let referrer = null;
    if (referralCode) {
        referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      mobile,
      role: role || "user",
      referredBy: referrer ? referrer._id : null,
      lastIpAddress: req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress,
      lastDeviceFingerprint: deviceFingerprint || req.headers['user-agent']
    });

    // Create wallet for the new user
    await Wallet.create({ userId: user._id, balance: 0, totalEarned: 0, totalRedeemed: 0 });

    if (referrer) {
        let rewardAmount = 50;
        const settings = await ReferralSettings.findOne();
        if (settings) {
            rewardAmount = settings.referralRewardReferred || 50;
        }

        const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;

        await Referral.create({
            referrerUserId: referrer._id,
            referredUserId: user._id,
            referralCode: referralCode.toUpperCase(),
            status: "PENDING",
            rewardAmount,
            deviceFingerprint: deviceFingerprint || req.headers['user-agent'],
            ipAddress
        });
    }

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
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "⚠️ User does not exist." });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "⚠️ incorrect password." });
        }
        const token = await genToken(user._id)
        
        // Update tracking info
        user.lastIpAddress = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;
        user.lastDeviceFingerprint = req.body.deviceFingerprint || req.headers['user-agent'];
        await user.save();

        res.cookie("token", token, {
            secure: true, // Always true for HTTPS/Render
            sameSite: "none", // Required for cross-domain auth
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
        res.clearCookie("token", {
            secure: true,
            sameSite: "none",
            httpOnly: true,
            path: "/"
        })
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

export const googleAuth = async (req, res) => {
    try {
        const { fullName, email, mobile, role, referralCode, deviceFingerprint } = req.body;
        let user = await User.findOne({ email });

        if (!user) {
            let referrer = null;
            if (referralCode) {
                referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
            }

            const generatedUserName = email.split('@')[0] + Math.random().toString(36).substring(2, 6);
            
            user = await User.create({
                fullName,
                userName: generatedUserName,
                email,
                mobile,
                role: role || "user",
                referredBy: referrer ? referrer._id : null,
                lastIpAddress: req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress,
                lastDeviceFingerprint: deviceFingerprint || req.headers['user-agent']
            });

            // Create wallet for the new user
            await Wallet.create({ userId: user._id, balance: 0, totalEarned: 0, totalRedeemed: 0 });

            if (referrer) {
                let rewardAmount = 50;
                const settings = await ReferralSettings.findOne();
                if (settings) {
                    rewardAmount = settings.referralRewardReferred || 50;
                }

                const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;

                await Referral.create({
                    referrerUserId: referrer._id,
                    referredUserId: user._id,
                    referralCode: referralCode.toUpperCase(),
                    status: "PENDING",
                    rewardAmount,
                    deviceFingerprint: deviceFingerprint || req.headers['user-agent'],
                    ipAddress
                });
            }
        }
        const token = await genToken(user._id);

        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        return res.status(200).json(user);

    } catch (error) {
        console.error("GOOGLE_AUTH_ERROR:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
