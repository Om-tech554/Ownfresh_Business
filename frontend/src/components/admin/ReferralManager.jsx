import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Users,
    Settings,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    Save,
    RefreshCcw,
    Search,
    Filter,
    TrendingUp,
    Gift,
    Award
} from "lucide-react";
import toast from "react-hot-toast";
import { serverUrl } from "../../App";

const ReferralManager = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        successful: 0,
        failed: 0,
        rewardsDistributed: 0
    });
    const [settings, setSettings] = useState({
        referralRewardReferrer: 100,
        referralRewardReferred: 50,
        tier1Threshold: 3,
        tier1Reward: 50,
        tier2Threshold: 6,
        tier3Threshold: 15,
        baseCommission: 10,
        tier3Commission: 15,
        subscriptionPrice: 999
    });
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState("stats"); // 'stats' or 'settings'
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${serverUrl}/api/referral/admin/stats`, { withCredentials: true });
            if (data.success) {
                setUsers(data.users);
                setSettings(data.settings);
                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            toast.error("Failed to load referral data");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put(`${serverUrl}/api/referral/admin/settings`, settings, { withCredentials: true });
            if (data.success) {
                toast.success("Referral settings updated!");
                setSettings(data.settings);
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center"><RefreshCcw className="animate-spin mx-auto text-green-600" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-6 pb-20">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                        Referral & Affiliate <span className="text-green-600">Control</span>
                    </h1>
                    <p className="text-slate-500 text-sm">Configure standard referral rewards, track milestones, and view user payouts.</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setActiveView("stats")}
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${activeView === "stats" ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Users size={14} /> Referral Stats
                    </button>
                    <button
                        onClick={() => setActiveView("settings")}
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${activeView === "settings" ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Settings size={14} /> Reward Settings
                    </button>
                </div>
            </div>

            {/* TOP STATS CARDS */}
            {activeView === "stats" && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="text-slate-400 text-xs font-black uppercase tracking-wider mb-2">Total Referrals</div>
                        <div className="text-3xl font-black text-slate-950">{stats.total}</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="text-slate-400 text-xs font-black uppercase tracking-wider mb-2 text-green-600">Successful</div>
                        <div className="text-3xl font-black text-green-600">{stats.successful}</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="text-slate-400 text-xs font-black uppercase tracking-wider mb-2 text-red-500">Failed / Abused</div>
                        <div className="text-3xl font-black text-red-500">{stats.failed}</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="text-slate-400 text-xs font-black uppercase tracking-wider mb-2 text-purple-600">Rewards Paid</div>
                        <div className="text-3xl font-black text-purple-600">₹{stats.rewardsDistributed}</div>
                    </div>
                </div>
            )}

            {activeView === "stats" ? (
                <div className="space-y-6">
                    {/* SEARCH BAR */}
                    <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                        <Search className="text-slate-400 ml-2" size={20} />
                        <input
                            type="text"
                            placeholder="Search user by name or email..."
                            className="flex-1 outline-none text-slate-700 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">User Details</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Invites Count</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Affiliate Status</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Commission Balance</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Total Earned</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((u, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{u.fullName}</p>
                                            <p className="text-xs text-slate-400">{u.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center font-black text-slate-700">
                                            {u.referralCount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                  u.referralCount >= settings.tier3Threshold ? 'bg-purple-100 text-purple-700' :
                                                  u.isAffiliate ? 'bg-blue-100 text-blue-700' : 
                                                  'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {u.referralCount >= settings.tier3Threshold ? 'Mega Affiliate (T3)' :
                                                     u.isAffiliate ? 'Affiliate (T2)' : 'User (T1)'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-600">
                                            ₹{u.commissionBalance?.toFixed(0) || 0}
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-900">
                                            ₹{u.totalEarnings?.toFixed(0) || 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="p-20 text-center text-slate-300">
                                <Users className="mx-auto mb-4 opacity-10" size={64} />
                                <p className="font-bold">No active users matching criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* DIRECT REWARD CONFIG */}
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-blue-50 p-4 rounded-3xl">
                                <Gift className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Direct Referral Payouts</h2>
                                <p className="text-slate-400 text-xs">Set amount given directly to Referrer and Referred.</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateSettings} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Referrer Reward (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-blue-400 transition"
                                        value={settings.referralRewardReferrer}
                                        onChange={(e) => setSettings({ ...settings, referralRewardReferrer: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Referred Reward (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-blue-400 transition"
                                        value={settings.referralRewardReferred}
                                        onChange={(e) => setSettings({ ...settings, referralRewardReferred: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <Award size={16} /> Milestone Targets & Extras
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Tier 1 Target (Referrals)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-blue-400 transition"
                                            value={settings.tier1Threshold}
                                            onChange={(e) => setSettings({ ...settings, tier1Threshold: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Tier 1 Extra Bonus (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-blue-400 transition"
                                            value={settings.tier1Reward}
                                            onChange={(e) => setSettings({ ...settings, tier1Reward: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
                                <Save size={20} /> Save Referral Rules
                            </button>
                        </form>
                    </div>

                    {/* COMMISSION CONFIG */}
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-green-50 p-4 rounded-3xl">
                                <DollarSign className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Affiliate Levels & Subscriptions</h2>
                                <p className="text-slate-400 text-xs">Set commission rates for Tier 2 and Tier 3 partners.</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateSettings} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Tier 2 Milestone (Refs)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-green-400 transition"
                                        value={settings.tier2Threshold}
                                        onChange={(e) => setSettings({ ...settings, tier2Threshold: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">T2 Commission Rate (%)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-green-400 transition"
                                        value={settings.baseCommission}
                                        onChange={(e) => setSettings({ ...settings, baseCommission: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Tier 3 Milestone (Refs)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-green-400 transition"
                                        value={settings.tier3Threshold}
                                        onChange={(e) => setSettings({ ...settings, tier3Threshold: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">T3 Commission Rate (%)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-green-400 transition"
                                        value={settings.tier3Commission}
                                        onChange={(e) => setSettings({ ...settings, tier3Commission: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Direct Unlock Subscription Price (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-green-400 transition"
                                        value={settings.subscriptionPrice}
                                        onChange={(e) => setSettings({ ...settings, subscriptionPrice: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-slate-900 rounded-3xl flex items-center gap-4">
                                <AlertCircle className="text-yellow-400" size={24} />
                                <p className="text-slate-400 text-[10px] italic">Milestones are assessed immediately upon order delivery. Fraud checks protect against duplicate IP/device exploits.</p>
                            </div>

                            <button className="w-full bg-[#24672E] text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#24672E]/20 cursor-pointer">
                                <Save size={20} /> Update Affiliate Rules
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralManager;
