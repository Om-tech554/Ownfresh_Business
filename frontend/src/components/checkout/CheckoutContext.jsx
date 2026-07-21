import React, { createContext, useContext, useState } from 'react';

const CheckoutContext = createContext();

export const useCheckout = () => {
  return useContext(CheckoutContext);
};

export const CheckoutProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingDetails, setShippingDetails] = useState({
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
    latitude: 19.076,
    longitude: 72.8777
  });
  const [deliveryMethod, setDeliveryMethod] = useState({
    id: 'standard',
    name: 'Standard Delivery',
    cost: 0,
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

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const goToStep = (step) => setCurrentStep(step);

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
    setReferralApplied
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};
