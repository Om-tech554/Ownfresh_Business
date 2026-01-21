// import React, { useState } from 'react'
// import React, { useState } from 'react'
// import { FaLocationDot, FaCartShopping, FaPlus, FaSearchengin } from "react-icons/fa6";
// import { useDispatch, useSelector } from 'react-redux';
// import { RxCross2 } from "react-icons/rx";
// import { LuReceiptIndianRupee } from "react-icons/lu";
// import { FaMicroblog } from "react-icons/fa";
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom'; // Added for navigation

// import { serverUrl } from '../App';
// import { setUserData } from '../redux/userslice';
// import AddProduct from "./admin/AddProduct";
// import AddBlog from "./admin/AddBlog";

// const Navbar = () => {
//     // 1. UPDATED SELECTOR: We now pull 'cart' instead of 'cartCount'
//     // We set cart = [] as a backup so the app doesn't crash if it's empty
//     const { userData, city, cart = [] } = useSelector(state => state.user)

//     const [showInfo, setShowInfo] = useState(false)
//     const [showSearch, setShowSearch] = useState(false)
//     const [showAddProduct, setShowAddProduct] = useState(false);
//     const [showAddBlog, setShowAddBlog] = useState(false);

//     const dispatch = useDispatch()
//     const navigate = useNavigate()

//     // 2. UPDATED CALCULATION: This replaces 'cartCount'
//     // It looks at every item in your cart array and adds up their quantities
//     const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

//     const handleLogOut = async () => {
//         try {
//             await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
//             dispatch(setUserData(null))
//         } catch (error) {
//             console.log(error)
//         }
//     }

//     return (
//         <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[999] bg-[#fff9f6]'>

//             <h1 className='text-3xl font-bold mb-2 text-[#FFD700] cursor-pointer' onClick={() => navigate('/')}>
//                 OwnyFresh
//             </h1>

//             {/* Desktop Search Bar (User Only) */}
//             {userData?.role === "user" && (
//                 <div className='md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] hidden md:flex'>
//                     <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
//                         <FaLocationDot size={25} className='text-[#ff4d2d]' />
//                         <div className='w-80% truncate text-gray-600'>{city}</div>
//                     </div>
//                     <div className='w-[80%] flex items-center gap-[10px]'>
//                         <FaSearchengin size={25} className='text-[#FFD700]' />
//                         <input type="text" placeholder='Search Fresh Oils' className='text-gray-700 outline-0 w-full' />
//                     </div>
//                 </div>
//             )}

//             <div className='flex items-center gap-4'>
//                 {/* Mobile Search Toggle */}
//                 {userData?.role === "user" && (
//                     <div className='md:hidden'>
//                         {showSearch ? 
//                             <RxCross2 size={30} className='text-[#FFD700]' onClick={() => setShowSearch(false)} /> : 
//                             <FaSearchengin size={30} className='text-[#FFD700]' onClick={() => setShowSearch(true)} />
//                         }
//                     </div>
//                 )}

//                 {/* ADMIN TOOLS */}
//                 {userData?.role === "admin" ? (
//                     <>
//                         <button onClick={() => setShowAddProduct(true)} className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#ff4d2d] text-white rounded-full hover:bg-[#e63626] transition-all">
//                             <FaPlus /> <span>Add Product</span>
//                         </button>
//                         <button onClick={() => setShowAddBlog(true)} className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#ff4d2d] text-white rounded-full hover:bg-[#e63626] transition-all">
//                             <FaPlus /> <span>Add Blog</span>
//                         </button>

//                         {/* Pending Orders Badge */}
//                         <div className='relative px-3 py-1 rounded-lg bg-[#ff4d2d] text-white flex items-center gap-2'>
//                             <LuReceiptIndianRupee size={20} />
//                             <span className='absolute -right-2 -top-2 text-xs font-bold bg-black rounded-full px-1.5'>0</span>
//                         </div>
//                     </>
//                 ) : (
//                     /* USER TOOLS (CART) */
//                     <>
//                         <div className='relative cursor-pointer' onClick={() => navigate('/cart')}>
//                             <FaCartShopping size={25} className='text-[#FFD700] transition-all active:scale-95' />
//                             {/* 3. UPDATED BADGE: Shows the real quantity from Redux */}
//                             {totalItems > 0 && (
//                                 <span className='absolute right-[-10px] top-[-15px] bg-[#ff4d2d] text-white text-[12px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#fff9f6]'>
//                                     {totalItems}
//                                 </span>
//                             )}
//                         </div>
//                         <button className="hidden md:block px-5 py-2 rounded-xl text-sm font-bold bg-[#ff3d2d] text-white shadow-lg">
//                             My Orders
//                         </button>
//                     </>
//                 )}

//                 {/* Profile Avatar */}
//                 <div className='w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white font-semibold cursor-pointer shadow-lg' 
//                      onClick={() => setShowInfo(!showInfo)}>
//                     {userData?.fullName?.slice(0, 1)}
//                 </div>

//                 {/* User Dropdown Menu */}
//                 {showInfo && (
//                     <div className='fixed top-[80px] right-[20px] w-[180px] bg-white shadow-2xl rounded-xl p-[20px] flex flex-col gap-[10px] z-[999] border border-gray-100'>
//                         <div className='text-[15px] font-bold text-gray-800 border-b pb-2'>{userData?.fullName}</div>
//                         <div className='text-[#ff4d2d] font-semibold cursor-pointer hover:translate-x-1 transition-transform' onClick={handleLogOut}>Sign Out</div>
//                     </div>
//                 )}
//             </div>

//             {/* Modals */}
//             {showAddProduct && <AddProduct onClose={() => setShowAddProduct(false)} />}
//             {showAddBlog && <AddBlog onClose={() => setShowAddBlog(false)} />}
//         </div>
//     )
// }

// export default Navbar

import React, { useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { FaSearchengin } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { serverUrl } from '../App';
import { setUserData } from '../redux/userslice';
import { FaPlus } from "react-icons/fa6";
import { LuReceiptIndianRupee } from "react-icons/lu";
import AddProduct from "./admin/AddProduct";
import AddBlog from "./admin/AddBlog";
import { FaMicroblog } from "react-icons/fa";

const Navbar = () => {
    // Corrected Selector: Destructured 'cart' so it can be used in the calculation
    const { userData, city, cart = [] } = useSelector(state => state.user)
    const [showInfo, setShowInfo] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showAddBlog, setShowAddBlog] = useState(false);

    // UPDATED CALCULATION: Accurately counts items in the cart array
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
            setShowInfo(false)
        } catch (error) {
            console.log(error)
        }
    }

    // Common animation class for reuse
    const btnAnimation = "transition-all duration-200 active:scale-95";

    return (
        <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[999] bg-[#fff9f6]'>
            
            {/* Mobile Search Bar view */}
            {showSearch && userData?.role === "user" && (
                <div className='w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] flex fixed top-[80px] left-[5%] md:hidden px-4'>
                    <div className='flex items-center w-[40%] overflow-hidden gap-[10px] border-r-[2px] border-gray-400'>
                        <FaLocationDot size={25} className='text-[#ff4d2d]' />
                        <div className='truncate text-gray-600'>{city}</div>
                    </div>
                    <div className='w-[60%] flex items-center gap-[10px] '>
                        <FaSearchengin size={25} className='text-[#FFD700]' />
                        <input type="text" placeholder='Search Fresh Oils' className='text-gray-700 outline-0 w-full' />
                    </div>
                </div>
            )}

            {/* Logo */}
            <h1 className={`text-3xl font-bold mb-2 text-[#FFD700] cursor-pointer ${btnAnimation}`} onClick={() => navigate('/')}>
                OwnyFresh
            </h1>

            {/* Desktop Search View */}
            {userData?.role === "user" && (
                <div className='md:w-[60%] lg:w-[40%] h-[60px] bg-white shadow-xl rounded-lg items-center gap-[20px] hidden md:flex border border-gray-100'>
                    <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
                        <FaLocationDot size={25} className='text-[#ff4d2d]' />
                        <div className='w-full truncate text-gray-600 font-medium'>{city}</div>
                    </div>
                    <div className='w-[70%] flex items-center gap-[10px] px-2'>
                        <FaSearchengin size={25} className='text-[#FFD700]' />
                        <input type="text" placeholder='Search Fresh Oils' className='text-gray-700 outline-0 w-full bg-transparent' />
                    </div>
                </div>
            )}

            {/* Right Side Icons/Actions */}
            <div className='flex items-center gap-4'>
                {userData?.role === "user" && (
                    <div className={`md:hidden cursor-pointer ${btnAnimation}`}>
                        {showSearch ? 
                            <RxCross2 size={30} className='text-[#FFD700]' onClick={() => setShowSearch(false)} /> : 
                            <FaSearchengin size={30} className='text-[#FFD700]' onClick={() => setShowSearch(true)} />
                        }
                    </div>
                )}

                {userData?.role === "admin" ? (
                    <>
                        <button onClick={() => setShowAddProduct(true)} className={`hidden md:flex items-center gap-2 px-4 py-2 bg-[#ff4d2d] text-white rounded-full font-bold shadow-md ${btnAnimation}`}>
                            <FaPlus /> <span>Add Product</span>
                        </button>
                        <button onClick={() => setShowAddBlog(true)} className={`hidden md:flex items-center gap-2 px-4 py-2 bg-[#ff4d2d] text-white rounded-full font-bold shadow-md ${btnAnimation}`}>
                            <FaPlus /> <span>Add Blog</span>
                        </button>

                        <button onClick={() => setShowAddProduct(true)} className={`md:hidden flex p-2 rounded-full bg-[#ff4d2d] text-white shadow-md ${btnAnimation}`}>
                            <FaPlus size={20} />
                        </button>
                        <button onClick={() => setShowAddBlog(true)} className={`md:hidden flex p-2 rounded-full bg-[#ff4d2d] text-white shadow-md ${btnAnimation}`}>
                            <FaMicroblog size={20} />
                        </button>

                        <div className={`relative px-3 py-1 rounded-lg bg-[#ff4d2d] font-medium text-white shadow-md cursor-pointer ${btnAnimation}`}>
                            <LuReceiptIndianRupee size={22} />
                            <span className='absolute -right-2 -top-3 text-xs font-bold text-white bg-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white'>0</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={`relative cursor-pointer ${btnAnimation}`} onClick={() => navigate('/cart')}>
                            <FaCartShopping size={28} className='text-[#FFD700]' />
                            {totalItems > 0 && (
                                <span className='absolute -right-2 -top-3 bg-[#ff4d2d] text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#fff9f6]'>
                                    {totalItems}
                                </span>
                            )}
                        </div>
                        <button className={`hidden md:block px-5 py-2 rounded-xl text-sm font-bold bg-[#ff4d2d] text-white shadow-lg ${btnAnimation}`}>
                            My Orders
                        </button>
                    </>
                )}

                {/* Profile Avatar */}
                <div className={`w-[42px] h-[42px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-lg font-bold shadow-md cursor-pointer border-2 border-white ${btnAnimation}`} onClick={() => setShowInfo(!showInfo)}>
                    {userData?.fullName?.slice(0, 1).toUpperCase()}
                </div>

                {/* User Dropdown Menu */}
                {showInfo && (
                    <div className='fixed top-[85px] right-[10px] md:right-[5%] lg:right-[10%] w-[200px] bg-white shadow-2xl rounded-2xl p-5 flex flex-col gap-4 z-[999] border border-gray-100 animate-in fade-in slide-in-from-top-2'>
                        <div className='flex flex-col border-b border-gray-100 pb-2'>
                            <span className='text-xs text-gray-400 uppercase font-bold tracking-wider'>Account</span>
                            <span className='text-[15px] font-black text-gray-800 truncate uppercase'>{userData?.fullName}</span>
                        </div>
                        
                        {/* My Order - Now properly displayed for all devices including mobile */}
                        <div className={`md:hidden flex items-center gap-2 text-slate-700 font-bold cursor-pointer hover:text-[#ff4d2d] ${btnAnimation}`}>
                            <LuReceiptIndianRupee size={18} className='text-[#ff4d2d]' />
                            <span>My Orders</span>
                        </div>
                        
                        <div className={`text-[#ff4d2d] font-black text-sm cursor-pointer pt-2 border-t border-gray-50 hover:opacity-80 ${btnAnimation}`} onClick={handleLogOut}>
                            SIGN OUT
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showAddProduct && <AddProduct onClose={() => setShowAddProduct(false)} />}
            {showAddBlog && <AddBlog onClose={() => setShowAddBlog(false)} />}
        </div>
    )
}

export default Navbar