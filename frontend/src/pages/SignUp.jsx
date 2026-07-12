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
import { auth } from "../../firebase";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
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

      // ⭐ NEW: Automatically log user in after signup
      dispatch(setUserData(data));
      dispatch(clearCart()); // ⭐ NEW: Cart resets to 0 for new user
      localStorage.setItem("oil_user", JSON.stringify(data));

      toast.success("Account created!", { duration: 1500 });

      setTimeout(() => navigate("/"), 1000);

    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // GOOGLE SIGNUP
  // -------------------------
  const handleGoogleAuth = async () => {
    if (mobile.length < 10)
      return toast.error("Enter mobile number before Google signup");

    const provider = new GoogleAuthProvider();
    setLoading(true);

    try {
      const google = await signInWithPopup(auth, provider);

      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: google.user.displayName,
          email: google.user.email,
          mobile: countryCode + mobile,
          role,
        },
        { withCredentials: true }
      );

      dispatch(setUserData(data));
      dispatch(clearCart()); // ⭐ for new google users
      localStorage.setItem("oil_user", JSON.stringify(data));

      toast.success("Google signup completed");
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-8 right-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-black tracking-tight mb-2 font-playfair"
              style={{ color: "#2F5D50" }}
            >
              OwnFresh
            </h1>
            <p className="text-gray-500 font-medium">Create your account</p>
          </div>

          {/* GOOGLE SIGNUP */}
          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl mb-3 hover:bg-gray-50 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span className="font-semibold text-gray-700">Sign up with Google</span>
          </button>


          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-[1px] bg-gray-100" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-[1px] bg-gray-100" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
                    placeholder="John Doe"
                    required
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
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
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">WhatsApp</label>
                <div className="flex bg-gray-50 border border-gray-100 rounded-xl focus-within:ring-2 focus-within:ring-yellow-400 focus-within:bg-white transition-all overflow-hidden">
                  <div className="flex items-center pl-3 border-r border-gray-200 pr-2">
                    <Phone className="text-gray-400 mr-2" size={18} />
                    <select
                      className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer"
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
                    className="w-full px-3 py-3 bg-transparent focus:outline-none text-gray-900"
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
              <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
                  required
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              className="w-full py-4 mt-2 rounded-xl font-bold text-[#422006] shadow-lg shadow-yellow-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
            </button>

          </form>

          <p className="text-center mt-6 text-sm font-medium text-gray-500">
            Already have an account?{" "}
            <span
              className="font-bold cursor-pointer transition-colors"
              style={{ color: primaryColor }}
              onClick={() => navigate("/signin")}
            >
              Sign In
            </span>
          </p>

        </div>
      </div>
    </div>
  );
};

export default SignUp;
