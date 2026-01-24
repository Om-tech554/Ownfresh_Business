// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Eye, EyeOff } from "lucide-react";
// import { serverUrl } from "../App";
// import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { auth } from "../../firebase";

// const SignUp = () => {
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);
//   const primaryColor = "#FFD700";   // Oil Yellow
//   const hoverColor = "#E6B800";
//   const bgColor = "#FFFDF2";
//   const borderColor = "#E5E5E5";
//   const [fullName, setFullName] = useState("")
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [mobile, setMobile] = useState("")
//   const [role, setRole] = useState("user"); // default role

//   const handleSignUp = async (params) => {
//     try {
//       const result = await axios.post(`${serverUrl}/api/auth/signup`, {
//         fullName, email, password, mobile, role
//       },
//         { withCredentials: true })
//       console.log(result)
//     } catch (error) {
//       console.log(error)
//     }
//   }
//   const handleGoogleAuth=async()=>{
//     if(!mobile){
//       return alert("Write Mobile Number Is Required")
//     }
//     const provider=new GoogleAuthProvider()
//     const result=await signInWithPopup(auth, provider)
//     try {
//       const {data}=await axios.post(`${serverUrl}/api/auth/google-auth`,{
//         fullName:result.user.displayName,
//         email:result.user.email,
//         role,mobile
//       },{withCredentials:true})
//       console.log(data)
//     } catch (error) {
//       console.log(error)
//     }
//   }
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
//           Create your account to get started
//         </p>

//         {/* Google Signup */}
//         <button
//           className="w-full flex items-center justify-center gap-2 border py-2 rounded-md mb-6 hover:bg-gray-50 transition"
//           style={{ borderColor }}
//           onClick={handleGoogleAuth}
//         >
//           <img
//             src="https://www.svgrepo.com/show/475656/google-color.svg"
//             alt="Google"
//             className="w-5 h-5"
//           />
//           <span className="font-medium cursor-pointer">Sign up with Google</span>
//         </button>

//         <div className="flex items-center gap-2 mb-6">
//           <div className="flex-1 h-px bg-gray-300" />
//           <span className="text-sm text-gray-500">OR</span>
//           <div className="flex-1 h-px bg-gray-300" />
//         </div>

//         {/* Full Name */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-1">
//             Full Name
//           </label>
//           <input
//             type="text"
//             placeholder="Enter your full name"
//             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
//             style={{ borderColor }}
//             value={fullName}
//             onChange={(e) => setFullName(e.target.value)}
//           />

//         </div>
//         {/* Mobile Number */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-1">
//             mobile number
//           </label>
//           <input
//             type="tel"
//             placeholder="Enter your Mobile Number"
//             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
//             style={{ borderColor }}
//             value={mobile}
//             onChange={(e) => setMobile(e.target.value)}
//           />

//         </div>

//         {/* Email */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-1">
//             Email
//           </label>
//           <input
//             type="email"
//             placeholder="Enter your email"
//             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
//             style={{ borderColor }}
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />

//         </div>

//         {/* Password with Eye */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-1">
//             Password
//           </label>
//           <div className="relative">
//             <input
//               type={showPassword ? "text" : "password"}
//               placeholder="Create a password"
//               className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10"
//               style={{ borderColor }}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />

//             <button
//               type="button"
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>
//         </div>

//         {/* Sign Up Button */}
//         <button
//           className="w-full py-2 rounded-md font-semibold cursor-pointer"
//           style={{ backgroundColor: primaryColor }}
//           onMouseOver={(e) => (e.target.style.backgroundColor = hoverColor)}
//           onMouseOut={(e) => (e.target.style.backgroundColor = primaryColor)}
//           onClick={handleSignUp}
//         >
//           Create Account
//         </button>

//         {/* Navigate to SignIn */}
//         <p className="text-sm text-center text-gray-600 mt-4">
//           Already have an account?{" "}
//           <span
//             className="font-semibold cursor-pointer"
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

// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Eye, EyeOff, User, Mail, Lock, Phone, Loader2, ArrowLeft } from "lucide-react";
// import { serverUrl } from "../App";
// import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { auth } from "../../firebase";
// import toast, { Toaster } from "react-hot-toast";

// const SignUp = () => {
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // Theme Constants
//   const primaryColor = "#FFD700";
//   const hoverColor = "#E6B800";
//   const bgColor = "#FFFDF2";

//   // Form State
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [role, setRole] = useState("user");

//   const handleSignUp = async (e) => {
//     e.preventDefault();
    
//     // Basic validation
//     if (mobile.length < 10) {
//       return toast.error("Please enter a valid 10-digit mobile number");
//     }

//     setLoading(true);
//     try {
//       const result = await axios.post(
//         `${serverUrl}/api/auth/signup`,
//         { fullName, email, password, mobile, role },
//         { withCredentials: true }
//       );
//       toast.success("Account created successfully!"); 
//       navigate("/signin");
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || "Registration failed";
//       toast.error(errorMsg); // Error Toast
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleAuth = async () => {
//     if (!mobile || mobile.length < 10) {
//       return toast.error("Please enter your mobile number first");
//     }

//     const provider = new GoogleAuthProvider();
//     setLoading(true);
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const { data } = await axios.post(
//         `${serverUrl}/api/auth/google-auth`,
//         {
//           fullName: result.user.displayName,
//           email: result.user.email,
//           role: role,
//           mobile: mobile,
//         },
//         { withCredentials: true }
//       );

//       toast.success(`Welcome, ${result.user.displayName}!`);
//       navigate("/");
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || "Google Auth failed";
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <div 
//       className="min-h-screen w-full flex flex-col items-center justify-center p-4 font-sans"
//       style={{ backgroundColor: bgColor }}
//     >
//       {/* 2. Add Toaster Component for rendering notifications */}
//       <Toaster position="top-center" reverseOrder={false} />

//       <button 
//         onClick={() => navigate("/")}
//         className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
//       >
//         <ArrowLeft size={20} />
//         <span className="font-medium">Back</span>
//       </button>

//       <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-10 border border-gray-100 my-8">
        
//         <div className="text-center mb-8">
//           <h1 
//             className="text-4xl font-black tracking-tight mb-2"
//             style={{ color: primaryColor }}
//           >
//             OwnFresh
//           </h1>
//           <p className="text-gray-500 font-medium text-sm px-4">
//             Join our community and start your fresh journey today.
//           </p>
//         </div>

//         <button
//           className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl mb-6 hover:bg-gray-50 transition-all active:scale-[0.98] cursor-pointer"
//           onClick={handleGoogleAuth}
//         >
//           <img
//             src="https://www.svgrepo.com/show/475656/google-color.svg"
//             alt="Google"
//             className="w-5 h-5"
//           />
//           <span className="font-semibold text-gray-700">Sign up with Google</span>
//         </button>

//         <div className="flex items-center gap-4 mb-8">
//           <div className="flex-1 h-[1px] bg-gray-100" />
//           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">or</span>
//           <div className="flex-1 h-[1px] bg-gray-100" />
//         </div>

//         <form onSubmit={handleSignUp} className="space-y-4">
//           <div>
//             <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase">Full Name</label>
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type="text"
//                 placeholder="John Doe"
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
//                 value={fullName}
//                 required
//                 onChange={(e) => setFullName(e.target.value)}
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase">Mobile Number</label>
//             <div className="relative">
//               <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type="tel"
//                 placeholder="9876543210"
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
//                 value={mobile}
//                 required
//                 onChange={(e) => setMobile(e.target.value)}
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase">Email Address</label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type="email"
//                 placeholder="john@example.com"
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
//                 value={email}
//                 required
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase">Password</label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Creat Password"
//                 className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
//                 value={password}
//                 required
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//               <button
//                 type="button"
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//           </div>
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3.5 mt-4 rounded-xl font-bold shadow-lg shadow-yellow-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
//             style={{ 
//               backgroundColor: primaryColor,
//               color: "#422006"
//             }}
//           >
//             {loading ? (
//               <Loader2 className="animate-spin" size={20} />
//             ) : (
//               "Create Free Account"
//             )}
//           </button>
//         </form>

//         <p className="text-sm text-center text-gray-500 mt-8 font-medium">
//           Already have an account?{" "}
//           <span
//             className="font-bold cursor-pointer transition-colors"
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
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Phone, Loader2, ArrowLeft } from "lucide-react";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import toast from "react-hot-toast";

const SignUp = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const role = "user";

  const primaryColor = "#FFD700";

  // --------------------------
  // NORMAL SIGNUP
  // --------------------------
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (mobile.length < 10)
      return toast.error("Enter valid 10-digit mobile number");

    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/auth/signup`,
        { fullName, email, password, mobile, role },
        { withCredentials: true }
      );

      toast.success("Account created successfully!", { duration: 1500 });

      setTimeout(() => navigate("/signin"), 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed",{ duration: 1500 });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // GOOGLE SIGNUP
  // --------------------------
  const handleGoogleAuth = async () => {
    if (mobile.length < 10)
      return toast.error("Enter mobile number before Google signup",{ duration: 1500 });

    const provider = new GoogleAuthProvider();

    setLoading(true);
    try {
      const googleData = await signInWithPopup(auth, provider);

      await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: googleData.user.displayName,
          email: googleData.user.email,
          mobile,
          role,
        },
        { withCredentials: true }
      );

      toast.success("Google signup completed",{duaration:1500});
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Google signup failed",{ duration: 1500 });
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

        <h1 className="text-4xl text-center font-black mb-2" style={{ color: primaryColor }}>
          OwnFresh
        </h1>
        <p className="text-gray-500 text-center mb-6">Create your account</p>

        {/* GOOGLE SIGNUP */}
        <button
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 border py-3 rounded-xl mb-6 shadow-yellow-200 transition-all active:scale-[0.98]"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
          Sign up with Google
        </button>

        <form onSubmit={handleSignUp} className="space-y-4">

          <div>
            <label>Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full pl-10 pr-3 py-3 border rounded-xl"
                required onChange={(e) => setFullName(e.target.value)} />
            </div>
          </div>

          <div>
            <label>Whatapp Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full pl-10 pr-3 py-3 border rounded-xl"
                required onChange={(e) => setMobile(e.target.value)} />
            </div>
          </div>

          <div>
            <label>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full pl-10 pr-3 py-3 border rounded-xl"
                required type="email" onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <label>Creat Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-10 py-3 border rounded-xl"
                required
                type={showPassword ? "text" : "password"}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button className="w-full py-3 rounded-xl font-bold shadow-yellow-200 transition-all active:scale-[0.98]"
            style={{ backgroundColor: primaryColor }}>
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
