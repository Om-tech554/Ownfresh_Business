import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCheckout } from './CheckoutContext';
import { motion } from 'framer-motion';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSearchLocation } from 'react-icons/fa';
import { TbCurrentLocation } from 'react-icons/tb';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const apiKey = import.meta.env.VITE_GEOAPIKEY;

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  companyName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().min(2, 'Country is required'),
  state: z.string().min(2, 'State is required'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string().min(4, 'ZIP code is required'),
  address: z.string().min(5, 'Address is required'),
  landmark: z.string().optional(),
});

// Auto-center map component
const MapRefUpdater = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 15, { duration: 1 });
  }, [lat, lon, map]);
  return null;
};

const ShippingForm = () => {
  const { shippingDetails, setShippingDetails, nextStep } = useCheckout();
  
  const [lat, setLat] = useState(shippingDetails.latitude || 19.076);
  const [lon, setLon] = useState(shippingDetails.longitude || 72.8777);

  const getInitialCountryCode = (phone) => {
    if (!phone) return "+91";
    const codes = ["+91", "+1", "+44", "+971", "+61", "+65"];
    for (let c of codes) {
      if (phone.startsWith(c)) return c;
    }
    return "+91";
  };

  const initialCode = getInitialCountryCode(shippingDetails.phone);
  const [countryCode, setCountryCode] = useState(initialCode);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...shippingDetails,
      phone: shippingDetails.phone ? shippingDetails.phone.replace(initialCode, "") : ""
    },
  });

  const watchAddress = watch('address');

  const onSubmit = (data) => {
    const finalPhone = data.phone.startsWith("+") ? data.phone : countryCode + data.phone;
    setShippingDetails({ ...data, phone: finalPhone, latitude: lat, longitude: lon });
    nextStep();
  };

  const fetchAddressFromCoords = async (latitude, longitude) => {
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
      );
      const data = res.data.results[0];
      if (data) {
        setValue('address', data.address_line1 || data.street || '');
        setValue('city', data.city || data.county || '');
        setValue('state', data.state || '');
        setValue('zipCode', data.postcode || '');
        setValue('country', data.country || 'India');
      }
    } catch (err) {
      console.error('Reverse geocode error', err);
    }
  };

  const searchLocation = async () => {
    if (!watchAddress?.trim()) return toast.error('Enter an address to search');
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(watchAddress)}&format=json&apiKey=${apiKey}`
      );
      const results = res.data.results || res.data.features;
      if (!results || results.length === 0) return toast.error('Location not found');

      const place = results[0];
      const latitude = place.lat || place.geometry?.coordinates?.[1];
      const longitude = place.lon || place.geometry?.coordinates?.[0];

      if (latitude && longitude) {
        setLat(latitude);
        setLon(longitude);
        toast.success('Location found!');
      }
    } catch (err) {
      toast.error('Search failed');
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
        await fetchAddressFromCoords(pos.coords.latitude, pos.coords.longitude);
        toast.success('Location updated!');
      },
      () => toast.error('Unable to get location'),
      { enableHighAccuracy: true }
    );
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
    >
      <h2 className="text-2xl font-black text-gray-900 mb-6">Shipping Details</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
            <input 
              {...register('fullName')} 
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`}
              placeholder="John Doe"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name (Optional)</label>
            <input 
              {...register('companyName')} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
              placeholder="Your Company Ltd"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
            <input 
              {...register('email')} 
              type="email"
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
            <div className={`flex bg-gray-50 border rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-transparent transition-all overflow-hidden ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}>
              <div className="flex items-center pl-3 border-r border-gray-200 pr-2">
                <select
                  className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+65">🇸🇬 +65</option>
                </select>
              </div>
              <input 
                {...register('phone')} 
                type="tel"
                className="w-full px-4 py-3 bg-transparent outline-none"
                placeholder="9876543210"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Address</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Complete Shipping Address *</label>
              <div className="flex gap-2">
                <input 
                  {...register('address')} 
                  className={`flex-1 px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all ${errors.address ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder="Street address, P.O. box, room no, etc."
                />
                <button
                  type="button"
                  onClick={searchLocation}
                  className="px-4 bg-gray-900 text-white rounded-xl shadow hover:bg-yellow-500 hover:text-black transition flex items-center justify-center"
                  title="Search Location on Map"
                >
                  <FaSearchLocation className="text-lg" />
                </button>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="px-4 bg-gray-200 text-gray-800 rounded-xl shadow hover:bg-yellow-500 transition flex items-center justify-center"
                  title="Use Current Location"
                >
                  <TbCurrentLocation className="text-xl" />
                </button>
              </div>
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>

            <div className="md:col-span-2 rounded-xl border border-gray-200 overflow-hidden relative z-0 h-64">
              <MapContainer className="h-full w-full" center={[lat, lon]} zoom={15}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapRefUpdater lat={lat} lon={lon} />
                <DraggableMarker />
              </MapContainer>
              <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold rounded-lg shadow border border-gray-200">
                Drag marker to pinpoint exact location
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
              <input 
                {...register('country')} 
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all ${errors.country ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="India"
              />
              {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">State / Province *</label>
              <input 
                {...register('state')} 
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all ${errors.state ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="Maharashtra"
              />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
              <input 
                {...register('city')} 
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all ${errors.city ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="Mumbai"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP / Pincode *</label>
              <input 
                {...register('zipCode')} 
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all ${errors.zipCode ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="400001"
              />
              {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Landmark (Optional)</label>
              <input 
                {...register('landmark')} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                placeholder="Near the central park"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-8 py-4 bg-gray-900 text-white rounded-xl font-black hover:bg-yellow-500 hover:text-black transition-colors shadow-lg flex items-center gap-2"
          >
            Continue to Delivery
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ShippingForm;
