import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Crown,
  Coins,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
  Loader2,
  CreditCard,
  Smartphone,
  ShieldAlert,
  RefreshCw,
  Gift
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const MembershipPage = () => {
  const user = useSelector((state) => state.user?.userData);
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  const [membershipStatus, setMembershipStatus] = useState({
    isMember: false,
    membershipPlanName: "None",
    membershipExpiresAt: null,
    commissionCoins: 0,
    minThreshold: 150,
    canRedeem: false,
    coinsNeededToRedeem: 150,
    progressPercentage: 0,
    resetDays: 45,
    nextExpiringAt: null,
    historyLogs: []
  });

  useEffect(() => {
    fetchData();
    checkPaymentReturn();
  }, [user, location.search]);

  const checkPaymentReturn = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentStatusParam = searchParams.get("payment");
    const txnIdParam = searchParams.get("txnId");

    if (paymentStatusParam === "success" && txnIdParam && user) {
      try {
        const { data } = await axios.get(
          `${serverUrl}/api/membership/phonepe-status/${txnIdParam}`,
          { withCredentials: true }
        );
        if (data.success && data.isMember) {
          toast.success(data.msg || "🎉 Welcome to OwnFresh Prime! Membership activated.");
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
          fetchData();
        } else {
          toast.error(data.msg || "Membership payment verification pending.");
        }
      } catch (err) {
        console.error("Membership status check error:", err);
      }
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Plans
      const { data: planData } = await axios.get(`${serverUrl}/api/membership/plans`);
      if (planData.success && Array.isArray(planData.plans) && planData.plans.length > 0) {
        setPlans(planData.plans);
      }

      // Fetch User Status if logged in
      if (user) {
        const { data: statusData } = await axios.get(`${serverUrl}/api/membership/my-status`, {
          withCredentials: true
        });
        if (statusData.success) {
          setMembershipStatus(statusData);
        }
      } else {
        // Reset to non-member state if logged out
        setMembershipStatus((prev) => ({
          ...prev,
          isMember: false,
          membershipPlanName: "None",
          membershipExpiresAt: null,
          commissionCoins: 0,
          canRedeem: false
        }));
      }
    } catch (err) {
      console.error("Failed to load membership data:", err);
      toast.error("Failed to load membership details.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseMembership = async (planId) => {
    if (!user) {
      toast.error("Please sign in to buy or activate a membership plan!");
      navigate("/signin?redirect=/membership");
      return;
    }

    try {
      setPurchasing(true);
      const { data } = await axios.post(
        `${serverUrl}/api/membership/initiate-phonepe-payment`,
        { planId },
        { withCredentials: true }
      );

      if (data.success && data.redirectUrl) {
        toast.success("Redirecting to secure PhonePe payment gateway...");
        window.location.href = data.redirectUrl;
      } else {
        toast.error(data.msg || "Failed to initiate payment. Please try again.");
        setPurchasing(false);
      }
    } catch (err) {
      console.error("Purchase membership PhonePe error:", err);
      toast.error(err.response?.data?.msg || "Failed to initiate PhonePe membership payment.");
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0F14] font-sans transition-colors duration-250">
        <Navbar />
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#24672E] dark:text-[#FFD600] animate-spin mb-3" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#818C9B]">
            Loading Membership & Payment Details...
          </p>
        </div>
      </div>
    );
  }

  const activePlans = plans.length > 0 ? plans : [{
    _id: "default-prime-plan",
    name: "OwnFresh Prime Membership",
    price: 299,
    durationDays: 365,
    description: "Earn 1% Commission Coins on every transaction. Coins reset in 45 days. Minimum 150 coins to redeem.",
    features: [
      "Earn 1% Commission Credit Coins on all orders",
      "Redeem coins directly at checkout (150 coins threshold)",
      "45-day rolling reset cycle for maximum earnings",
      "Exclusive Prime member deals & fast priority shipping"
    ]
  }];

  const currentSelectedPlan = activePlans[selectedPlanIndex] || activePlans[0];

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0F14] font-sans pb-16 transition-colors duration-250">
      <Navbar />
      <div className="max-w-6xl mx-auto space-y-10 pt-8 px-4 sm:px-6 lg:px-8">

        {/* ── HERO BANNER ── */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 dark:from-[#070B16] dark:via-[#062B2A] dark:to-[#17221F] rounded-3xl p-8 md:p-12 text-white shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-transparent dark:border-[#26333A] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#EFDB27] dark:bg-[#FFD600] opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 dark:bg-[#062B2A] border border-emerald-400/30 dark:border-[#19C37D]/40 text-emerald-300 dark:text-[#19C37D] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                <Crown className="w-4 h-4 text-[#EFDB27] dark:text-[#FFD600]" /> Official 1% Prime Rewards Program
              </div>

              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white dark:text-[#F4F7FA] leading-tight">
                Earn <span className="text-[#EFDB27] dark:text-[#FFD600]">1% Commission</span> Coins On Every Order
              </h1>

              <p className="text-gray-300 dark:text-[#B4C0CF] text-sm md:text-base font-medium leading-relaxed">
                Join our exclusive Prime Membership. Every purchase earns you 1% redeemable Credit Coins in your wallet. Coins can be redeemed directly at checkout once you reach 150 coins!
              </p>
            </div>

            {/* Member Status Badge */}
            <div className="bg-white/10 dark:bg-[#171D26]/90 backdrop-blur-md border border-white/20 dark:border-[#26333A] p-6 rounded-2xl text-center min-w-[260px] shrink-0 shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-[#EFDB27] dark:bg-[#FFD600] text-black flex items-center justify-center mx-auto mb-3 shadow-md">
                <Crown className="w-7 h-7 text-[#111318]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-[#818C9B] block">
                Your Status
              </span>
              <h3 className="text-xl font-black text-white dark:text-[#F5F7FA] uppercase tracking-wider mt-0.5">
                {membershipStatus.isMember ? (membershipStatus.membershipPlanName || "Prime Member") : "Non-Member"}
              </h3>
              {membershipStatus.isMember ? (
                <div className="space-y-1 mt-2">
                  <span className="inline-block text-xs font-bold text-emerald-400 dark:text-[#19C37D] bg-emerald-950/80 border border-emerald-500/40 dark:border-[#19C37D]/30 px-3 py-1 rounded-full">
                    ✓ Member Active
                  </span>
                  {membershipStatus.membershipExpiresAt && (
                    <p className="text-[10px] text-gray-300 dark:text-[#AEB9C8]">
                      Expires: {new Date(membershipStatus.membershipExpiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <span className="inline-block mt-2 text-xs font-bold text-amber-300 dark:text-[#FFD600] bg-amber-950/80 border border-amber-500/40 dark:border-[#FFD600]/30 px-3 py-1 rounded-full">
                  Upgrade to Earn 1%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── COMMISSION COINS WALLET DASHBOARD & PAYMENT CARD ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: Coins Balance & 150 Threshold Card (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#171D26] p-8 rounded-3xl border border-gray-200 dark:border-[#2A3440] shadow-sm space-y-6 flex flex-col justify-between transition-colors duration-250">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2A3440] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-[#1D2530] text-amber-700 dark:text-[#FFD600] flex items-center justify-center font-black">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-[#F5F7FA] uppercase tracking-wider">
                      Commission Credit Coins
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-[#818C9B] font-medium">
                      Earned via 1% purchase cashback for active members
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold bg-amber-50 dark:bg-[#1D2530] text-amber-800 dark:text-[#FFD600] border border-amber-200 dark:border-[#2A3440] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> 45-Day Cycle
                </span>
              </div>

              {/* Coins Balance Gauge */}
              <div className="bg-gradient-to-br from-amber-500/10 via-yellow-50 to-emerald-500/10 dark:from-[#1D2530] dark:via-[#171D26] dark:to-[#1D2530] border border-amber-200 dark:border-[#2A3440] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 mt-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-[#FFD600] block">
                    Active Commission Coins
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-[#F5F7FA] font-mono">
                      {membershipStatus.commissionCoins}
                    </span>
                    <span className="text-sm font-bold text-gray-600 dark:text-[#818C9B]">Coins</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-[#AEB9C8] font-medium mt-1">
                    Value: <strong className="text-slate-900 dark:text-[#F5F7FA]">₹{membershipStatus.commissionCoins}</strong> (1 Coin = ₹1)
                  </p>
                </div>

                {/* Threshold Status Lock */}
                <div className="bg-white dark:bg-[#171D26] p-4 rounded-xl border border-gray-200 dark:border-[#2A3440] shadow-xs text-center min-w-[200px] w-full sm:w-auto">
                  {membershipStatus.canRedeem ? (
                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#19C37D] flex items-center justify-center mx-auto">
                        <Unlock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black uppercase text-emerald-700 dark:text-[#19C37D] block">
                        Redemption Unlocked
                      </span>
                      <p className="text-[10px] text-gray-500 dark:text-[#818C9B]">Ready to redeem at Checkout!</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-[#FFD600] flex items-center justify-center mx-auto">
                        <Lock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black uppercase text-amber-800 dark:text-[#FFD600] block">
                        150 Coins Threshold
                      </span>
                      <p className="text-[10px] text-gray-500 dark:text-[#818C9B]">
                        Need {membershipStatus.coinsNeededToRedeem} more coins
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Threshold Progress Bar */}
              <div className="space-y-2 mt-6">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-600 dark:text-[#AEB9C8]">
                    Threshold Progress (Min 150 Coins required)
                  </span>
                  <span className="text-slate-900 dark:text-[#F5F7FA] font-mono">
                    {membershipStatus.commissionCoins} / 150 Coins ({membershipStatus.progressPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-[#151B23] rounded-full h-3.5 overflow-hidden p-0.5 border border-gray-200 dark:border-[#2A3440]">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      membershipStatus.canRedeem ? "bg-emerald-500 dark:bg-[#19C37D]" : "bg-amber-400 dark:bg-[#FFD600]"
                    }`}
                    style={{ width: `${Math.min(membershipStatus.progressPercentage || 0, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-[#818C9B] italic">
                  {membershipStatus.canRedeem
                    ? "🎉 You have reached the 150 coins threshold! Apply your coins at checkout for an instant ₹ discount."
                    : `🔒 Minimum threshold is 150 coins. Earn ${membershipStatus.coinsNeededToRedeem} more coins on your orders to unlock instant redemption at checkout.`}
                </p>
              </div>
            </div>

            {/* 45-day Expiration info */}
            {membershipStatus.nextExpiringAt && (
              <div className="bg-gray-50 dark:bg-[#1D2530] p-4 rounded-xl border border-gray-200 dark:border-[#2A3440] flex items-center gap-3 text-xs text-gray-600 dark:text-[#AEB9C8]">
                <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>
                  Next coin expiration reset date:{" "}
                  <strong className="text-slate-900 dark:text-[#F5F7FA]">
                    {new Date(membershipStatus.nextExpiringAt).toLocaleDateString()}
                  </strong>{" "}
                  (45 days from transaction date).
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Membership Plan & Payment Gateway Card (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#171D26] p-8 rounded-3xl border border-gray-200 dark:border-[#2A3440] shadow-sm flex flex-col justify-between space-y-6 transition-colors duration-250">
            <div className="space-y-5">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2A3440] pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-[#19C37D]">
                    Membership Plan
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-[#F5F7FA] uppercase tracking-tight">
                    {currentSelectedPlan.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-slate-900 dark:text-[#F5F7FA] font-mono">
                    ₹{currentSelectedPlan.price}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-[#818C9B] font-normal block">
                    /{currentSelectedPlan.durationDays || 365} Days
                  </span>
                </div>
              </div>

              {/* Multiple Plans selector if available */}
              {activePlans.length > 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {activePlans.map((p, idx) => (
                    <button
                      key={p._id || idx}
                      type="button"
                      onClick={() => setSelectedPlanIndex(idx)}
                      className={`p-3 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                        selectedPlanIndex === idx
                          ? "border-[#24672E] bg-emerald-50/60 ring-2 ring-[#24672E]/20 dark:border-[#FFD600] dark:bg-[#1D2530] dark:ring-[#FFD600]/20"
                          : "border-gray-200 dark:border-[#2A3440] bg-gray-50 dark:bg-[#151B23] hover:bg-white dark:hover:bg-[#1D2530]"
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-[#F5F7FA] truncate">{p.name}</div>
                      <div className="text-emerald-700 dark:text-[#FFD600] font-mono font-black mt-0.5">₹{p.price}</div>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-600 dark:text-[#AEB9C8] leading-relaxed font-medium">
                {currentSelectedPlan.description}
              </p>

              {/* Plan Features */}
              <div className="space-y-2.5 pt-1">
                {currentSelectedPlan.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-gray-700 dark:text-[#AEB9C8]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#19C37D] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* PAYMENT WAYS ACCEPTED BADGES */}
              <div className="bg-slate-50 dark:bg-[#1D2530] border border-slate-200/80 dark:border-[#2A3440] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-[#F5F7FA]">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#24672E] dark:text-[#FFD600]" /> Accepted Payment Modes:
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-[#19C37D] font-extrabold uppercase bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    Instant Activation
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-gray-600">
                  <span className="bg-white dark:bg-[#171D26] border border-gray-200 dark:border-[#2A3440] px-2.5 py-1 rounded-lg shadow-2xs text-[#5f259f] dark:text-purple-300 font-black">
                    PhonePe
                  </span>
                  <span className="bg-white dark:bg-[#171D26] border border-gray-200 dark:border-[#2A3440] px-2.5 py-1 rounded-lg shadow-2xs text-[#4285F4] dark:text-blue-300 font-black">
                    Google Pay
                  </span>
                  <span className="bg-white dark:bg-[#171D26] border border-gray-200 dark:border-[#2A3440] px-2.5 py-1 rounded-lg shadow-2xs text-[#00b9f1] dark:text-sky-300 font-black">
                    Paytm
                  </span>
                  <span className="bg-white dark:bg-[#171D26] border border-gray-200 dark:border-[#2A3440] px-2.5 py-1 rounded-lg shadow-2xs text-slate-800 dark:text-[#AEB9C8]">
                    Any UPI / QR
                  </span>
                  <span className="bg-white dark:bg-[#171D26] border border-gray-200 dark:border-[#2A3440] px-2.5 py-1 rounded-lg shadow-2xs text-slate-800 dark:text-[#AEB9C8]">
                    Debit / Credit Cards
                  </span>
                  <span className="bg-white dark:bg-[#171D26] border border-gray-200 dark:border-[#2A3440] px-2.5 py-1 rounded-lg shadow-2xs text-slate-800 dark:text-[#AEB9C8]">
                    Net Banking
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-[#818C9B] font-medium pt-1 border-t border-gray-200/60 dark:border-[#2A3440]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-[#19C37D] shrink-0" />
                  <span>256-bit SSL encrypted official payment gateway</span>
                </div>
              </div>

            </div>

            {/* ACTION BUTTON */}
            <div className="pt-2 space-y-3">
              {!user ? (
                <button
                  type="button"
                  onClick={() => navigate("/signin?redirect=/membership")}
                  className="w-full bg-[#FFD600] hover:bg-[#FFE45C] text-[#111318] font-black py-4 rounded-2xl uppercase tracking-widest text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-[#111318]" />
                  Sign In to Join Prime (₹{currentSelectedPlan.price}/Year)
                </button>
              ) : membershipStatus.isMember ? (
                <div className="space-y-2">
                  <div className="w-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-[#19C37D]/30 text-emerald-800 dark:text-[#19C37D] font-bold py-3.5 rounded-2xl text-xs text-center flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#19C37D]" />
                    <span>Prime Membership is Active!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePurchaseMembership(currentSelectedPlan._id)}
                    disabled={purchasing}
                    className="w-full bg-white dark:bg-[#1D2530] hover:bg-gray-50 dark:hover:bg-[#222B37] border border-gray-300 dark:border-[#303B48] text-slate-700 dark:text-[#F5F7FA] font-bold py-2.5 rounded-xl uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {purchasing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    {purchasing ? "Processing..." : `Extend / Renew for 1 Year (₹${currentSelectedPlan.price})`}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePurchaseMembership(currentSelectedPlan._id)}
                  disabled={purchasing}
                  className="w-full bg-[#FFD600] hover:bg-[#FFE45C] text-[#111318] font-black py-4 rounded-2xl uppercase tracking-widest text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {purchasing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#111318]" />
                  ) : (
                    <Zap className="w-4 h-4 text-[#111318]" />
                  )}
                  {purchasing ? "Opening Payment Gateway..." : `Pay ₹${currentSelectedPlan.price} & Activate Prime`}
                </button>
              )}
            </div>

          </div>

        </div>

        {/* ── COMMISSION TRANSACTION HISTORY LOGS ── */}
        <div className="bg-white dark:bg-[#171D26] p-8 rounded-3xl border border-gray-200 dark:border-[#2A3440] shadow-sm space-y-4 transition-colors duration-250">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2A3440] pb-4">
            <h3 className="text-base font-black text-slate-900 dark:text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-[#19C37D]" /> Commission Coins Activity & 45-Day Expiration Log
            </h3>
            <span className="text-xs font-bold text-gray-400 dark:text-[#818C9B]">
              Showing recent transactions
            </span>
          </div>

          {!membershipStatus.historyLogs || membershipStatus.historyLogs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-[#818C9B] font-medium">
              <Coins className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs uppercase font-bold tracking-wider">No Commission Activity Yet</p>
              <p className="text-[11px] text-gray-400 dark:text-[#818C9B]">
                Activate your Prime membership and place an order to earn 1% commission coins!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-[#151B23] text-gray-500 dark:text-[#818C9B] uppercase font-bold text-[10px] tracking-wider border-b border-gray-200 dark:border-[#2A3440]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Activity / Note</th>
                    <th className="p-3 text-right">Order Total</th>
                    <th className="p-3 text-right">Coins Earned</th>
                    <th className="p-3 text-center">45-Day Expiration</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#202832] font-medium">
                  {membershipStatus.historyLogs.map((log) => (
                    <tr key={log._id || Math.random()} className="hover:bg-gray-50/50 dark:hover:bg-[#1D2530]/60 transition-colors">
                      <td className="p-3 text-gray-600 dark:text-[#AEB9C8] font-mono">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-slate-900 dark:text-[#F5F7FA] font-semibold">
                        {log.note || log.type}
                      </td>
                      <td className="p-3 text-right font-bold text-gray-700 dark:text-[#AEB9C8]">
                        {log.orderTotal ? `₹${log.orderTotal}` : "-"}
                      </td>
                      <td className="p-3 text-right font-black text-emerald-600 dark:text-[#19C37D] font-mono">
                        {log.coinsEarned > 0 ? `+${log.coinsEarned} Coins` : "-"}
                      </td>
                      <td className="p-3 text-center text-gray-500 dark:text-[#818C9B] font-mono">
                        {log.expiresAt ? new Date(log.expiresAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            log.status === "ACTIVE"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#19C37D] border border-emerald-200 dark:border-[#19C37D]/30"
                              : log.status === "EXPIRED"
                              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-[#FF5C6C] border border-rose-200 dark:border-[#FF5C6C]/30"
                              : "bg-gray-100 dark:bg-[#1D2530] text-gray-600 dark:text-[#AEB9C8] border border-gray-200 dark:border-[#2A3440]"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MembershipPage;
