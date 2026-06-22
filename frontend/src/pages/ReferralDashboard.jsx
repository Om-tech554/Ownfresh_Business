import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  Users, 
  Gift, 
  Share2, 
  Copy, 
  CheckCircle2, 
  TrendingUp,
  Coins,
  Crown,
  Zap,
  LayoutDashboard,
  Percent,
  Plus,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import Navbar from "../components/Navbar";
import { serverUrl } from "../App";

const ReferralDashboard = () => {
  const user = useSelector((state) => state.user.userData);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("referrals");
  
  // Affiliate coupon generation state
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [affiliateData, setAffiliateData] = useState(null);
  const [publicCoupons, setPublicCoupons] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchPublicCoupons();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/referral/stats`, { withCredentials: true });
      if (data.success) {
        setStats(data);
        if (data.isAffiliate) {
          fetchAffiliateData();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchAffiliateData = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/referral/affiliate-data`, { withCredentials: true });
      if (data.success) {
        setAffiliateData(data);
      }
    } catch (error) {
        console.error(error);
    }
  };

  const fetchPublicCoupons = async () => {
    try {
      console.log("Attempting to fetch coupons from:", `${serverUrl}/api/coupon/public`);
      const { data } = await axios.get(`${serverUrl}/api/coupon/public`, { withCredentials: true });
      console.log("API Response for Coupons:", data);
      if (Array.isArray(data)) {
        setPublicCoupons(data);
      }
    } catch (error) {
      console.error("Failed to fetch public coupons. Check if server is running at:", serverUrl, error);
    }
  };

  const handleGenerateCoupon = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${serverUrl}/api/referral/generate-coupon`, {
        code: couponCode,
        discountType,
        discountValue,
        expiryDate
      }, { withCredentials: true });
      
      if (data.success) {
        toast.success("Coupon generated successfully!");
        setCouponCode("");
        setDiscountValue("");
        setExpiryDate("");
        fetchAffiliateData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate coupon");
    }
  };

  const handleUnlockAffiliate = async () => {
    try {
      const { data } = await axios.post(`${serverUrl}/api/referral/unlock-affiliate`, {}, { withCredentials: true });
      if (data.success) {
        toast.success("Welcome to the Affiliate Program!");
        fetchStats();
      }
    } catch (error) {
      toast.error("Subscription failed. Please try again.");
    }
  };

  const referralLink = `${window.location.origin}/signup?ref=${stats?.referralCode}`;

  const copyToClipboard = (text) => {
    if (!text || text.includes("undefined")) {
      return toast.error("Referral code not available yet. Please refresh.");
    }
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const shareOnWhatsApp = () => {
    const message = `Check out OwnFresh! Use my referral code ${stats?.referralCode} to get ${stats?.settings?.referralDiscountValue}${stats?.settings?.referralDiscountType === 'percentage' ? '%' : ' OFF'} on your first order of fresh wood-pressed oils. Buy now: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#F9DD19] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto pt-24 pb-20 px-4 md:px-6">
        
        {/* TOP STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <Users className="text-blue-600" size={20} />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Referrals</p>
                <p className="text-2xl font-black text-slate-800">{stats?.totalReferrals || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="bg-green-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle2 className="text-green-600" size={20} />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Successful</p>
                <p className="text-2xl font-black text-slate-800">{stats?.referralCount || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="bg-yellow-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <Crown className="text-yellow-600" size={20} />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Tier</p>
                <p className="text-2xl font-black text-slate-800">Tier {stats?.currentTier || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="bg-purple-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <Coins className="text-purple-600" size={20} />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Earnings</p>
                <p className="text-2xl font-black text-slate-800">₹{stats?.earnings?.toFixed(2) || 0}</p>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
            
            {/* LEFT COLUMN: REFERRAL TOOLS */}
            <div className="flex-1 space-y-8">
                
                {/* HERO CARD */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F9DD19] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-black mb-4">
                            Refer Friends & <span className="text-[#F9DD19]">Unlock Perks</span>
                        </h1>
                        <p className="text-slate-400">
                            Your friends get <span className="text-white font-bold">{stats?.settings?.referralDiscountValue}% OFF</span>. You unlock higher rewards and commission at every milestone.
                        </p>
                        
                        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                    {publicCoupons.length > 0 ? "Active Promotion Codes" : "Your Unique Referral Code"}
                                </p>
                                {publicCoupons.length > 0 && (
                                    <span className="bg-[#F9DD19] text-black px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                        DYNAMIC ADMIN DEALS
                                    </span>
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                {publicCoupons.length > 0 ? (
                                    publicCoupons.map((coupon, idx) => (
                                        <div key={coupon._id || idx} className="flex flex-col sm:flex-row gap-4 group">
                                            <div className="flex-1 bg-[#F9DD19]/10 p-4 rounded-xl font-black text-2xl tracking-[0.3em] flex items-center justify-center border border-[#F9DD19]/30 uppercase text-white min-h-[64px] shadow-inner relative overflow-hidden transition-all group-hover:border-[#F9DD19]/60">
                                                <div className="absolute top-0 right-0 p-1 opacity-20 bg-[#F9DD19] text-black text-[8px] font-black uppercase rounded-bl-lg">
                                                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                                </div>
                                                {coupon.code}
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => copyToClipboard(coupon.code)}
                                                    className="flex-1 sm:flex-none bg-[#F9DD19] text-black px-6 py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-95"
                                                >
                                                    <Copy size={20} /> Copy
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const message = `Check out OwnFresh! Use promo code ${coupon.code} to get a special discount. Buy now: ${window.location.origin}`;
                                                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
                                                    }}
                                                    className="flex-1 sm:flex-none bg-[#25D366] text-white px-6 py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-95"
                                                >
                                                    <Share2 size={20} /> Share
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    /* FALLBACK TO USER REFERRAL CODE IF NO ADMIN COUPONS ARE FOUND DYNAMICALLY */
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1 bg-white/10 p-4 rounded-xl font-black text-2xl tracking-[0.3em] flex items-center justify-center border border-white/20 uppercase text-white min-h-[64px]">
                                            {stats?.referralCode || user?.referralCode || "..."}
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => copyToClipboard(stats?.referralCode || user?.referralCode)}
                                                className="bg-[#F9DD19] text-black px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-95"
                                            >
                                                <Copy size={20} /> Copy
                                            </button>
                                            <button 
                                                onClick={shareOnWhatsApp}
                                                className="bg-[#25D366] text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-95"
                                            >
                                                <Share2 size={20} /> WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* PROGRESS / MILESTONES */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-black mb-8 flex items-center gap-2 text-slate-800">
                        <TrendingUp size={20} className="text-[#1E971D]" /> Milestone Rewards
                    </h2>
                    
                    <div className="space-y-12 relative">
                        {/* Vertical line connecting milestones */}
                        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-100 hidden md:block"></div>

                        {/* Tier 1 */}
                        <div className="flex items-start gap-6 relative group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 z-10 ${stats?.referralCount >= stats?.settings?.tier1Threshold ? 'bg-[#1E971D] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {stats?.referralCount >= stats?.settings?.tier1Threshold ? <CheckCircle2 size={20} /> : "1"}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-slate-900 text-lg">Tier 1: Small Wins</p>
                                <p className="text-slate-500 text-sm mb-4">Complete {stats?.settings?.tier1Threshold} successful referrals to get <span className="text-[#1E971D] font-bold">₹{stats?.settings?.tier1Reward} wallet credit</span>.</p>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-[#1E971D] h-full transition-all duration-1000" 
                                        style={{ width: `${Math.min((stats?.referralCount / stats?.settings?.tier1Threshold) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-right text-[10px] font-bold text-slate-400 mt-2 uppercase">{stats?.referralCount}/{stats?.settings?.tier1Threshold} COMPLETED</p>
                            </div>
                        </div>

                        {/* Tier 2 */}
                        <div className="flex items-start gap-6 relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 z-10 ${stats?.referralCount >= stats?.settings?.tier2Threshold || stats?.isAffiliate ? 'bg-[#1E971D] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {stats?.referralCount >= stats?.settings?.tier2Threshold || stats?.isAffiliate ? <Crown size={20} /> : "2"}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-slate-900 text-lg">Tier 2: Affiliate Status</p>
                                <p className="text-slate-500 text-sm">Become an official affiliate after {stats?.settings?.tier2Threshold} referrals. Earn <span className="text-[#1E971D] font-bold">{stats?.settings?.baseCommission}% commission</span> on every purchase.</p>
                                {!stats?.isAffiliate && (
                                    <div className="mt-4 p-4 border border-dashed border-yellow-200 bg-yellow-50 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Zap className="text-yellow-600" size={24} />
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">Don't want to wait?</p>
                                                <p className="text-[10px] text-slate-500">Skip the line and unlock now!</p>
                                            </div>
                                        </div>
                                        <button 
                                          onClick={handleUnlockAffiliate}
                                          className="bg-black text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition"
                                        >
                                            Unlock for ₹{stats?.settings?.subscriptionPrice}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tier 3 */}
                        <div className="flex items-start gap-6 relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 z-10 ${stats?.referralCount >= stats?.settings?.tier3Threshold ? 'bg-[#1E971D] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {stats?.referralCount >= stats?.settings?.tier3Threshold ? <Zap size={20} /> : "3"}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-slate-900 text-lg">Tier 3: Mega Affiliate</p>
                                <p className="text-slate-500 text-sm">Hit {stats?.settings?.tier3Threshold} referrals to unlock <span className="text-[#1E971D] font-bold">{stats?.settings?.tier3Commission}% lifetime commission</span>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: AFFILIATE DASHBOARD OR HISTORY */}
            <div className="w-full md:w-96 flex flex-col gap-8">
                
                {/* TABS */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex">
                    <button 
                        onClick={() => setActiveTab("referrals")}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "referrals" ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Users size={16} /> Referrals
                    </button>
                    {stats?.isAffiliate && (
                        <button 
                            onClick={() => setActiveTab("affiliate")}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "affiliate" ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <LayoutDashboard size={16} /> Affiliate
                        </button>
                    )}
                    <button 
                        onClick={() => setActiveTab("promotions")}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "promotions" ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Percent size={16} /> Offers
                    </button>
                </div>

                {activeTab === "referrals" ? (
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm grow flex flex-col h-[600px]">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Gift size={20} className="text-[#F9DD19]" /> Recent Signups
                        </h2>
                        
                        <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {stats?.referrals?.length > 0 ? (
                                stats?.referrals.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase text-xs">
                                                {item.referredUser?.fullName?.slice(0, 1)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{item.referredUser?.fullName}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{new Date(item.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {item.status}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <Users className="mx-auto text-slate-100 mb-4" size={64} />
                                    <p className="text-slate-400 font-bold text-sm">No referrals yet.</p>
                                    <p className="text-slate-300 text-xs mt-2">Start sharing your code!</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === "promotions" ? (
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm grow flex flex-col h-[600px]">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Zap size={20} className="text-[#F9DD19]" /> Live Promotions
                        </h2>
                        
                        <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {publicCoupons?.length > 0 ? (
                                publicCoupons.map((coupon, idx) => (
                                    <div key={idx} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] p-5 relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#F9DD19] opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity" />
                                        
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Available Offer</p>
                                                <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                                                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} OFF
                                                </h4>
                                            </div>
                                            <div className="bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                                                <p className="text-[10px] font-black text-slate-500 uppercase">Valid until</p>
                                                <p className="text-[10px] font-bold text-slate-800">{new Date(coupon.expiryDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 relative z-10">
                                            <div className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-xl font-black text-lg tracking-[0.2em] flex items-center justify-center text-slate-800">
                                                {coupon.code}
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(coupon.code)}
                                                className="bg-slate-900 text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
                                            >
                                                <Copy size={20} />
                                            </button>
                                        </div>
                                        
                                        {coupon.minOrderAmount > 0 && (
                                            <p className="text-[10px] text-slate-400 font-bold mt-4 flex items-center gap-1">
                                                <ArrowRight size={10} /> Valid on orders above ₹{coupon.minOrderAmount}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <Percent className="mx-auto text-slate-100 mb-4" size={64} />
                                    <p className="text-slate-400 font-bold text-sm">No live offers currently.</p>
                                    <p className="text-slate-300 text-xs mt-2">Check back later for exclusive deals!</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* EARNINGS SUMMARY */}
                        <div className="bg-gradient-to-br from-[#1E971D] to-[#156b15] rounded-[2rem] p-8 text-white shadow-lg">
                            <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Affiliate Balance</p>
                            <h3 className="text-4xl font-black mb-8">₹{stats?.earnings?.toFixed(2) || 0}</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                    <p className="text-[10px] uppercase font-bold text-white/60 mb-1">Total Convs</p>
                                    <p className="text-xl font-black">{affiliateData?.totalConversions || 0}</p>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                    <p className="text-[10px] uppercase font-bold text-white/60 mb-1">Total Earned</p>
                                    <p className="text-xl font-black">₹{affiliateData?.totalEarnings?.toFixed(0) || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* CREATE COUPON */}
                        <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                <Plus size={18} className="text-slate-900" /> Create Custom Coupon
                            </h2>
                            <form onSubmit={handleGenerateCoupon} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Coupon Code</label>
                                    <input 
                                        type="text" 
                                        placeholder="FRESH50" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-[#F9DD19] transition uppercase font-bold"
                                        required
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Value</label>
                                        <input 
                                            type="number" 
                                            placeholder="10" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-[#F9DD19] transition font-bold"
                                            required
                                            value={discountValue}
                                            onChange={(e) => setDiscountValue(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Type</label>
                                        <select 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-[#F9DD19] transition font-bold"
                                            value={discountType}
                                            onChange={(e) => setDiscountType(e.target.value)}
                                        >
                                            <option value="percentage">% Perc</option>
                                            <option value="fixed">₹ Fixed</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Expiry Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-[#F9DD19] transition font-bold"
                                        required
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                    />
                                </div>
                                <button className="w-full bg-black text-white py-4 rounded-xl font-black text-sm hover:scale-[1.02] transition active:scale-95">
                                    Generate Coupon
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
