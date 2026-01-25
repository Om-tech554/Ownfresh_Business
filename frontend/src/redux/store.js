// import { configureStore } from "@reduxjs/toolkit";
// import userslice from "./userslice"
// export const store = configureStore({
//     userslice:userslice
// })
import { configureStore } from "@reduxjs/toolkit";
import userslice from "./userslice";
import mapSlice from "./mapSlice";
export const store = configureStore({
  reducer: {
    user: userslice, // key name is up to you
    map: mapSlice,
  },
});
