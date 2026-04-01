import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";
import Navbar from "../components/Navbar";
import { Package, Clock, CheckCircle2, Truck, XCircle, MapPin, ChevronRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const MyOrders = () => {
    const user = useSelector((state) => state.user.userData);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/order/my-orders`, { withCredentials: true });
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Fetch orders failed", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending": return <Clock className="w-4 h-4 text-amber-500" />;
            case "processing": return <Package className="w-4 h-4 text-blue-500" />;
            case "shipped": return <Truck className="w-4 h-4 text-indigo-500" />;
            case "delivered": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
            case "processing": return "bg-blue-50 text-blue-700 border-blue-200";
            case "shipped": return "bg-indigo-50 text-indigo-700 border-indigo-200";
            case "delivered": return "bg-green-50 text-green-700 border-green-200";
            case "cancelled": return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="flex flex-col items-center justify-center pt-40">
                <div className="w-12 h-12 border-4 border-[#F9DD19] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 font-black uppercase tracking-widest text-slate-400 text-xs">Loading Orders...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            
            <div className="max-w-5xl mx-auto pt-32 pb-20 px-4 md:px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                            My <span className="text-[#F9DD19]">Orders</span>
                        </h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Track your wellness journey</p>
                    </div>
                    <Link to="/shop" className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-[#F9DD19] hover:text-black transition-all">
                        New Order
                    </Link>
                </div>

                {!orders || orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="text-slate-300 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase">No orders yet</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Start your journey to botanic purity by exploring our premium range of oils.</p>
                        <Link to="/shop" className="mt-6 inline-block bg-[#F9DD19] text-black font-black uppercase tracking-widest text-[11px] px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-yellow-200 transition-all">
                            Go to Shop
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                {/* Order Header */}
                                <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-slate-50 p-2.5 rounded-2xl">
                                            <Package className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID: {order._id.substring(order._id.length - 8).toUpperCase()}</p>
                                            <p className="text-xs font-bold text-slate-600 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    
                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase truncate">{item.name}</h4>
                                                    <p className="text-xs font-bold text-slate-500 mt-0.5">Qty: {item.quantity} × ₹{item.price}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-slate-900 font-mono">₹{item.price * item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Footer */}
                                <div className="p-6 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <MapPin size={14} />
                                        <p className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[200px]">
                                            {order.deliveryAddress?.areaName || order.deliveryAddress?.text}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                                            <p className="text-xl font-black text-slate-900 font-mono">₹{order.totalAmount}</p>
                                        </div>
                                        <Link to={`/order-details/${order._id}`} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#F9DD19] hover:bg-yellow-50 transition-all text-slate-400 hover:text-black">
                                            <ChevronRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
