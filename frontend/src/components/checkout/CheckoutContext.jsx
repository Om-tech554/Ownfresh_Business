import React, { createContext, useContext, useState } from 'react';
import { identifyCustomer } from '../../utils/analytics';

const CheckoutContext = createContext();

export const useCheckout = () => {
  return useContext(CheckoutContext);
};

export const CheckoutProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingDetails, setShippingDetailsState] = useState(() => {
    try {
      const savedDest = localStorage.getItem("oil_delivery_destination");
      const savedShip = localStorage.getItem("oil_shipping_details");
      const destParsed = savedDest ? JSON.parse(savedDest) : null;
      const shipParsed = savedShip ? JSON.parse(savedShip) : null;

      if (shipParsed) {
        return {
          ...shipParsed,
          city: destParsed?.city || shipParsed.city || '',
          state: destParsed?.state || shipParsed.state || '',
          zipCode: destParsed?.pincode || shipParsed.zipCode || '',
          address: destParsed?.address || shipParsed.address || '',
          latitude: destParsed?.latitude !== undefined ? destParsed.latitude : shipParsed.latitude,
          longitude: destParsed?.longitude !== undefined ? destParsed.longitude : shipParsed.longitude,
        };
      }

      if (destParsed) {
        return {
          fullName: '',
          companyName: '',
          email: '',
          phone: '',
          country: 'India',
          state: destParsed.state || '',
          city: destParsed.city || '',
          zipCode: destParsed.pincode || '',
          flatNo: '',
          address: destParsed.address || '',
          landmark: destParsed.district || '',
          latitude: destParsed.latitude,
          longitude: destParsed.longitude
        };
      }
    } catch (e) {}

    return {
      fullName: '',
      companyName: '',
      email: '',
      phone: '',
      country: 'India',
      state: '',
      city: '',
      zipCode: '',
      flatNo: '',
      address: '',
      landmark: '',
      latitude: null,
      longitude: null
    };
  });

  // Dynamically update shipping details when user logs in or profile transfers data
  React.useEffect(() => {
    const handleSync = () => {
      try {
        const savedDest = localStorage.getItem("oil_delivery_destination");
        const savedShip = localStorage.getItem("oil_shipping_details");
        const destParsed = savedDest ? JSON.parse(savedDest) : null;
        const shipParsed = savedShip ? JSON.parse(savedShip) : null;

        if (shipParsed || destParsed) {
          setShippingDetailsState((prev) => ({
            ...prev,
            ...(shipParsed || {}),
            city: destParsed?.city || shipParsed?.city || prev.city,
            state: destParsed?.state || shipParsed?.state || prev.state,
            zipCode: destParsed?.pincode || shipParsed?.zipCode || prev.zipCode,
            address: destParsed?.address || shipParsed?.address || prev.address,
            phone: shipParsed?.phone || prev.phone,
            fullName: shipParsed?.fullName || shipParsed?.name || prev.fullName,
            email: shipParsed?.email || prev.email,
            latitude: destParsed?.latitude ?? prev.latitude,
            longitude: destParsed?.longitude ?? prev.longitude,
          }));
        }
      } catch (e) {}
    };

    window.addEventListener("shippingDetailsChanged", handleSync);
    window.addEventListener("deliveryDestinationChanged", handleSync);
    return () => {
      window.removeEventListener("shippingDetailsChanged", handleSync);
      window.removeEventListener("deliveryDestinationChanged", handleSync);
    };
  }, []);

  const setShippingDetails = (newDetails) => {
    setShippingDetailsState((prev) => {
      const updated = typeof newDetails === 'function' ? newDetails(prev) : { ...prev, ...newDetails };
      try {
        localStorage.setItem("oil_shipping_details", JSON.stringify(updated));

        // Synchronize structured delivery destination
        const dest = {
          address: updated.address || "",
          city: updated.city || "",
          district: updated.landmark || updated.district || "",
          state: updated.state || "",
          pincode: updated.zipCode || updated.pincode || "",
          latitude: updated.latitude !== undefined && updated.latitude !== null ? Number(updated.latitude) : null,
          longitude: updated.longitude !== undefined && updated.longitude !== null ? Number(updated.longitude) : null,
          placeId: updated.placeId || ""
        };
        localStorage.setItem("oil_delivery_destination", JSON.stringify(dest));
        window.dispatchEvent(new Event("deliveryDestinationChanged"));

        if (updated.email || updated.phone || updated.fullName) {
          identifyCustomer(updated);
        }

        // Sync address to backend for cross-device OwnFresh persistence
        const rawUser = localStorage.getItem("oil_user");
        const token = localStorage.getItem("oil_token");
        if (rawUser && (dest.address || dest.city)) {
          const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");
          const headers = { "Content-Type": "application/json" };
          if (token) headers["Authorization"] = `Bearer ${token}`;
          fetch(`${API_BASE_URL}/api/user/sync-address`, {
            method: "POST",
            credentials: "include",
            headers,
            body: JSON.stringify({
              deliveryAddress: {
                text: [updated.address, updated.landmark, updated.city, updated.state, updated.zipCode].filter(Boolean).join(", "),
                street: updated.address || "",
                city: updated.city || "",
                state: updated.state || "",
                pincode: updated.zipCode || "",
                phone: updated.phone || "",
                landmark: updated.landmark || ""
              }
            })
          }).catch(() => {});
        }
      } catch (e) {}
      return updated;
    });
  };
  const [deliveryMethod, setDeliveryMethod] = useState({
    id: 'standard',
    name: 'Standard Delivery',
    estimatedTime: '5-7 Business Days'
  });
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [couponDetails, setCouponDetailsState] = useState(() => {
    try {
      const saved = localStorage.getItem("oil_applied_coupon");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isApplied) return parsed;
      }
    } catch (e) {}
    return {
      code: '',
      discount: 0,
      isApplied: false,
      requiresDeliveryCharge: false,
      applicableUsers: 'ALL_USERS'
    };
  });

  const setCouponDetails = (newDetails) => {
    setCouponDetailsState((prev) => {
      const updated = typeof newDetails === 'function' ? newDetails(prev) : newDetails;
      try {
        if (updated && updated.isApplied) {
          localStorage.setItem("oil_applied_coupon", JSON.stringify(updated));
        } else {
          localStorage.removeItem("oil_applied_coupon");
        }
      } catch (e) {}
      return updated;
    });
  };
  const [useWallet, setUseWallet] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);

  // Commission Coins State
  const [useCommissionCoins, setUseCommissionCoins] = useState(false);
  const [commissionCoinsBalance, setCommissionCoinsBalance] = useState(0);
  const [canRedeemCoins, setCanRedeemCoins] = useState(false);
  const [membershipInfo, setMembershipInfo] = useState(null);

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  const goToStep = (step) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(step);
  };

  const value = {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    shippingDetails,
    setShippingDetails,
    deliveryMethod,
    setDeliveryMethod,
    paymentMethod,
    setPaymentMethod,
    couponDetails,
    setCouponDetails,
    useWallet,
    setUseWallet,
    referralCode,
    setReferralCode,
    referralApplied,
    setReferralApplied,
    useCommissionCoins,
    setUseCommissionCoins,
    commissionCoinsBalance,
    setCommissionCoinsBalance,
    canRedeemCoins,
    setCanRedeemCoins,
    membershipInfo,
    setMembershipInfo
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};
