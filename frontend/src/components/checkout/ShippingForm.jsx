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
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  country: z.string().min(2, 'Country is required'),
  state: z.string().min(2, 'State is required'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string().regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit PIN code'),
  flatNo: z.string().min(1, 'Flat / House / Building No. is required'),
  address: z.string().min(5, 'Street Address is required'),
  landmark: z.string().min(2, 'Landmark / Area is required'),
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
    toast.success("Shipping address & coordinates saved! 🪔 Proceeding to delivery...", {
      icon: "📍",
      style: { borderRadius: "14px", background: "#181818", color: "#FFDD00", border: "1px solid #FFDD00" }
    });
    nextStep();
  };

  const fetchAddressFromCoords = async (latitude, longitude) => {
    let success = false;
    if (apiKey) {
      try {
        const res = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
        );
        const data = res.data.results?.[0];
        if (data) {
          setValue('address', data.address_line1 || data.street || data.formatted || '');
          setValue('city', data.city || data.county || '');
          setValue('state', data.state || '');
          setValue('zipCode', data.postcode || '');
          setValue('country', data.country || 'India');
          success = true;
        }
      } catch (err) {
        console.warn('Geoapify reverse geocode failed, using fallback...', err.message);
      }
    }

    if (!success) {
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const addr = res.data.address;
        if (addr) {
          setValue('address', res.data.display_name?.split(',')[0] || addr.road || addr.suburb || '');
          setValue('city', addr.city || addr.town || addr.village || addr.county || '');
          setValue('state', addr.state || '');
          setValue('zipCode', addr.postcode || '');
          setValue('country', addr.country || 'India');
        }
      } catch (err) {
        console.error('Reverse geocode error', err);
      }
    }
  };

  const searchLocation = async () => {
    if (!watchAddress?.trim()) return toast.error('Enter an address to search');
    let found = false;

    if (apiKey) {
      try {
        const res = await axios.get(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(watchAddress)}&format=json&apiKey=${apiKey}`
        );
        const results = res.data.results || res.data.features;
        if (results && results.length > 0) {
          const place = results[0];
          const latitude = place.lat || place.geometry?.coordinates?.[1];
          const longitude = place.lon || place.geometry?.coordinates?.[0];
          if (latitude && longitude) {
            setLat(latitude);
            setLon(longitude);
            if (place.city || place.state) {
              setValue('city', place.city || place.county || '');
              setValue('state', place.state || '');
              setValue('zipCode', place.postcode || '');
              setValue('country', place.country || 'India');
            }
            toast.success('Location found on map!');
            found = true;
          }
        }
      } catch (err) {
        console.warn('Geoapify search failed, using fallback...', err.message);
      }
    }

    if (!found) {
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(watchAddress)}`
        );
        if (res.data && res.data.length > 0) {
          const place = res.data[0];
          const latitude = parseFloat(place.lat);
          const longitude = parseFloat(place.lon);
          setLat(latitude);
          setLon(longitude);
          toast.success('Location found on map!');
          found = true;
        } else {
          toast.error('Location not found on map');
        }
      } catch (err) {
        toast.error('Search failed. Please try again.');
      }
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    toast.loading('Fetching your location...', { id: 'geo-toast' });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newLat = pos.coords.latitude;
        const newLon = pos.coords.longitude;
        setLat(newLat);
        setLon(newLon);
        await fetchAddressFromCoords(newLat, newLon);
        toast.success('Location updated to your current position!', { id: 'geo-toast' });
      },
      () => toast.error('Unable to retrieve your location', { id: 'geo-toast' }),
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
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  {...register('address')} 
                  className={`flex-1 px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all ${errors.address ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder="Street address, colony, area name, etc."
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={searchLocation}
                    className="flex-1 sm:flex-initial px-4 py-3 bg-gray-900 text-white rounded-xl shadow hover:bg-yellow-500 hover:text-black transition flex items-center justify-center gap-2 font-bold text-xs"
                    title="Search Location on Map"
                  >
                    <FaSearchLocation className="text-base" />
                    <span className="sm:hidden">Search Address</span>
                  </button>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="flex-1 sm:flex-initial px-4 py-3 bg-gray-200 text-gray-800 rounded-xl shadow hover:bg-yellow-500 transition flex items-center justify-center gap-2 font-bold text-xs"
                    title="Use Current Location"
                  >
                    <TbCurrentLocation className="text-lg" />
                    <span className="sm:hidden">My Location</span>
                  </button>
                </div>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Flat / House No. / Building *</label>
              <input 
                {...register('flatNo')} 
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all ${errors.flatNo ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="e.g. Flat 402, Building A"
              />
              {errors.flatNo && <p className="text-red-500 text-xs mt-1">{errors.flatNo.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Landmark / Area *</label>
              <input 
                {...register('landmark')} 
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all ${errors.landmark ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="e.g. Near HDFC Bank, Sector 5"
              />
              {errors.landmark && <p className="text-red-500 text-xs mt-1">{errors.landmark.message}</p>}
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
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 via-[#FFDD00] to-amber-600 text-slate-950 rounded-xl font-black text-sm uppercase tracking-wider hover:from-yellow-400 hover:to-amber-500 transition-all shadow-lg hover:shadow-yellow-500/30 flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
          >
            <span>Continue to Delivery</span>
            <span className="text-lg">🪔</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ShippingForm;
