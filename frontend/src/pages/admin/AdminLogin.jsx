import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/userslice";
import { Eye, EyeOff, Lock, Loader2, ShieldAlert, UserCog } from "lucide-react";
import { serverUrl } from "../../App";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/admin-signin`,
        { userName, password },
        { withCredentials: true }
      );

      dispatch(setUserData(result.data));
      localStorage.setItem("oil_user", JSON.stringify(result.data));

      toast.success("Welcome to the Admin Portal");
      navigate("/admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FFFDF2] font-sans transition-all">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10 border border-gray-100 relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#2F5D50]" />

        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#f0fdf4] rounded-full flex items-center justify-center mb-4 border border-[#dcfce7] shadow-sm">
            <ShieldAlert className="text-[#2F5D50]" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Restricted Access. Authorized Personnel Only.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAdminSignIn} className="space-y-6">

          {/* User Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Admin Username
            </label>
            <div className="relative">
              <UserCog
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="admin_user"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F5D50] focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                value={userName}
                required
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F5D50] focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
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
            className="w-full py-3.5 mt-2 rounded-xl font-bold text-white bg-[#2F5D50] hover:bg-[#23473D] shadow-lg shadow-[#2F5D50]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Authenticate"}
          </button>
        </form>

        <div className="mt-8 text-center flex flex-col gap-3 border-t border-gray-100 pt-6">
          <button 
            onClick={() => navigate("/admin/signup")}
            className="text-gray-500 hover:text-[#2F5D50] text-sm font-bold transition-colors"
          >
            Need an Admin account? Register here.
          </button>
          <button 
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors mt-2"
          >
            &larr; Return to Public Store
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
