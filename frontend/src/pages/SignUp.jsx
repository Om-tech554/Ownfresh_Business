import React, { useState, useEffect, useRef } from "react";
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
  Smartphone,
  ShieldCheck,
  RotateCcw,
  Sparkles
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
import { useDispatch } from "react-redux";
import { setUserData, clearCart } from "../redux/userslice";
import SEO from "../components/SEO";

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Tab: "phone" | "email"
  const [authMethod, setAuthMethod] = useState("phone");

  // Referral code from query param if available
  const queryRefCode = searchParams.get("ref") || "";

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(queryRefCode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Phone OTP Flow State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Domain signup email OTP modal
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerifying, setEmailVerifying] = useState(false);

  const otpInputsRef = useRef([]);
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
  // 1. PHONE NUMBER OTP SIGNUP
  // -----------------------------------------
  const handleSendPhoneOtp = async (e) => {
    if (e) e.preventDefault();

    if (!fullName || fullName.trim().length < 2) {
      return toast.error("Please enter your Full Name");
    }

    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      return toast.error("Please enter a valid 10-digit Indian mobile number");
    }

    const formattedPhone = `+91${cleanMobile}`;

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
      toast.success(`SMS OTP sent to ${formattedPhone}!`);

      setTimeout(() => {
        if (otpInputsRef.current[0]) {
          otpInputsRef.current[0].focus();
        }
      }, 300);
    } catch (err) {
      console.error("Phone signup OTP error:", err);
      const msg = err.message || "Failed to send SMS OTP";
      if (msg.includes("too-many-requests")) {
        toast.error("Too many attempts. Please wait a few minutes.");
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

      const { data } = await axios.post(
        `${serverUrl}/api/auth/phone-auth`,
        {
          idToken,
          fullName,
          referralCode: referralCode ? referralCode.trim().toUpperCase() : undefined
        },
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

      toast.success("Account created and signed in successfully!");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error("Phone OTP verification error:", err);
      toast.error(err.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // -----------------------------------------
  // 2. EMAIL / PASSWORD SIGNUP
  // -----------------------------------------
  const handleEmailSignUp = async (e) => {
    e.preventDefault();

    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullName,
          email,
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

        toast.success("Account created successfully!");
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!emailOtp || emailOtp.trim().length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    setEmailVerifying(true);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/verify-signup-otp`,
        { email, otp: emailOtp },
        { withCredentials: true }
      );

      dispatch(setUserData(data));
      dispatch(clearCart());
      localStorage.setItem("oil_user", JSON.stringify(data));

      toast.success("Account verified successfully!");
      setShowEmailOtpModal(false);
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
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
      setLoading(true);
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

      toast.success("Google signup successful!");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Google Signup Error:", error);
      const errMsg = error.response?.data?.message || error.message || "Google Sign-In failed";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-[#FFFDF2] relative">
      <SEO
        title="Sign Up | Join OwnFresh Stone Pressed Oils"
        description="Create your OwnFresh account with instant Mobile SMS OTP or Google Sign-In. Enjoy 1% Prime reward coins and traditional stone-pressed oils."
        keywords="sign up, ownfresh register, phone otp signup, pure wood pressed oil, buy stone pressed oils india"
      />

      <div id="recaptcha-container"></div>

      {/* LEFT COLUMN: HERO IMAGE */}
      <div className="hidden lg:flex w-1/2 relative bg-black">
        <img
          src="/auth-signin-bg.jpg"
          alt="OwnFresh Pure Oils"
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
          <span className="inline-block px-3 py-1 bg-emerald-50 text-[#24672E] border border-emerald-200 text-[10px] font-black uppercase tracking-wider rounded-full mb-3">
            Welcome to the Pure Oil Revolution
          </span>
          <h2 className="text-2xl font-black mb-2.5 leading-tight uppercase tracking-tight text-slate-900 font-playfair">
            Join Thousands of <span className="text-[#24672E]">Healthy Families</span>
          </h2>
          <p className="text-xs font-semibold text-slate-600 mb-4 leading-relaxed">
            Create an account to unlock 1% Prime rewards on every order, fast delivery tracking, and farm-fresh stone-pressed purity.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase">Stone Pressed</span>
            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase">Instant SMS Access</span>
            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase">1% Cashback Coins</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-gray-500 hover:text-[#24672E] transition-colors cursor-pointer bg-white py-2 px-4.5 rounded-full shadow-xs hover:shadow-sm border border-slate-200 text-xs font-black uppercase tracking-wider z-50"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="w-full max-w-md bg-white sm:bg-transparent p-7 sm:p-0 rounded-3xl sm:rounded-none border border-slate-100 sm:border-0 shadow-sm sm:shadow-none transition-all duration-300">
          <div className="text-center mb-6">
            <h1
              className="text-3xl sm:text-4xl font-black tracking-tight mb-1.5 font-playfair uppercase"
              style={{ color: "#2F5D50" }}
            >
              Create Account
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold">
              Sign up in seconds to start shopping pure oils:
            </p>
          </div>

          {/* GOOGLE SIGNUP (PRESERVED) */}
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
            <span>Sign up with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-[1px] bg-slate-200" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              OR REGISTER WITH
            </span>
            <div className="flex-1 h-[1px] bg-slate-200" />
          </div>

          {/* TAB SELECTOR */}
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
              TAB 1: FAST PHONE OTP SIGNUP
             ───────────────────────────────────────────────────────────── */}
          {authMethod === "phone" && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Omkar Chandra"
                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:border-[#24672E] focus:bg-white transition-all text-xs sm:text-sm font-semibold text-slate-800"
                        value={fullName}
                        required
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
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
                        value={mobile}
                        required
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                  </div>

                  {/* Referral Code */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                      Referral Code <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="e.g. OWN1234"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:bg-white uppercase font-mono text-xs font-bold text-slate-800 tracking-wider"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={otpSending || mobile.length < 10 || !fullName}
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
                    {otpSending ? "Sending SMS OTP..." : "Get OTP & Register"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-5">
                  <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                        SMS OTP Sent to
                      </span>
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        +91 {mobile}
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
                      Change Details
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
                    {otpVerifying ? "Verifying..." : "Complete Registration"}
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
              TAB 2: EMAIL / PASSWORD SIGNUP
             ───────────────────────────────────────────────────────────── */}
          {authMethod === "email" && (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:bg-white text-xs sm:text-sm font-semibold text-slate-800"
                    value={fullName}
                    required
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:bg-white text-xs sm:text-sm font-semibold text-slate-800"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="tel"
                    maxLength="10"
                    placeholder="10-digit Mobile Number"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:bg-white text-xs sm:text-sm font-semibold text-slate-800"
                    value={mobile}
                    required
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full pl-10 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:bg-white text-xs sm:text-sm font-semibold text-slate-800"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                  Referral Code <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="e.g. OWN1234"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] uppercase font-mono text-xs font-bold text-slate-800"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  />
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
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign Up with Email"}
              </button>
            </form>
          )}

          {/* Footer Link */}
          <p className="text-xs sm:text-sm text-center text-slate-500 mt-8 font-semibold">
            Already have an account?{" "}
            <span
              className="font-black cursor-pointer transition-colors text-[#24672E] hover:underline"
              onClick={() => navigate("/signin")}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>

      {/* Modal for domain email OTP verification */}
      {showEmailOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-4 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-slate-900 uppercase text-center">
              Verify Email OTP
            </h3>
            <p className="text-xs text-gray-500 text-center">
              A 6-digit verification code was sent to <b>{email}</b>.
            </p>
            <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                className="w-full text-center tracking-widest font-mono text-xl py-3 border-2 border-gray-200 rounded-xl focus:border-[#24672E] focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={emailVerifying}
                className="w-full py-3.5 bg-[#EFDB27] text-black font-black uppercase tracking-wider text-xs rounded-xl shadow cursor-pointer"
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
