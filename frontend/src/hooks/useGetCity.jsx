import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCity, setCurrentState, setCurrentAddress } from "../redux/userslice";
import { setLocation } from "../redux/mapSlice";

function useGetCity() {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    const fetchCityByCoords = async (latitude, longitude) => {
      let success = false;

      // 1. Primary: Geoapify reverse geocoding
      if (apiKey) {
        try {
          const res = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
          );
          if (res.ok) {
            const result = await res.json();
            const data = result?.results?.[0];
            if (data) {
              const cityName = data.city || data.town || data.village || data.suburb || data.county;
              if (cityName) {
                dispatch(setCity(cityName));
                dispatch(setCurrentState(data.state || ""));
                dispatch(setCurrentAddress(data.address_line2 || data.address_line1 || "Address found"));
                success = true;
              }
            }
          }
        } catch (error) {
          console.warn("Geoapify reverse geocode request failed, using OpenStreetMap fallback...", error?.message || error);
        }
      }

      // 2. Secondary fallback: OpenStreetMap Nominatim reverse geocoding
      if (!success) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data?.address;
            if (addr) {
              const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state_district;
              if (cityName) {
                dispatch(setCity(cityName));
                dispatch(setCurrentState(addr.state || ""));
                dispatch(setCurrentAddress(data.display_name || "Address found"));
                success = true;
              }
            }
          }
        } catch (err) {
          console.warn("OpenStreetMap reverse geocode fallback failed, trying BigDataCloud...", err?.message || err);
        }
      }

      // 3. Tertiary fallback: BigDataCloud free client reverse geocoding
      if (!success) {
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (res.ok) {
            const data = await res.json();
            if (data) {
              const cityName = data.city || data.locality || data.principalSubdivision;
              if (cityName) {
                dispatch(setCity(cityName));
                dispatch(setCurrentState(data.principalSubdivision || ""));
                const addrStr = [data.locality, data.city, data.principalSubdivision].filter(Boolean).join(", ");
                dispatch(setCurrentAddress(addrStr || "Address found"));
                success = true;
              }
            }
          }
        } catch (err) {
          console.warn("BigDataCloud reverse geocode fallback failed...", err?.message || err);
        }
      }

      // 4. Final fallback: IP-based location if coordinate geocoding fails completely
      if (!success) {
        fetchCityByIP();
      }
    };

    const fetchCityByIP = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          const cityName = data.city || data.region || "Location Found";
          dispatch(setCity(cityName));
          dispatch(setCurrentState(data.region || ""));
          dispatch(setCurrentAddress(`${data.city || ""}, ${data.region || ""}, ${data.country_name || ""}`.replace(/^,\s*/, '')));
          return;
        }
      } catch (error) {
        console.warn("ipapi.co failed, trying ip-api.com fallback...", error?.message || error);
      }

      try {
        const res2 = await fetch("https://ip-api.com/json/");
        if (res2.ok) {
          const data = await res2.json();
          const cityName = data.city || data.regionName || "Location Found";
          dispatch(setCity(cityName));
          dispatch(setCurrentState(data.regionName || ""));
          dispatch(setCurrentAddress(`${data.city || ""}, ${data.regionName || ""}, ${data.country || ""}`.replace(/^,\s*/, '')));
        }
      } catch (err2) {
        console.error("IP Location Fallback Error:", err2);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setLocation({ lat: latitude, lon: longitude }));
          fetchCityByCoords(latitude, longitude);
        },
        (error) => {
          console.warn("Geolocation denied/failed, using IP fallback...", error);
          fetchCityByIP();
        },
        { timeout: 10000 }
      );
    } else {
      fetchCityByIP();
    }
  }, []);
}

export default useGetCity;

