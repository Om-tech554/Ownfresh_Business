import React, { createContext, useContext, useState } from 'react';

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
  const [couponDetails, setCouponDetails] = useState({
    code: '',
    discount: 0,
    isApplied: false
  });
  const [useWallet, setUseWallet] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);

  // Commission Coins State
  const [useCommissionCoins, setUseCommissionCoins] = useState(false);
  const [commissionCoinsBalance, setCommissionCoinsBalance] = useState(0);
  const [canRedeemCoins, setCanRedeemCoins] = useState(false);

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
    setCanRedeemCoins
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};
