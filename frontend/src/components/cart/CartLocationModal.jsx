import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Search, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setDeliveryDestination } from '../../redux/userslice';

const apiKey = import.meta.env.VITE_GEOAPIKEY;

const POPULAR_DESTINATIONS = [
  { name: 'Pune (Local)', city: 'Pune', state: 'Maharashtra', pincode: '411041', lat: 18.4485, lon: 73.8183, tag: 'Local Delivery' },
  { name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', lat: 19.0760, lon: 72.8777, tag: 'Courier Delivery' },
  { name: 'Nashik', city: 'Nashik', state: 'Maharashtra', pincode: '422001', lat: 19.9975, lon: 73.7898, tag: 'Courier Delivery' },
  { name: 'Nagpur', city: 'Nagpur', state: 'Maharashtra', pincode: '440001', lat: 21.1458, lon: 79.0882, tag: 'Courier Delivery' },
  { name: 'Delhi', city: 'Delhi', state: 'Delhi', pincode: '110001', lat: 28.6139, lon: 77.2090, tag: 'Interstate Courier' },
  { name: 'Bangalore', city: 'Bangalore', state: 'Karnataka', pincode: '560001', lat: 12.9716, lon: 77.5946, tag: 'Interstate Courier' },
];

const CartLocationModal = ({ isOpen, onClose, currentDestination, onSelectDestination }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  if (!isOpen) return null;

  const saveDestination = (dest, successMsg = 'Delivery destination updated!') => {
    dispatch(setDeliveryDestination(dest));
    try {
      localStorage.setItem('oil_delivery_destination', JSON.stringify(dest));
      // Also sync partial details into shipping details for checkout continuity
      const existingShip = JSON.parse(localStorage.getItem('oil_shipping_details') || '{}');
      localStorage.setItem(
        'oil_shipping_details',
        JSON.stringify({
          ...existingShip,
          city: dest.city || existingShip.city || '',
          state: dest.state || existingShip.state || '',
          zipCode: dest.pincode || existingShip.zipCode || '',
          address: dest.address || existingShip.address || '',
          latitude: dest.latitude,
          longitude: dest.longitude
        })
      );
      window.dispatchEvent(new Event('deliveryDestinationChanged'));
    } catch (e) {}

    if (onSelectDestination) {
      onSelectDestination(dest);
    }
    toast.success(successMsg, {
      icon: '📍',
      style: { borderRadius: '14px', background: '#181818', color: '#FFDD00', border: '1px solid #FFDD00' }
    });
    onClose();
  };

  // OPTION A: Search Current Location (GPS)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser.');
    }

    setIsLocating(true);
    const toastId = toast.loading('Acquiring your current GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        let detectedCity = '';
        let detectedState = '';
        let detectedPincode = '';
        let detectedAddress = '';

        // Reverse-geocode via Geoapify
        if (apiKey) {
          try {
            const res = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
            );
            if (res.ok) {
              const data = (await res.json())?.results?.[0];
              if (data) {
                detectedCity = data.city || data.county || data.suburb || '';
                detectedState = data.state || '';
                detectedPincode = data.postcode || '';
                detectedAddress = data.address_line1 || data.formatted || '';
              }
            }
          } catch (err) {
            console.warn('Geoapify reverse geocode failed:', err);
          }
        }

        // Fallback to OpenStreetMap
        if (!detectedCity && !detectedState) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            if (res.ok) {
              const json = await res.json();
              const addr = json?.address;
              if (addr) {
                detectedCity = addr.city || addr.town || addr.village || addr.county || '';
                detectedState = addr.state || '';
                detectedPincode = addr.postcode || '';
                detectedAddress = json.display_name?.split(',')[0] || '';
              }
            }
          } catch (err) {
            console.warn('OSM reverse geocode failed:', err);
          }
        }

        setIsLocating(false);
        toast.dismiss(toastId);

        const newDest = {
          address: detectedAddress || 'Current GPS Location',
          city: detectedCity || 'Pune',
          district: '',
          state: detectedState || 'Maharashtra',
          pincode: detectedPincode || '',
          latitude,
          longitude,
          placeId: ''
        };

        saveDestination(newDest, 'Delivery destination set to your current location!');
      },
      (err) => {
        setIsLocating(false);
        toast.dismiss(toastId);
        console.warn('Geolocation Error:', err);
        toast.error('Unable to retrieve location. Please check browser location permissions.');
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // OPTION B: Search Location by City / Pincode / Address
  const handleSearchLocation = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      return toast.error('Please enter a city, pincode, or address to search');
    }

    setIsSearching(true);
    const toastId = toast.loading(`Searching "${query}"...`);

    let found = false;
    let newDest = null;

    // 1. Try Geoapify
    if (apiKey) {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&format=json&apiKey=${apiKey}`
        );
        if (res.ok) {
          const json = await res.json();
          const place = json.results?.[0] || json.features?.[0];
          if (place) {
            const lat = place.lat || place.geometry?.coordinates?.[1];
            const lon = place.lon || place.geometry?.coordinates?.[0];
            newDest = {
              address: place.address_line1 || place.formatted || query,
              city: place.city || place.county || place.state_district || query,
              district: place.county || '',
              state: place.state || '',
              pincode: place.postcode || '',
              latitude: Number(lat) || null,
              longitude: Number(lon) || null,
              placeId: place.place_id || ''
            };
            found = true;
          }
        }
      } catch (err) {
        console.warn('Geoapify search error:', err);
      }
    }

    // 2. Try Nominatim Fallback
    if (!found) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const place = data[0];
            newDest = {
              address: place.display_name?.split(',')[0] || query,
              city: place.display_name?.split(',')[0] || query,
              district: '',
              state: place.display_name?.includes('Maharashtra') ? 'Maharashtra' : '',
              pincode: '',
              latitude: parseFloat(place.lat) || null,
              longitude: parseFloat(place.lon) || null,
              placeId: place.place_id ? String(place.place_id) : ''
            };
            found = true;
          }
        }
      } catch (err) {
        console.warn('OSM search error:', err);
      }
    }

    setIsSearching(false);
    toast.dismiss(toastId);

    if (found && newDest) {
      saveDestination(newDest, `Delivery destination set to ${newDest.city || newDest.address}!`);
    } else {
      // Fallback: If search API didn't locate coordinates, record query as destination
      const manualDest = {
        address: query,
        city: query,
        district: '',
        state: query.toLowerCase().includes('maharashtra') ? 'Maharashtra' : '',
        pincode: /^\d{6}$/.test(query) ? query : '',
        latitude: null,
        longitude: null,
        placeId: ''
      };
      saveDestination(manualDest, `Delivery destination set to ${query}!`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl text-white relative overflow-hidden"
        >
          {/* Subtle Golden Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-white">
                  Delivery Destination
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Where should your stone-pressed edible oil be delivered?
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Option A: Search Current Location Button */}
          <div className="mb-4 relative z-10">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="w-full p-3.5 bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-400/30 border border-amber-400/40 rounded-2xl flex items-center justify-between transition-all group cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Navigation size={18} className={isLocating ? 'animate-spin' : ''} />
                </div>
                <div>
                  <span className="block text-xs font-black uppercase tracking-wider text-amber-300">
                    Use My Current Location
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Use device GPS coordinates for delivery
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                Auto-Detect
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 my-4 relative z-10">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              or search destination
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Option B: Search City / Pincode / Address */}
          <form onSubmit={handleSearchLocation} className="mb-5 relative z-10">
            <div className="flex items-center gap-2 bg-slate-800/90 border border-white/10 focus-within:border-amber-400 rounded-2xl p-1.5 transition-all">
              <Search size={18} className="text-slate-400 ml-2.5 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter city, locality, or 6-digit PIN code (e.g. Pune, 411041)..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none px-2 py-2"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-amber-400 hover:bg-yellow-300 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow cursor-pointer flex-shrink-0 active:scale-95"
              >
                {isSearching ? 'Searching...' : 'Apply'}
              </button>
            </div>
          </form>

          {/* Quick Hub Presets */}
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400" /> Quick Select Delivery Hubs:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_DESTINATIONS.map((dest) => {
                const isSelected =
                  currentDestination &&
                  (currentDestination.city?.toLowerCase() === dest.city.toLowerCase() ||
                    (dest.lat && currentDestination.latitude === dest.lat));

                return (
                  <button
                    key={dest.name}
                    type="button"
                    onClick={() =>
                      saveDestination({
                        address: `${dest.city}, ${dest.state}`,
                        city: dest.city,
                        district: '',
                        state: dest.state,
                        pincode: dest.pincode,
                        latitude: dest.lat,
                        longitude: dest.lon,
                        placeId: ''
                      })
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md'
                        : 'bg-slate-800/50 hover:bg-slate-800 border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold leading-tight">{dest.name}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{dest.tag}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-amber-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CartLocationModal;
