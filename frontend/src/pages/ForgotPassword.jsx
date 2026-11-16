import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userslice";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // steps: 1 = email, 2 = otp, 3 = new password
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [directLoginLoading, setDirectLoginLoading] = useState(false);
  const [error, setError] = useState("");

  // STEP 1: Send OTP
  const handleSendOtp = async () => {
    if (!email || !email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email: email.trim().toLowerCase() },
        { withCredentials: true }
      );

      toast.success(res.data?.message || "OTP sent to your email!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please check the email address.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  // andLoginDirectly = true logs device in immediately using verified OTP (no new password required)
  const handleVerifyOtp = async (andLoginDirectly = false) => {
    if (!otp || !otp.trim()) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      if (andLoginDirectly) {
        setDirectLoginLoading(true);
      } else {
        setLoading(true);
      }
      setError("");

      const res = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        },
        { withCredentials: true }
      );

      if (andLoginDirectly && res.data?.user) {
        if (res.data.token) {
          localStorage.setItem("oil_token", res.data.token);
        }
        dispatch(setUserData(res.data.user));
        toast.success(`Logged in as ${res.data.user.fullName || "User"}! Welcome back!`);
        navigate("/");
        return;
      }

      toast.success("OTP verified successfully!");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
      setDirectLoginLoading(false);
    }
  };

  // STEP 3: Reset Password & Auto Login
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        {
          email: email.trim().toLowerCase(),
          password,
        },
        { withCredentials: true }
      );

      if (res.data?.user) {
        if (res.data.token) {
          localStorage.setItem("oil_token", res.data.token);
        }
        dispatch(setUserData(res.data.user));
        toast.success("Password set successfully! Logged in.");
        navigate("/");
      } else {
        toast.success("Password reset successfully! Please sign in.");
        navigate("/signin");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FCFBF7] dark:bg-[#0B0F14] transition-colors duration-200">
      <div className="bg-white dark:bg-[#171D26] rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100 dark:border-[#27313D] transition-colors duration-200">
        
        {/* Brand */}
        <h1 className="text-3xl font-black mb-1 text-center text-[#FFD600] font-sans uppercase tracking-wider">
          OwnFresh
        </h1>

        <p className="text-gray-600 dark:text-[#B7C1CE] mb-6 text-center text-xs sm:text-sm font-semibold">
          {step === 1 && "Account Access & Password Recovery"}
          {step === 2 && "Enter Email Verification Code"}
          {step === 3 && "Set Password for Your Account"}
        </p>

        {/* Step indicator pills */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? "w-8 bg-[#FFD600]" : "w-4 bg-slate-200 dark:bg-slate-700"}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? "w-8 bg-[#FFD600]" : "w-4 bg-slate-200 dark:bg-slate-700"}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? "w-8 bg-[#FFD600]" : "w-4 bg-slate-200 dark:bg-slate-700"}`} />
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-5 text-xs sm:text-sm text-red-600 dark:text-[#FF5C6C] bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/50 rounded-xl px-3.5 py-2.5 font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: EMAIL */}
        {step === 1 && (
          <>
            <div className="mb-6">
              <label className="block text-xs font-black text-slate-700 dark:text-[#C4CCD7] uppercase tracking-wider mb-1.5 ml-1">
                Registered Email Address
              </label>
              <input
                type="email"
                placeholder="Enter customer or account email"
                className="w-full h-12 px-4 bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] text-slate-900 dark:text-[#F5F7FA] placeholder-slate-400 dark:placeholder-[#778393] rounded-xl focus:ring-2 focus:ring-[#FFD600]/30 focus:border-[#FFD600] focus:bg-white dark:focus:bg-[#151B23] outline-none transition-all text-sm font-semibold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                autoFocus
              />
              <p className="text-[11px] text-slate-500 mt-2 ml-1">
                Works for all accounts, including Google 1-Click login users without passwords.
              </p>
            </div>

            <button
              disabled={loading}
              className="w-full h-12 rounded-xl font-black text-[#111318] bg-[#FFD600] hover:bg-[#FFE45C] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-md uppercase tracking-wider text-xs sm:text-sm"
              onClick={handleSendOtp}
            >
              {loading && <Loader2 size={18} className="animate-spin text-[#111318]" />}
              {loading ? "Sending OTP..." : "Send Verification OTP"}
            </button>
          </>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-xs font-black text-slate-700 dark:text-[#C4CCD7] uppercase tracking-wider">
                  6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Change Email
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                placeholder="• • • • • •"
                className="w-full h-12 px-4 bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] text-slate-900 dark:text-[#F5F7FA] placeholder-slate-400 dark:placeholder-[#778393] rounded-xl focus:ring-2 focus:ring-[#FFD600]/30 focus:border-[#FFD600] focus:bg-white dark:focus:bg-[#151B23] outline-none transition-all text-lg font-black font-mono tracking-widest text-center"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp(false)}
                autoFocus
              />
              <p className="text-[11px] text-slate-500 mt-2 text-center">
                OTP sent to <span className="font-bold text-slate-800 dark:text-slate-200">{email}</span> (expires in 5 mins)
              </p>
            </div>

            <div className="space-y-3 mt-6">
              {/* Option A: Instant Login with OTP */}
              <button
                disabled={loading || directLoginLoading}
                className="w-full h-12 rounded-xl font-black text-[#111318] bg-[#FFD600] hover:bg-[#FFE45C] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-md uppercase tracking-wider text-xs sm:text-sm"
                onClick={() => handleVerifyOtp(true)}
              >
                {directLoginLoading ? (
                  <Loader2 size={18} className="animate-spin text-[#111318]" />
                ) : (
                  <Sparkles size={16} />
                )}
                {directLoginLoading ? "Logging In..." : "Instant Login to Account"}
              </button>

              {/* Option B: Set New Password */}
              <button
                disabled={loading || directLoginLoading}
                className="w-full h-11 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 text-xs sm:text-sm border border-slate-200 dark:border-slate-700"
                onClick={() => handleVerifyOtp(false)}
              >
                {loading && <Loader2 size={16} className="animate-spin text-slate-700" />}
                <KeyRound size={15} />
                <span>Verify &amp; Create Password</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 3: PASSWORD */}
        {step === 3 && (
          <>
            <div className="mb-4">
              <label className="block text-xs font-black text-slate-700 dark:text-[#C4CCD7] uppercase tracking-wider mb-1.5 ml-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] text-slate-900 dark:text-[#F5F7FA] placeholder-slate-400 dark:placeholder-[#778393] rounded-xl pr-12 focus:ring-2 focus:ring-[#FFD600]/30 focus:border-[#FFD600] focus:bg-white dark:focus:bg-[#151B23] outline-none transition-all text-sm font-semibold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#818C9B] hover:text-gray-900 dark:hover:text-[#F5F7FA] cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black text-slate-700 dark:text-[#C4CCD7] uppercase tracking-wider mb-1.5 ml-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                className="w-full h-12 px-4 bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] text-slate-900 dark:text-[#F5F7FA] placeholder-slate-400 dark:placeholder-[#778393] rounded-xl focus:ring-2 focus:ring-[#FFD600]/30 focus:border-[#FFD600] focus:bg-white dark:focus:bg-[#151B23] outline-none transition-all text-sm font-semibold"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
              />
            </div>

            <button
              disabled={loading}
              className="w-full h-12 rounded-xl font-black text-[#111318] bg-[#FFD600] hover:bg-[#FFE45C] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-md uppercase tracking-wider text-xs sm:text-sm"
              onClick={handleResetPassword}
            >
              {loading && <Loader2 size={18} className="animate-spin text-[#111318]" />}
              {loading ? "Setting Password & Logging in..." : "Set Password & Log In"}
            </button>
          </>
        )}

        {/* BACK TO SIGN IN */}
        <p className="text-xs sm:text-sm text-center text-gray-600 dark:text-[#818C9B] mt-6 pt-4 border-t border-slate-100 dark:border-[#27313D] font-medium">
          Remember your password?{" "}
          <span
            className="font-black cursor-pointer hover:underline text-[#FFD600]"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>

      </div>
    </div>
  );
};

export default ForgotPassword;
