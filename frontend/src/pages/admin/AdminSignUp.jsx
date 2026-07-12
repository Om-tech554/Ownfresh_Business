import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/userslice";
import { Eye, EyeOff, Lock, Loader2, ShieldAlert, UserCog, Mail, User, KeyRound, Phone } from "lucide-react";
import { serverUrl } from "../../App";
import toast from "react-hot-toast";

const AdminSignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const handleAdminSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/admin-signup`,
        { fullName, userName, email, password, mobile: countryCode + mobile, secretKey },
        { withCredentials: true }
      );

      dispatch(setUserData(result.data));
      localStorage.setItem("oil_user", JSON.stringify(result.data));

      toast.success("Admin Account Created Successfully!");
      navigate("/admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Check your Secret Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FFFDF2] font-sans transition-all py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 border border-gray-100 relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#FFD700]" />

        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#fffdeb] rounded-full flex items-center justify-center mb-4 border border-[#fef08a] shadow-sm">
            <ShieldAlert className="text-[#d97706]" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
            Register Admin
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Requires an authorized Registration Secret.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAdminSignUp} className="space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-gray-900 placeholder-gray-400 transition-all"
                  value={fullName}
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
                  type="email"
                  placeholder="admin@company.com"
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-gray-900 placeholder-gray-400 transition-all"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Admin Username */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Admin Username</label>
              <div className="relative">
                <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="admin_johndoe"
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-gray-900 placeholder-gray-400 transition-all"
                  value={userName}
                  required
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Mobile</label>
              <div className="flex bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[#FFD700] transition-all overflow-hidden">
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
                  type="tel"
                  placeholder="1234567890"
                  className="w-full px-3 py-3 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
                  value={mobile}
                  required
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-gray-900 placeholder-gray-400 transition-all"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Secret Key */}
            <div>
              <label className="block text-sm font-bold text-[#d97706] mb-1 ml-1">Registration Secret</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d97706]" size={18} />
                <input
                  type="password"
                  placeholder="Secret Key"
                  className="w-full pl-10 pr-3 py-3 bg-[#fffdeb] border border-[#fef08a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d97706] text-gray-900 placeholder-gray-500 transition-all"
                  value={secretKey}
                  required
                  onChange={(e) => setSecretKey(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 rounded-xl font-bold text-gray-900 bg-[#FFD700] hover:bg-[#e6c700] shadow-lg shadow-[#FFD700]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Admin Account"}
          </button>
        </form>

        <div className="mt-8 text-center flex flex-col gap-3 border-t border-gray-100 pt-6">
          <button 
            onClick={() => navigate("/admin/login")}
            className="text-gray-500 hover:text-[#d97706] text-sm font-bold transition-colors"
          >
            Already an Admin? Sign In here.
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

export default AdminSignUp;
