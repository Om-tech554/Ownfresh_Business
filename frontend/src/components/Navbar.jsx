import React, { useState, useEffect, useRef } from 'react';
import { FaLocationDot, FaSearchengin, FaCartShopping, FaPlus, FaMicroblog } from "react-icons/fa6";
import { RxCross2, RxHamburgerMenu } from "react-icons/rx";
import { LuReceiptIndianRupee } from "react-icons/lu";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { clearUser } from '../redux/userslice';
import { Layers } from 'lucide-react';
import SLink from './SLink';

const Navbar = () => {
    const { userData, city, cartItems } = useSelector(state => state.user);

    const [showInfo, setShowInfo] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showMobileNav, setShowMobileNav] = useState(false);

    const [searchableItems, setSearchableItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const searchRefDesktop = useRef(null);
    const searchRefMobile = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const isHome = location.pathname === "/";

    useEffect(() => {
        const fetchAllSearchable = async () => {
            let combinedResults = [];
            
            // Fetch Products
            try {
                const productRes = await axios.get(`${serverUrl}/api/product/all`);
                const formattedProducts = (productRes.data.products || []).map(p => ({
                    ...p,
                    searchType: 'Product',
                    searchTitle: p.name,
                    searchDescription: p.shortDesc || '',
                    searchImage: p.image,
                    searchUrl: `/product/${p._id}`
                }));
                combinedResults = [...combinedResults, ...formattedProducts];
            } catch (error) {
                console.error("Failed to prefetch products", error);
            }
            
            // Fetch Backend Blogs
            try {
                const backendBlogRes = await axios.get(`${serverUrl}/api/blog/all`);
                const formattedBackendBlogs = (backendBlogRes.data.blogs || []).map(b => ({
                    ...b,
                    searchType: 'Blog',
                    searchTitle: b.title,
                    searchDescription: b.description?.replace(/<[^>]+>/g, '') || '',
                    searchImage: b.image,
                    searchUrl: `/blog/${b._id}`
                }));
                combinedResults = [...combinedResults, ...formattedBackendBlogs];
            } catch (error) {
                console.error("Failed to prefetch backend blogs", error);
            }
            

            
            setSearchableItems(combinedResults);
        };
        fetchAllSearchable();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
        const timer = setTimeout(() => {
            const query = searchQuery.toLowerCase().trim();
            const filtered = searchableItems.filter(item => 
                (item.searchTitle && item.searchTitle.toLowerCase().includes(query)) ||
                (item.category && item.category.toLowerCase().includes(query)) ||
                (item.searchDescription && item.searchDescription.toLowerCase().includes(query))
            );
            setSearchResults(filtered);
            setShowDropdown(true);
        }, 200);
        return () => clearTimeout(timer);
    }, [searchQuery, searchableItems]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                (searchRefDesktop.current && !searchRefDesktop.current.contains(event.target)) &&
                (searchRefMobile.current && !searchRefMobile.current.contains(event.target))
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleResultClick = (url) => {
        setShowDropdown(false);
        setSearchQuery("");
        setShowSearch(false);
        navigate(url);
    };

    const handleSearchClick = () => {
        if (searchQuery.trim().length > 0) setShowDropdown(true);
    };

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
        { name: "Home", path: "/" },
        { name: "About Us", path: "/whyownfresh" },
        { name: "Shop", path: "/shop" },
        { name: "Blog", path: "/Oilinsights" },
        { name: "Contact", path: "/contact" }
    ];

    const SearchDropdownUI = () => (
        showDropdown && (
            <div className="absolute top-[110%] left-0 right-0 bg-white border border-gray-200 shadow-xl max-h-[350px] overflow-y-auto z-[1001] p-0 flex flex-col w-full">
                {searchResults.length > 0 ? (
                    searchResults.map(p => (
                        <div key={p._id} onClick={() => handleResultClick(p.searchUrl)} className="flex items-center gap-4 p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors">
                            <div className="w-12 h-12 bg-gray-50 flex items-center justify-center p-1 flex-shrink-0">
                                <img src={p.searchImage} alt={p.searchTitle} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="text-sm font-bold text-black truncate" dangerouslySetInnerHTML={{ __html: p.searchTitle }}></span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded text-white uppercase tracking-widest ${p.searchType === 'Product' ? 'bg-[#F9DD19] !text-black' : 'bg-black'}`}>
                                        {p.searchType}
                                    </span>
                                    <span className="text-[10px] text-gray-500 uppercase truncate">{p.category || "General"}</span>
                                </div>
                            </div>
                            {p.searchType === 'Product' && <div className="text-sm font-bold text-black">₹{p.price}</div>}
                        </div>
                    ))
                ) : (
                    <div className="p-6 text-center bg-gray-50 border-b border-gray-100">
                        <p className="text-sm text-gray-500">No products found for "<span className="text-black font-bold">{searchQuery}</span>"</p>
                    </div>
                )}
            </div>
        )
    );

    return (
        <React.Fragment>
            <div className="sticky top-0 z-[1000] w-full flex flex-col shadow-sm bg-white">
                <div className="w-full bg-[#F9DD19] text-black py-2.5 text-center text-xs font-bold tracking-[0.1em] uppercase relative px-4">
                    🎉 FREE SHIPPING ON ORDERS ABOVE ₹999 | 100% PURE BOTANIC OILS
                </div>

                <div className="w-full h-[80px] flex items-center justify-between px-[24px] lg:px-[60px] bg-white border-b border-gray-200">
                    <SLink to="/" className="flex items-center">
                        <img 
                            src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png" 
                            alt="OwnFresh Logo" 
                            className="h-10 md:h-12 w-auto object-contain" 
                        />
                    </SLink>

                    {userData?.role !== "admin" && (
                        <div className='hidden lg:flex items-center gap-8 mx-auto absolute left-1/2 -translate-x-1/2'>
                            {navLinks.map((link) => (
                                <SLink key={link.name} to={link.path} className='text-[13px] font-bold text-[#1E971D] uppercase tracking-widest hover:text-[#1E971D] hover:underline underline-offset-8 decoration-2 transition-all whitespace-nowrap'>
                                    {link.name}
                                </SLink>
                            ))}
                        </div>
                    )}

                    <div className='flex items-center gap-5 ml-auto'>
                        <RxHamburgerMenu size={28} className='text-black lg:hidden cursor-pointer hover:text-[#F9DD19] transition-colors' onClick={() => setShowMobileNav(true)} />

                        {userData?.role !== "admin" && (
                            <div className="relative" ref={searchRefDesktop}>
                                {showSearch ? (
                                    <div className='hidden md:flex items-center bg-gray-100 px-3 py-1.5 rounded-full outline outline-1 outline-gray-200 divide-x divide-gray-300'>
                                        {/* GEOLOCATION INJECTED HERE */}
                                        <div className='flex items-center gap-2 pr-3'>
                                            <FaLocationDot size={14} className='text-[#F9DD19]' />
                                            <div className='text-[11px] font-bold text-black uppercase tracking-wider truncate max-w-[80px]'>
                                                {city || "Select City"}
                                            </div>
                                        </div>
                                        <div className="flex items-center pl-3">
                                            <input 
                                                type="text" 
                                                placeholder='Search...' 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onClick={handleSearchClick}
                                                className='bg-transparent outline-none text-sm w-[150px] text-black'
                                                autoFocus
                                            />
                                            <RxCross2 size={18} className='text-gray-500 cursor-pointer hover:text-black ml-2' onClick={() => {setShowSearch(false); setShowDropdown(false);}} />
                                        </div>
                                        <SearchDropdownUI />
                                    </div>
                                ) : (
                                    <FaSearchengin size={22} className='text-black cursor-pointer hover:text-[#F9DD19] transition-colors' onClick={() => setShowSearch(true)} />
                                )}
                            </div>
                        )}

                        {userData?.role === "user" && (
                            <SLink to="/cart" className='relative transition-colors block'>
                                <FaCartShopping size={22} className='text-black hover:text-[#F9DD19]' />
                                <span className='absolute -right-2 -top-2 text-[10px] font-bold text-black bg-[#F9DD19] rounded-full h-5 w-5 flex items-center justify-center'>
                                    {cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0)}
                                </span>
                            </SLink>
                        )}

                        {userData?.role === "admin" && (
                            <div className='flex items-center gap-4 mr-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200'>
                                <div className='flex items-center gap-2 cursor-pointer group' onClick={() => navigate('/admin/product/editor/create')} title="Add Product">
                                    <FaPlus size={16} className='text-black group-hover:text-[#F9DD19] transition-colors' />
                                    <span className='text-[10px] font-bold uppercase tracking-widest hidden sm:block'>Product</span>
                                </div>
                            </div>
                        )}

                        {(userData?.role === "admin" || userData?.role === "blogger") && (
                            <div className='flex items-center gap-4 mr-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200'>
                                <div className='flex items-center gap-2 cursor-pointer group' onClick={() => navigate('/admin')} title="Admin Dashboard">
                                    <Layers size={18} className='text-black group-hover:text-[#F9DD19] transition-colors' />
                                    <span className='text-[10px] font-bold uppercase tracking-widest hidden sm:block'>Dashboard</span>
                                </div>
                            </div>
                        )}

                        {(userData?.role === "admin" || userData?.role === "blogger") && (
                            <div className='flex items-center gap-4 mr-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200'>
                                <div className='flex items-center gap-2 cursor-pointer group' onClick={() => navigate('/admin/blog/editor/create')} title="Add Blog">
                                    <FaMicroblog size={18} className='text-black group-hover:text-[#F9DD19] transition-colors' />
                                    <span className='text-[10px] font-bold uppercase tracking-widest hidden sm:block'>Blog</span>
                                </div>
                            </div>
                        )}

                        {!userData ? (
                            <SLink to="/signin" className="hidden lg:flex text-[13px] font-bold text-[#1E971D] uppercase tracking-widest hover:text-[#1E971D] hover:underline underline-offset-8 decoration-2 transition-all">
                                Login
                            </SLink>
                        ) : (
                            <div className='relative'>
                                <div className='w-[35px] h-[35px] rounded-full bg-black text-[#F9DD19] font-bold flex items-center justify-center cursor-pointer text-sm' onClick={() => setShowInfo(prev => !prev)}>
                                    {userData.fullName?.slice(0, 2).toUpperCase()}
                                </div>
                                {showInfo && (
                                    <div className='absolute right-0 mt-3 w-[200px] bg-white border border-gray-200 shadow-xl p-3 flex flex-col z-[1000]'>
                                        <div className='text-xs font-bold text-gray-500 pb-2 border-b border-gray-100 truncate mb-2 uppercase tracking-wide'>
                                            {userData.fullName}
                                        </div>
                                        {userData.role === "user" && <SLink to="/my-orders" onClick={() => setShowInfo(false)} className='text-sm text-black font-bold block py-1.5 hover:text-[#F9DD19] transition-colors'>My Orders</SLink>}
                                        <div className='text-sm text-red-600 font-bold cursor-pointer block py-1.5 hover:text-black transition-colors' onClick={handleLogOut}>Log Out</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* MOBILE SEARCH W/ GEOLOCATION */}
                    {showSearch && userData?.role !== "admin" && (
                        <div className='md:hidden absolute top-[80px] left-0 w-full bg-white border-b border-gray-200 p-4 shadow-md' ref={searchRefMobile}>
                             <div className='flex items-center bg-gray-100 px-4 py-3 rounded-md w-full relative divide-x divide-gray-300'>
                                <div className='flex items-center gap-2 pr-3 mr-3 max-w-[40%]'>
                                    <FaLocationDot size={14} className='text-[#F9DD19] flex-shrink-0' />
                                    <div className='text-[10px] font-bold text-black uppercase tracking-wider truncate'>
                                        {city || "Select City"}
                                    </div>
                                </div>
                                <div className='flex items-center flex-1'>
                                    <input type="text" placeholder='Search...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClick={handleSearchClick} className='bg-transparent outline-none text-sm w-full text-black pl-3' autoFocus />
                                    <RxCross2 size={20} className='text-gray-500 ml-2 cursor-pointer flex-shrink-0' onClick={() => {setShowSearch(false); setShowDropdown(false);}} />
                                </div>
                                <SearchDropdownUI />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {showMobileNav && (
                <div className='fixed inset-0 bg-black/50 z-[1000] lg:hidden transition-all' onClick={() => setShowMobileNav(false)}>
                    <div className='w-[80%] max-w-[300px] h-full bg-white p-6 flex flex-col shadow-2xl' onClick={e => e.stopPropagation()}>
                        <div className='flex justify-between items-center border-b border-gray-200 pb-4 mb-6'>
                            <img 
                                src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png" 
                                alt="OwnFresh Logo" 
                                className="h-8 w-auto object-contain" 
                            />
                            <RxCross2 size={28} onClick={() => setShowMobileNav(false)} className='cursor-pointer text-black hover:text-[#F9DD19]' />
                        </div>
                        {userData?.role !== "admin" && (
                            <div className="flex flex-col gap-4">
                                {navLinks.map((link) => <SLink key={link.name} to={link.path} onClick={() => setShowMobileNav(false)} className='text-[15px] font-bold text-[#1E971D] uppercase tracking-widest hover:text-[#1E971D] hover:underline underline-offset-8 decoration-2 transition-all block'>{link.name}</SLink>)}
                            </div>
                        )}
                        {!userData && (
                            <div className="mt-8 border-t border-gray-100 pt-6">
                                <SLink to="/signin" onClick={() => setShowMobileNav(false)} className="w-full btn-primary text-sm whitespace-nowrap block text-center">Login / Register</SLink>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </React.Fragment>
    );
};
export default Navbar;
