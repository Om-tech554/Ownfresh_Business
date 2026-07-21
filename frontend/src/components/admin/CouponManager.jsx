import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Ticket, 
  Trash2, 
  Plus, 
  Calendar, 
  Tag, 
  AlertCircle,
  CheckCircle2,
  X,
  Users,
  Percent,
  Coins
} from "lucide-react";
import toast from "react-hot-toast";
import { serverUrl } from "../../App";
import { useConfirm } from "../../hooks/ConfirmContext.jsx";

const CouponManager = () => {
  const confirm = useConfirm();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [analytics, setAnalytics] = useState({ totalCoupons: 0, activeCoupons: 0, totalUses: 0 });
  
  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrderAmount: "",
    maximumDiscountAmount: "",
    usageLimit: "",
    perUserLimit: "1",
    startDate: "",
    expiryDate: "",
    applicableUsers: "ALL_USERS",
    selectedUsersListText: "" // user emails/IDs comma separated to parse
  });

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/coupon/all`);
      setCoupons(res.data);
      
      // Calculate basic stats manually or fetch analytics
      const active = res.data.filter(c => c.isActive && new Date(c.expiryDate) > new Date()).length;
      const totalUses = res.data.reduce((sum, c) => sum + (c.usedCount || 0), 0);
      setAnalytics({
        totalCoupons: res.data.length,
        activeCoupons: active,
        totalUses
      });
    } catch (error) {
      toast.error("Failed to load coupons");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Parse selected users if any
      let selectedUsersList = [];
      if (formData.selectedUsersListText) {
        selectedUsersList = formData.selectedUsersListText
          .split(",")
          .map(item => item.trim())
          .filter(Boolean);
      }

      const body = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minimumOrderAmount: Number(formData.minimumOrderAmount) || 0,
        maximumDiscountAmount: formData.maximumDiscountAmount ? Number(formData.maximumDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        perUserLimit: Number(formData.perUserLimit) || 1,
        startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
        expiryDate: new Date(formData.expiryDate),
        applicableUsers: formData.applicableUsers,
        selectedUsersList
      };

      await axios.post(`${serverUrl}/api/coupon/create`, body, { withCredentials: true });
      toast.success("Promo code created successfully");
      setShowAddModal(false);
      
      // Reset form
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minimumOrderAmount: "",
        maximumDiscountAmount: "",
        usageLimit: "",
        perUserLimit: "1",
        startDate: "",
        expiryDate: "",
        applicableUsers: "ALL_USERS",
        selectedUsersListText: ""
      });
      
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: "Delete Coupon?",
      message: "Are you sure you want to delete this coupon?",
      type: "danger",
      confirmText: "Delete"
    });
    if (!isConfirmed) return;
    try {
      await axios.delete(`${serverUrl}/api/coupon/${id}`, { withCredentials: true });
      toast.success("Promo code deleted");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="px-6 py-8 md:px-12 lg:px-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Ticket className="text-[#24672E] w-8 h-8" />
            Promo <span className="text-[#24672E]">Coupons</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Promo Campaigns & Discounts
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#24672E] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#167a17] transition-all shadow-lg shadow-[#24672E]/20 cursor-pointer"
        >
          <Plus size={20} />
          Create Promo
        </button>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Codes</p>
          <p className="text-2xl font-black text-slate-900">{analytics.totalCoupons}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 text-green-600">Active Codes</p>
          <p className="text-2xl font-black text-green-600">{analytics.activeCoupons}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 text-purple-600">Total Uses</p>
          <p className="text-2xl font-black text-purple-600">{analytics.totalUses}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-2 h-full ${coupon.isActive ? 'bg-[#24672E]' : 'bg-red-400'}`} />
            
            <div className="flex items-center justify-between mb-4">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Tag className="text-[#24672E]" size={20} />
              </div>
              <button 
                onClick={() => handleDelete(coupon._id)}
                className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <h3 className="text-2xl font-black text-slate-900 mb-1">{coupon.code}</h3>
              {coupon.affiliateId && (
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">Affiliate</span>
              )}
            </div>
            
            <p className="text-sm font-bold text-[#24672E] mb-4">
              {coupon.discountType === 'PERCENTAGE' || coupon.discountType === 'percentage' 
                ? `${coupon.discountValue}% OFF` 
                : `₹${coupon.discountValue} OFF`}
            </p>

            <div className="space-y-2 text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-slate-400" />
                <span>Min Order: ₹{coupon.minimumOrderAmount || 0}</span>
              </div>
              {coupon.maximumDiscountAmount && (
                <div className="flex items-center gap-2">
                  <Coins size={14} className="text-slate-400" />
                  <span>Max Cap: ₹{coupon.maximumDiscountAmount}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-slate-400" />
                <span>Used: {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : '(Unlimited)'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-slate-400" />
                <span>User Cap: {coupon.perUserLimit} per user</span>
              </div>
              <div className="text-[10px] bg-slate-100 px-2 py-1 rounded-md text-slate-500 font-bold uppercase inline-block mt-2">
                Eligible: {coupon.applicableUsers}
              </div>
            </div>

            {!coupon.isActive && (
              <div className="mt-4 py-1 px-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold inline-block">
                INACTIVE
              </div>
            )}
          </div>
        ))}
        {coupons.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Ticket className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-bold">No coupons found. Create your first one!</p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-[#24672E] p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Plus size={20} /> Create New Promo Code
              </h3>
              <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-1">Coupon Code</label>
                  <input 
                    autoFocus
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] transition-all uppercase font-bold"
                    placeholder="e.g. FESTIVE20"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-1">Eligibility Group</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] font-bold"
                    value={formData.applicableUsers}
                    onChange={(e) => setFormData({...formData, applicableUsers: e.target.value})}
                  >
                    <option value="ALL_USERS">All Customers</option>
                    <option value="NEW_USERS">New Customers Only</option>
                    <option value="SELECTED_USERS">Selected Users List</option>
                  </select>
                </div>
              </div>

              {formData.applicableUsers === "SELECTED_USERS" && (
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-1">Selected User IDs (comma separated)</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] text-xs font-mono"
                    placeholder="e.g. 60d5ec4b8f1d2e1438bf2248, 60d5ec4b8f1d2e1438bf2249"
                    value={formData.selectedUsersListText}
                    onChange={(e) => setFormData({...formData, selectedUsersListText: e.target.value})}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-1">Discount Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] font-bold"
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-1">Discount Value</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] font-bold"
                    placeholder="20"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-1">Min Order Value (₹)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] font-bold"
                    placeholder="500"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({...formData, minimumOrderAmount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-1">Max Cap (₹, Optional)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] font-bold"
                    placeholder="No Limit"
                    value={formData.maximumDiscountAmount}
                    onChange={(e) => setFormData({...formData, maximumDiscountAmount: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-1">Total Usage Limit</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] font-bold"
                    placeholder="e.g. 500 (No Limit)"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-1">Uses Per User Limit</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] font-bold"
                    placeholder="1"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({...formData, perUserLimit: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-1">Start Date</label>
                  <input 
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] font-bold"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-1">Expiry Date</label>
                  <input 
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] font-bold"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-[#24672E] transition-all transform active:scale-95 disabled:opacity-50 mt-4 shadow-xl cursor-pointer"
              >
                {loading ? "Creating..." : "Launch Promo Coupon"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
