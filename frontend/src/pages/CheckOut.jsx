import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/userslice";

import { FaSearchLocation, FaWallet } from "react-icons/fa";
import { IoLocation } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { BsCreditCard2FrontFill } from "react-icons/bs";
import { serverUrl } from "../App";

import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet marker icon asset paths when bundled by Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const CheckOut = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const cartItems = useSelector((state) => state.user.cartItems);

  const { location } = useSelector((state) => state.map);
  const currentAddress = useSelector((state) => state.user.fullAddress);

  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  const [address, setAddress] = useState(currentAddress || "");
  const [room, setRoom] = useState("");
  const [area, setArea] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [lat, setLat] = useState(location?.lat || 19.076);
  const [lon, setLon] = useState(location?.lon || 72.8777);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWalletCheckbox, setUseWalletCheckbox] = useState(false);

  useEffect(() => {
    fetchWalletBalance();
  }, [user]);

  const fetchWalletBalance = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get(`${serverUrl}/api/wallet/my-wallet`, { withCredentials: true });
      if (data.success) {
        setWalletBalance(data.balance || 0);
      }
    } catch (err) {
      console.error("Wallet balance fetch error", err);
    }
  };

  const cartTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Reverse Geocode
  const fetchAddressFromCoords = async (latitude, longitude) => {
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
      );

      const data = res.data.results[0];
      setAddress(
        data.address_line2 || data.address_line1 || "Address not found"
      );
    } catch { }
  };

  // Search Location (Forward Geocoding)
  const searchLocation = async () => {
    if (!address.trim()) return toast.error("Enter a location");

    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          address
        )}&format=json&apiKey=${apiKey}`
      );

      const results = res.data.results || res.data.features;
      if (!results || results.length === 0)
        return toast.error("Location not found");

      const place = results[0];
      const latitude = place.lat || place.geometry?.coordinates?.[1];
      const longitude = place.lon || place.geometry?.coordinates?.[0];

      if (!latitude || !longitude)
        return toast.error("Failed to locate the place");

      setLat(latitude);
      setLon(longitude);
      setAddress(place.formatted || address);

      toast.success("Location found!");
    } catch {
      toast.error("Search failed");
    }
  };

  // GPS Button
  const getCurrentLocation = () => {
    if (!navigator.geolocation)
      return toast.error("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
        await fetchAddressFromCoords(pos.coords.latitude, pos.coords.longitude);
        toast.success("Location updated!");
      },
      () => toast.error("Unable to get location"),
      { enableHighAccuracy: true }
    );
  };

  // Auto-center map
  const MapRefUpdater = ({ lat, lon }) => {
    const map = useMap();
    useEffect(() => {
      map.flyTo([lat, lon], 15, { duration: 1 });
    }, [lat, lon]);
    return null;
  };

  // Draggable Marker
  const DraggableMarker = () => {
    const markerRef = useRef(null);
    return (
      <Marker
        draggable
        ref={markerRef}
        position={[lat, lon]}
        eventHandlers={{
          dragend() {
            const m = markerRef.current;
            if (m) {
              const newPos = m.getLatLng();
              setLat(newPos.lat);
              setLon(newPos.lng);
              fetchAddressFromCoords(newPos.lat, newPos.lng);
            }
          },
        }}
      />
    );
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Enter coupon code");
    setValidatingCoupon(true);
    try {
      const { data } = await axios.post(`${serverUrl}/api/coupon/validate`, {
        code: couponCode,
        amount: cartTotal
      }, { withCredentials: true });

      if (data.success) {
        setDiscount(data.discountAmount);
        setIsCouponApplied(true);
        toast.success(`Coupon applied! ₹${data.discountAmount} saved.`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon");
      setDiscount(0);
      setIsCouponApplied(false);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscount(0);
    setIsCouponApplied(false);
    toast.success("Coupon removed");
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Checkout Handler
  const checkout = async () => {
    if (!user) return toast.error("Login first");
    if (!address) return toast.error("Enter address");

    const finalAmount = cartTotal - discount;

    if (paymentMethod === "online") {
      const res = await loadRazorpayScript();
      if (!res) return toast.error("Razorpay SDK failed to load. Are you online?");

      try {
        const { data } = await axios.post(`${serverUrl}/api/payment/create-order`, {
          amount: finalAmount
        }, { withCredentials: true });

        if (!data.success) return toast.error("Failed to create order");

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SdpJSZtNnLHmjO",
          amount: data.order.amount,
          currency: "INR",
          name: "Own Fresh",
          description: "Online Payment",
          order_id: data.order.id,
          handler: async function (response) {
            try {
              const verifyRes = await axios.post(`${serverUrl}/api/payment/verify`, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              }, { withCredentials: true });

              if (verifyRes.data.success) {
                await placeOrderToDB(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
              }
            } catch (error) {
              toast.error("Payment Verification Failed");
            }
          },
          prefill: {
            name: user.fullName,
            email: user.email,
            contact: "9999999999"
          },
          theme: {
            color: "#eab308"
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

      } catch (error) {
        toast.error("Failed to initiate payment");
      }
    } else {
      await placeOrderToDB();
    }
  };

  const placeOrderToDB = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
      const { data } = await axios.post(`${serverUrl}/api/order/create`, {
        userId: user._id,
        items: cartItems,
        paymentMethod,
        deliveryAddress: {
          roomNumber: room,
          areaName: area,
          text: address,
          latitude: lat,
          longitude: lon,
        },
        totalAmount: cartTotal - discount,
        discountAmount: discount,
        couponCode: isCouponApplied ? couponCode : "",
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        useWallet: useWalletCheckbox
      }, { withCredentials: true });

      if (data.success) {
        toast.success("Order placed successfully!");
        dispatch(clearCart());
        navigate("/my-orders");
      }
    } catch (error) {
      toast.error("Order placement failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center px-4 py-10">
      <div className="w-full md:w-2/3 lg:w-1/2 bg-white rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-black text-center text-gray-900 uppercase">
          Checkout
        </h1>
        <div className="w-20 h-1 bg-yellow-500 mx-auto mt-2 mb-6" />

        {/* CUSTOMER INFO */}
        <div className="bg-gray-50 border p-5 rounded-xl mb-6">
          <h2 className="text-lg font-bold">Customer Details</h2>
          <p><b>Name:</b> {user?.fullName}</p>
          <p><b>Email:</b> {user?.email}</p>
        </div>

        {/* LOCATION */}
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <IoLocation className="text-yellow-600" /> Delivery Location
        </h2>

        <input
          type="text"
          placeholder="Room / Flat No"
          className="w-full mt-3 mb-3 px-4 py-3 rounded-xl border"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />

        <input
          type="text"
          placeholder="Area / Neighborhood"
          className="w-full mb-3 px-4 py-3 rounded-xl border"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />

        {/* ADDRESS INPUT + SEARCH + GPS */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Full Address / Search Location"
            className="w-full px-4 py-3 rounded-xl border"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <button
            onClick={searchLocation}
            className="p-3 bg-gray-200 rounded-xl shadow hover:bg-yellow-400"
          >
            <FaSearchLocation className="text-xl text-gray-800" />
          </button>

          <button
            onClick={getCurrentLocation}
            className="p-3 bg-gray-200 rounded-xl shadow hover:bg-yellow-400"
          >
            <TbCurrentLocation className="text-xl text-gray-800" />
          </button>
        </div>

        {/* MAP */}
        <div className="rounded-xl border overflow-hidden mb-8">
          <MapContainer className="h-64 w-full" center={[lat, lon]} zoom={15}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapRefUpdater lat={lat} lon={lon} />
            <DraggableMarker />
          </MapContainer>
        </div>

        {/* PAYMENT METHOD ICON BUTTONS */}
        <div className="bg-gray-50 border p-5 rounded-xl mb-6">
          <h2 className="text-lg font-bold mb-4">Payment Method</h2>

          <div className="grid grid-cols-2 gap-4">

            <button
              onClick={() => setPaymentMethod("cod")}
              className={`flex flex-col items-center p-4 rounded-xl border shadow transition 
                ${paymentMethod === "cod"
                  ? "bg-yellow-400 border-yellow-600"
                  : "bg-white"
                }`}
            >
              <FaWallet className="text-3xl mb-2 text-gray-800" />
              <span className="font-semibold">Cash on Delivery</span>
            </button>

            <button
              onClick={() => setPaymentMethod("online")}
              className={`flex flex-col items-center p-4 rounded-xl border shadow transition 
                ${paymentMethod === "online"
                  ? "bg-yellow-400 border-yellow-600"
                  : "bg-white"
                }`}
            >
              <BsCreditCard2FrontFill className="text-3xl mb-2 text-gray-800" />
              <span className="font-semibold">Online Payment</span>
            </button>

          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-gray-50 border p-5 rounded-xl mb-6">
          <h2 className="text-lg font-bold mb-3">Order Summary</h2>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover border"
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-gray-600 text-sm">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>

                <p className="font-bold">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          {/* COUPON SECTION */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Promotional Code</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Coupon Code"
                className="flex-1 px-4 py-2 border rounded-xl outline-none focus:border-yellow-500 uppercase font-bold"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={isCouponApplied}
              />
              {isCouponApplied ? (
                <button
                  onClick={removeCoupon}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold text-sm"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon}
                  className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-yellow-500 hover:text-black transition disabled:opacity-50"
                >
                  {validatingCoupon ? "..." : "Apply"}
                </button>
              )}
            </div>
          </div>

          {walletBalance > 0 && (
            <div className="mt-4 pt-4 border-t flex items-center justify-between bg-purple-50 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="use-wallet"
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                  checked={useWalletCheckbox}
                  onChange={(e) => setUseWalletCheckbox(e.target.checked)}
                />
                <label htmlFor="use-wallet" className="text-sm font-bold text-purple-950 cursor-pointer select-none">
                  Use Wallet Balance (Available: ₹{walletBalance})
                </label>
              </div>
              <span className="font-black text-purple-700">- ₹{Math.min(walletBalance, cartTotal - discount)}</span>
            </div>
          )}

          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between items-center text-gray-600">
              <span>Subtotal:</span>
              <span className="font-bold">₹{cartTotal}</span>
            </div>
            {isCouponApplied && (
              <div className="flex justify-between items-center text-green-600">
                <span>Discount:</span>
                <span className="font-bold">- ₹{discount}</span>
              </div>
            )}
            {useWalletCheckbox && walletBalance > 0 && (
              <div className="flex justify-between items-center text-purple-600">
                <span>Wallet Deduction:</span>
                <span className="font-bold">- ₹{Math.min(walletBalance, cartTotal - discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-xl font-black text-slate-900">Total payable:</span>
              <span className="text-2xl font-black text-yellow-600">₹{Math.max(0, cartTotal - discount - (useWalletCheckbox ? walletBalance : 0))}</span>
            </div>
          </div>
        </div>

        {/* CHECKOUT BUTTON */}
        <button
          onClick={checkout}
          className="w-full bg-gray-900 text-white py-5 rounded-xl font-black text-lg hover:bg-yellow-500 hover:text-black transition"
        >
          Place Order ({paymentMethod === "cod" ? "COD" : "Online"})
        </button>

      </div>
    </div>
  );
};

export default CheckOut;
