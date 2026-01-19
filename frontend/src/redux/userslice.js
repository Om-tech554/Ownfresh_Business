import { createSlice } from "@reduxjs/toolkit";
const userSlice = createSlice({
  name: "user",
  initialState: {
  userData: null,
  city: null,
  loading: true
  },
  reducers: {
    setUserData: (state, action) => {
    state.userData = action.payload;
    state.loading = false;
    },
    clearUser: (state) => {
    state.userData = null;
    state.loading = false;
  },
    setCity:(state, action) => {
      state.city = action.payload;
    },
  },
});

export const { setUserData,setCity } = userSlice.actions;
export default userSlice.reducer;