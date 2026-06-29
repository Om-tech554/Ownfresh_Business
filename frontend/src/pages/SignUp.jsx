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
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");

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
        { fullName, email, password, mobile, role, referralCode },
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
          mobile,
          role,
          referralCode,
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFFDF2] relative">

      <button
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-black"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">

        <h1
          className="text-4xl text-center font-black mb-2"
          style={{ color: primaryColor }}
        >
          OwnFresh
        </h1>

        <p className="text-gray-500 text-center mb-6">Create your account</p>

        {/* GOOGLE SIGNUP */}
        <button
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 border py-3 rounded-xl mb-6 cursor-pointer hover:bg-gray-50 transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5" />
          Sign up with Google
        </button>

        {/* FORM */}
        <form onSubmit={handleSignUp} className="space-y-4">

          {/* Full Name */}
          <div>
            <label>Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-3 py-3 border rounded-xl"
                required
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label>WhatsApp Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-3 py-3 border rounded-xl"
                type="tel"
                required
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-3 py-3 border rounded-xl"
                type="email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label>Create Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-10 py-3 border rounded-xl"
                required
                type={showPassword ? "text" : "password"}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="pb-2">
            <label className="text-slate-600 text-sm font-bold flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#FFD700]" size={16} />
              Referral Code (Optional)
            </label>
            <input
              className="w-full px-4 py-3 border border-slate-200 rounded-xl mt-1 focus:border-[#FFD700] outline-none transition-all uppercase placeholder:text-slate-300"
              placeholder="e.g. OWN-XXXXX"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            />
          </div>


          {/* SUBMIT */}
          <button
            className="w-full py-3 rounded-xl font-bold cursor-pointer hover:opacity-90 transition"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Create Account"}
          </button>

        </form>

        <p className="text-center mt-6 text-gray-500">
          Already have an account?{" "}
          <span
            className="font-bold cursor-pointer"
            style={{ color: primaryColor }}
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>

      </div>
    </div>
  );
};

export default SignUp;
