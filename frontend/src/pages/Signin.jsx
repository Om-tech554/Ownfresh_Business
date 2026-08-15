import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userslice";
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getToken } from "firebase/app-check";
import { auth, appCheck } from "../../firebase";
import toast from "react-hot-toast";
import SEO from "../components/SEO";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Theme Colors
  const primaryColor = "#FFD700";
  const hoverColor = "#E6B800";
  const bgColor = "#FFFDF2";

  // -----------------------------------------
  // EMAIL / PASSWORD LOGIN
  // -----------------------------------------

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      );

      // ⭐ FIX: UPDATE REDUX & LOCAL STORAGE
      dispatch(setUserData(result.data));
      localStorage.setItem("oil_user", JSON.stringify(result.data));
      if (result.data?.token) {
        localStorage.setItem("oil_token", result.data.token);
      }

      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get("redirect") || "/";

      toast.success("Logged in successfully!");
      if (result.data?.role === "admin") {
        navigate("/admin");
      } else {
        navigate(redirectPath);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid credentials!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // GOOGLE LOGIN
  // -----------------------------------------
  const handleGoogleAuth = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const redirectPath = searchParams.get("redirect") || "/";
    const provider = new GoogleAuthProvider();

    try {
      setLoading(true);
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
        {
          idToken
        },
        {
          withCredentials: true,
          headers: appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {}
        }
      );

      dispatch(setUserData(data));
      localStorage.setItem("oil_user", JSON.stringify(data));
      if (data?.token) {
        localStorage.setItem("oil_token", data.token);
      }

      // Remove query params from browser history for security
      window.history.replaceState({}, document.title, window.location.pathname);

      toast.success("Logged in with Google!", { duration: 1500 });
      if (data?.role === "admin") {
        navigate("/admin");
      } else {
        navigate(redirectPath);
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      const errMsg = error.response?.data?.message || error.message || "Google Sign-In failed";
      if (errMsg.includes("unauthorized-domain") || errMsg.includes("unauthorized domain")) {
        toast.error("Domain not authorized in Firebase! Add myownfresh.com to Firebase Console Authorized Domains.", { duration: 5000 });
      } else if (errMsg.includes("popup-closed-by-user")) {
        toast.error("Sign-in popup was closed before completing.");
      } else if (errMsg.includes("popup-blocked")) {
        toast.error("Popup was blocked by browser. Please allow popups for myownfresh.com.");
      } else {
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-[#FFFDF2] relative">
      <SEO 
        title="Sign In | Buy Stone Pressed Pure Cooking Oils Online" 
        description="Log in to MyOwnFresh to order premium 100% organic cold-pressed sunflower oils, wood-pressed coconut oils, and authentic stone-pressed kitchen essentials."
        keywords="sign in, ownfresh login, buy stone pressed sunflower oil, cholesterol free organic oil, cold pressed cooking oil india"
      />

      {/* LEFT COLUMN: BACKGROUND IMAGE */}
      <div className="hidden lg:flex w-1/2 relative bg-black">
        <img 
          src="/auth-signin-bg.jpg" 
          alt="OwnFresh Stone Pressed Sunflower Oil" 
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10"></div>
        
        <div className="absolute top-12 left-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-widest uppercase drop-shadow-xs" style={{ fontFamily: 'Playfair Display, serif' }}>
            Own<span className="text-[#24672E]">Fresh</span>
          </h1>
          <div className="h-1 w-16 bg-[#24672E] mt-4 rounded-full"></div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-white/50 text-slate-800 shadow-lg">
          <span className="inline-block px-3 py-1 bg-emerald-50 text-[#24672E] border border-emerald-100 text-[10px] font-black uppercase tracking-wider rounded-full mb-3">
            Pure & Natural
          </span>
          <h2 className="text-2xl font-black mb-3 leading-tight uppercase tracking-tight text-slate-900 font-playfair">
            Premium Cooking Oils <span className="text-[#24672E]">for Everyday Wellness</span>
          </h2>
          <p className="text-xs font-semibold text-slate-655 mb-5 leading-relaxed">
            Shop premium cold-pressed and traditionally processed cooking oils, carefully sourced for authentic taste, quality, and everyday healthy cooking.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase">Stone Pressed</span>
            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase">Quality Sourced</span>
            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase">Naturally Rich</span>
            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase">Premium Quality</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-gray-500 hover:text-[#24672E] transition-colors cursor-pointer bg-white py-2 px-4.5 rounded-full shadow-xs hover:shadow-sm border border-slate-150 text-xs font-black uppercase tracking-wider z-50 animate-fade-in"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="w-full max-w-md bg-white sm:bg-transparent p-7 sm:p-0 rounded-3xl sm:rounded-none border border-slate-100 sm:border-0 shadow-sm sm:shadow-none transition-all duration-300">
          
          {/* MOBILE LOGO HEADER */}
          <div className="flex flex-col items-center mb-6 lg:hidden">
            <img
              src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png"
              alt="OwnFresh Logo"
              className="h-10 w-auto object-contain mb-2"
            />
            <span className="text-[9px] font-black uppercase tracking-widest text-[#24672E] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Pure Stone-Pressed Oils
            </span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl sm:text-4xl font-black tracking-tight mb-2 font-playfair uppercase"
              style={{ color: "#2F5D50" }}
            >
              Botanic Purity
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-semibold">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Google Login Button */}
          <button
            className="w-full flex items-center justify-center gap-3 border border-slate-200 py-3.5 rounded-xl mb-3 hover:bg-slate-50 transition-all active:scale-[0.98] cursor-pointer shadow-xs bg-white text-xs sm:text-sm font-bold text-slate-700"
            onClick={handleGoogleAuth}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Log in with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-[1px] bg-slate-100" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-[1px] bg-slate-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:border-[#24672E] focus:bg-white transition-all text-xs sm:text-sm font-semibold text-slate-800"
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
                  className="text-xs font-extrabold cursor-pointer hover:underline text-[#24672E]"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot?
                </span>
              </div>

              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-10 pr-12 py-3.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:border-[#24672E] focus:bg-white transition-all text-xs sm:text-sm font-semibold text-slate-800"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 rounded-xl font-black text-[#422006] shadow-md shadow-yellow-500/20 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border-0 text-xs sm:text-sm uppercase tracking-widest"
              style={{
                backgroundColor: primaryColor,
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = hoverColor)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = primaryColor)
              }
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In to Account"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-xs sm:text-sm text-center text-slate-400 mt-8 font-semibold">
            New to Botanic Purity?{" "}
            <span
              className="font-black cursor-pointer transition-colors text-[#24672E] hover:underline"
              onClick={() => navigate("/signup")}
            >
              Create an account
            </span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default SignIn;
