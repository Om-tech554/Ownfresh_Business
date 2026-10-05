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
  UserCheck,
  Search,
  Percent,
  Coins
} from "lucide-react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { serverUrl } from "../../App";
import { useConfirm } from "../../hooks/ConfirmContext.jsx";

const CouponManager = () => {
  const confirm = useConfirm();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [analytics, setAnalytics] = useState({ totalCoupons: 0, activeCoupons: 0, totalUses: 0 });
  const [allCustomers, setAllCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerChips, setSelectedCustomerChips] = useState([]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/user/admin/all`, { withCredentials: true });
      if (res.data?.users) {
        setAllCustomers(res.data.users);
      }
    } catch (e) {
      console.warn("Could not fetch customer list for coupon manager:", e);
    }
  };
  
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
    isSpecialCoupon: false,
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
    fetchCustomers();
  }, []);

  const handleSelectCustomer = (customer) => {
    if (selectedCustomerChips.some(c => c._id === customer._id)) {
      toast.error("Customer already added");
      return;
    }
    const updated = [...selectedCustomerChips, customer];
    setSelectedCustomerChips(updated);
    setFormData(prev => ({
      ...prev,
      selectedUsersListText: updated.map(c => c._id).join(", ")
    }));
    setCustomerSearch("");
  };

  const handleRemoveCustomerChip = (id) => {
    const updated = selectedCustomerChips.filter(c => c._id !== id);
    setSelectedCustomerChips(updated);
    setFormData(prev => ({
      ...prev,
      selectedUsersListText: updated.map(c => c._id).join(", ")
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isSpecial = formData.applicableUsers === "SPECIAL_MEMBER" || formData.isSpecialCoupon;

      // Parse and sanitize selected users (strips any brackets, quotes, whitespace)
      let selectedUsersList = [];
      if (!isSpecial && formData.selectedUsersListText) {
        const cleanReg = new RegExp("[\[\]'\"`]", "g");
        const raw = formData.selectedUsersListText.replace(cleanReg, " ").trim();
        selectedUsersList = raw
          .split(/[\s,]+/)
          .map(item => item.trim())
          .filter(Boolean);
      }

      const body = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minimumOrderAmount: Number(formData.minimumOrderAmount) || 0,
        maximumDiscountAmount: formData.maximumDiscountAmount ? Number(formData.maximumDiscountAmount) : null,
        usageLimit: isSpecial ? 1 : (formData.usageLimit ? Number(formData.usageLimit) : null),
        perUserLimit: isSpecial ? 1 : (Number(formData.perUserLimit) || 1),
        startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
        expiryDate: new Date(formData.expiryDate),
        applicableUsers: isSpecial ? "SPECIAL_MEMBER" : formData.applicableUsers,
        isSpecialCoupon: isSpecial,
        selectedUsersList: isSpecial ? [] : selectedUsersList,
        requiresDeliveryCharge: isSpecial ? true : undefined
      };

      await axios.post(`${serverUrl}/api/coupon/create`, body, { withCredentials: true });
      toast.success(isSpecial ? "Special single-use promo code created!" : "Promo code created successfully");
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
        isSpecialCoupon: false,
        selectedUsersListText: ""
      });
      setSelectedCustomerChips([]);
      setCustomerSearch("");
      
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
              {(coupon.applicableUsers === "SPECIAL_MEMBER" || coupon.isSpecialCoupon) ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1">
                    ⭐ Special Single-Use
                  </span>
                  <span className="bg-orange-100 text-orange-900 border border-orange-200/60 px-1.5 py-0.5 rounded text-[7px] font-black uppercase">
                    🚚 Delivery Charges Apply
                  </span>
                </div>
              ) : (coupon.applicableUsers === "SELECTED_USERS" || coupon.requiresDeliveryCharge) ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[8px] font-black uppercase">
                    🎯 {coupon.selectedUsersList?.length || 0} Customers
                  </span>
                  <span className="bg-orange-100 text-orange-900 border border-orange-200/60 px-1.5 py-0.5 rounded text-[7px] font-black uppercase">
                    🚚 Delivery Charges Apply
                  </span>
                </div>
              ) : null}
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
                <CheckCircle2 size={14} className={(coupon.applicableUsers === "SPECIAL_MEMBER" || coupon.isSpecialCoupon) && coupon.usedCount >= 1 ? "text-rose-500" : "text-slate-400"} />
                <span className={(coupon.applicableUsers === "SPECIAL_MEMBER" || coupon.isSpecialCoupon) && coupon.usedCount >= 1 ? "font-bold text-rose-600" : ""}>
                  Used: {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : '(Unlimited)'}
                  {(coupon.applicableUsers === "SPECIAL_MEMBER" || coupon.isSpecialCoupon) && coupon.usedCount >= 1 && " (REDEEMED)"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-slate-400" />
                <span>User Cap: {coupon.perUserLimit} per user</span>
              </div>
              <div className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase inline-block mt-2 ${
                coupon.applicableUsers === "SPECIAL_MEMBER" || coupon.isSpecialCoupon
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-slate-100 text-slate-500"
              }`}>
                Eligible: {coupon.applicableUsers === "SPECIAL_MEMBER" || coupon.isSpecialCoupon ? "⭐ Special Member (Single-Use)" : coupon.applicableUsers}
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
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl z-10"
            >
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        applicableUsers: val,
                        isSpecialCoupon: val === "SPECIAL_MEMBER",
                        usageLimit: val === "SPECIAL_MEMBER" ? "1" : formData.usageLimit,
                        perUserLimit: val === "SPECIAL_MEMBER" ? "1" : formData.perUserLimit
                      });
                    }}
                  >
                    <option value="ALL_USERS">All Customers (Public / Standard)</option>
                    <option value="NEW_USERS">New Customers Only (First Order)</option>
                    <option value="SELECTED_USERS">Selected Users List (By Email / ID)</option>
                    <option value="SPECIAL_MEMBER">⭐ Special Member / Family (Single-Use Only)</option>
                  </select>
                </div>
              </div>

              {formData.applicableUsers === "SPECIAL_MEMBER" && (
                <div className="space-y-3 p-4 sm:p-5 bg-amber-500/10 dark:bg-[#111720] border-2 border-amber-400 dark:border-[#FFD600] rounded-2xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 dark:bg-[#FFD600]/20 border border-amber-400/40 dark:border-[#FFD600]/40 flex items-center justify-center shrink-0">
                      <span className="text-xl">⭐</span>
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-slate-900 dark:text-[#FFD600] uppercase tracking-wider">
                          Special Member / Family Promo Code
                        </h4>
                        <span className="text-[10px] bg-purple-600 text-white font-black px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                          VIP 1-TIME
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-[#E2E8F0] leading-relaxed">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-[#FFD600] font-black text-sm leading-none">•</span>
                          <span>
                            <strong className="text-slate-900 dark:text-white font-extrabold">Login Strictly Mandatory:</strong> The customer MUST sign in or register an account to apply this coupon. Unauthenticated / guest users cannot use it.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-[#FFD600] font-black text-sm leading-none">•</span>
                          <span>
                            <strong className="text-slate-900 dark:text-white font-extrabold">Any Account Allowed:</strong> Once they log in (even on a brand new account), the secret code will work without needing their email registered beforehand.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-[#FFD600] font-black text-sm leading-none">•</span>
                          <span>
                            <strong className="text-slate-900 dark:text-white font-extrabold">Single-Use Only:</strong> Can only be redeemed <strong className="text-amber-700 dark:text-[#FFD600] underline font-extrabold">1 time total</strong> across the entire store. As soon as the order is placed, it expires permanently.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-[#FFD600] font-black text-sm leading-none">•</span>
                          <span>
                            <strong className="text-slate-900 dark:text-white font-extrabold">Delivery Charges Apply:</strong> Standard delivery fees are charged transparently (same as selected users) to avoid shipping losses on big discounts.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-[#FFD600] font-black text-sm leading-none">•</span>
                          <span>
                            <strong className="text-slate-900 dark:text-white font-extrabold">Private & Secret:</strong> Never shown in public website banners or promo code popups.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-100/90 dark:bg-[#1D2530] border border-amber-300 dark:border-[#384556] rounded-xl flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-1.5">
                      <span>🔒</span> Usage limits automatically locked to <strong>1 order total & 1 per user</strong>
                    </span>
                    <span className="text-[10px] bg-[#FFD600] text-slate-950 px-2.5 py-1 rounded-full font-black uppercase tracking-wide shadow-xs shrink-0">
                      1-TIME LOCK
                    </span>
                  </div>
                </div>
              )}

              {formData.applicableUsers === "SELECTED_USERS" && (
                <div className="space-y-3 p-4 bg-emerald-50/50 dark:bg-[#111720] border border-emerald-200 dark:border-[#27313D] rounded-2xl">
                  {/* Delivery Charges Notice */}
                  <div className="p-2.5 bg-amber-50 dark:bg-[#1D2530] border border-amber-200 dark:border-[#384556] rounded-xl text-[11px] text-amber-900 dark:text-[#F1F5F9] font-bold flex items-center gap-2">
                    <span className="text-sm">🚚</span>
                    <span>
                      Standard Delivery Charges Apply: Target customers using this personalized promo code will pay standard delivery charges regardless of cart value.
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-emerald-900 uppercase">
                      Select Target Customers
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {selectedCustomerChips.length} selected
                    </span>
                  </div>

                  {/* Customer Search & Quick Pick */}
                  <div className="relative">
                    <div className="flex items-center gap-2 bg-white border border-emerald-300 rounded-xl px-3 py-2">
                      <Search className="w-4 h-4 text-emerald-600 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search by customer name, email, or ID..."
                        className="w-full text-xs font-semibold outline-none bg-transparent"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                      />
                      {customerSearch && (
                        <button
                          type="button"
                          onClick={() => setCustomerSearch("")}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filtered Dropdown */}
                    {customerSearch.trim() && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {allCustomers
                          .filter(c => {
                            const q = customerSearch.toLowerCase();
                            return (
                              (c.fullName && c.fullName.toLowerCase().includes(q)) ||
                              (c.email && c.email.toLowerCase().includes(q)) ||
                              (c.userName && c.userName.toLowerCase().includes(q)) ||
                              (c._id && c._id.toLowerCase().includes(q))
                            );
                          })
                          .slice(0, 8)
                          .map(cust => (
                            <button
                              key={cust._id}
                              type="button"
                              onClick={() => handleSelectCustomer(cust)}
                              className="w-full text-left px-3 py-2 hover:bg-emerald-50 transition-colors flex items-center justify-between cursor-pointer"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-extrabold text-slate-800 truncate">
                                  {cust.fullName || cust.userName || "Customer"}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {cust.email} {cust.mobile && `• ${cust.mobile}`}
                                </p>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0 ml-2">
                                #{cust._id.slice(-6)}
                              </span>
                            </button>
                          ))}
                        {allCustomers.filter(c => {
                          const q = customerSearch.toLowerCase();
                          return (
                            (c.fullName && c.fullName.toLowerCase().includes(q)) ||
                            (c.email && c.email.toLowerCase().includes(q)) ||
                            (c.userName && c.userName.toLowerCase().includes(q)) ||
                            (c._id && c._id.toLowerCase().includes(q))
                          );
                        }).length === 0 && (
                          <div className="p-3 text-center text-xs text-slate-400">
                            No customers matching "{customerSearch}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Customer Badges */}
                  {selectedCustomerChips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedCustomerChips.map(cust => (
                        <span
                          key={cust._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold shadow-2xs"
                        >
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>{cust.fullName || cust.email}</span>
                          <span className="text-[9px] font-mono text-emerald-600 font-extrabold">#{cust._id.slice(-6)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomerChip(cust._id)}
                            className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Advanced manual input / ID list */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Customer IDs / Emails (Comma separated or auto-populated)
                    </label>
                    <textarea 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#24672E] text-xs font-mono"
                      placeholder="e.g. 6aa7f6f2a696a27557f4d292 or f4d292 or user@email.com"
                      rows={2}
                      value={formData.selectedUsersListText}
                      onChange={(e) => setFormData({...formData, selectedUsersListText: e.target.value})}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Full IDs, 6-character short IDs (e.g. <code className="text-emerald-700 font-bold">f4d292</code>), and emails are automatically resolved.
                    </p>
                  </div>
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
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#27313D] rounded-xl outline-none focus:border-[#24672E] font-bold disabled:bg-slate-100 dark:disabled:bg-[#1A222D] disabled:text-slate-900 dark:disabled:text-[#FFD600] disabled:border-amber-300 dark:disabled:border-amber-500/50"
                    placeholder={formData.applicableUsers === "SPECIAL_MEMBER" ? "1 (Single Use)" : "e.g. 500 (No Limit)"}
                    disabled={formData.applicableUsers === "SPECIAL_MEMBER"}
                    value={formData.applicableUsers === "SPECIAL_MEMBER" ? "1" : formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  />
                  {formData.applicableUsers === "SPECIAL_MEMBER" && (
                    <span className="text-[11px] text-amber-700 dark:text-[#FFD600] font-black mt-1 block">🔒 Locked to 1 total use</span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 dark:text-slate-300 uppercase mb-1">Uses Per User Limit</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#27313D] rounded-xl outline-none focus:border-[#24672E] font-bold disabled:bg-slate-100 dark:disabled:bg-[#1A222D] disabled:text-slate-900 dark:disabled:text-[#FFD600] disabled:border-amber-300 dark:disabled:border-amber-500/50"
                    placeholder="1"
                    disabled={formData.applicableUsers === "SPECIAL_MEMBER"}
                    value={formData.applicableUsers === "SPECIAL_MEMBER" ? "1" : formData.perUserLimit}
                    onChange={(e) => setFormData({...formData, perUserLimit: e.target.value})}
                  />
                  {formData.applicableUsers === "SPECIAL_MEMBER" && (
                    <span className="text-[11px] text-amber-700 dark:text-[#FFD600] font-black mt-1 block">🔒 Locked to 1 per user</span>
                  )}
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponManager;
