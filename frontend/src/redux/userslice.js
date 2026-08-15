// import { createSlice } from "@reduxjs/toolkit";

// // SAFE LOCALSTORAGE PARSE
// let storedUser = null;
// try {
//   const raw = localStorage.getItem("oil_user");
//   if (raw && raw !== "undefined") {
//     storedUser = JSON.parse(raw);
//   }
// } catch (err) {
//   storedUser = null;
// }

// const userSlice = createSlice({
//   name: "user",
//   initialState: {
//     userData: storedUser,
//     city: null,
//     loading: false,
//     cartItems: JSON.parse(localStorage.getItem("oil_cart") || "[]"),
//   },
  

//   reducers: {
//     setUserData: (state, action) => {
//       state.userData = action.payload;
//       state.loading = false;

//       if (action.payload) {
//         localStorage.setItem("oil_user", JSON.stringify(action.payload));
//       }
//     },

//     clearUser: (state) => {
//       state.userData = null;
//       localStorage.removeItem("oil_user");
//     },

//     setCity: (state, action) => {
//       state.city = action.payload;
//     },

//     addToCart: (state, action) => {
//       const cartItem = action.payload;
//       const existingItem = state.cartItems.find(i => i._id === cartItem._id);

//       if (existingItem) {
//         existingItem.quantity += 1;
//       } else {
//         state.cartItems.push({ ...cartItem, quantity: 1 });
//       }

//       localStorage.setItem("oil_cart", JSON.stringify(state.cartItems));
//     },

//     updateQuantity: (state, action) => {
//       const { id, quantity } = action.payload;
//       const item = state.cartItems.find(i => i._id === id);

//       if (item && quantity > 0) {
//         item.quantity = quantity;
//       }

//       localStorage.setItem("oil_cart", JSON.stringify(state.cartItems));
//     },

//     removeFromCart: (state, action) => {
//       state.cartItems = state.cartItems.filter(item => item._id !== action.payload);
//       localStorage.setItem("oil_cart", JSON.stringify(state.cartItems));
//     },

//     clearCart: (state) => {
//       state.cartItems = [];
//       localStorage.removeItem("oil_cart");
//     }
//   },
// });

// export const {
//   setUserData,
//   clearUser,
//   setCity,
//   addToCart,
//   updateQuantity,
//   removeFromCart,
//   clearCart,
// } = userSlice.actions;

// export default userSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";

// SAFE LOCALSTORAGE PARSE
let storedUser = null;
try {
  const raw = localStorage.getItem("oil_user");
  if (raw && raw !== "undefined") {
    storedUser = JSON.parse(raw);
  }
} catch (err) {
  storedUser = null;
}

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: storedUser,
    city: null,
    stateName: null,        // ✅ ADDED
    fullAddress: null,      // ✅ ADDED
    loading: false,
    cartItems: JSON.parse(localStorage.getItem("oil_cart") || "[]"),
  },

  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.loading = false;

      if (action.payload) {
        localStorage.setItem("oil_user", JSON.stringify(action.payload));
      }
    },

    clearUser: (state) => {
      state.userData = null;
      state.cartItems = [];
      localStorage.removeItem("oil_user");
      localStorage.removeItem("oil_cart");
    },

    // CITY
    setCity: (state, action) => {
      state.city = action.payload;
    },

    // STATE (for Geo Location)
    setCurrentState: (state, action) => {
      state.stateName = action.payload;
    },

    // ADDRESS (line1 or line2)
    setCurrentAddress: (state, action) => {
      state.fullAddress = action.payload;
    },

    addToCart: (state, action) => {
      const cartItem = action.payload;
      const existingItem = state.cartItems.find(i => i._id === cartItem._id);

      if (existingItem) {
        existingItem.quantity += cartItem.quantity || 1;
      } else {
        state.cartItems.push(cartItem);
      }

      localStorage.setItem("oil_cart", JSON.stringify(state.cartItems));
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find(i => i._id === id);

      if (item && quantity > 0) {
        item.quantity = quantity;
      }

      localStorage.setItem("oil_cart", JSON.stringify(state.cartItems));
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(item => item._id !== action.payload);
      localStorage.setItem("oil_cart", JSON.stringify(state.cartItems));
    },

    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem("oil_cart");
    }
  },
});

export const {
  setUserData,
  clearUser,
  setCity,

  // ⭐ NEW EXPORTS ⭐
  setCurrentState,
  setCurrentAddress,

  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = userSlice.actions;

export default userSlice.reducer;
