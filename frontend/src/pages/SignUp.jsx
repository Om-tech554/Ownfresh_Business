import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  Loader2,
  ArrowLeft,
  Ticket,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { serverUrl } from "../App";
import {
  auth,
  appCheck,
  GoogleAuthProvider,
  signInWithPopup
} from "../../firebase";
import { getToken } from "firebase/app-check";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUserData, clearCart } from "../redux/userslice";
import SEO from "../components/SEO";
import OilFlowAnimation from "../components/OilFlowAnimation";

const LOGO_URL = "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png";

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Referral code from query param if available
  const queryRefCode = searchParams.get("ref") || "";

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(queryRefCode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Domain signup email OTP modal (if required by backend config)
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerifying, setEmailVerifying] = useState(false);

  // -----------------------------------------
  // 1. EMAIL / PASSWORD SIGNUP
  // -----------------------------------------
  const handleEmailSignUp = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 2) {
      return toast.error("Please enter your Full Name");
    }
    if (!email.trim()) {
      return toast.error("Please enter a valid email address");
    }

    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      return toast.error("Please enter a valid 10-digit mobile number for order delivery");
    }

    if (!password || password.length < 6) {
      return toast.error("Password should be at least 6 characters long");
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          mobile: cleanMobile,
          referralCode: referralCode ? referralCode.trim().toUpperCase() : undefined,
          role: "user"
        },
        { withCredentials: true }
      );

      if (data.requiresVerification) {
        toast.success("Verification OTP sent to your email!");
        setShowEmailOtpModal(true);
      } else {
        dispatch(setUserData(data));
        dispatch(clearCart());
        localStorage.setItem("oil_user", JSON.stringify(data));
        if (data?.token) {
          localStorage.setItem("oil_token", data.token);
        }

        toast.success("Account created successfully! Welcome to OwnFresh.");
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // 2. EMAIL VERIFICATION MODAL SUBMIT
  // -----------------------------------------
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!emailOtp || emailOtp.trim().length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    setEmailVerifying(true);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/verify-signup-otp`,
        { email: email.trim(), otp: emailOtp.trim() },
        { withCredentials: true }
      );

      dispatch(setUserData(data));
      dispatch(clearCart());
      localStorage.setItem("oil_user", JSON.stringify(data));

      toast.success("Account verified successfully! Welcome to OwnFresh.");
      setShowEmailOtpModal(false);
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed. Please check the code.");
    } finally {
      setEmailVerifying(false);
    }
  };

  // -----------------------------------------
  // 3. GOOGLE 1-CLICK SIGNUP (PRESERVED)
  // -----------------------------------------
  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();

    try {
      setGoogleLoading(true);
      const googleUser = await signInWithPopup(auth, provider);
      const idToken = await googleUser.user.getIdToken();

      let appCheckToken = "";
      if (appCheck) {
        try {
          const tokenRes = await getToken(appCheck, false);
          appCheckToken = tokenRes.token;
        } catch (e) {
          console.warn("App Check token omitted", e);
        }
      }

      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        { idToken },
        {
          withCredentials: true,
          headers: appCheckToken ? { "X-Firebase-AppCheck": appCheckToken } : {}
        }
      );

      dispatch(setUserData(data));
      dispatch(clearCart());
      localStorage.setItem("oil_user", JSON.stringify(data));
      if (data?.token) {
        localStorage.setItem("oil_token", data.token);
      }

      toast.success("Google signup successful! Welcome to OwnFresh.");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Google Signup Error:", error);
      const errMsg = error.response?.data?.message || error.message || "Google Sign-In failed";
      if (errMsg.includes("unauthorized-domain") || errMsg.includes("unauthorized domain")) {
        toast.error(
          `Domain "${window.location.hostname}" not authorized in Firebase! Add "${window.location.hostname}" to Firebase Console -> Authentication -> Settings -> Authorized Domains.`,
          { duration: 6000 }
        );
      } else if (errMsg.includes("popup-closed-by-user")) {
        toast.error("Sign-in popup was closed before completing.");
      } else if (errMsg.includes("popup-blocked")) {
        toast.error(`Popup was blocked by browser. Please allow popups for ${window.location.hostname}.`);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-[#FCFBF7] dark:bg-[#0B0F14] relative overflow-x-hidden transition-colors duration-200">
      <SEO
        title="Create Account | OwnFresh - Pure Stone Pressed Oils"
        description="Join OwnFresh today with Google 1-Click or email. Enjoy authentic traditional cold-pressed cooking oils, 1% Prime reward coins, and direct farm purity."
        keywords="sign up, create account, ownfresh register, google sign up, pure stone pressed oils india"
      />

      {/* ── LEFT COLUMN: BRAND HERO (DESKTOP) ── */}
      <div className="hidden lg:flex w-1/2 relative bg-[#121814] dark:bg-[#0A0D12] overflow-hidden">
        <img
          src="/auth-signin-bg.jpg"
          alt="OwnFresh Pure Oils"
          className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105 transition-transform duration-1000 ease-out hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121814]/90 via-[#121814]/40 to-[#121814]/30 dark:from-[#0B0F14]/95 dark:via-[#0B0F14]/60 dark:to-[#0B0F14]/40" />

        {/* Brand Header */}
        <div className="absolute top-10 left-12 z-10 flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="OwnFresh Logo"
            className="h-12 w-auto object-contain drop-shadow-md brightness-105"
          />
        </div>

        {/* Highlight Card */}
        <div className="absolute bottom-10 left-12 right-12 z-10 bg-white/90 dark:bg-[#171D26]/90 backdrop-blur-xl p-8 rounded-3xl border border-white/60 dark:border-[#27313D] text-slate-800 dark:text-[#F5F7FA] shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-[#1E971D] dark:text-[#FFD600] border border-emerald-200/80 dark:border-emerald-800/40 text-[10px] font-black uppercase tracking-wider rounded-full shadow-xs">
              <CheckCircle2 size={12} className="text-[#1E971D] dark:text-[#FFD600]" /> Pure Oil Revolution
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 dark:text-[#FFD600] bg-amber-100/90 dark:bg-amber-950/60 px-2.5 py-1 rounded-full shadow-xs border border-transparent dark:border-amber-700/30">
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-[#FFD600]" /> Instant 1% Prime Cashback
            </span>
          </div>

          <h2 className="text-2xl font-black mb-2 leading-tight uppercase tracking-tight text-slate-900 dark:text-[#F7F9FC] font-serif">
            Join Thousands of <span className="text-[#1E971D] dark:text-[#FFD600]">Healthy Families</span>
          </h2>
          <p className="text-xs font-medium text-slate-600 dark:text-[#B7C1CE] mb-4 leading-relaxed">
            Create an account to unlock exclusive Prime discounts, instant delivery alerts, and pure unadulterated cold-pressed cooking oils.
          </p>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200/60 dark:border-[#27313D]">
            <span className="px-2.5 py-1 bg-slate-100/80 dark:bg-[#1D2530] text-slate-700 dark:text-[#B7C1CE] rounded-lg text-[9px] font-extrabold uppercase tracking-wide">Stone Pressed</span>
            <span className="px-2.5 py-1 bg-slate-100/80 dark:bg-[#1D2530] text-slate-700 dark:text-[#B7C1CE] rounded-lg text-[9px] font-extrabold uppercase tracking-wide">FSSAI Certified</span>
            <span className="px-2.5 py-1 bg-slate-100/80 dark:bg-[#1D2530] text-slate-700 dark:text-[#B7C1CE] rounded-lg text-[9px] font-extrabold uppercase tracking-wide">100% Single Origin</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: FORM (MOBILE-FIRST) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen p-4 sm:p-8 lg:p-12 relative">
        
        {/* Animated Golden Oil Flow Backdrop */}
        <OilFlowAnimation />

        {/* Back to Home CTA */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-5 left-5 sm:top-8 sm:left-8 flex items-center gap-1.5 text-slate-700 dark:text-[#B7C1CE] hover:text-[#1E971D] dark:hover:text-[#FFD600] transition-all active:scale-95 cursor-pointer bg-white/90 dark:bg-[#171D26]/90 backdrop-blur-md py-2.5 px-4 rounded-full shadow-sm hover:shadow-md border border-amber-200/50 dark:border-[#27313D] text-xs font-black uppercase tracking-wider z-20"
        >
          <ArrowLeft size={15} />
          <span>Back</span>
        </button>

        {/* Main Card Container */}
        <div className="w-full max-w-md z-10 bg-white/95 dark:bg-[#171D26]/95 backdrop-blur-xl p-7 sm:p-9 rounded-3xl border border-amber-100/80 dark:border-[#27313D] shadow-[0_20px_60px_-15px_rgba(217,119,6,0.12)] dark:shadow-none transition-all duration-300">
          
          {/* Company Logo Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-b from-[#FFFDF2] to-amber-50/60 dark:from-[#1D2530] dark:to-[#151B23] border border-amber-200/60 dark:border-[#2A3440] shadow-xs">
              <img
                src={LOGO_URL}
                alt="OwnFresh Logo"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>
            
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight mb-1 font-serif uppercase text-[#24672E] dark:text-[#FFD600]"
            >
              Create Account
            </h1>
            <p className="text-slate-500 dark:text-[#818C9B] text-xs sm:text-sm font-medium">
              Join OwnFresh to start shopping authentic stone-pressed oils
            </p>
          </div>

          {/* 🌟 1-CLICK GOOGLE SIGN UP */}
          <button
            type="button"
            className="w-full h-12 flex items-center justify-center gap-3 border-2 border-slate-200/90 dark:border-[#29333F] rounded-2xl mb-5 hover:bg-amber-50/40 dark:hover:bg-[#1C232D] hover:border-amber-300/80 dark:hover:border-[#FFD600]/40 transition-all active:scale-[0.98] cursor-pointer shadow-sm bg-white dark:bg-[#151B23] text-xs sm:text-sm font-bold text-slate-800 dark:text-[#F5F7FA] disabled:opacity-60"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#FFD600]" />
            ) : (
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5 shrink-0"
              />
            )}
            <span>{googleLoading ? "Signing up with Google..." : "Sign up with Google"}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-slate-200 dark:via-[#27313D] to-slate-200 dark:to-[#27313D]" />
            <span className="text-[10px] font-black text-slate-400 dark:text-[#818C9B] uppercase tracking-widest px-1">
              or fill details
            </span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200 dark:from-[#27313D] via-slate-200 dark:via-[#27313D] to-transparent" />
          </div>

          {/* ── EMAIL / DETAILS SIGNUP FORM ── */}
          <form onSubmit={handleEmailSignUp} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-[#C4CCD7] uppercase tracking-wider mb-1 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#818C9B]" size={17} />
                <input
                  type="text"
                  placeholder="Your Full Name"
                  autoComplete="name"
                  className="w-full h-11 pl-10 pr-4 bg-slate-50/80 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD600]/30 focus:border-[#FFD600] focus:bg-white dark:focus:bg-[#151B23] transition-all text-xs sm:text-sm font-semibold text-slate-800 dark:text-[#F5F7FA] placeholder:text-slate-400 dark:placeholder:text-[#778393]"
                  value={fullName}
                  required
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-[#C4CCD7] uppercase tracking-wider mb-1 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#818C9B]" size={17} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full h-11 pl-10 pr-4 bg-slate-50/80 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD600]/30 focus:border-[#FFD600] focus:bg-white dark:focus:bg-[#151B23] transition-all text-xs sm:text-sm font-semibold text-slate-800 dark:text-[#F5F7FA] placeholder:text-slate-400 dark:placeholder:text-[#778393]"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-[#C4CCD7] uppercase tracking-wider mb-1 ml-1">
                Mobile Number <span className="text-[10px] text-slate-400 dark:text-[#818C9B] font-normal">(for delivery updates)</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-600 dark:text-[#B7C1CE] font-bold text-xs border-r border-slate-200 dark:border-[#29333F] pr-2 pointer-events-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength="10"
                  placeholder="10-digit mobile"
                  autoComplete="tel"
                  className="w-full h-11 pl-20 pr-4 bg-slate-50/80 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD600]/30 focus:border-[#FFD600] focus:bg-white dark:focus:bg-[#151B23] transition-all text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F5F7FA] tracking-wider font-mono placeholder:text-slate-400 dark:placeholder:text-[#778393] placeholder:font-sans placeholder:font-normal"
                  value={mobile}
                  required
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-[#C4CCD7] uppercase tracking-wider mb-1 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#818C9B]" size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full h-11 pl-10 pr-12 bg-slate-50/80 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD600]/30 focus:border-[#FFD600] focus:bg-white dark:focus:bg-[#151B23] transition-all text-xs sm:text-sm font-semibold text-slate-800 dark:text-[#F5F7FA] placeholder:text-slate-400 dark:placeholder:text-[#778393]"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#818C9B] hover:text-slate-700 dark:hover:text-[#F5F7FA] p-1 transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-[#C4CCD7] uppercase tracking-wider mb-1 ml-1">
                Referral Code <span className="text-[10px] text-slate-400 dark:text-[#818C9B] font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#818C9B]" size={17} />
                <input
                  type="text"
                  placeholder="e.g. PRIME50"
                  className="w-full h-11 pl-10 pr-4 bg-slate-50/80 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD600]/30 focus:border-[#FFD600] uppercase font-mono text-xs font-bold text-slate-800 dark:text-[#F5F7FA] placeholder:text-slate-400 dark:placeholder:text-[#778393] placeholder:font-sans placeholder:font-normal"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-12 mt-4 rounded-xl font-black text-[#111318] bg-[#FFD600] hover:bg-[#FFE45C] shadow-md shadow-yellow-500/15 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border-0 text-xs sm:text-sm uppercase tracking-widest disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#27313D] text-center">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#818C9B] font-semibold">
              Already have an account?{" "}
              <button
                type="button"
                className="font-black cursor-pointer text-[#1E971D] dark:text-[#FFD600] hover:underline ml-1"
                onClick={() => navigate("/signin")}
              >
                Sign in
              </button>
            </p>
          </div>

        </div>
      </div>

      {/* Modal for domain email OTP verification (if backend prompts) */}
      {showEmailOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1D2530] rounded-3xl p-8 max-w-sm w-full space-y-4 shadow-2xl border border-amber-100 dark:border-[#2A3440]">
            <h3 className="text-lg font-black text-slate-900 dark:text-[#F7F9FC] uppercase text-center font-serif">
              Verify Email OTP
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#B7C1CE] text-center">
              A 6-digit verification code was sent to <b className="text-gray-900 dark:text-[#F5F7FA]">{email}</b>.
            </p>
            <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                className="w-full text-center tracking-widest font-mono text-xl py-3 bg-white dark:bg-[#151B23] border-2 border-slate-200 dark:border-[#29333F] text-slate-900 dark:text-[#F5F7FA] rounded-xl focus:border-[#FFD600] focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={emailVerifying}
                className="w-full py-3.5 bg-[#FFD600] text-[#111318] hover:bg-[#FFE45C] font-black uppercase tracking-wider text-xs rounded-xl shadow cursor-pointer transition-colors"
              >
                {emailVerifying ? "Verifying..." : "Verify & Sign In"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
