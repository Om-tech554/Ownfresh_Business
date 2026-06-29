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
  ExternalLink,
  Wallet,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Edit2
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import Navbar from "../components/Navbar";
import { serverUrl } from "../App";

const ReferralDashboard = () => {
  const user = useSelector((state) => state.user.userData);
  const [stats, setStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("referrals");
  
  // Custom Referral Code & Apply Referral Code States
  const [customCode, setCustomCode] = useState("");
  const [applyCode, setApplyCode] = useState("");
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [applyingCode, setApplyingCode] = useState(false);

  // Affiliate coupon generation states
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [affiliateData, setAffiliateData] = useState(null);
  const [publicCoupons, setPublicCoupons] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchWallet();
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

  const fetchWallet = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/wallet/my-wallet`, { withCredentials: true });
      if (data.success) {
        setWallet(data);
      }
    } catch (error) {
      console.error("Failed to load wallet", error);
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
      const { data } = await axios.get(`${serverUrl}/api/coupon/public`, { withCredentials: true });
      if (Array.isArray(data)) {
        setPublicCoupons(data);
      }
    } catch (error) {
      console.error("Failed to fetch public coupons", error);
    }
  };

  const handleUpdateCustomCode = async (e) => {
    e.preventDefault();
    if (!customCode.trim()) return toast.error("Please enter a custom code");
    setSubmittingCode(true);
    try {
      const { data } = await axios.post(`${serverUrl}/api/referral/update-code`, {
        customCode
      }, { withCredentials: true });
      if (data.success) {
        toast.success("Referral code updated!");
        setShowCustomizer(false);
        setCustomCode("");
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update code");
    } finally {
      setSubmittingCode(false);
    }
  };

  const handleApplyReferral = async (e) => {
    e.preventDefault();
    if (!applyCode.trim()) return toast.error("Please enter a referral code");
    setApplyingCode(true);
    try {
      const { data } = await axios.post(`${serverUrl}/api/referral/apply-referral`, {
        referralCode: applyCode
      }, { withCredentials: true });
      if (data.success) {
        toast.success("Referral code applied successfully!");
        setApplyCode("");
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply code");
    } finally {
      setApplyingCode(false);
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
        toast.success("Affiliate coupon generated!");
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
        toast.success("Affiliate status unlocked!");
        fetchStats();
      }
    } catch (error) {
      toast.error("Subscription failed. Please try again.");
    }
  };

  const referralLink = `${window.location.origin}/signup?ref=${stats?.referralCode}`;

  const copyToClipboard = (text) => {
    if (!text || text.includes("undefined")) {
      return toast.error("Referral code not available. Please refresh.");
    }
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const shareOnWhatsApp = () => {
    const message = `Check out OwnFresh! Use my referral code ${stats?.referralCode} to get ₹${stats?.settings?.referralRewardReferred} OFF on your first purchase of fresh wood-pressed oils. Buy now: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareOnTelegram = () => {
    const message = `Check out OwnFresh! Use my referral code ${stats?.referralCode} to get ₹${stats?.settings?.referralRewardReferred} OFF.`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#24672E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto pt-24 pb-20 px-4 md:px-6">
        
        {/* TOP STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <Users className="text-blue-600" size={20} />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Invites</p>
                <p className="text-2xl font-black text-slate-800">{stats?.totalReferrals || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <div className="bg-green-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle2 className="text-green-600" size={20} />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Successful</p>
                <p className="text-2xl font-black text-slate-800">{stats?.successful || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <div className="bg-yellow-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <Coins className="text-yellow-600" size={20} />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Rewards Earned</p>
                <p className="text-2xl font-black text-slate-800">₹{stats?.rewardsEarned || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <div className="bg-purple-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <Wallet className="text-purple-600" size={20} />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Wallet Balance</p>
                <p className="text-2xl font-black text-slate-800">₹{wallet?.balance?.toFixed(0) || 0}</p>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN: REFERRAL TOOLS */}
            <div className="flex-1 space-y-8">
                
                {/* HERO CARD */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#24672E] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-black mb-4">
                          Invite Friends & <span className="text-[#24672E]">Earn Rewards</span>
                        </h1>
                        <p className="text-slate-400">
                          Get **₹{stats?.settings?.referralRewardReferrer || 100}** in your wallet when your friends sign up and make their first purchase. Your friends get **₹{stats?.settings?.referralRewardReferred || 50}** discount instantly!
                        </p>
                        
                        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                    Your Unique Referral Code
                                </p>
                                {!stats?.hasChangedReferralCode && (
                                    <button 
                                      onClick={() => setShowCustomizer(!showCustomizer)}
                                      className="text-xs text-[#24672E] hover:underline font-bold flex items-center gap-1"
                                    >
                                      <Edit2 size={12} /> Customize Code
                                    </button>
                                )}
                            </div>

                            {showCustomizer ? (
                              <form onSubmit={handleUpdateCustomCode} className="flex gap-2 mb-6 animate-in slide-in-from-top-2 duration-200">
                                <input 
                                  type="text" 
                                  placeholder="e.g. OMKAR20"
                                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none text-white font-bold uppercase"
                                  value={customCode}
                                  onChange={(e) => setCustomCode(e.target.value)}
                                />
                                <button 
                                  type="submit" 
                                  disabled={submittingCode}
                                  className="bg-[#24672E] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#167a17] transition disabled:opacity-50"
                                >
                                  {submittingCode ? "..." : "Save"}
                                </button>
                              </form>
                            ) : null}
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 bg-white/10 p-4 rounded-xl font-black text-2xl tracking-[0.3em] flex items-center justify-center border border-white/20 uppercase text-white min-h-[64px]">
                                    {stats?.referralCode || user?.referralCode || "..."}
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => copyToClipboard(stats?.referralCode || user?.referralCode)}
                                        className="bg-[#24672E] text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-95 cursor-pointer"
                                    >
                                        <Copy size={20} /> Copy
                                    </button>
                                    <button 
                                        onClick={shareOnWhatsApp}
                                        className="bg-[#25D366] text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-95 cursor-pointer"
                                    >
                                        <Share2 size={20} /> WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* SOCIAL LINKS ROW */}
                        <div className="flex justify-center md:justify-start gap-4 mt-6">
                          <button onClick={shareOnTelegram} className="text-slate-400 hover:text-white transition flex items-center gap-1.5 text-sm font-bold">
                            Telegram <ExternalLink size={14} />
                          </button>
                          <span className="text-slate-700">|</span>
                          <button onClick={() => window.open(`mailto:?subject=OwnFresh Referral&body=Use code ${stats?.referralCode} to sign up at ${referralLink}`)} className="text-slate-400 hover:text-white transition flex items-center gap-1.5 text-sm font-bold">
                            Email <ExternalLink size={14} />
                          </button>
                        </div>
                    </div>
                </div>

                {/* APPLY REFERRAL CODE FOR NEW USERS */}
                {!stats?.referredBy && (
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
                      <Gift size={22} className="text-[#24672E]" /> Were you referred?
                    </h2>
                    <p className="text-slate-500 text-sm mb-6">
                      Enter a friend's referral code here to unlock a welcome bonus of **₹{stats?.settings?.referralRewardReferred || 50}** on your first purchase!
                    </p>
                    <form onSubmit={handleApplyReferral} className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        placeholder="Friend's referral code (e.g. OMKAR24)" 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:border-[#24672E] transition uppercase font-bold text-slate-800"
                        value={applyCode}
                        onChange={(e) => setApplyCode(e.target.value)}
                        disabled={applyingCode}
                      />
                      <button 
                        type="submit"
                        disabled={applyingCode}
                        className="bg-black text-white hover:bg-slate-800 px-8 py-4 rounded-xl font-black transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {applyingCode ? "Applying..." : "Apply Code"}
                      </button>
                    </form>
                  </div>
                )}

                {/* PROGRESS / MILESTONES */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-black mb-8 flex items-center gap-2 text-slate-800">
                        <TrendingUp size={20} className="text-[#24672E]" /> Referrer Progression Milestones
                    </h2>
                    
                    <div className="space-y-12 relative">
                        {/* Vertical line connecting milestones */}
                        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-100 hidden md:block"></div>

                        {/* Tier 1 */}
                        <div className="flex items-start gap-6 relative group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 z-10 ${stats?.referralCount >= stats?.settings?.tier1Threshold ? 'bg-[#24672E] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {stats?.referralCount >= stats?.settings?.tier1Threshold ? <CheckCircle2 size={20} /> : "1"}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-slate-900 text-lg">Tier 1: Starter Reward</p>
                                <p className="text-slate-500 text-sm mb-4 font-medium">Complete {stats?.settings?.tier1Threshold} successful invites to grab an extra <span className="text-[#24672E] font-bold">₹{stats?.settings?.tier1Reward} wallet cash</span>.</p>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-[#24672E] h-full transition-all duration-1000" 
                                        style={{ width: `${Math.min((stats?.referralCount / stats?.settings?.tier1Threshold) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-right text-[10px] font-bold text-slate-400 mt-2 uppercase">{stats?.referralCount}/{stats?.settings?.tier1Threshold} COMPLETED</p>
                            </div>
                        </div>

                        {/* Tier 2 */}
                        <div className="flex items-start gap-6 relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 z-10 ${stats?.referralCount >= stats?.settings?.tier2Threshold || stats?.isAffiliate ? 'bg-[#24672E] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {stats?.referralCount >= stats?.settings?.tier2Threshold || stats?.isAffiliate ? <Crown size={20} /> : "2"}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-slate-900 text-lg">Tier 2: Unlock Affiliate Status</p>
                                <p className="text-slate-500 text-sm font-medium">Get {stats?.settings?.tier2Threshold} successful invites or purchase standard subscription directly to become an Affiliate. Earn <span className="text-[#24672E] font-bold">{stats?.settings?.baseCommission}% commission</span> on orders using custom codes.</p>
                                {!stats?.isAffiliate && (
                                    <div className="mt-4 p-4 border border-dashed border-yellow-200 bg-yellow-50 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Zap className="text-yellow-600" size={24} />
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">Skip the line?</p>
                                                <p className="text-[10px] text-slate-500 font-medium">Become an Affiliate instantly</p>
                                            </div>
                                        </div>
                                        <button 
                                          onClick={handleUnlockAffiliate}
                                          className="bg-black text-white text-xs px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition"
                                        >
                                            Unlock for ₹{stats?.settings?.subscriptionPrice}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tier 3 */}
                        <div className="flex items-start gap-6 relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 z-10 ${stats?.referralCount >= stats?.settings?.tier3Threshold ? 'bg-[#24672E] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {stats?.referralCount >= stats?.settings?.tier3Threshold ? <Zap size={20} /> : "3"}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-slate-900 text-lg">Tier 3: Mega Affiliate</p>
                                <p className="text-slate-500 text-sm font-medium">Accumulate {stats?.settings?.tier3Threshold} successful invites to jump directly to Tier 3. Boost custom coupon commissions to <span className="text-[#24672E] font-bold">{stats?.settings?.tier3Commission}% commission rate</span>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: WALLET OR PARTNERS */}
            <div className="w-full lg:w-96 flex flex-col gap-8">
                
                {/* TABS */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex">
                    <button 
                        onClick={() => setActiveTab("referrals")}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "referrals" ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Users size={16} /> Invites
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
                        onClick={() => setActiveTab("wallet")}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "wallet" ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Wallet size={16} /> Wallet
                    </button>
                </div>

                {activeTab === "referrals" ? (
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm grow flex flex-col h-[600px]">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Gift size={20} className="text-[#24672E]" /> Referral History
                        </h2>
                        
                        <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar flex-1">
                            {stats?.referrals?.length > 0 ? (
                                stats?.referrals.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase text-xs">
                                                {item.referredUserId?.fullName?.slice(0, 1) || "?"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{item.referredUserId?.fullName || "User"}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{new Date(item.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                                          item.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 
                                          item.status === 'FAILED' ? 'bg-red-100 text-red-700' : 
                                          'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {item.status}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <Users className="mx-auto text-slate-100 mb-4" size={64} />
                                    <p className="text-slate-400 font-bold text-sm">No invites sent yet.</p>
                                    <p className="text-slate-300 text-xs mt-2">Start sharing your referral link!</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === "wallet" ? (
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm grow flex flex-col h-[600px]">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Wallet size={20} className="text-purple-600" /> Wallet Transactions
                        </h2>
                        
                        <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar flex-1">
                            {wallet?.transactions?.length > 0 ? (
                                wallet.transactions.map((tx, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                              tx.type === 'REDEEM' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                            }`}>
                                                {tx.type === 'REDEEM' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-xs line-clamp-1">{tx.description}</p>
                                                <p className="text-[9px] text-slate-400 font-medium">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <p className={`font-black text-sm ${tx.type === 'REDEEM' ? 'text-red-600' : 'text-green-600'}`}>
                                            {tx.type === 'REDEEM' ? '-' : '+'}₹{tx.amount}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <Clock className="mx-auto text-slate-100 mb-4" size={64} />
                                    <p className="text-slate-400 font-bold text-sm">No transactions yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* EARNINGS SUMMARY */}
                        <div className="bg-gradient-to-br from-[#24672E] to-[#156b15] rounded-[2.2rem] p-8 text-white shadow-lg shadow-[#24672E]/10">
                            <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Affiliate Commission Balance</p>
                            <h3 className="text-4xl font-black mb-8">₹{stats?.earnings?.toFixed(2) || 0}</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                    <p className="text-[10px] uppercase font-bold text-white/60 mb-1">Total Sales</p>
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
                                <Plus size={18} className="text-slate-900" /> Create Custom Code
                            </h2>
                            <form onSubmit={handleGenerateCoupon} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Custom Promo Code</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. FRESH50" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-[#24672E] transition uppercase font-bold"
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
                                            placeholder="50" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-[#24672E] transition font-bold"
                                            required
                                            value={discountValue}
                                            onChange={(e) => setDiscountValue(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Type</label>
                                        <select 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-[#24672E] transition font-bold"
                                            value={discountType}
                                            onChange={(e) => setDiscountType(e.target.value)}
                                        >
                                            <option value="percentage">% Percentage</option>
                                            <option value="fixed">₹ Fixed Amount</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Expiry Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-[#24672E] transition font-bold"
                                        required
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                    />
                                </div>
                                <button className="w-full bg-black text-white py-4 rounded-xl font-black text-sm hover:scale-[1.02] transition active:scale-95 cursor-pointer">
                                    Generate Custom Coupon
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
