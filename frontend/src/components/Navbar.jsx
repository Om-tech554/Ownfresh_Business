import React, { useState } from 'react';
import { FaLocationDot, FaSearchengin, FaCartShopping, FaPlus, FaMicroblog } from "react-icons/fa6";
import { RxCross2, RxHamburgerMenu } from "react-icons/rx";
import { LuReceiptIndianRupee } from "react-icons/lu";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { clearUser } from '../redux/userslice';
import AddProduct from "./admin/AddProduct";
import AddBlog from "./admin/AddBlog";

const Navbar = () => {
    const { userData, city, cartItems } = useSelector(state => state.user);

    const [showInfo, setShowInfo] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showMobileNav, setShowMobileNav] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showAddBlog, setShowAddBlog] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ------------------------------------------------------
    // LOGOUT
    // ------------------------------------------------------
    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
            dispatch(clearUser());
            localStorage.removeItem("oil_user");
            setShowInfo(false);
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    };

    const navLinks = [
        { name: "Shop", path: "/shop" },
        { name: "Blog", path: "/Oilinsights" },
        { name: "About Us", path: "/about" },
        { name: "Contact Us", path: "/contact" }
    ];

    return (
        <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[15px] md:gap-[30px] px-[20px] fixed top-0 z-[999] bg-[#fff9f6]'>

            {/* ---------------------- MOBILE NAVBAR ---------------------- */}
            {showMobileNav && (
                <div className='fixed inset-0 bg-black/50 z-[1000] md:hidden' onClick={() => setShowMobileNav(false)}>
                    <div className='w-[250px] h-full bg-white p-6 flex flex-col gap-6 shadow-2xl' onClick={e => e.stopPropagation()}>
                        <div className='flex justify-between items-center border-b pb-4'>
                            <span className='font-bold text-[#FFD700] text-xl'>Menu</span>
                            <RxCross2 size={25} onClick={() => setShowMobileNav(false)} className='cursor-pointer' />
                        </div>

                        {/* NAV LINKS (SHOW FOR EVERYONE EXCEPT ADMIN) */}
                        {userData?.role !== "admin" && navLinks.map((link) => (
                            <div
                                key={link.name}
                                onClick={() => { navigate(link.path); setShowMobileNav(false); }}
                                className='text-lg font-semibold text-gray-700 hover:text-[#ff4d2d] cursor-pointer'
                            >
                                {link.name}
                            </div>
                        ))}

                        {/* ADMIN MOBILE BUTTONS (ICONS ONLY) */}
                        {userData?.role === "admin" && (
                            <div className="flex items-center justify-between mt-4 px-2">

                                {/* ADD PRODUCT */}
                                <button
                                    onClick={() => { setShowAddProduct(true); setShowMobileNav(false); }}
                                    className="p-3 bg-[#ff4d2d] rounded-full shadow-md shadow-yellow-200 
                                            transition-all duration-200 active:scale-[0.95] hover:bg-[#e63626]"
                                >
                                    <FaPlus size={20} className="text-white" />
                                </button>

                                {/* ADD BLOG */}
                                <button
                                    onClick={() => { setShowAddBlog(true); setShowMobileNav(false); }}
                                    className="p-3 bg-[#ff4d2d] rounded-full shadow-md shadow-yellow-200 
                                            transition-all duration-200 active:scale-[0.95] hover:bg-[#e63626]"
                                >
                                    <FaMicroblog size={20} className="text-white" />
                                </button>

                                {/* PENDING */}
                                <button
                                    onClick={() => { navigate("/admin/pending"); setShowMobileNav(false); }}
                                    className="p-3 bg-[#FFD700] rounded-full shadow-md shadow-yellow-200 
                                            transition-all duration-200 active:scale-[0.95] hover:opacity-90"
                                >
                                    <LuReceiptIndianRupee size={20} className="text-black" />
                                </button>
                            </div>
                        )}

                        {/* SIGN IN (ONLY FOR NON-LOGGED USERS) */}
                        {!userData && (
                            <button
                                onClick={() => { navigate("/signin"); setShowMobileNav(false); }}
                                className="mt-4 px-4 py-2 bg-[#FFD700] text-black font-bold rounded-lg
                                           shadow-md shadow-yellow-200 transition-all duration-200
                                           hover:opacity-90 active:scale-[0.98] cursor-pointer"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ---------------------- MOBILE SEARCH ---------------------- */}
            {showSearch && userData?.role !== "admin" && (
                <div className='w-[90%] h-[70px] bg-white shadow-xl rounded-lg flex items-center gap-[20px] fixed top-[80px] left-[5%] md:hidden'>
                    <div className='flex items-center w-[35%] gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
                        <FaLocationDot size={25} className='text-[#ff4d2d]' />
                        <div className='truncate text-gray-600'>{city || "Select City"}</div>
                    </div>
                    <div className='w-[65%] flex items-center gap-[10px]'>
                        <FaSearchengin size={25} className='text-[#FFD700]' />
                        <input type="text" placeholder='Search Oils' className='outline-0 w-full' />
                    </div>
                </div>
            )}

            {/* ---------------------- LOGO ---------------------- */}
            <h1
                className='text-2xl md:text-3xl font-bold text-[#FFD700] cursor-pointer'
                onClick={() => navigate("/")}
            >
                OwnFresh
            </h1>

            {/* ---------------------- DESKTOP NAVIGATION (HIDE FOR ADMIN) ---------------------- */}
            {userData?.role !== "admin" && (
                <div className='hidden lg:flex items-center gap-8'>
                    {navLinks.map((link) => (
                        <span
                            key={link.name}
                            onClick={() => navigate(link.path)}
                            className='relative font-bold text-gray-700 cursor-pointer transition-all duration-300 hover:text-black group py-1'
                        >
                            {link.name}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
                        </span>
                    ))}
                </div>
            )}

            {/* ---------------------- DESKTOP SEARCH BAR (HIDE FOR ADMIN) ---------------------- */}
            {userData?.role !== "admin" && (
                <div className='hidden md:flex md:w-[40%] lg:w-[30%] h-[55px] bg-white shadow-md rounded-lg items-center gap-[15px] border border-orange-100'>
                    <div className='flex items-center w-[35%] gap-[10px] px-[10px] border-r-[2px] border-gray-200'>
                        <FaLocationDot size={20} className='text-[#ff4d2d]' />
                        <div className='truncate text-gray-600 text-sm font-medium'>{city || "Select City"}</div>
                    </div>
                    <div className='w-[65%] flex items-center gap-[10px] pr-2'>
                        <FaSearchengin size={22} className='text-[#FFD700]' />
                        <input type="text" placeholder='Search Oils' className='text-gray-700 outline-0 w-full text-sm' />
                    </div>
                </div>
            )}

            {/* ---------------------- RIGHT SIDE ICON AREA ---------------------- */}
            <div className='flex items-center gap-4 md:gap-6'>

                {/* MOBILE MENU */}
                <RxHamburgerMenu
                    size={28}
                    className='text-[#FFD700] md:hidden cursor-pointer'
                    onClick={() => setShowMobileNav(true)}
                />

                {/* MOBILE SEARCH ONLY FOR USER */}
                {userData?.role !== "admin" && (
                    showSearch ? (
                        <RxCross2 size={28} className='text-[#FFD700] md:hidden cursor-pointer' onClick={() => setShowSearch(false)} />
                    ) : (
                        <FaSearchengin size={28} className='text-[#FFD700] md:hidden cursor-pointer' onClick={() => setShowSearch(true)} />
                    )
                )}

                {/* USER BUTTONS */}
                {userData?.role === "user" && (
                    <>
                        {/* CART */}
                        <div className='relative cursor-pointer' onClick={() => navigate("/cart")}>
                            <FaCartShopping size={25} className='text-[#FFD700] transition-all' />
                            <span className='absolute -right-2 -top-3 text-[10px] font-bold text-white bg-[#ff4d2d] rounded-full h-5 w-5 flex items-center justify-center'>
                                {cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0)}
                            </span>
                        </div>

                        {/* MY ORDERS */}
                        <button
                            onClick={() => navigate("/my-orders")}
                            className="hidden md:block px-5 py-2 rounded-xl text-sm font-bold bg-[#ff4d2d] text-white
                                            shadow-md shadow-yellow-200 transition-all duration-200 
                                            hover:bg-[#e63626] active:scale-[0.98]"
                        >
                            My Orders
                        </button>
                    </>
                )}

                {/* ---------------- ADMIN BUTTONS (DESKTOP) ---------------- */}
                {userData?.role === "admin" && (
                    <div className="hidden md:flex items-center gap-4">

                        {/* ADD PRODUCT */}
                        <button
                            onClick={() => setShowAddProduct(true)}
                            className="px-5 py-2 rounded-xl bg-[#ff4d2d] text-white font-bold
                                            shadow-md shadow-yellow-200 transition-all duration-200
                                            hover:bg-[#e63626] active:scale-[0.98] cursor-pointer flex items-center gap-2"
                        >
                            <FaPlus size={16} /> Add Product
                        </button>

                        {/* ADD BLOG */}
                        <button
                            onClick={() => setShowAddBlog(true)}
                            className="px-5 py-2 rounded-xl bg-[#ff4d2d] text-white font-bold
                                            shadow-md shadow-yellow-200 transition-all duration-200
                                            hover:bg-[#e63626] active:scale-[0.98] cursor-pointer flex items-center gap-2"
                        >
                            <FaMicroblog size={16} /> Add Blog
                        </button>

                        {/* PENDING */}
                        <button
                            onClick={() => navigate("/admin/pending")}
                            className="px-5 py-2 rounded-xl bg-[#FFD700] text-black font-bold
                                            shadow-md shadow-yellow-200 transition-all duration-200
                                            hover:opacity-90 active:scale-[0.98] cursor-pointer flex items-center gap-2"
                        >
                            <LuReceiptIndianRupee size={18} /> Pending
                        </button>
                    </div>
                )}

                {/* SIGN IN BUTTON FOR NON LOGGED USERS */}
                {!userData && (
                    <button
                        onClick={() => navigate("/signin")}
                        className="px-5 py-2 rounded-xl bg-[#FFD700] text-black font-bold 
                                   shadow-md shadow-yellow-200 transition-all duration-200 
                                   hover:opacity-90 active:scale-[0.98]"
                    >
                        Sign In
                    </button>
                )}

                {/* AVATAR DROPDOWN */}
                {userData && (
                    <div className='relative'>
                        <div
                            className='w-[40px] h-[40px] rounded-full bg-[#ff4d2d] text-white font-bold flex items-center justify-center cursor-pointer
                                       hover:bg-[#e63626] transition-all'
                            onClick={() => setShowInfo(prev => !prev)}
                        >
                            {userData.fullName?.slice(0, 2).toUpperCase()}
                        </div>

                        {showInfo && (
                            <div className='absolute right-0 mt-3 w-[180px] bg-white shadow-2xl rounded-xl p-4 flex flex-col gap-3 z-[1000] border border-gray-100'>
                                <div className='text-sm font-bold text-gray-800 border-b pb-2 truncate'>
                                    {userData.fullName}
                                </div>

                                {userData.role === "user" && (
                                    <div
                                        onClick={() => { navigate("/my-orders"); setShowInfo(false); }}
                                        className='md:hidden text-gray-700 font-semibold cursor-pointer text-sm hover:text-[#ff4d2d]'
                                    >
                                        My Orders
                                    </div>
                                )}

                                <div
                                    className='text-[#ff4d2d] font-bold cursor-pointer text-sm hover:text-[#e63626]'
                                    onClick={handleLogOut}
                                >
                                    Sign Out
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* ---------------- MODALS ---------------- */}
            {showAddProduct && <AddProduct onClose={() => setShowAddProduct(false)} />}
            {showAddBlog && <AddBlog onClose={() => setShowAddBlog(false)} />}
        </div>
    );
};

export default Navbar;
