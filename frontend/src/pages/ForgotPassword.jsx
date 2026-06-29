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
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border"
        style={{ borderColor }}
      >
        {/* Brand */}
        <h1
          className="text-3xl font-bold mb-2 text-center"
          style={{ color: primaryColor }}
        >
          OwnFresh
        </h1>

        <p className="text-gray-600 mb-6 text-center">
          {step === 1 && "Reset your password"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "Create new password"}
        </p>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* STEP 1: EMAIL */}
        {step === 1 && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-300 outline-none"
                style={{ borderColor }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-2 rounded-md font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              style={{ backgroundColor: primaryColor }}
              onMouseOver={(e) =>
                (e.target.style.backgroundColor = hoverColor)
              }
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = primaryColor)
              }
              onClick={handleSendOtp}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">OTP</label>
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-300 outline-none"
                style={{ borderColor }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-2 rounded-md font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              style={{ backgroundColor: primaryColor }}
              onMouseOver={(e) =>
                (e.target.style.backgroundColor = hoverColor)
              }
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = primaryColor)
              }
              onClick={handleVerifyOtp}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* STEP 3: PASSWORD */}
        {step === 3 && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2 border rounded-md pr-10 focus:ring-2 focus:ring-yellow-300 outline-none"
                  style={{ borderColor }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-300 outline-none"
                style={{ borderColor }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-2 rounded-md font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              style={{ backgroundColor: primaryColor }}
              onMouseOver={(e) =>
                (e.target.style.backgroundColor = hoverColor)
              }
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = primaryColor)
              }
              onClick={handleResetPassword}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        {/* BACK TO SIGN IN */}
        <p className="text-sm text-center text-gray-600 mt-4">
          Back to{" "}
          <span
            className="font-semibold cursor-pointer hover:underline"
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

export default ForgotPassword;
