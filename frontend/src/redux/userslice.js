import { createSlice } from "@reduxjs/toolkit";
const userSlice = createSlice({
  name: "user",
  initialState: {
  userData: null,
  city: null,
  loading: true,
  cartCount: 0,
  cart: [],
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
    addToCart: (state, action) => {
      // Check if item already exists to increment quantity instead of duplicating
      const existingItem = state.cart.find(item => item._id === action.payload._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cart.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(item => item._id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, amount } = action.payload;
      const item = state.cart.find(item => item._id === id);
      if (item) {
        item.quantity = Math.max(1, item.quantity + amount);
      }
    }
  },
});

export const { setUserData,setCity, addToCart, removeFromCart, updateQuantity } = userSlice.actions;
export default userSlice.reducer;