import React, { useState, useEffect, useRef } from "react";
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
  Smartphone,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  KeyRound
} from "lucide-react";
import { serverUrl } from "../App";
import {
  auth,
  appCheck,
  setUpRecaptcha,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup
} from "../../firebase";
import { getToken } from "firebase/app-check";
import toast from "react-hot-toast";
import SEO from "../components/SEO";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Auth Method Tab: "phone" | "email"
  const [authMethod, setAuthMethod] = useState("phone");

  // Email / Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const otpInputsRef = useRef([]);

  // Theme Colors
  const primaryColor = "#FFD700";
  const hoverColor = "#E6B800";

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // -----------------------------------------
  // 1. PHONE NUMBER OTP LOGIN
  // -----------------------------------------
  const handleSendPhoneOtp = async (e) => {
    if (e) e.preventDefault();

    const cleanNumber = phoneNumber.replace(/\D/g, "");
    if (cleanNumber.length !== 10) {
      return toast.error("Please enter a valid 10-digit Indian mobile number");
    }

    const formattedPhone = `+91${cleanNumber}`;

    try {
      setOtpSending(true);
      const appVerifier = setUpRecaptcha("recaptcha-container");
      if (!appVerifier) {
        throw new Error("reCAPTCHA failed to initialize. Please refresh the page.");
      }

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      setCountdown(30);
      toast.success(`6-digit SMS OTP sent to ${formattedPhone}!`);

      // Focus first OTP input
      setTimeout(() => {
        if (otpInputsRef.current[0]) {
          otpInputsRef.current[0].focus();
        }
      }, 300);
    } catch (err) {
      console.error("Phone OTP send error:", err);
      const msg = err.message || "Failed to send SMS OTP";
      if (msg.includes("invalid-phone-number")) {
        toast.error("Invalid phone number format.");
      } else if (msg.includes("too-many-requests")) {
        toast.error("Too many OTP attempts. Please wait a few minutes.");
      } else if (msg.includes("captcha-check-failed")) {
        toast.error("Security verification failed. Please refresh and try again.");
      } else {
        toast.error(msg);
      }
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    if (e) e.preventDefault();
    const enteredOtp = otpCode.join("");
    if (enteredOtp.length !== 6) {
      return toast.error("Please enter the complete 6-digit OTP");
    }

    if (!confirmationResult) {
      return toast.error("Session expired. Please request a new OTP.");
    }

    try {
      setOtpVerifying(true);
      const userCredential = await confirmationResult.confirm(enteredOtp);
      const idToken = await userCredential.user.getIdToken();

      let appCheckToken = "";
      if (appCheck) {
        try {
          const tokenRes = await getToken(appCheck, false);
          appCheckToken = tokenRes.token;
        } catch (e) {
          console.warn("App Check token omitted", e);
        }
      }

      // Send verified token to Backend Phone Auth service
      const { data } = await axios.post(
        `${serverUrl}/api/auth/phone-auth`,
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

      toast.success("Logged in successfully with Mobile OTP!");
      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get("redirect") || "/";

      if (data?.role === "admin") {
        navigate("/admin");
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      console.error("Phone OTP verification error:", err);
      toast.error(err.response?.data?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // -----------------------------------------
  // 2. EMAIL / PASSWORD LOGIN
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
  // 3. GOOGLE 1-CLICK LOGIN (PRESERVED)
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
        toast.error(`Domain "${window.location.hostname}" not authorized in Firebase! Add "${window.location.hostname}" to Firebase Console -> Authentication -> Settings -> Authorized Domains.`, { duration: 6000 });
      } else if (errMsg.includes("popup-closed-by-user")) {
        toast.error("Sign-in popup was closed before completing.");
      } else if (errMsg.includes("popup-blocked")) {
        toast.error(`Popup was blocked by browser. Please allow popups for ${window.location.hostname}.`);
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
        title="Sign In | Buy Stone Pressed Cooking Oils Online"
        description="Log in to MyOwnFresh via secure Mobile SMS OTP or Google to order premium organic stone-pressed sunflower oils and traditional wood-pressed cooking oils."
        keywords="sign in, ownfresh login, phone otp login, buy stone pressed sunflower oil, traditional stone pressed cooking oil india"
      />

      {/* Invisible container for Firebase phone reCAPTCHA */}
      <div id="recaptcha-container"></div>

      {/* LEFT COLUMN: BACKGROUND IMAGE */}
      <div className="hidden lg:flex w-1/2 relative bg-black">
        <img
          src="/auth-signin-bg.jpg"
          alt="OwnFresh Stone Pressed Pure Oil"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20"></div>

        <div className="absolute top-12 left-12">
          <h1
            className="text-5xl font-black text-white tracking-widest uppercase drop-shadow-md"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Own<span className="text-[#EFDB27]">Fresh</span>
          </h1>
          <div className="h-1 w-16 bg-[#EFDB27] mt-3 rounded-full"></div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-white/50 text-slate-800 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-[#24672E] border border-emerald-200 text-[10px] font-black uppercase tracking-wider rounded-full">
              100% Organic & Chemical-Free
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-600" /> Fast Phone OTP Access
            </span>
          </div>
          <h2 className="text-2xl font-black mb-2.5 leading-tight uppercase tracking-tight text-slate-900 font-playfair">
            Pure Traditional Oils <span className="text-[#24672E]">For Healthy Homes</span>
          </h2>
          <p className="text-xs font-semibold text-slate-600 mb-4 leading-relaxed">
            Direct from farm seeds to authentic stone-pressed extractions. Sign in securely to manage your orders, 1% Prime reward coins, and live delivery updates.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase">Stone Pressed</span>
            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase">FSSAI Certified</span>
            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase">1% Prime Cashback</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: AUTHENTICATION CONTAINER */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-gray-500 hover:text-[#24672E] transition-colors cursor-pointer bg-white py-2 px-4.5 rounded-full shadow-xs hover:shadow-sm border border-slate-200 text-xs font-black uppercase tracking-wider z-50"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="w-full max-w-md bg-white sm:bg-transparent p-7 sm:p-0 rounded-3xl sm:rounded-none border border-slate-100 sm:border-0 shadow-sm sm:shadow-none transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-6">
            <h1
              className="text-3xl sm:text-4xl font-black tracking-tight mb-1.5 font-playfair uppercase"
              style={{ color: "#2F5D50" }}
            >
              Sign In
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold">
              Welcome to OwnFresh. Choose your login method:
            </p>
          </div>

          {/* 🌟 1-CLICK GOOGLE LOGIN (PRESERVED) */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-slate-200 py-3 rounded-xl mb-4 hover:bg-slate-50 transition-all active:scale-[0.98] cursor-pointer shadow-xs bg-white text-xs sm:text-sm font-bold text-slate-700"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-[1px] bg-slate-200" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              OR LOGIN WITH
            </span>
            <div className="flex-1 h-[1px] bg-slate-200" />
          </div>

          {/* TAB SELECTOR: Phone OTP vs Email */}
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl mb-6 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("phone");
                setOtpSent(false);
              }}
              className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === "phone"
                  ? "bg-white text-[#24672E] shadow-sm font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile OTP
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("email")}
              className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === "email"
                  ? "bg-white text-[#24672E] shadow-sm font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email & Password
            </button>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TAB 1: PHONE NUMBER SMS OTP LOGIN
             ───────────────────────────────────────────────────────────── */}
          {authMethod === "phone" && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                      Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-700 font-bold text-xs sm:text-sm border-r border-slate-200 pr-2.5 pointer-events-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength="10"
                        placeholder="98765 43210"
                        className="w-full pl-22 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:border-[#24672E] focus:bg-white transition-all text-xs sm:text-sm font-bold text-slate-900 tracking-wider font-mono"
                        value={phoneNumber}
                        required
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5 ml-1 font-medium">
                      We will send a 6-digit SMS verification code to your mobile.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={otpSending || phoneNumber.length < 10}
                    className="w-full py-4 mt-2 rounded-xl font-black text-[#422006] shadow-md shadow-yellow-500/20 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border-0 text-xs sm:text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = hoverColor)}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = primaryColor)}
                  >
                    {otpSending ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Smartphone size={16} />
                    )}
                    {otpSending ? "Sending SMS OTP..." : "Get OTP on Phone"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-5">
                  <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                        OTP Sent to
                      </span>
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        +91 {phoneNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode(["", "", "", "", "", ""]);
                      }}
                      className="text-xs text-emerald-700 font-black hover:underline cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 text-center">
                      Enter 6-Digit SMS Code
                    </label>
                    <div className="flex justify-center gap-2 sm:gap-2.5">
                      {otpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputsRef.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-10 sm:w-12 h-12 text-center font-mono font-black text-lg sm:text-xl bg-white border-2 border-slate-200 rounded-xl focus:border-[#24672E] focus:ring-2 focus:ring-[#24672E]/20 focus:outline-none transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={otpVerifying || otpCode.join("").length < 6}
                    className="w-full py-4 rounded-xl font-black text-[#422006] shadow-md shadow-yellow-500/20 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border-0 text-xs sm:text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = hoverColor)}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = primaryColor)}
                  >
                    {otpVerifying ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <ShieldCheck size={18} />
                    )}
                    {otpVerifying ? "Verifying..." : "Verify & Sign In"}
                  </button>

                  <div className="text-center pt-1">
                    {countdown > 0 ? (
                      <span className="text-xs text-gray-400 font-semibold">
                        Resend OTP in <strong className="text-slate-700 font-mono">{countdown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        className="text-xs font-black text-[#24672E] hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Resend SMS OTP
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: EMAIL / PASSWORD LOGIN
             ───────────────────────────────────────────────────────────── */}
          {authMethod === "email" && (
            <form onSubmit={handleSignIn} className="space-y-4">
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
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:border-[#24672E] focus:bg-white transition-all text-xs sm:text-sm font-semibold text-slate-800"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

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
                    className="w-full pl-10 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:border-[#24672E] focus:bg-white transition-all text-xs sm:text-sm font-semibold text-slate-800"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 rounded-xl font-black text-[#422006] shadow-md shadow-yellow-500/20 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border-0 text-xs sm:text-sm uppercase tracking-widest disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = hoverColor)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = primaryColor)}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In with Password"}
              </button>
            </form>
          )}

          {/* Footer Link */}
          <p className="text-xs sm:text-sm text-center text-slate-500 mt-8 font-semibold">
            New to OwnFresh?{" "}
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
