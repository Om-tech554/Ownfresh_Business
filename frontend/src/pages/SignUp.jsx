// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Eye, EyeOff, User, Mail, Lock, Phone, Loader2, ArrowLeft } from "lucide-react";
// import { serverUrl } from "../App";
// import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { auth } from "../../firebase";
// import toast from "react-hot-toast";

// const SignUp = () => {
//   const navigate = useNavigate();

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [fullName, setFullName] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const role = "user";

//   const primaryColor = "#FFD700";

//   // --------------------------
//   // NORMAL SIGNUP
//   // --------------------------
//   const handleSignUp = async (e) => {
//     e.preventDefault();

//     if (mobile.length < 10)
//       return toast.error("Enter valid 10-digit mobile number");

//     setLoading(true);
//     try {
//       await axios.post(
//         `${serverUrl}/api/auth/signup`,
//         { fullName, email, password, mobile, role },
//         { withCredentials: true }
//       );

//       toast.success("Account created successfully!", { duration: 1500 });

//       setTimeout(() => navigate("/signin"), 1500);

//     } catch (error) {
//       toast.error(error.response?.data?.message || "Signup failed",{ duration: 1500 });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --------------------------
//   // GOOGLE SIGNUP
//   // --------------------------
//   const handleGoogleAuth = async () => {
//     if (mobile.length < 10)
//       return toast.error("Enter mobile number before Google signup",{ duration: 1500 });

//     const provider = new GoogleAuthProvider();

//     setLoading(true);
//     try {
//       const googleData = await signInWithPopup(auth, provider);

//       await axios.post(
//         `${serverUrl}/api/auth/google-auth`,
//         {
//           fullName: googleData.user.displayName,
//           email: googleData.user.email,
//           mobile,
//           role,
//         },
//         { withCredentials: true }
//       );

//       toast.success("Google signup completed",{duaration:1500});
//       navigate("/");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Google signup failed",{ duration: 1500 });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFFDF2] relative">

//       <button
//         onClick={() => navigate("/")}
//         className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-black"
//       >
//         <ArrowLeft size={20} /> Back
//       </button>

//       <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">

//         <h1 className="text-4xl text-center font-black mb-2" style={{ color: primaryColor }}>
//           OwnFresh
//         </h1>
//         <p className="text-gray-500 text-center mb-6">Create your account</p>

//         {/* GOOGLE SIGNUP */}
//         <button
//           onClick={handleGoogleAuth}
//           className="w-full flex items-center justify-center gap-3 border py-3 rounded-xl mb-6 shadow-yellow-200 transition-all active:scale-[0.98]"
//         >
//           <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
//           Sign up with Google
//         </button>

//         <form onSubmit={handleSignUp} className="space-y-4">

//           <div>
//             <label>Full Name</label>
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input className="w-full pl-10 pr-3 py-3 border rounded-xl"
//                 required onChange={(e) => setFullName(e.target.value)} />
//             </div>
//           </div>

//           <div>
//             <label>Whatapp Number</label>
//             <div className="relative">
//               <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input className="w-full pl-10 pr-3 py-3 border rounded-xl"
//                 required onChange={(e) => setMobile(e.target.value)} />
//             </div>
//           </div>

//           <div>
//             <label>Email</label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input className="w-full pl-10 pr-3 py-3 border rounded-xl"
//                 required type="email" onChange={(e) => setEmail(e.target.value)} />
//             </div>
//           </div>

//           <div>
//             <label>Creat Password</label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input
//                 className="w-full pl-10 pr-10 py-3 border rounded-xl"
//                 required
//                 type={showPassword ? "text" : "password"}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//               <button type="button"
//                 className="absolute right-3 top-1/2 -translate-y-1/2"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <EyeOff /> : <Eye />}
//               </button>
//             </div>
//           </div>

//           <button className="w-full py-3 rounded-xl font-bold shadow-yellow-200 transition-all active:scale-[0.98]"
//             style={{ backgroundColor: primaryColor }}>
//             {loading ? <Loader2 className="animate-spin mx-auto" /> : "Create Account"}
//           </button>

//         </form>

//         <p className="text-center mt-6 text-gray-500">
//           Already have an account?{" "}
//           <span
//             className="font-bold cursor-pointer"
//             style={{ color: primaryColor }}
//             onClick={() => navigate("/signin")}
//           >
//             Sign In
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SignUp;

import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, User, Mail, Lock, Phone, Loader2, ArrowLeft, Ticket
} from "lucide-react";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getToken } from "firebase/app-check";
import { auth, appCheck } from "../../firebase";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { setUserData, clearCart } from "../redux/userslice";  // ⭐ ADDED
const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const role = "user";
  const primaryColor = "#FFD700";

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  // -------------------------
  // NORMAL SIGNUP
  // -------------------------
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (mobile.length < 10) {
      return toast.error("Enter valid 10-digit mobile number");
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { fullName, email, password, mobile: countryCode + mobile, role },
        { withCredentials: true }
      );

      if (data.requiresVerification) {
        toast.success("Verification OTP sent to your company email!");
        setShowOtpModal(true);
      } else {
        // ⭐ NEW: Automatically log user in after signup
        dispatch(setUserData(data));
        dispatch(clearCart()); // ⭐ NEW: Cart resets to 0 for new user
        localStorage.setItem("oil_user", JSON.stringify(data));

        toast.success("Account created!", { duration: 1500 });

        setTimeout(() => navigate("/"), 1000);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP code");
    }

    setVerifying(true);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/verify-signup-otp`,
        { email, otp: otpCode },
        { withCredentials: true }
      );

      dispatch(setUserData(data));
      dispatch(clearCart());
      localStorage.setItem("oil_user", JSON.stringify(data));

      toast.success("Account verified and created successfully!");
      setShowOtpModal(false);

      if (data.role === "admin" || data.role === "blogger") {
        setTimeout(() => navigate("/admin"), 1000);
      } else {
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await axios.post(
        `${serverUrl}/api/auth/resend-signup-otp`,
        { email },
        { withCredentials: true }
      );
      toast.success("OTP resent successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  // -------------------------
  // GOOGLE SIGNUP
  // -------------------------
  const handleGoogleAuth = async () => {
    if (mobile && mobile.length < 10)
      return toast.error("Enter a valid 10-digit mobile number or leave it blank");

    const provider = new GoogleAuthProvider();
    setLoading(true);

    try {
      const google = await signInWithPopup(auth, provider);
      const idToken = await google.user.getIdToken();

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
          idToken,
          mobile: mobile ? (countryCode + mobile) : undefined,
          role,
        },
        { 
          withCredentials: true,
          headers: appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {}
        }
      );

      dispatch(setUserData(data));
      dispatch(clearCart()); // ⭐ for new google users
      localStorage.setItem("oil_user", JSON.stringify(data));

      toast.success("Google signup completed");
      
      // Remove query params from browser history for security
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/");

    } catch (error) {
      toast.error(error.response?.data?.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-[#FFFDF2] relative">
      
      {/* LEFT COLUMN: BACKGROUND IMAGE */}
      <div className="hidden lg:flex w-1/2 relative bg-black">
        <img 
          src="/auth-bg.png" 
          alt="OwnFresh background" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>
        
        <div className="absolute top-12 left-12">
          <h1 className="text-5xl font-black text-white tracking-widest uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
            Own<span className="text-[#FFD700]">Fresh</span>
          </h1>
          <div className="h-1 w-16 bg-[#FFD700] mt-4 rounded-full"></div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Discover the Essence of Nature</h2>
          <p className="text-lg text-gray-200">Join OwnFresh to explore premium, stone-pressed oils and natural wellness products tailored for you.</p>
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

          <div className="text-center mb-6">
            <h1
              className="text-3xl sm:text-4xl font-black tracking-tight mb-1.5 font-playfair uppercase"
              style={{ color: "#2F5D50" }}
            >
              Botanic Purity
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-semibold">Create your account</p>
          </div>

          {/* GOOGLE SIGNUP */}
          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 py-3.5 rounded-xl mb-3 hover:bg-slate-50 transition-all active:scale-[0.98] cursor-pointer shadow-xs bg-white text-xs sm:text-sm font-bold text-slate-700"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span>Sign up with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-[1px] bg-slate-100" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-[1px] bg-slate-100" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className="w-full pl-10 pr-3 py-3.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:border-[#24672E] focus:bg-white transition-all text-xs sm:text-sm font-semibold text-slate-800"
                    placeholder="John Doe"
                    required
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className="w-full pl-10 pr-3 py-3.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:border-[#24672E] focus:bg-white transition-all text-xs sm:text-sm font-semibold text-slate-800"
                    type="email"
                    placeholder="name@mail.com"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Mobile */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">WhatsApp</label>
                <div className="flex bg-slate-50/70 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-[#24672E] focus-within:border-[#24672E] focus-within:bg-white transition-all overflow-hidden">
                  <div className="flex items-center pl-3.5 border-r border-slate-200 pr-2 bg-slate-50 shrink-0">
                    <Phone className="text-slate-400 mr-2" size={16} />
                    <select
                      className="bg-transparent text-xs font-black text-slate-700 focus:outline-none cursor-pointer"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+65">🇸🇬 +65</option>
                    </select>
                  </div>
                  <input
                    className="w-full px-3 py-3.5 bg-transparent focus:outline-none text-xs sm:text-sm font-semibold text-slate-800"
                    type="tel"
                    placeholder="1234567890"
                    required
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  className="w-full pl-10 pr-10 py-3.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24672E] focus:border-[#24672E] focus:bg-white transition-all text-xs sm:text-sm font-semibold text-slate-800"
                  required
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              className="w-full py-4 mt-4 rounded-xl font-black text-[#422006] shadow-md shadow-yellow-500/20 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-widest cursor-pointer border-0"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
            </button>

          </form>

          <p className="text-xs sm:text-sm text-center text-slate-400 mt-8 font-semibold">
            Already have an account?{" "}
            <span
              className="font-black cursor-pointer transition-colors text-[#24672E] hover:underline"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </span>
          </p>

        </div>
      </div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowOtpModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10 p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-200 shadow-sm">
                  <Ticket className="text-[#2F5D50]" size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Verify Your Email</h3>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                  We've sent a 6-digit OTP code to <span className="font-bold text-slate-800">{email}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 text-center">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    className="w-full text-center tracking-[0.5em] text-2xl font-black p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all text-slate-800"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-4 rounded-2xl font-bold text-[#422006] shadow-lg shadow-yellow-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {verifying ? <Loader2 className="animate-spin" size={20} /> : "Verify & Complete Signup"}
                </button>

                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="text-[#2F5D50] hover:text-[#2F5D50]/80 transition-colors uppercase tracking-wider disabled:opacity-50"
                  >
                    {resending ? "Sending..." : "Resend OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignUp;
