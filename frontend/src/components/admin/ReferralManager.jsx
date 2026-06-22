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
    TrendingUp
} from "lucide-react";
import toast from "react-hot-toast";
import { serverUrl } from "../../App";

const ReferralManager = () => {
    const [users, setUsers] = useState([]);
    const [settings, setSettings] = useState({
        tier1Threshold: 3,
        tier1Reward: 50,
        tier2Threshold: 6,
        tier3Threshold: 15,
        tier3Commission: 15,
        baseCommission: 10,
        subscriptionPrice: 999,
        referralDiscountValue: 10,
        referralDiscountType: "percentage"
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
                toast.success("Settings updated successfully!");
                setSettings(data.settings);
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <p className="text-slate-500 text-sm">Manage user tiers, commission rates and monitoring tools.</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setActiveView("stats")}
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${activeView === "stats" ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Users size={14} /> User Stats
                    </button>
                    <button
                        onClick={() => setActiveView("settings")}
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${activeView === "settings" ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Settings size={14} /> Global Settings
                    </button>
                </div>
            </div>

            {activeView === "stats" ? (
                <div className="space-y-6">
                    {/* SEARCH BAR */}
                    <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                        <Search className="text-slate-400 ml-2" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="flex-1 outline-none text-slate-700 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                            <Filter size={16} /> Filter
                        </button>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Referrals</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Commission Bal</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Total Earnings</th>
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
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.isAffiliate ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {u.isAffiliate ? 'Affiliate' : 'User'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-600">
                                            ₹{u.commissionBalance?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-900">
                                            ₹{u.totalEarnings?.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="p-20 text-center text-slate-300">
                                <Users className="mx-auto mb-4 opacity-10" size={64} />
                                <p className="font-bold">No active referral partners found.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* MILESTONE CONFIG */}
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-blue-50 p-4 rounded-3xl">
                                <TrendingUp className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Tier Thresholds</h2>
                                <p className="text-slate-400 text-xs">Define milestones for user progression.</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateSettings} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Tier 1 Target</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-blue-400 transition"
                                        value={settings.tier1Threshold}
                                        onChange={(e) => setSettings({ ...settings, tier1Threshold: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">T1 Reward (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-blue-400 transition"
                                        value={settings.tier1Reward}
                                        onChange={(e) => setSettings({ ...settings, tier1Reward: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Tier 2 Target</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-blue-400 transition"
                                        value={settings.tier2Threshold}
                                        onChange={(e) => setSettings({ ...settings, tier2Threshold: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Tier 3 Target</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-blue-400 transition"
                                        value={settings.tier3Threshold}
                                        onChange={(e) => setSettings({ ...settings, tier3Threshold: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                                <Save size={20} /> Save Changes
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
                                <h2 className="text-xl font-black text-slate-900">Financial Rules</h2>
                                <p className="text-slate-400 text-xs">Set commission rates & signup discounts.</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateSettings} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Base Comm (%)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-green-400 transition"
                                        value={settings.baseCommission}
                                        onChange={(e) => setSettings({ ...settings, baseCommission: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Tier 3 Comm (%)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-green-400 transition"
                                        value={settings.tier3Commission}
                                        onChange={(e) => setSettings({ ...settings, tier3Commission: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Signup Disc (%)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-green-400 transition"
                                        value={settings.referralDiscountValue}
                                        onChange={(e) => setSettings({ ...settings, referralDiscountValue: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Subsc. Fee (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-green-400 transition"
                                        value={settings.subscriptionPrice}
                                        onChange={(e) => setSettings({ ...settings, subscriptionPrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-slate-900 rounded-3xl flex items-center gap-4">
                                <AlertCircle className="text-yellow-400" size={24} />
                                <p className="text-slate-400 text-[10px] italic">Changes reflect immediately for new orders and milestone assessments.</p>
                            </div>

                            <button className="w-full bg-[#1E971D] text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#1E971D]/20">
                                <Save size={20} /> Update Commission Rules
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralManager;
