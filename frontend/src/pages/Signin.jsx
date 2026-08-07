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
      if (msg.includes("does not exist")) {
        toast.error("Account does not exist. Redirecting to sign up...");
        setTimeout(() => {
          navigate("/signup");
        }, 1500);
      } else {
        toast.error(msg);
      }
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
            Botanic Purity
          </h1>
          <p className="text-gray-500 font-medium">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Google Login Button */}
        <button
          className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl mb-3 hover:bg-gray-50 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
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
          New to Botanic Purity?{" "}
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
