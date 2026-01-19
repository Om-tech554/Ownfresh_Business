import React, { useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { FaSearchengin } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { serverUrl } from '../App';
import { auth } from '../../firebase';
import { setUserData } from '../redux/userslice';
const Navbar = () => {
    const { userData,city } = useSelector(state => state.user)
    const [showInfo, setShowInfo] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const dispatch=useDispatch()
    const handleLogOut=async () => {
        try {
            const result=await axios.get(`${serverUrl}/api/auth/signout`,{withCredentials:true})
            dispatch(setUserData(null))
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[999]
        bg-[#fff9f6] overflow-visible'>
            {/* Mobile Search Bar view */}

            {showSearch && <div className='w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] flex fixed top-[80px] left[5%] md:hidden'>
                <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
                    <FaLocationDot size={25} className='text-[#ff4d2d]' />
                    <div className='w-80% truncate text-gray-600'>{city}</div>
                </div>
                {/* ----------Mobile Search Bar View-------- */}
                <div className='w-[80%] flex items-center gap-[10px] '>
                    <FaSearchengin size={25} className='text-[#FFD700]' />
                    <input type="text" placeholder='Search Fresh Oils' className='text-gray-700 outline-0 w-full' />
                </div>
            </div>}

            {/* -----------Desktop View--------- */}
            <h1 className='text-3xl font-bold mb-2 text-[#FFD700]'>OwnyFresh</h1>
            <div className='md:w-[60%] lg:w-{40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] hidden md:flex'>
                <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
                    <FaLocationDot size={25} className='text-[#ff4d2d]' />
                    <div className='w-80% truncate text-gray-600'>{city}</div>
                </div>
                {/* ----------Search Bar-------- */}
                <div className='w-[80%] flex items-center gap-[10px] '>
                    <FaSearchengin size={25} className='text-[#FFD700]' />
                    <input type="text" placeholder='Search Fresh Oils' className='text-gray-700 outline-0 w-full' />
                </div>
            </div>
            {/* ---------------Cart----------- */}
            <div className='flex items-center gap-4'>
                {showSearch ? <RxCross2 size={30} className='text-[#FFD700]  md:hidden' onClick={() => setShowSearch(false)} /> : <FaSearchengin size={30} className='text-[#FFD700]  md:hidden' onClick={() => setShowSearch(true)} />}
                <div className='relative cursor-pointer '>
                    <FaCartShopping size={25} className='text-[#FFD700] transition-all duration-200 active:scale-95' />
                    <span className='absolute right-[-8px] top-[-17px] text-[#ff4d2d]'>0</span>
                </div>
                <button
                    className="hidden md:block px-5 py-2 rounded-xl text-sm font-bold bg-[#ff3d2d] text-white shadow-lg shadow-red-200 transition-all duration-200 hover:bg-[#e63626] active:scale-95">
                    My Orders
                </button>
                {/* ---------Mobile View---------- */}
                <div className='w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] 
            shadow-xl font-semibold cursor-pointer transition-all duration-200 hover:bg-[#e63626] active:scale-95' onClick={() => setShowInfo(prev => !prev)}>
                    {userData?.fullName.slice(0, 1)}
                </div>
                {showInfo && <div className='fixed top-[80px] right-[10px] md:right-[10%] lg:right-[10%] w-[180px] bg-white shadow-2xl
            rounded-xl p-[20px] flex flex-col gap-[10px] z-[999]'>
                    <div className='text-[17px] font-semibold'>{userData.fullName}</div>
                    <div className='md:hidden text-[#ff4d2d] font-semibold cursor-pointer'>My Order</div>
                    <div className='text-[#ff4d2d] font-semibold cursor-pointer'onClick={handleLogOut}>Sign Out</div>
                </div>}

            </div>
        </div>
    )
}

export default Navbar
