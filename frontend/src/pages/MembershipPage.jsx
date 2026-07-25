import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const MembershipPage = () => {
  const user = useSelector((state) => state.user.userData);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [plans, setPlans] = useState([]);
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
  }, [user]);

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
      if (planData.success) {
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
      toast.error("Please sign in to buy a membership plan!");
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#24672E] animate-spin mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Loading Membership & Commission Dashboard...
        </p>
      </div>
    );
  }

  const defaultPlan = plans[0] || {
    name: "OwnFresh Prime Membership",
    price: 299,
    durationDays: 365,
    description: "Earn 1% Commission Coins on every transaction. Coins reset in 45 days. Minimum 150 coins to redeem.",
    features: [
      "Earn 1% Commission Credit Coins on all orders",
      "Redeem coins directly at checkout (150 coins threshold)",
      "45-day reset cycle for max rewards",
      "Exclusive Prime member offers & priority support"
    ]
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans pb-16">
      <Navbar />
      <div className="max-w-6xl mx-auto space-y-10 pt-8 px-4 sm:px-6 lg:px-8">

        {/* ── HERO BANNER ── */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#EFDB27] opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                <Crown className="w-4 h-4 text-[#EFDB27]" /> Commission Rewards Program
              </div>

              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                Earn <span className="text-[#EFDB27]">1% Commission</span> Coins On Every Order
              </h1>

              <p className="text-gray-300 text-sm md:text-base font-medium leading-relaxed">
                Join our exclusive Membership Plan. Every purchase earns you 1% redeemable Credit Coins in your wallet. Coins reset every 45 days and can be redeemed at checkout when reaching 150 coins!
              </p>
            </div>

            {/* Member Status Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-center min-w-[260px] shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-[#EFDB27] text-black flex items-center justify-center mx-auto mb-3 shadow-md">
                <Crown className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 block">
                Your Status
              </span>
              <h3 className="text-xl font-black text-white uppercase tracking-wider mt-0.5">
                {membershipStatus.isMember ? membershipStatus.membershipPlanName : "Non-Member"}
              </h3>
              {membershipStatus.isMember ? (
                <span className="inline-block mt-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                  ✓ Member Active
                </span>
              ) : (
                <span className="inline-block mt-2 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
                  Upgrade to Earn 1%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── COMMISSION COINS WALLET DASHBOARD (FOR ALL USERS) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Coins Balance & 150 Threshold Card (7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    Commission Credit Coins
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Earned via 1% purchase cashback for active members
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> 45-Day Reset Cycle
              </span>
            </div>

            {/* Coins Balance Gauge */}
            <div className="bg-gradient-to-br from-amber-500/10 via-yellow-50 to-emerald-500/10 border border-amber-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block">
                  Active Commission Coins
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-slate-900 font-mono">
                    {membershipStatus.commissionCoins}
                  </span>
                  <span className="text-sm font-bold text-gray-600">Coins</span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Value: <strong className="text-slate-900">₹{membershipStatus.commissionCoins}</strong> (1 Coin = ₹1)
                </p>
              </div>

              {/* Threshold Status Lock */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-center min-w-[200px]">
                {membershipStatus.canRedeem ? (
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <Unlock className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase text-emerald-700 block">
                      Redemption Unlocked
                    </span>
                    <p className="text-[10px] text-gray-500">Ready to redeem at Checkout!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase text-amber-800 block">
                      150 Coins Threshold
                    </span>
                    <p className="text-[10px] text-gray-500">
                      Need {membershipStatus.coinsNeededToRedeem} more coins
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Threshold Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-600">
                  Threshold Progress (Min 150 Coins required)
                </span>
                <span className="text-slate-900 font-mono">
                  {membershipStatus.commissionCoins} / 150 Coins ({membershipStatus.progressPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5 border border-gray-200">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    membershipStatus.canRedeem ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                  style={{ width: `${membershipStatus.progressPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 italic">
                {membershipStatus.canRedeem
                  ? "🎉 You have reached the 150 coins threshold! Apply your coins at checkout for an instant discount."
                  : `🔒 Minimum threshold is 150 coins. Earn ${membershipStatus.coinsNeededToRedeem} more coins on your next orders to unlock redemption at checkout.`}
              </p>
            </div>

            {/* 45-day Expiration info */}
            {membershipStatus.nextExpiringAt && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-3 text-xs text-gray-600">
                <Info className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  Next coin expiration reset date:{" "}
                  <strong className="text-slate-900">
                    {new Date(membershipStatus.nextExpiringAt).toLocaleDateString()}
                  </strong>{" "}
                  (45 days from transaction date).
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Membership Plan Selector Card (5 cols) */}
          <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                    Exclusive Tier
                  </span>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    {defaultPlan.name}
                  </h3>
                </div>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  ₹{defaultPlan.price}
                  <span className="text-xs text-gray-400 font-normal">/year</span>
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                {defaultPlan.description}
              </p>

              <div className="space-y-2.5 pt-2">
                {defaultPlan.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              {membershipStatus.isMember ? (
                <button
                  disabled
                  className="w-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-black py-4 rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-default"
                >
                  <ShieldCheck className="w-4 h-4" /> Membership Active
                </button>
              ) : (
                <button
                  onClick={() => handlePurchaseMembership(defaultPlan._id)}
                  disabled={purchasing}
                  className="w-full bg-[#EFDB27] hover:bg-slate-900 hover:text-white text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {purchasing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {purchasing ? "Activating Membership..." : `Activate Membership (₹${defaultPlan.price}/Year)`}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* ── COMMISSION TRANSACTION HISTORY LOGS ── */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Commission Coins Activity & 45-Day Expiration Log
            </h3>
            <span className="text-xs font-bold text-gray-400">
              Showing recent transactions
            </span>
          </div>

          {membershipStatus.historyLogs?.length === 0 ? (
            <div className="py-12 text-center text-gray-400 font-medium">
              <Coins className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs uppercase font-bold tracking-wider">No Commission Activity Yet</p>
              <p className="text-[11px] text-gray-400">
                Activate your membership and place an order to earn 1% commission coins!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Activity / Note</th>
                    <th className="p-3 text-right">Order Total</th>
                    <th className="p-3 text-right">Coins Earned</th>
                    <th className="p-3 text-center">45-Day Expiration</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {membershipStatus.historyLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 text-gray-600 font-mono">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-slate-900 font-semibold">
                        {log.note || log.type}
                      </td>
                      <td className="p-3 text-right font-bold text-gray-700">
                        {log.orderTotal ? `₹${log.orderTotal}` : "-"}
                      </td>
                      <td className="p-3 text-right font-black text-emerald-600 font-mono">
                        {log.coinsEarned > 0 ? `+${log.coinsEarned} Coins` : "-"}
                      </td>
                      <td className="p-3 text-center text-gray-500 font-mono">
                        {log.expiresAt ? new Date(log.expiresAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            log.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : log.status === "EXPIRED"
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
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
