import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import {
  Crown,
  Coins,
  Users,
  TrendingUp,
  Clock,
  ShieldCheck,
  Edit,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Search,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";

const PrimeMembershipManager = () => {
  const [loading, setLoading] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState({
    totalMembers: 0,
    totalCoinsIssued: 0,
    totalCoinsActive: 0,
    totalCoinsRedeemed: 0,
    totalCoinsExpired: 0
  });

  const [members, setMembers] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  const [planForm, setPlanForm] = useState({
    planId: "",
    name: "OwnFresh Prime Membership",
    price: 299,
    description: "Earn 1% Commission Credit Coins on every transaction. Coins reset in 45 days. Minimum 150 coins to redeem.",
    featuresText: "Earn 1% Commission Credit Coins on all orders\nRedeem coins directly at checkout (150 threshold)\n45-day reset cycle\nExclusive Prime member offers & priority support"
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${serverUrl}/api/membership/admin/dashboard`, {
        withCredentials: true
      });

      if (data.success) {
        setStats(data.stats || {});
        setMembers(data.members || []);
        setRecentLogs(data.recentLogs || []);

        if (data.plan) {
          setPlanForm({
            planId: data.plan._id,
            name: data.plan.name,
            price: data.plan.price,
            description: data.plan.description,
            featuresText: (data.plan.features || []).join("\n")
          });
        }
      }
    } catch (err) {
      console.error("Failed to load admin membership dashboard:", err);
      toast.error("Failed to load Prime 1% Admin Dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      setUpdatingPlan(true);
      const payload = {
        planId: planForm.planId,
        name: planForm.name,
        price: Number(planForm.price),
        description: planForm.description,
        features: planForm.featuresText.split("\n").filter(f => f.trim())
      };

      const { data } = await axios.put(`${serverUrl}/api/membership/admin/plan`, payload, {
        withCredentials: true
      });

      if (data.success) {
        toast.success(data.msg);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Update plan error:", err);
      toast.error("Failed to update membership plan configuration.");
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleToggleUserMembership = async (userId, currentIsMember) => {
    try {
      const { data } = await axios.put(
        `${serverUrl}/api/membership/admin/user-membership`,
        {
          userId,
          isMember: !currentIsMember,
          days: 365,
          planName: planForm.name
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(`User membership ${!currentIsMember ? "activated" : "deactivated"}!`);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Toggle user membership error:", err);
      toast.error("Failed to update user membership status.");
    }
  };

  const filteredMembers = members.filter(m => 
    m.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.mobile?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
          Loading Prime 1% Management Panel...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans">
      
      {/* ── HEADER TITLE ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EFDB27] text-black flex items-center justify-center font-black shadow-xs">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-wider">
              Prime 1% Membership & Commission Manager
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Configure Membership Plans, monitor 1% Commission Coins, and manage customer tiers
            </p>
          </div>
        </div>

        <button
          onClick={fetchDashboardData}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer w-fit"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* ── 4 SUMMARY STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Active Members */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
              Active Members
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {stats.totalMembers}
            </span>
          </div>
        </div>

        {/* Card 2: Total 1% Coins Issued */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
              Total 1% Coins Issued
            </span>
            <span className="text-2xl font-black text-amber-600 font-mono">
              {stats.totalCoinsIssued}
            </span>
          </div>
        </div>

        {/* Card 3: Active Balance (45-Day Cycle) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
              Active Unexpired Coins
            </span>
            <span className="text-2xl font-black text-sky-700 font-mono">
              {stats.totalCoinsActive}
            </span>
          </div>
        </div>

        {/* Card 4: Redeemed Coins */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
              Coins Redeemed
            </span>
            <span className="text-2xl font-black text-purple-700 font-mono">
              {stats.totalCoinsRedeemed}
            </span>
          </div>
        </div>

      </div>

      {/* ── PLAN CONFIGURATION & MEMBER SEARCH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Plan Editor Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Crown className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
              Configure Prime Plan
            </h3>
          </div>

          <form onSubmit={handleUpdatePlan} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                Plan Name
              </label>
              <input
                type="text"
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                Annual Membership Price (₹)
              </label>
              <input
                type="number"
                value={planForm.price}
                onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                Key Features (One per line)
              </label>
              <textarea
                rows={4}
                value={planForm.featuresText}
                onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPlan}
              className="w-full bg-slate-900 hover:bg-[#EFDB27] hover:text-black text-white font-black py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {updatingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {updatingPlan ? "Saving Changes..." : "Save Plan Settings"}
            </button>
          </form>
        </div>

        {/* RIGHT: Enrolled Members List (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Enrolled Prime Members ({filteredMembers.length})
            </h3>

            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-emerald-500 w-full sm:w-48"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider sticky top-0 border-b border-gray-200">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3 text-right">Active Coins</th>
                  <th className="p-3 text-center">Expires At</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-400 font-bold">
                      No members found
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m._id} className="hover:bg-gray-50/50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{m.fullName}</div>
                        <div className="text-[10px] text-gray-400">{m.email}</div>
                      </td>
                      <td className="p-3 text-xs font-bold text-emerald-700">
                        {m.membershipPlanName || "Prime"}
                      </td>
                      <td className="p-3 text-right font-black text-amber-600 font-mono">
                        {m.commissionCoins || 0} Coins
                      </td>
                      <td className="p-3 text-center text-gray-500 font-mono text-[11px]">
                        {m.membershipExpiresAt ? new Date(m.membershipExpiresAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleUserMembership(m._id, m.isMember)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            m.isMember
                              ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200"
                          }`}
                        >
                          {m.isMember ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── RECENT 1% COMMISSION LOGS & EXPIRED BATCH AUDIT ── */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" /> Commission Coins Audit & 45-Day Expiration Logs
          </h3>
          <span className="text-xs font-bold text-gray-400">
            Real-time transaction tracking
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Type / Description</th>
                <th className="p-3 text-right">Order Total</th>
                <th className="p-3 text-right">Coins Issued</th>
                <th className="p-3 text-center">45-Day Reset Date</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400 font-bold">
                    No commission transaction logs found
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50">
                    <td className="p-3 text-gray-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {log.userId?.fullName || "Customer"}
                      <div className="text-[10px] font-normal text-gray-400">{log.userId?.email}</div>
                    </td>
                    <td className="p-3 text-gray-700">
                      {log.note || log.type}
                    </td>
                    <td className="p-3 text-right font-bold text-gray-800">
                      {log.orderTotal ? `₹${log.orderTotal}` : "-"}
                    </td>
                    <td className="p-3 text-right font-black text-emerald-600 font-mono">
                      {log.coinsEarned > 0 ? `+${log.coinsEarned}` : "-"}
                    </td>
                    <td className="p-3 text-center text-gray-500 font-mono text-[11px]">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PrimeMembershipManager;
