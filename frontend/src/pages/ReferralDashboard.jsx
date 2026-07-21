import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { 
    Copy, Check, Share2, Wallet, Award, Gift, Clock, CheckCircle, XCircle, RefreshCw, Send, FileText, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { serverUrl } from "../App";

const ReferralDashboard = () => {
    const userData = useSelector((state) => state.user.userData);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copying, setCopying] = useState(false);
    const [activeTab, setActiveTab] = useState("referrals");
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        try {
            const { data } = await axios.get(`${serverUrl}/api/referral/stats`, { withCredentials: true });
            if (data.success) {
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to load referral stats:", error);
            toast.error("Failed to load referral dashboard data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const copyCode = () => {
        if (!stats?.referralCode) return;
        navigator.clipboard.writeText(stats.referralCode);
        setCopying(true);
        toast.success("Referral code copied to clipboard!");
        setTimeout(() => setCopying(false), 2000);
    };

    const shareReferral = () => {
        if (!stats?.referralCode) return;
        const shareData = {
            title: "Join OwnFresh!",
            text: `Use my referral code ${stats.referralCode} to sign up at OwnFresh and get a ₹50 welcome bonus!`,
            url: `${window.location.origin}/signup?ref=${stats.referralCode}`
        };

        if (navigator.share) {
            navigator.share(shareData).catch(console.error);
        } else {
            // Fallback: Copy full text
            navigator.clipboard.writeText(shareData.text + " " + shareData.url);
            toast.success("Share text copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center pt-40 px-6">
                    <RefreshCw className="w-10 h-10 text-[#1E971D] animate-spin mb-4" />
                    <p className="font-black text-slate-400 text-xs uppercase tracking-widest">Loading Referral Dashboard...</p>
                </div>
            </div>
        );
    }

    const qrUrl = stats?.referralCode 
        ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/signup?ref=${stats.referralCode}`)}` 
        : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50/20">
            <Navbar />
            <div className="max-w-6xl mx-auto pt-28 pb-16 px-4 md:px-8 space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-playfair">
                            Referrals & Rewards
                        </h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">
                            Share the purity of wood-pressed oils and earn points together.
                        </p>
                    </div>
                    <button 
                        onClick={() => fetchStats(true)} 
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:border-[#1E971D] rounded-xl px-4 py-2.5 text-xs font-black uppercase text-slate-700 tracking-wider transition duration-200 active:scale-[0.98] shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh Stats
                    </button>
                </div>

                {/* Dashboard Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Wallet Balance */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet Balance</p>
                            <h3 className="text-2xl font-black text-slate-950 mt-1">₹{stats?.wallet?.balance || 0}</h3>
                        </div>
                    </div>

                    {/* Approved Rewards */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="p-3.5 bg-[#FFDD00]/10 rounded-xl text-[#B39B00]">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved Rewards</p>
                            <h3 className="text-2xl font-black text-slate-950 mt-1">₹{stats?.wallet?.totalEarned || 0}</h3>
                        </div>
                    </div>

                    {/* Pending Referrals */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Referrals</p>
                            <h3 className="text-2xl font-black text-slate-950 mt-1">{stats?.counts?.pending || 0}</h3>
                        </div>
                    </div>

                    {/* Total Successful Referrals */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="p-3.5 bg-purple-50 rounded-xl text-purple-600">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Successful Referrals</p>
                            <h3 className="text-2xl font-black text-slate-950 mt-1">{stats?.counts?.approved || 0}</h3>
                        </div>
                    </div>
                </div>

                {/* Referral Invitation Card & QR Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Share Card */}
                    <div className="lg:col-span-2 bg-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFDD00]/5 rounded-full blur-3xl -ml-16 -mb-16"></div>

                        <div className="space-y-4 relative z-10">
                            <div className="bg-emerald-500/20 text-emerald-400 inline-block px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                                Referral Reward Program
                            </div>
                            <h2 className="text-3xl font-black tracking-tight max-w-lg leading-tight font-playfair">
                                Give ₹50. Get ₹100.
                            </h2>
                            <p className="text-slate-300 text-sm max-w-md leading-relaxed">
                                Share your personal referral code with your friends. They get a ₹50 welcome discount on their first paid order, and you earn ₹100 inside your wallet once our admin approves!
                            </p>
                        </div>

                        {/* Referral Code Box */}
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                            <div>
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Referral Code</label>
                                <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
                                    <span className="font-black text-xl tracking-wider text-white uppercase">{stats?.referralCode || "N/A"}</span>
                                    <button 
                                        onClick={copyCode}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                    >
                                        {copying ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex items-end">
                                <button 
                                    onClick={shareReferral}
                                    className="w-full flex items-center justify-center gap-2 bg-[#FFDD00] hover:bg-[#E6C600] text-slate-900 rounded-xl py-3.5 px-6 font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-[#FFDD00]/10"
                                >
                                    <Share2 size={16} />
                                    Share Invite Link
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Card */}
                    <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Scan to Sign Up</h4>
                        {qrUrl ? (
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
                                <img src={qrUrl} alt="Referral QR Code" className="w-[140px] h-[140px]" />
                            </div>
                        ) : (
                            <div className="w-[140px] h-[140px] bg-slate-100 animate-pulse rounded-2xl"></div>
                        )}
                        <p className="text-slate-500 font-bold text-xs max-w-[180px]">
                            Scan QR code to immediately register using referral link.
                        </p>
                    </div>
                </div>

                {/* Dashboard Tabs & Lists */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center gap-2 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("referrals")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                                activeTab === "referrals"
                                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                    : "text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                            <Gift size={14} />
                            Referral History
                        </button>
                        <button
                            onClick={() => setActiveTab("wallet")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                                activeTab === "wallet"
                                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                    : "text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                            <Wallet size={14} />
                            Wallet Ledger
                        </button>
                        <button
                            onClick={() => setActiveTab("terms")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                                activeTab === "terms"
                                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                    : "text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                            <FileText size={14} />
                            Terms & Rules
                        </button>
                    </div>

                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {activeTab === "referrals" && (
                                <motion.div
                                    key="referrals"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="space-y-4"
                                >
                                    {stats?.referrals?.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-100">
                                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Friend Referred</th>
                                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Payment</th>
                                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Used</th>
                                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Referral Status</th>
                                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Estimated Reward</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.referrals.map((ref) => (
                                                        <tr key={ref._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                                                            <td className="py-4">
                                                                <p className="font-black text-xs text-slate-900">{ref.referredUserId?.fullName || "A Friend"}</p>
                                                                <p className="text-slate-400 font-bold text-[10px]">{ref.referredUserId?.email}</p>
                                                            </td>
                                                            <td className="py-4">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                                    ref.orderId?.paymentStatus === "completed" 
                                                                        ? "bg-emerald-50 text-emerald-600" 
                                                                        : "bg-amber-50 text-amber-600"
                                                                }`}>
                                                                    {ref.orderId?.paymentStatus || "pending"}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 font-bold text-xs text-slate-600">
                                                                {new Date(ref.usedAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="py-4">
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                                    ref.status === "APPROVED" 
                                                                        ? "bg-emerald-50 text-emerald-600" 
                                                                        : ref.status === "REJECTED" 
                                                                        ? "bg-rose-50 text-rose-600" 
                                                                        : "bg-blue-50 text-blue-600"
                                                                }`}>
                                                                    {ref.status === "APPROVED" && <CheckCircle size={10} />}
                                                                    {ref.status === "REJECTED" && <XCircle size={10} />}
                                                                    {ref.status === "PENDING" && <Clock size={10} />}
                                                                    {ref.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 text-right font-black text-xs text-slate-900">
                                                                +₹{ref.rewardAmount}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-slate-400">
                                            <Gift className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                                            <p className="font-black text-xs uppercase tracking-wider">No Referrals Yet</p>
                                            <p className="text-xs text-slate-400 mt-1">Start sharing your referral code to earn reward points!</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === "wallet" && (
                                <motion.div
                                    key="wallet"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="space-y-4"
                                >
                                    {stats?.transactions?.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-100">
                                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction details</th>
                                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.transactions.map((tx) => (
                                                        <tr key={tx._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                                                            <td className="py-4">
                                                                <p className="font-black text-xs text-slate-900">{tx.description}</p>
                                                                <p className="text-slate-400 font-bold text-[9px]">ID: {tx._id}</p>
                                                            </td>
                                                            <td className="py-4">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                                    tx.amount > 0 
                                                                        ? "bg-emerald-50 text-emerald-600" 
                                                                        : "bg-rose-50 text-rose-600"
                                                                }`}>
                                                                    {tx.type}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 font-bold text-xs text-slate-600">
                                                                {new Date(tx.timestamp).toLocaleString()}
                                                            </td>
                                                            <td className={`py-4 text-right font-black text-xs ${
                                                                tx.amount > 0 ? "text-emerald-600" : "text-rose-600"
                                                            }`}>
                                                                {tx.amount > 0 ? "+" : ""}₹{tx.amount}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-slate-400">
                                            <Wallet className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                                            <p className="font-black text-xs uppercase tracking-wider">No Transactions</p>
                                            <p className="text-xs text-slate-400 mt-1">Your wallet history ledger will appear here.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === "terms" && (
                                <motion.div
                                    key="terms"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="space-y-6"
                                >
                                    <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 space-y-3">
                                        <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-amber-500" />
                                            How It Works & Referral Rules
                                        </h3>
                                        <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                                            Refer friends and earn wallet credits! Please read these rules to understand program eligibility, terms, and the manual approval process.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Referrer Details */}
                                        <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-white shadow-sm">
                                            <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                For the Referrer (You)
                                            </h4>
                                            <ul className="list-disc pl-5 text-slate-600 text-[11px] space-y-2 font-bold leading-relaxed">
                                                <li>You have a **permanent referral code** generated only once on registration. It will never change.</li>
                                                <li>Your code can be shared and redeemed an **unlimited number of times**.</li>
                                                <li>You will receive **₹100** credited to your wallet for each successful referral.</li>
                                                <li>Points/credits are added **only after** an Admin reviews and approves the referral logs.</li>
                                            </ul>
                                        </div>

                                        {/* Referee Details */}
                                        <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-white shadow-sm">
                                            <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                For Your Friends (Buyers)
                                            </h4>
                                            <ul className="list-disc pl-5 text-slate-600 text-[11px] space-y-2 font-bold leading-relaxed">
                                                <li>A buyer can redeem **only one referral code** in their entire lifetime.</li>
                                                <li>Your friend receives a **₹50 welcome discount** in their wallet upon admin approval.</li>
                                                <li>The referral code must be applied **before placing their first successful purchase**.</li>
                                                <li>Self-referrals are invalid; you cannot use your own code.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Auditing and Verification */}
                                    <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-white shadow-sm">
                                        <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                                            Admin Verification & Fraud Control
                                        </h4>
                                        <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                                            To prevent abuse, referrals are held as **PENDING** until the admin team reviews the order. Once the order payment status changes to completed, the admin can approve the credits.
                                        </p>
                                        <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                                            If a referral is rejected (due to cancellation, self-referral, or fake profile detection), no wallet points are credited. However, the buyer's redemption limit will reset, allowing them to try using a valid referral code on another order.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReferralDashboard;
