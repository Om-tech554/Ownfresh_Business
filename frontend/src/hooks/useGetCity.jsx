import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCity, setCurrentState, setCurrentAddress } from "../redux/userslice";
import { setLocation } from "../redux/mapSlice";

function useGetCity() {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      dispatch(setLocation({ lat: latitude, lon: longitude }));

      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
      );

      const data = result?.data?.results?.[0];
      console.log("Geo Data:", data);

      dispatch(setCity(data?.city));
      dispatch(setCurrentState(data?.state));
      dispatch(
        setCurrentAddress(
          data?.address_line2 || data?.address_line1 || "Address not found"
        )
      );
    });
  }, []); // ✅ run once
}

export default useGetCity;

