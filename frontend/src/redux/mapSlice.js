import { createSlice } from "@reduxjs/toolkit";
import { User } from "lucide-react";


const mapSlice = createSlice({
    name:"User",
  initialState: {
    location:{
        lat:null,
        lon:null,
    },
    adress:null
},
    
  reducers: {
    setLocation:(state,action)=>{
        const{lat,lon}=action.payload
        state.location.lat=lat
        state.location.lon=lon
    },
    setAdress:(state,action)=>{
        state.adress=action.payload
    }
  },
});

export const {setAdress,setLocation} = mapSlice.actions;

export default mapSlice.reducer;


