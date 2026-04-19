import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCity, setCurrentState, setCurrentAddress } from "../redux/userslice";
import { setLocation } from "../redux/mapSlice";

function useGetCity() {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    const fetchCityByCoords = async (latitude, longitude) => {
      try {
        const result = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
        );
        const data = result?.data?.results?.[0];
        if (data) {
          // Get the best available name: city, town, village, or suburb
          const cityName = data.city || data.town || data.village || data.suburb || data.county;
          dispatch(setCity(cityName));
          dispatch(setCurrentState(data.state));
          dispatch(setCurrentAddress(data.address_line2 || data.address_line1 || "Address not found"));
        }
      } catch (error) {
        console.error("Geoapify Error:", error);
        fetchCityByIP(); 
      }
    };

    const fetchCityByIP = async () => {
      try {
        const { data } = await axios.get("https://ipapi.co/json/");
        if (data) {
          const cityName = data.city || data.region || "Location Found";
          dispatch(setCity(cityName));
          dispatch(setCurrentState(data.region));
          dispatch(setCurrentAddress(`${data.city || ""}, ${data.region || ""}, ${data.country_name || ""}`));
        }
      } catch (error) {
        console.error("IP Location Fallback Error:", error);
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
          console.warn("Geolocation denied/failed, using IP fallback...");
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

