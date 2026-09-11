// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Eye, EyeOff } from "lucide-react";
// import { serverUrl } from "../App";

// const ForgotPassword = () => {
//   const navigate = useNavigate();
//   // steps: 1 = email, 2 = otp, 3 = new password
//   const [step, setStep] = useState(1);

//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const [showPassword, setShowPassword] = useState(false);
//   const primaryColor = "#FFD700";
//   const hoverColor = "#E6B800";
//   const bgColor = "#FFFDF2";
//   const borderColor = "#E5E5E5";

//   // STEP 1: Send OTP
//   const handleSendOtp = async () => {
//     try {
//       const res = await axios.post(
//         `${serverUrl}/api/auth/send-otp`,
//         { email },
//         {withCredentials:true}
//       );
//       console.log(res.data);
//       setStep(2);
//     } catch (error) {
//       console.log(error.response?.data || error);
//     }
//   };

//   // STEP 2: Verify OTP
//   const handleVerifyOtp = async () => {
//     try {
//       const res = await axios.post(
//         `${serverUrl}/api/auth/verify-otp`,
//         { email, otp }
//       );
//       console.log(res.data);
//       setStep(3);
//     } catch (error) {
//       console.log(error.response?.data || error);
//     }
//   };

//   // STEP 3: Reset Password
//   const handleResetPassword = async () => {
//     if (password !== confirmPassword) {
//       return alert("Passwords do not match");
//     }

//     try {
//       const res = await axios.post(
//         `${serverUrl}/api/auth/reset-password`,
//         { email, password }
//       );
//       console.log(res.data);
//       navigate("/signin");
//     } catch (error) {
//       console.log(error.response?.data || error);
//     }
//   };

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
//           {step === 1 && "Reset your password"}
//           {step === 2 && "Verify OTP"}
//           {step === 3 && "Create new password"}
//         </p>

//         {/* STEP 1: EMAIL */}
//         {step === 1 && (
//           <>
//             <div className="mb-6">
//               <label className="block text-sm font-medium mb-1">Email</label>
//               <input
//                 type="email"
//                 placeholder="Enter your registered email"
//                 className="w-full px-4 py-2 border rounded-md"
//                 style={{ borderColor }}
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>

//             <button
//               className="w-full py-2 rounded-md font-semibold cursor-pointer"
//               style={{ backgroundColor: primaryColor }}
//               onMouseOver={(e) => (e.target.style.backgroundColor = hoverColor)}
//               onMouseOut={(e) => (e.target.style.backgroundColor = primaryColor)}
//               onClick={handleSendOtp}
//             >
//               Send OTP
//             </button>
//           </>
//         )}

//         {/* STEP 2: OTP */}
//         {step === 2 && (
//           <>
//             <div className="mb-6">
//               <label className="block text-sm font-medium mb-1">OTP</label>
//               <input
//                 type="text"
//                 placeholder="Enter OTP"
//                 className="w-full px-4 py-2 border rounded-md"
//                 style={{ borderColor }}
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//               />
//             </div>

//             <button
//               className="w-full py-2 rounded-md font-semibold cursor-pointer"
//               style={{ backgroundColor: primaryColor }}
//               onMouseOver={(e) => (e.target.style.backgroundColor = hoverColor)}
//               onMouseOut={(e) => (e.target.style.backgroundColor = primaryColor)}
//               onClick={handleVerifyOtp}
//             >
//               Verify OTP
//             </button>
//           </>
//         )}

//         {/* STEP 3: NEW PASSWORD + CONFIRM */}
//         {step === 3 && (
//           <>
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">
//                 New Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   className="w-full px-4 py-2 border rounded-md pr-10"
//                   style={{ borderColor }}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium mb-1">
//                 Confirm Password
//               </label>
//               <input
//                 type={showPassword ? "text" : "password"}
//                 className="w-full px-4 py-2 border rounded-md"
//                 style={{ borderColor }}
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />
//             </div>

//             <button
//               className="w-full py-2 rounded-md font-semibold cursor-pointer"
//               style={{ backgroundColor: primaryColor }}
//               onMouseOver={(e) => (e.target.style.backgroundColor = hoverColor)}
//               onMouseOut={(e) => (e.target.style.backgroundColor = primaryColor)}
//               onClick={handleResetPassword}
//             >
//               Reset Password
//             </button>
//           </>
//         )}

//         {/* Back to Sign In */}
//         <p className="text-sm text-center text-gray-600 mt-4">
//           Back to{" "}
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

// export default ForgotPassword;


import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { serverUrl } from "../App";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // steps: 1 = email, 2 = otp, 3 = new password
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const primaryColor = "#FFD700";
  const hoverColor = "#E6B800";
  const bgColor = "#FFFDF2";
  const borderColor = "#E5E5E5";

  // STEP 1: Send OTP
  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );

      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(`${serverUrl}/api/auth/verify-otp`, {
        email,
        otp,
      });

      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(`${serverUrl}/api/auth/reset-password`, {
        email,
        password,
      });

      navigate("/signin");
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FCFBF7] dark:bg-[#0B0F14] transition-colors duration-200"
    >
      <div
        className="bg-white dark:bg-[#171D26] rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100 dark:border-[#27313D] transition-colors duration-200"
      >
        {/* Brand */}
        <h1
          className="text-3xl font-black mb-2 text-center text-[#FFD600] font-serif uppercase tracking-wider"
        >
          OwnFresh
        </h1>

        <p className="text-gray-600 dark:text-[#B7C1CE] mb-6 text-center text-sm font-medium">
          {step === 1 && "Reset your password"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "Create new password"}
        </p>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 text-sm text-red-600 dark:text-[#FF5C6C] bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/50 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {/* STEP 1: EMAIL */}
        {step === 1 && (
          <>
            <div className="mb-6">
              <label className="block text-xs font-black text-slate-700 dark:text-[#C4CCD7] uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                className="w-full h-12 px-4 bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] text-slate-900 dark:text-[#F5F7FA] placeholder-slate-400 dark:placeholder-[#778393] rounded-xl focus:ring-2 focus:ring-[#FFD600]/30 focus:border-[#FFD600] focus:bg-white dark:focus:bg-[#151B23] outline-none transition-all text-sm font-semibold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              className="w-full h-12 rounded-xl font-black text-[#111318] bg-[#FFD600] hover:bg-[#FFE45C] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-md uppercase tracking-wider text-xs sm:text-sm"
              onClick={handleSendOtp}
            >
              {loading && <Loader2 size={18} className="animate-spin text-[#111318]" />}
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <>
            <div className="mb-6">
              <label className="block text-xs font-black text-slate-700 dark:text-[#C4CCD7] uppercase tracking-wider mb-1.5 ml-1">OTP Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className="w-full h-12 px-4 bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] text-slate-900 dark:text-[#F5F7FA] placeholder-slate-400 dark:placeholder-[#778393] rounded-xl focus:ring-2 focus:ring-[#FFD600]/30 focus:border-[#FFD600] focus:bg-white dark:focus:bg-[#151B23] outline-none transition-all text-sm font-bold font-mono tracking-widest text-center"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              />
            </div>

            <button
              disabled={loading}
              className="w-full h-12 rounded-xl font-black text-[#111318] bg-[#FFD600] hover:bg-[#FFE45C] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-md uppercase tracking-wider text-xs sm:text-sm"
              onClick={handleVerifyOtp}
            >
              {loading && <Loader2 size={18} className="animate-spin text-[#111318]" />}
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* STEP 3: PASSWORD */}
        {step === 3 && (
          <>
            <div className="mb-4">
              <label className="block text-xs font-black text-slate-700 dark:text-[#C4CCD7] uppercase tracking-wider mb-1.5 ml-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] text-slate-900 dark:text-[#F5F7FA] placeholder-slate-400 dark:placeholder-[#778393] rounded-xl pr-12 focus:ring-2 focus:ring-[#FFD600]/30 focus:border-[#FFD600] focus:bg-white dark:focus:bg-[#151B23] outline-none transition-all text-sm font-semibold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#818C9B] hover:text-gray-900 dark:hover:text-[#F5F7FA] cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black text-slate-700 dark:text-[#C4CCD7] uppercase tracking-wider mb-1.5 ml-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full h-12 px-4 bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] text-slate-900 dark:text-[#F5F7FA] placeholder-slate-400 dark:placeholder-[#778393] rounded-xl focus:ring-2 focus:ring-[#FFD600]/30 focus:border-[#FFD600] focus:bg-white dark:focus:bg-[#151B23] outline-none transition-all text-sm font-semibold"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              className="w-full h-12 rounded-xl font-black text-[#111318] bg-[#FFD600] hover:bg-[#FFE45C] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-md uppercase tracking-wider text-xs sm:text-sm"
              onClick={handleResetPassword}
            >
              {loading && <Loader2 size={18} className="animate-spin text-[#111318]" />}
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        {/* BACK TO SIGN IN */}
        <p className="text-xs sm:text-sm text-center text-gray-600 dark:text-[#818C9B] mt-6 pt-4 border-t border-slate-100 dark:border-[#27313D] font-medium">
          Back to{" "}
          <span
            className="font-black cursor-pointer hover:underline text-[#FFD600]"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
