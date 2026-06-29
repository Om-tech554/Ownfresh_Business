// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Eye, EyeOff } from "lucide-react";
// import { serverUrl } from "../App";
// import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { auth } from "../../firebase";
// const SignIn = () => {
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);

//   const primaryColor = "#FFD700";
//   const hoverColor = "#E6B800";
//   const bgColor = "#FFFDF2";
//   const borderColor = "#E5E5E5";

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSignIn = async () => {
//     try {
//       const result = await axios.post(
//         `${serverUrl}/api/auth/signin`,
//         { email, password },
//         { withCredentials: true }
//       );
//       console.log(result);
//       navigate("/");
//     } catch (error) {
//        console.log("BACKEND ERROR 👉", error.response?.data);
//     }
//   };
//   const handleGoogleAuth=async()=>{

//       const provider=new GoogleAuthProvider()
//       const result=await signInWithPopup(auth, provider)
//       try {
//         const {data}=await axios.post(`${serverUrl}/api/auth/google-auth`,{
//           fullName:result.user.displayName,
//           email:result.user.email,
//         },{withCredentials:true})
//         console.log(data)
//       } catch (error) {
//         console.log(error)
//       }
//     }

//   return (
//     <div
//       className="min-h-screen w-full flex items-center justify-center p-4"
//       style={{ backgroundColor: bgColor }}
//     >
//       <div
//         className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border"
//         style={{ borderColor }}
//       >
//         {/* Brand */}
//         <h1
//           className="text-3xl font-bold mb-2 text-center"
//           style={{ color: primaryColor }}
//         >
//           OwnFresh
//         </h1>

//         <p className="text-gray-600 mb-6 text-center">
//           Sign in to your account
//         </p>

//         {/* CONTINUE WITH GOOGLE */}
//         <button
//           className="w-full flex items-center justify-center gap-2 border py-2 rounded-md mb-6 hover:bg-gray-50 transition cursor-pointer"
//           style={{ borderColor }}
//           onClick={handleGoogleAuth}
//         >
//           <img
//             src="https://www.svgrepo.com/show/475656/google-color.svg"
//             alt="Google"
//             className="w-5 h-5"
//           />
//           <span className="font-medium">Continue with Google</span>
//         </button>

//         {/* OR DIVIDER */}
//         <div className="flex items-center gap-2 mb-6">
//           <div className="flex-1 h-px bg-gray-300" />
//           <span className="text-sm text-gray-500">OR</span>
//           <div className="flex-1 h-px bg-gray-300" />
//         </div>

//         {/* Email */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-1">Email</label>
//           <input
//             type="email"
//             placeholder="Enter your email"
//             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
//             style={{ borderColor }}
//             value={email} required
//             onChange={(e) => setEmail(e.target.value)}
//           />
//         </div>

//         {/* Password */}
//         <div className="mb-2">
//           <label className="block text-sm font-medium mb-1">Password</label>
//           <div className="relative">
//             <input
//               type={showPassword ? "text" : "password"}
//               name="password"
//               autoComplete="current-password"
//               data-lpignore="true"
//               placeholder="Enter your password"
//               className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 "
//               style={{ borderColor }}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//             {/* SINGLE EYE ICON */}
//             <button
//               type="button"
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>
//         </div>

//         {/* Forgot Password */}
//         <div className="text-right mb-6">
//           <span
//             className="text-sm font-medium cursor-pointer"
//             style={{ color: primaryColor }}
//             onClick={() => navigate("/forgot-password")}
//           >
//             Forgot password?
//           </span>
//         </div>

//         {/* Sign In Button */}
//         <button
//           className="w-full py-2 rounded-md font-semibold cursor-pointer"
//           style={{ backgroundColor: primaryColor }}
//           onMouseOver={(e) => (e.target.style.backgroundColor = hoverColor)}
//           onMouseOut={(e) => (e.target.style.backgroundColor = primaryColor)}
//           onClick={handleSignIn}
//         >
//           Sign In
//         </button>

//         {/* Navigate to SignUp */}
//         <p className="text-sm text-center text-gray-600 mt-4">
//           Don’t have an account?{" "}
//           <span
//             className="font-semibold cursor-pointer"
//             style={{ color: primaryColor }}
//             onClick={() => navigate("/signup")}
//           >
//             Create Account
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SignIn;

// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
// import { serverUrl } from "../App";
// import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { auth } from "../../firebase";
// import toast from "react-hot-toast";

// const SignIn = () => {
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   // Theme Constants
//   const primaryColor = "#FFD700";
//   const hoverColor = "#E6B800";
//   const bgColor = "#FFFDF2";

//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const result = await axios.post(
//         `${serverUrl}/api/auth/signin`,
//         { email, password },
//         { withCredentials: true }
//       );
//       navigate("/");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleAuth = async () => {
//     const provider = new GoogleAuthProvider();
//     try {
//       const result = await signInWithPopup(auth, provider);

//       const { data } = await axios.post(
//         `${serverUrl}/api/auth/google-auth`,
//         {
//           fullName: result.user.displayName,
//           email: result.user.email,
//         },
//         { withCredentials: true }
//       );
//       navigate("/");
//     } catch (error) {
//       if (error.response?.status === 400) {
//         toast.error("Account not found. Please Sign Up to provide your mobile number .");
//         navigate("/signup");
//       } else {
//         toast.error("Google Authentication failed.");
//       }
//     }
//   };

//   return (
//     <div
//       className="min-h-screen w-full flex flex-col items-center justify-center p-4 font-sans transition-all"
//       style={{ backgroundColor: bgColor }}
//     >
//       {/* Back Button */}
//       <button
//         onClick={() => navigate("/")}
//         className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors cursor-pointer"
//       >
//         <ArrowLeft size={20} />
//         <span className="font-medium">Back to Home</span>
//       </button>

//       <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full max-w-md p-10 border border-gray-100">

//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1
//             className="text-4xl font-black tracking-tight mb-2"
//             style={{ color: primaryColor }}
//           >
//             OwnFresh
//           </h1>
//           <p className="text-gray-500 font-medium">
//             Welcome back! Please enter your details.
//           </p>
//         </div>

//         {/* Google Auth Button */}
//         <button
//           className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl mb-6 hover:bg-gray-50 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
//           onClick={handleGoogleAuth}
//         >
//           <img
//             src="https://www.svgrepo.com/show/475656/google-color.svg"
//             alt="Google"
//             className="w-5 h-5"
//           />
//           <span className="font-semibold text-gray-700">Log in with Google</span>
//         </button>

//         {/* Divider */}
//         <div className="flex items-center gap-4 mb-8">
//           <div className="flex-1 h-[1px] bg-gray-100" />
//           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
//             or
//           </span>
//           <div className="flex-1 h-[1px] bg-gray-100" />
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSignIn} className="space-y-5">
//           {/* Email */}
//           <div>
//             <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
//               Email Address
//             </label>
//             <div className="relative">
//               <Mail
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                 size={18}
//               />
//               <input
//                 type="email"
//                 placeholder="name@company.com"
//                 className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all cursor-pointer"
//                 value={email}
//                 required
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Password */}
//           <div>
//             <div className="flex justify-between items-center mb-2 ml-1">
//               <label className="text-sm font-bold text-gray-700">
//                 Password
//               </label>
//               <span
//                 className="text-xs font-bold cursor-pointer hover:underline"
//                 style={{ color: primaryColor }}
//                 onClick={() => navigate("/forgot-password")}
//               >
//                 Forgot?
//               </span>
//             </div>

//             <div className="relative">
//               <Lock
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                 size={18}
//               />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Password"
//                 className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
//                 value={password}
//                 required
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//               <button
//                 type="button"
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//           </div>

//           {/* Sign In Button — SAME */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-4 mt-4 rounded-xl font-bold text-white shadow-lg shadow-yellow-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
//             style={{
//               backgroundColor: primaryColor,
//               color: "#422006",
//             }}
//             onMouseOver={(e) =>
//               (e.currentTarget.style.backgroundColor = hoverColor)
//             }
//             onMouseOut={(e) =>
//               (e.currentTarget.style.backgroundColor = primaryColor)
//             }
//           >
//             {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In to Account"}
//           </button>
//         </form>

//         {/* Footer */}
//         <p className="text-sm text-center text-gray-500 mt-8 font-medium">
//           New to OwnFresh?{" "}
//           <span
//             className="font-bold cursor-pointer transition-colors"
//             style={{ color: primaryColor }}
//             onClick={() => navigate("/signup")}
//           >
//             Create an account
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SignIn;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userslice";   // <-- MUST IMPORT
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import toast from "react-hot-toast";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // <-- IMPORTANT

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

      toast.success("Logged in successfully!");
      navigate("/"); // Redirect
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials!");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // GOOGLE LOGIN
  // -----------------------------------------
  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const googleUser = await signInWithPopup(auth, provider);

      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: googleUser.user.displayName,
          email: googleUser.user.email,
        },
        { withCredentials: true }
      );

      // ⭐ FIX: UPDATE REDUX & LOCAL STORAGE
      dispatch(setUserData(data));
      localStorage.setItem("oil_user", JSON.stringify(data));

      toast.success("Logged in with Google!", { duration: 1500 });
      navigate("/");
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("Account not found! Please sign up first.");
        return navigate("/signup");
      }

      toast.error("Google Authentication failed", { duration: 1500 });
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 font-sans transition-all"
      style={{ backgroundColor: bgColor }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Home</span>
      </button>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full max-w-md p-10 border border-gray-100">

        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold tracking-tight mb-2 font-playfair"
            style={{ color: "#2F5D50" }}
          >
            Botanic Stone
          </h1>
          <p className="text-gray-500 font-medium">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Google Login Button */}
        <button
          className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl mb-6 hover:bg-gray-50 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
          onClick={handleGoogleAuth}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="font-semibold text-gray-700">Log in with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-[1px] bg-gray-100" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            or
          </span>
          <div className="flex-1 h-[1px] bg-gray-100" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="text-sm font-bold text-gray-700">
                Password
              </label>
              <span
                className="text-xs font-bold cursor-pointer hover:underline"
                style={{ color: primaryColor }}
                onClick={() => navigate("/forgot-password")}
              >
                Forgot?
              </span>
            </div>

            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 rounded-xl font-bold text-white shadow-lg shadow-yellow-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            style={{
              backgroundColor: primaryColor,
              color: "#422006",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = hoverColor)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = primaryColor)
            }
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In to Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-gray-500 mt-8 font-medium">
          New to Botanic Stone?{" "}
          <span
            className="font-bold cursor-pointer transition-colors"
            style={{ color: primaryColor }}
            onClick={() => navigate("/signup")}
          >
            Create an account
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
