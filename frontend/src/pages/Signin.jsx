import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userslice";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ArrowLeft,
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
import SEO from "../components/SEO";
import OilFlowAnimation from "../components/OilFlowAnimation";

const LOGO_URL = "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Email / Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // -----------------------------------------
  // 1. EMAIL / PASSWORD LOGIN
  // -----------------------------------------
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email: email.trim(), password },
        { withCredentials: true }
      );

      dispatch(setUserData(result.data));
      localStorage.setItem("oil_user", JSON.stringify(result.data));
      if (result.data?.token) {
        localStorage.setItem("oil_token", result.data.token);
      }

      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get("redirect") || "/";

      toast.success("Welcome back to OwnFresh!");
      if (result.data?.role === "admin") {
        navigate("/admin");
      } else {
        navigate(redirectPath);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid email or password!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // 2. GOOGLE 1-CLICK LOGIN (PRESERVED)
  // -----------------------------------------
  const handleGoogleAuth = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const redirectPath = searchParams.get("redirect") || "/";
    const provider = new GoogleAuthProvider();

    try {
      setGoogleLoading(true);
      const googleUser = await signInWithPopup(auth, provider);
      const idToken = await googleUser.user.getIdToken();

      let appCheckToken = "";
      if (appCheck) {
        try {
          const tokenResponse = await getToken(appCheck, false);
          appCheckToken = tokenResponse.token;
        } catch (e) {
          console.warn("App Check token fetch failed", e);
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
      localStorage.setItem("oil_user", JSON.stringify(data));
      if (data?.token) {
        localStorage.setItem("oil_token", data.token);
      }

      window.history.replaceState({}, document.title, window.location.pathname);
      toast.success("Signed in with Google successfully!");
      if (data?.role === "admin") {
        navigate("/admin");
      } else {
        navigate(redirectPath);
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
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
    <div className="min-h-screen flex w-full font-sans bg-[#FCFBF7] relative overflow-x-hidden">
      <SEO
        title="Sign In | OwnFresh - Premium Stone Pressed Cooking Oils"
        description="Sign in to your OwnFresh account with Google or email. Order authentic 100% pure cold-pressed botanical oils, track deliveries, and manage your 1% Prime rewards."
        keywords="sign in, ownfresh login, google login, pure stone pressed oil, cold pressed cooking oil india"
      />

      {/* ── LEFT COLUMN: BRAND SHOWCASE HERO (DESKTOP) ── */}
      <div className="hidden lg:flex w-1/2 relative bg-[#121814] overflow-hidden">
        <img
          src="/auth-signin-bg.jpg"
          alt="OwnFresh Stone Pressed Pure Oil"
          className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105 transition-transform duration-1000 ease-out hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121814]/90 via-[#121814]/40 to-[#121814]/30" />

        {/* Brand Header */}
        <div className="absolute top-10 left-12 z-10 flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="OwnFresh Logo"
            className="h-12 w-auto object-contain drop-shadow-md brightness-105"
          />
        </div>

        {/* Feature Highlights Card */}
        <div className="absolute bottom-10 left-12 right-12 z-10 bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-white/60 text-slate-800 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#1E971D] border border-emerald-200/80 text-[10px] font-black uppercase tracking-wider rounded-full shadow-xs">
              <CheckCircle2 size={12} className="text-[#1E971D]" /> 100% Stone Pressed Purity
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-100/90 px-2.5 py-1 rounded-full shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-600" /> 1% Prime Rewards
            </span>
          </div>

          <h2 className="text-2xl font-black mb-2 leading-tight uppercase tracking-tight text-slate-900 font-serif">
            Pure Botanical Oils <span className="text-[#1E971D]">For Healthy Living</span>
          </h2>
          <p className="text-xs font-medium text-slate-600 mb-4 leading-relaxed">
            From single-origin farm seeds to traditional slow stone-pressing. Sign in to access express delivery tracking, club benefits, and order history.
          </p>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200/60">
            <span className="px-2.5 py-1 bg-slate-100/80 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase tracking-wide">Single Origin Seeds</span>
            <span className="px-2.5 py-1 bg-slate-100/80 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase tracking-wide">FSSAI Certified</span>
            <span className="px-2.5 py-1 bg-slate-100/80 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase tracking-wide">Zero Chemicals</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: AUTHENTICATION CONTAINER (MOBILE-FIRST) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen p-4 sm:p-8 lg:p-12 relative">
        
        {/* Animated Golden Oil Flow Backdrop */}
        <OilFlowAnimation />

        {/* Back to Home CTA */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-5 left-5 sm:top-8 sm:left-8 flex items-center gap-1.5 text-slate-700 hover:text-[#1E971D] transition-all active:scale-95 cursor-pointer bg-white/90 backdrop-blur-md py-2.5 px-4 rounded-full shadow-sm hover:shadow-md border border-amber-200/50 text-xs font-black uppercase tracking-wider z-20"
        >
          <ArrowLeft size={15} />
          <span>Back</span>
        </button>

        {/* Main Card Container */}
        <div className="w-full max-w-md z-10 bg-white/95 backdrop-blur-xl p-7 sm:p-9 rounded-3xl border border-amber-100/80 shadow-[0_20px_60px_-15px_rgba(217,119,6,0.12)] transition-all duration-300">
          
          {/* Company Logo Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-b from-[#FFFDF2] to-amber-50/60 border border-amber-200/60 shadow-xs">
              <img
                src={LOGO_URL}
                alt="OwnFresh Logo"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>
            
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight mb-1 font-serif uppercase"
              style={{ color: "#24672E" }}
            >
              Welcome Back
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Sign in to manage your orders and pure oils
            </p>
          </div>

          {/* 🌟 PROMINENT 1-CLICK GOOGLE SIGN IN */}
          <button
            type="button"
            className="w-full h-12 flex items-center justify-center gap-3 border-2 border-slate-200/90 rounded-2xl mb-5 hover:bg-amber-50/40 hover:border-amber-300/80 transition-all active:scale-[0.98] cursor-pointer shadow-sm bg-white text-xs sm:text-sm font-bold text-slate-800 disabled:opacity-60"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#1E971D]" />
            ) : (
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5 shrink-0"
              />
            )}
            <span>{googleLoading ? "Signing in with Google..." : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-slate-200" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              or with email
            </span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200 via-slate-200 to-transparent" />
          </div>

          {/* ── EMAIL / PASSWORD LOGIN FORM ── */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
                <input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full h-12 pl-10 pr-4 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E971D]/30 focus:border-[#1E971D] focus:bg-white transition-all text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span
                  className="text-xs font-extrabold cursor-pointer text-[#1E971D] hover:underline"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot?
                </span>
              </div>

              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full h-12 pl-10 pr-12 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E971D]/30 focus:border-[#1E971D] focus:bg-white transition-all text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-12 mt-3 rounded-xl font-black text-[#181818] bg-[#F9DD19] hover:bg-[#1E971D] hover:text-white shadow-md shadow-yellow-500/15 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border-0 text-xs sm:text-sm uppercase tracking-widest disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Don't have an account?{" "}
              <button
                type="button"
                className="font-black cursor-pointer text-[#1E971D] hover:underline ml-1"
                onClick={() => navigate("/signup")}
              >
                Create an account
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignIn;
