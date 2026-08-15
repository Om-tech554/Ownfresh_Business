import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import {
  X,
  Plus,
  Trash2,
  User,
  MapPin,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Ban
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const CreateManualOrderModal = ({ isOpen, onClose, onSuccess }) => {
  const [loadingVariants, setLoadingVariants] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allVariants, setAllVariants] = useState([]);

  // Form state
  const [customerDetails, setCustomerDetails] = useState({
    fullName: "",
    mobile: "",
    email: "",
  });

  const [deliveryAddress, setDeliveryAddress] = useState({
    roomNumber: "",
    areaName: "",
    text: "",
    phone: "",
  });

  // Selected Line Items
  const [orderItems, setOrderItems] = useState([]);

  // Variant selector states
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);

  // Financials & Settings
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);

  // Customer search states
  const [allCustomers, setAllCustomers] = useState([]);
  const [searchCustomerQuery, setSearchCustomerQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [clientType, setClientType] = useState("Non-GST");
  const [couponCode, setCouponCode] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  
  // Format current local date for datetime-local input (YYYY-MM-DDTHH:mm)
  const getCurrentLocalDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [orderDate, setOrderDate] = useState(getCurrentLocalDateTime());
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentStatus, setPaymentStatus] = useState("completed");
  const [status, setStatus] = useState("delivered");
  const [deductStock, setDeductStock] = useState(true);
  const [adminNotes, setAdminNotes] = useState("WhatsApp / Manual Offline Order");
  const [transactionId, setTransactionId] = useState("");

  // Listen for ESC key press to easily cancel/close popup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchVariants();
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/user/admin/all`, {
        withCredentials: true,
      });
      if (data.success) {
        setAllCustomers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  const handleSelectCustomer = (cust) => {
    setCustomerDetails({
      fullName: cust.fullName || "",
      mobile: cust.mobile || "",
      email: cust.email || "",
      userId: cust._id
    });
    setDeliveryAddress((prev) => ({
      ...prev,
      phone: cust.mobile || prev.phone || ""
    }));
    setClientType(cust.clientType || "Non-GST");
    setSearchCustomerQuery(cust.fullName || "");
    setShowCustomerDropdown(false);
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    const toastId = toast.loading("Validating coupon...");
    try {
      setCouponValidating(true);
      const payload = {
        code: couponCode.trim().toUpperCase(),
        amount: subtotal,
      };
      if (customerDetails.userId) {
        payload.userId = customerDetails.userId;
      }
      const { data } = await axios.post(`${serverUrl}/api/coupon/validate`, payload, {
        withCredentials: true
      });
      if (data.success) {
        setDiscountAmount(data.discountAmount || 0);
        toast.success(`Coupon applied! Saved ₹${data.discountAmount}`, { id: toastId });
      }
    } catch (err) {
      console.error("Coupon validation error:", err);
      toast.error(err.response?.data?.message || "Invalid coupon code", { id: toastId });
    } finally {
      setCouponValidating(false);
    }
  };

  const fetchVariants = async () => {
    try {
      setLoadingVariants(true);
      const { data } = await axios.get(`${serverUrl}/api/inventory/variants/all`, {
        withCredentials: true,
      });
      if (data.success) {
        setAllVariants(data.variants || []);
      }
    } catch (err) {
      console.error("Failed to fetch variants:", err);
      toast.error("Failed to load product variants.");
    } finally {
      setLoadingVariants(false);
    }
  };

  // Auto-fill phone in address if modified
  const handleCustomerPhoneChange = (val) => {
    setCustomerDetails((prev) => ({ ...prev, mobile: val }));
    setDeliveryAddress((prev) => ({ ...prev, phone: val }));
  };

  // Add Item to Manual Order Cart
  const handleAddItem = () => {
    if (!selectedVariantId) {
      toast.error("Please select a product variant!");
      return;
    }
    const variant = allVariants.find((v) => v._id === selectedVariantId);
    if (!variant) return;

    const unitPrice = Number(variant.salePrice || variant.price || 0);
    const existingIndex = orderItems.findIndex((item) => item.variantId === variant._id);

    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += Number(selectedQty);
      setOrderItems(updated);
    } else {
      const newItem = {
        productId: variant.product?._id || variant.product || null,
        variantId: variant._id,
        name: variant.product?.name || "Product",
        variantName: variant.name || "Standard",
        price: unitPrice,
        quantity: Number(selectedQty) || 1,
        image: variant.product?.image || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1/blogs/default_placeholder",
      };
      setOrderItems([...orderItems, newItem]);
    }

    toast.success(`Added ${variant.product?.name || "Product"} (${variant.name})`);
    setSelectedVariantId("");
    setSelectedQty(1);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleQtyChange = (index, delta) => {
    const updated = [...orderItems];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      handleRemoveItem(index);
    } else {
      updated[index].quantity = newQty;
      setOrderItems(updated);
    }
  };

  // Calculate Subtotal & Total
  const subtotal = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [orderItems]);

  const isGST = clientType === "GST";

  useEffect(() => {
    if (isGST) {
      const taxable = Math.max(0, subtotal - Number(discountAmount || 0));
      const calculatedCgst = taxable * 0.025;
      const calculatedSgst = taxable * 0.025;
      setCgst(calculatedCgst);
      setSgst(calculatedSgst);
      setTaxAmount(calculatedCgst + calculatedSgst);
    } else {
      setCgst(0);
      setSgst(0);
      setTaxAmount(0);
    }
  }, [isGST, subtotal, discountAmount]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - Number(discountAmount || 0) + Number(taxAmount || 0));
  }, [subtotal, discountAmount, taxAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerDetails.fullName.trim()) {
      toast.error("Customer Full Name is required!");
      return;
    }
    if (!customerDetails.mobile.trim() && !customerDetails.email.trim()) {
      toast.error("Customer Mobile or Email is required!");
      return;
    }
    if (orderItems.length === 0) {
      toast.error("Please add at least 1 product item to the order!");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customerDetails,
        deliveryAddress: {
          ...deliveryAddress,
          text: deliveryAddress.text || `${deliveryAddress.roomNumber} ${deliveryAddress.areaName}`.trim() || "Offline Address",
        },
        items: orderItems,
        paymentMethod,
        paymentStatus,
        status,
        orderDate: new Date(orderDate).toISOString(),
        discountAmount: Number(discountAmount) || 0,
        taxAmount: Number(taxAmount) || 0,
        cgst: Number(cgst) || 0,
        sgst: Number(sgst) || 0,
        couponCode: couponCode ? couponCode.trim().toUpperCase() : "",
        adminNotes,
        transactionId,
        deductStock,
        clientType,
      };

      const { data } = await axios.post(`${serverUrl}/api/order/admin/create-manual`, payload, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success(`Manual Order #${data.order.customOrderId || ""} created & tallied!`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Create manual order error:", err);
      toast.error(err.response?.data?.msg || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          
          {/* Animated Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer"
          />

          {/* Animated Popup Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col font-sans relative z-10 my-auto"
          >
            
            {/* Modal Header Bar */}
            <div className="sticky top-0 bg-white z-20 px-8 py-5 border-b border-gray-100 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EFDB27] text-black flex items-center justify-center font-black shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">
                    Create Manual / WhatsApp Order
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    Record offline orders & tally sequential books accurately
                  </p>
                </div>
              </div>

              {/* Styled Top Right Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Cancel & Close Modal (Esc)"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8 flex-1">
              
              {/* SECTION 1: Customer Info */}
              <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <User className="w-4 h-4 text-emerald-600" /> Customer Information
                </h3>

                {/* Search Customer Input */}
                <div className="relative mb-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    Lookup Registered Customer (Search by Name/Mobile/Email)
                  </label>
                  <input
                    type="text"
                    placeholder="Type name, email or phone to search..."
                    value={searchCustomerQuery}
                    onChange={(e) => {
                      setSearchCustomerQuery(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-bold focus:border-[#24672E] outline-none transition-all bg-white"
                  />
                  
                  {showCustomerDropdown && searchCustomerQuery.trim() !== "" && (
                    <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-30 divide-y divide-gray-100">
                      {allCustomers
                        .filter(
                          (c) =>
                            c.fullName?.toLowerCase().includes(searchCustomerQuery.toLowerCase()) ||
                            c.email?.toLowerCase().includes(searchCustomerQuery.toLowerCase()) ||
                            c.mobile?.includes(searchCustomerQuery)
                        )
                        .map((cust) => (
                          <div
                            key={cust._id}
                            onClick={() => handleSelectCustomer(cust)}
                            className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors text-black font-semibold"
                          >
                            <div>
                              <span className="font-bold text-slate-900">{cust.fullName}</span>
                              <span className="text-[10px] text-gray-500 ml-2">({cust.mobile || cust.email})</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${cust.clientType === "GST" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                              {cust.clientType || "Non-GST"}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={customerDetails.fullName}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, fullName: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-bold focus:border-black outline-none transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={customerDetails.mobile}
                      onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-bold focus:border-black outline-none transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. ramesh@gmail.com"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-medium focus:border-black outline-none transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Client Type *
                    </label>
                    <select
                      value={clientType}
                      onChange={(e) => setClientType(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-bold focus:border-black outline-none transition-all bg-white cursor-pointer"
                    >
                      <option value="Non-GST">Non-GST Client</option>
                      <option value="GST">GST Registered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Delivery Address */}
              <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Shipping / Delivery Address
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      House / Room / Flat No
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 302, Green Heights"
                      value={deliveryAddress.roomNumber}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, roomNumber: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-medium focus:border-black outline-none transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Area / Street / City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MG Road, Near City Mall, Mumbai"
                      value={deliveryAddress.areaName}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, areaName: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-medium focus:border-black outline-none transition-all bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Select Products & Line Items Cart */}
              <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" /> Order Items & Product Variants
                </h3>

                {/* Product Variant Picker */}
                <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200">
                  <div className="flex-1 w-full">
                    <select
                      disabled={loadingVariants}
                      value={selectedVariantId}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none p-2 cursor-pointer"
                    >
                      <option value="">-- Select Product & Variant --</option>
                      {allVariants.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.product?.name || "Product"} - {v.name} (₹{v.salePrice || v.price} | Stock: {v.stockQuantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 border border-gray-300 rounded-lg p-1.5 text-center text-xs font-bold outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                </div>

                {/* Cart Items Table */}
                {orderItems.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold uppercase tracking-wider">No Items Added Yet</p>
                    <p className="text-[11px] text-gray-400">Select a variant above and click "+ Add Item"</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100/70 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3">Variant</th>
                          <th className="p-3 text-right">Price</th>
                          <th className="p-3 text-center">Quantity</th>
                          <th className="p-3 text-right">Subtotal</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {orderItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-3 flex items-center gap-2">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-9 h-9 object-cover rounded-lg border border-gray-200"
                              />
                              <span className="font-bold text-slate-900">{item.name}</span>
                            </td>
                            <td className="p-3 text-gray-600 font-bold">{item.variantName}</td>
                            <td className="p-3 text-right font-bold text-gray-800">₹{item.price}</td>
                            <td className="p-3 text-center">
                              <div className="inline-flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg">
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(idx, -1)}
                                  className="w-5 h-5 bg-white rounded-md flex items-center justify-center text-xs font-black shadow-xs hover:bg-gray-200"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-bold">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(idx, 1)}
                                  className="w-5 h-5 bg-white rounded-md flex items-center justify-center text-xs font-black shadow-xs hover:bg-gray-200"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-right font-black text-slate-900">
                              ₹{item.price * item.quantity}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* SECTION 4: Financial Adjustments & Book Tallying Controls */}
              <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Book Tallying & Payment Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Order Timestamp Override */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Order Date & Time (For Book Tallying)
                    </label>
                    <input
                      type="datetime-local"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-bold focus:border-black outline-none transition-all bg-white"
                    />
                    <span className="text-[9px] text-gray-400 mt-1 block">
                      Set past/exact date to tally books sequentially.
                    </span>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-bold focus:border-black outline-none transition-all bg-white cursor-pointer"
                    >
                      <option value="cod">Cash on Delivery (COD)</option>
                      <option value="online">Online / UPI / NetBanking</option>
                      <option value="cash">Cash Offline</option>
                      <option value="whatsapp">WhatsApp Order</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-bold focus:border-black outline-none transition-all bg-white cursor-pointer"
                    >
                      <option value="completed">Completed (Paid)</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Order Status */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Order Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-bold focus:border-black outline-none transition-all bg-white cursor-pointer"
                    >
                      <option value="delivered">Delivered</option>
                      <option value="shipped">Shipped</option>
                      <option value="processing">Processing</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  {/* Apply Coupon Code */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Apply Promo/Coupon
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. OFF50"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 border-2 border-gray-200 rounded-xl p-2 text-xs font-bold focus:border-black uppercase outline-none transition-all bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleValidateCoupon}
                        disabled={couponValidating}
                        className="bg-slate-950 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {couponValidating ? "..." : "Apply"}
                      </button>
                    </div>
                  </div>

                  {/* Discount Amount */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-bold focus:border-black outline-none transition-all bg-white"
                    />
                  </div>

                  {/* Tax / GST */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      {isGST ? "GST Tax (5% Auto Calc)" : "Tax / Shipping Charge (₹)"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      disabled={isGST}
                      placeholder="0"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(Number(e.target.value) || 0)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-bold focus:border-black outline-none transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Custom UTR / Ref */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      UPI UTR / Payment Ref ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UTR123456789"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-medium focus:border-black outline-none transition-all bg-white"
                    />
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Internal Admin Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Offline customer WhatsApp order #54"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs font-medium focus:border-black outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Deduct Stock Checkbox */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <input
                    type="checkbox"
                    id="deductStockToggle"
                    checked={deductStock}
                    onChange={(e) => setDeductStock(e.target.checked)}
                    className="w-4 h-4 rounded-md text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="deductStockToggle" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Automatically deduct variant stock quantity for this order
                  </label>
                </div>
              </div>

              {/* SECTION 5: Summary Card & Action Buttons */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                    Order Financial Calculation
                  </span>
                  <div className="flex flex-wrap items-baseline gap-4 mt-1">
                    <span className="text-xs text-gray-300">
                      Subtotal: <strong className="text-white">₹{subtotal}</strong>
                    </span>
                    {discountAmount > 0 && (
                      <span className="text-xs text-emerald-400">
                        Discount: -₹{discountAmount}
                      </span>
                    )}
                    {clientType === "GST" ? (
                      <>
                        <span className="text-xs text-purple-300">
                          CGST (2.5%): +₹{cgst.toFixed(2)}
                        </span>
                        <span className="text-xs text-purple-300">
                          SGST (2.5%): +₹{sgst.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      taxAmount > 0 && (
                        <span className="text-xs text-amber-400">
                          Tax/Shipping: +₹{taxAmount}
                        </span>
                      )
                    )}
                  </div>
                  <p className="text-2xl font-black text-white mt-1">
                    Total Payable: <span className="text-[#EFDB27]">₹{finalTotal}</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full md:w-auto bg-[#EFDB27] text-black font-black uppercase text-xs tracking-widest px-8 py-3.5 rounded-2xl hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {submitting ? "Processing Entry..." : "Create Order & Record Entry"}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateManualOrderModal;
