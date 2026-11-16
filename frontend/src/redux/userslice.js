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

let storedDestination = null;
try {
  const destRaw = localStorage.getItem("oil_delivery_destination");
  if (destRaw && destRaw !== "undefined") {
    storedDestination = JSON.parse(destRaw);
  } else {
    // Fallback migration check from saved shipping details if address exists
    const shipRaw = localStorage.getItem("oil_shipping_details");
    if (shipRaw && shipRaw !== "undefined") {
      const parsed = JSON.parse(shipRaw);
      if (parsed.address || parsed.city || parsed.state || parsed.latitude) {
        storedDestination = {
          address: parsed.address || "",
          city: parsed.city || "",
          district: parsed.landmark || "",
          state: parsed.state || "",
          pincode: parsed.zipCode || parsed.pincode || "",
          latitude: parsed.latitude || null,
          longitude: parsed.longitude || null,
          placeId: ""
        };
      }
    }
  }
} catch (err) {
  storedDestination = null;
}

// Non-blocking helper to sync cart across OwnFresh devices
export const syncCartToBackend = (cartItems) => {
  try {
    const rawUser = localStorage.getItem("oil_user");
    const token = localStorage.getItem("oil_token");
    if (!rawUser) return;
    const user = JSON.parse(rawUser);
    if (!user?._id) return;

    const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_BASE_URL}/api/user/sync-cart`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ cart: cartItems, cartItems: cartItems })
    }).catch(() => {});
  } catch (e) {}
};

// Non-blocking helper to sync address across OwnFresh devices
export const syncAddressToBackend = (deliveryAddress) => {
  try {
    const rawUser = localStorage.getItem("oil_user");
    const token = localStorage.getItem("oil_token");
    if (!rawUser) return;
    const user = JSON.parse(rawUser);
    if (!user?._id) return;

    const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_BASE_URL}/api/user/sync-address`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ deliveryAddress })
    }).catch(() => {});
  } catch (e) {}
};

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: storedUser,
    city: null,
    stateName: null,        // Device state
    fullAddress: null,      // Device address
    currentUserLocation: null, // Device physical coordinates & location object
    deliveryDestination: storedDestination, // Selected order delivery destination (source of truth for shipping)
    loading: false,
    cartItems: JSON.parse(localStorage.getItem("oil_cart") || "[]"),
  },

  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.loading = false;

      if (action.payload) {
        localStorage.setItem("oil_user", JSON.stringify(action.payload));
        if (action.payload.token) {
          localStorage.setItem("oil_token", action.payload.token);
        }

        // 1. Cross-Device Transferable Cart:
        // Automatically populate or smart-merge cart so user2 on another device sees user1's cart instantly
        if (Array.isArray(action.payload.cart) && action.payload.cart.length > 0) {
          if (!state.cartItems || state.cartItems.length === 0) {
            state.cartItems = action.payload.cart;
          } else {
            // Smart merge server items with local items
            const merged = [...state.cartItems];
            action.payload.cart.forEach((serverItem) => {
              const existingIdx = merged.findIndex(
                (i) =>
                  (i._id && serverItem._id && i._id === serverItem._id) ||
                  (i.productId &&
                    serverItem.productId &&
                    i.productId === serverItem.productId &&
                    i.variantName === serverItem.variantName)
              );
              if (existingIdx === -1) {
                merged.push(serverItem);
              }
            });
            state.cartItems = merged;
          }
          try {
            localStorage.setItem("oil_cart", JSON.stringify(state.cartItems));
            window.dispatchEvent(new Event("cartUpdated"));
          } catch (e) {}
        } else if (state.cartItems && state.cartItems.length > 0) {
          // If server cart is currently empty but client has active items, upload to backend
          syncCartToBackend(state.cartItems);
        }

        // 2. Cross-Device Transferable Delivery Address & Phone:
        // Populate deliveryDestination and shippingDetails automatically
        if (action.payload.deliveryAddress) {
          const addr = action.payload.deliveryAddress;
          const formattedDest = {
            address: addr.street || addr.address || addr.text || "",
            city: addr.city || "",
            district: addr.landmark || addr.district || "",
            state: addr.state || "",
            pincode: addr.pincode || addr.zipCode || "",
            latitude: addr.latitude || null,
            longitude: addr.longitude || null,
            placeId: addr.placeId || ""
          };
          state.deliveryDestination = formattedDest;
          try {
            localStorage.setItem("oil_delivery_destination", JSON.stringify(formattedDest));
          } catch (e) {}

          // Also populate oil_shipping_details for instant checkout without manual work
          try {
            const rawShip = localStorage.getItem("oil_shipping_details");
            const existingShip = rawShip ? JSON.parse(rawShip) : {};
            const mergedShip = {
              ...existingShip,
              fullName: action.payload.fullName || addr.fullName || existingShip.fullName || existingShip.name || "",
              name: action.payload.fullName || addr.fullName || existingShip.name || "",
              phone: action.payload.mobile || addr.phone || existingShip.phone || "",
              email: action.payload.email || existingShip.email || "",
              address: addr.street || addr.address || addr.text || existingShip.address || "",
              city: addr.city || existingShip.city || "",
              state: addr.state || existingShip.state || "",
              zipCode: addr.pincode || addr.zipCode || existingShip.zipCode || "",
              landmark: addr.landmark || existingShip.landmark || ""
            };
            localStorage.setItem("oil_shipping_details", JSON.stringify(mergedShip));
            window.dispatchEvent(new Event("shippingDetailsChanged"));
            window.dispatchEvent(new Event("deliveryDestinationChanged"));
          } catch (e) {}
        } else if (action.payload.mobile) {
          // Pre-populate phone in shipping details if available
          try {
            const rawShip = localStorage.getItem("oil_shipping_details");
            const existingShip = rawShip ? JSON.parse(rawShip) : {};
            existingShip.phone = action.payload.mobile;
            existingShip.fullName = action.payload.fullName || existingShip.fullName || "";
            existingShip.email = action.payload.email || existingShip.email || "";
            localStorage.setItem("oil_shipping_details", JSON.stringify(existingShip));
            window.dispatchEvent(new Event("shippingDetailsChanged"));
          } catch (e) {}
        }
      }
    },

    clearUser: (state) => {
      state.userData = null;
      state.cartItems = [];
      localStorage.removeItem("oil_user");
      localStorage.removeItem("oil_cart");
      localStorage.removeItem("oil_applied_coupon");
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

    // PHYSICAL DEVICE CURRENT LOCATION
    setCurrentUserLocation: (state, action) => {
      state.currentUserLocation = action.payload;
    },

    // SELECTED ORDER DELIVERY DESTINATION
    setDeliveryDestination: (state, action) => {
      state.deliveryDestination = action.payload;
      if (action.payload) {
        try {
          localStorage.setItem("oil_delivery_destination", JSON.stringify(action.payload));
        } catch (e) {}
      } else {
        localStorage.removeItem("oil_delivery_destination");
      }
    },

    clearDeliveryDestination: (state) => {
      state.deliveryDestination = null;
      localStorage.removeItem("oil_delivery_destination");
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
      syncCartToBackend(state.cartItems);
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find(i => i._id === id);

      if (item && quantity > 0) {
        item.quantity = quantity;
      }

      localStorage.setItem("oil_cart", JSON.stringify(state.cartItems));
      syncCartToBackend(state.cartItems);
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(item => item._id !== action.payload);
      localStorage.setItem("oil_cart", JSON.stringify(state.cartItems));
      syncCartToBackend(state.cartItems);
    },

    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem("oil_cart");
      localStorage.removeItem("oil_applied_coupon");
      syncCartToBackend([]);
    }
  },
});

export const {
  setUserData,
  clearUser,
  setCity,
  setCurrentState,
  setCurrentAddress,
  setCurrentUserLocation,
  setDeliveryDestination,
  clearDeliveryDestination,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = userSlice.actions;

export default userSlice.reducer;
