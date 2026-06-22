import axios from "axios";
import { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData, clearUser } from "../redux/userslice"; 

function useGetCurrentUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      // Logic for fetching current user session 

      try {
        const result = await axios.get(
          `${serverUrl}/api/user/current`,
          { withCredentials: true }
        );

        if (result.data) {
          dispatch(setUserData(result.data));
        }
      } catch (error) {
        // ONLY log out if the server definitively says 'Unauthorized' (401)
        if (error.response && error.response.status === 401) {
          console.log("Session verified as expired by server. Logging out.");
          dispatch(clearUser());
        } else {
          // If it's a network error (500, timeout, etc.), DO NOT log the user out.
          // Keep the current stored session so they don't lose their data.
          console.warn("Server check failed, but keeping session for stability:", error.message);
        }
      }
    };

    fetchUser();
  }, [dispatch]);
}

export default useGetCurrentUser;
