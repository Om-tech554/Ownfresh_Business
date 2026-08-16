import React, { useState, useEffect, useRef } from 'react';
import { FaLocationDot, FaSearchengin, FaCartShopping, FaPlus, FaMicroblog } from "react-icons/fa6";
import { RxCross2, RxHamburgerMenu } from "react-icons/rx";
import { LuReceiptIndianRupee } from "react-icons/lu";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { clearUser } from '../redux/userslice';
import { Layers, Package, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import SLink from './SLink';

const Navbar = () => {
    const { userData, city, cartItems } = useSelector(state => state.user);

    const [showInfo, setShowInfo] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showMobileNav, setShowMobileNav] = useState(false);
    const [showShopDropdown, setShowShopDropdown] = useState(false);
    const [mobileShopOpen, setMobileShopOpen] = useState(false);

    const [searchableItems, setSearchableItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [announcement, setAnnouncement] = useState("🎉 FREE SHIPPING ON ORDERS ABOVE ₹999 • 🌿 PREMIUM GRADE PURE OIL & STONE PRESSED BOTANIC OILS • 👑 JOIN PRIME 1% TO EARN REDEEMABLE COIN COMMISSIONS • 📦 EXPRESS 2-DAY DELIVERY ACROSS INDIA");

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const keys = ["announcement1", "announcement2", "announcement3", "announcement4"];
                const results = await Promise.allSettled(
                    keys.map(k => axios.get(`${serverUrl}/api/settings/${k}`))
                );

                const lines = [];
                results.forEach(r => {
                    if (r.status === "fulfilled" && r.value.data?.success && r.value.data?.value) {
                        lines.push(r.value.data.value.trim());
                    }
                });

                if (lines.length > 0) {
                    setAnnouncement(lines.join(" • "));
                } else {
                    // Fallback to legacy single key
                    const { data } = await axios.get(`${serverUrl}/api/settings/announcement`);
                    if (data.success && data.value) setAnnouncement(data.value);
                }
            } catch (error) {
                console.error("Failed to fetch announcement banner", error);
            }
        };
        fetchAnnouncement();
    }, []);

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



            // Fetch Categories
            try {
                const catRes = await axios.get(`${serverUrl}/api/category/all`);
                if (catRes.data.success) {
                    setCategories(catRes.data.categories);
                }
            } catch (error) {
                console.error("Failed to prefetch categories", error);
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
                (item.category?.name && item.category.name.toLowerCase().includes(query)) ||
                (item.category && typeof item.category === 'string' && item.category.toLowerCase().includes(query)) ||
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
        {
            name: "Shop",
            path: "/shop",
            dropdown: categories.length > 0 ? categories.map(cat => ({
                name: cat.name,
                path: `/shop?category=${cat.name}`,
                image: cat.image
            })) : null
        },
        { name: "Blog", path: "/Oilinsights" },
        { name: "Prime 1%", path: "/membership" },
        { name: "Contact", path: "/contact" },
        ...(userData ? [{ name: "Refer & Earn", path: "/referral", special: true }] : [])
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
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded text-white uppercase tracking-widest ${p.searchType === 'Product' ? 'bg-[#FFDD00] !text-black' : 'bg-black'}`}>
                                        {p.searchType}
                                    </span>
                                    <span className="text-[10px] text-gray-500 uppercase truncate">{p.category?.name || p.category || "General"}</span>
                                </div>
                            </div>
                            {p.searchType === 'Product' && <div className="text-sm font-bold text-black">₹{Math.round(p.price)}</div>}
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
                <div className="w-full bg-[#F9DD19] text-[#181818] py-2.5 text-xs font-extrabold tracking-[0.1em] uppercase overflow-hidden whitespace-nowrap relative">
                    <div className="inline-block animate-marquee whitespace-nowrap">
                        <span className="mx-12">{announcement}</span>
                        <span className="mx-12">{announcement}</span>
                        <span className="mx-12">{announcement}</span>
                        <span className="mx-12">{announcement}</span>
                    </div>
                    <style>{`
                        @keyframes marquee {
                            0% { transform: translate3d(0, 0, 0); }
                            100% { transform: translate3d(-25%, 0, 0); }
                        }
                        .animate-marquee {
                            display: inline-block;
                            animation: marquee 25s linear infinite;
                        }
                    `}</style>
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
                        <div className='hidden lg:flex items-center justify-center flex-1 gap-3 xl:gap-7 px-4 min-w-0'>
                            {navLinks.map((link) => (
                                <div
                                    key={link.name}
                                    className="relative group flex-shrink-0"
                                    onMouseEnter={() => link.dropdown && setShowShopDropdown(true)}
                                    onMouseLeave={() => link.dropdown && setShowShopDropdown(false)}
                                >
                                    <SLink
                                        to={link.path}
                                        className={`text-[12px] xl:text-[13px] font-bold uppercase tracking-widest hover:underline underline-offset-8 decoration-2 transition-all whitespace-nowrap ${link.special ? 'text-[#F9DD19] bg-[#181818] px-3.5 py-1.5 rounded-full hover:no-underline hover:scale-105 shadow-sm' : 'text-[#1E971D]'}`}
                                    >
                                        {link.name}
                                    </SLink>

                                    {link.dropdown && showShopDropdown && (
                                        <div className="absolute top-[100%] left-0 pt-4 w-[220px] animate-in fade-in slide-in-from-top-2 duration-200 z-[1002]">
                                            <div className="bg-white border border-gray-100 shadow-2xl p-2 rounded-2xl overflow-hidden">
                                                {link.dropdown.map((sub) => (
                                                    <SLink
                                                        key={sub.name}
                                                        to={sub.path}
                                                        className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[#24672E] hover:bg-[#FFDD00] hover:text-black rounded-xl transition-all"
                                                    >
                                                        {sub.image && (
                                                            <img src={sub.image} alt={sub.name} className="w-6 h-6 object-cover rounded-md" />
                                                        )}
                                                        {sub.name}
                                                    </SLink>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className='flex items-center gap-4 xl:gap-5 ml-auto flex-shrink-0'>
                        <RxHamburgerMenu size={28} className='text-black lg:hidden cursor-pointer hover:text-[#FFDD00] transition-colors' onClick={() => setShowMobileNav(true)} />

                        {userData?.role !== "admin" && (
                            <div className="relative flex-shrink-0" ref={searchRefDesktop}>
                                {showSearch ? (
                                    <div className='hidden md:flex items-center bg-gray-100 px-3 py-1.5 rounded-full outline outline-1 outline-gray-200 divide-x divide-gray-300 transition-all duration-300 max-w-[230px] xl:max-w-[290px] shadow-sm'>
                                        {/* GEOLOCATION */}
                                        <div className='flex items-center gap-1.5 pr-2.5 flex-shrink-0'>
                                            <FaLocationDot size={13} className='text-[#FFDD00]' />
                                            <div className='text-[10px] xl:text-[11px] font-bold text-black uppercase tracking-wider truncate max-w-[60px] xl:max-w-[80px]'>
                                                {city || "Select City"}
                                            </div>
                                        </div>
                                        <div className="flex items-center pl-2.5 flex-1 min-w-0">
                                            <input
                                                type="text"
                                                placeholder='Search...'
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onClick={handleSearchClick}
                                                className='bg-transparent outline-none text-xs xl:text-sm w-full text-black'
                                                autoFocus
                                            />
                                            <RxCross2 size={16} className='text-gray-500 cursor-pointer hover:text-black ml-1.5 flex-shrink-0' onClick={() => { setShowSearch(false); setShowDropdown(false); }} />
                                        </div>
                                        <SearchDropdownUI />
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowSearch(true)}
                                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer"
                                        title="Search"
                                    >
                                        <FaSearchengin size={22} className='text-black hover:text-[#FFDD00] transition-colors' />
                                    </button>
                                )}
                            </div>
                        )}

                        {userData?.role !== "admin" && (
                            <SLink
                                to="/cart"
                                className='relative transition-colors block cursor-pointer group'
                            >
                                <FaCartShopping size={22} className='text-black group-hover:text-[#FFDD00] transition-colors' />
                                <span className='absolute -right-2 -top-2 text-[10px] font-bold text-black bg-[#FFDD00] rounded-full h-5 w-5 flex items-center justify-center border-2 border-white'>
                                    {cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0)}
                                </span>
                            </SLink>
                        )}

                        {userData?.role === "admin" && (
                            <div className='flex items-center gap-4 mr-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200'>
                                <div className='flex items-center gap-2 cursor-pointer group' onClick={() => navigate('/admin/product/editor/create')} title="Add Product">
                                    <FaPlus size={16} className='text-black group-hover:text-[#FFDD00] transition-colors' />
                                    <span className='text-[10px] font-bold uppercase tracking-widest hidden sm:block'>Product</span>
                                </div>
                            </div>
                        )}

                        {(userData?.role === "admin" || userData?.role === "blogger") && (
                            <div className='flex items-center gap-4 mr-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200'>
                                <div className='flex items-center gap-2 cursor-pointer group' onClick={() => navigate('/admin')} title="Admin Dashboard">
                                    <Layers size={18} className='text-black group-hover:text-[#FFDD00] transition-colors' />
                                    <span className='text-[10px] font-bold uppercase tracking-widest hidden sm:block'>Dashboard</span>
                                </div>
                            </div>
                        )}

                        {(userData?.role === "admin" || userData?.role === "blogger") && (
                            <div className='flex items-center gap-4 mr-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200'>
                                <div className='flex items-center gap-2 cursor-pointer group' onClick={() => navigate('/admin/blog/editor/create')} title="Add Blog">
                                    <FaMicroblog size={18} className='text-black group-hover:text-[#FFDD00] transition-colors' />
                                    <span className='text-[10px] font-bold uppercase tracking-widest hidden sm:block'>Blog</span>
                                </div>
                            </div>
                        )}

                        {!userData ? (
                            <SLink to="/signin" className="hidden lg:flex text-[13px] font-bold text-[#24672E] uppercase tracking-widest hover:text-[#24672E] hover:underline underline-offset-8 decoration-2 transition-all">
                                Login
                            </SLink>
                        ) : (
                            <div className='relative'>
                                <div className='w-[35px] h-[35px] rounded-full bg-black text-[#FFDD00] font-bold flex items-center justify-center cursor-pointer text-sm' onClick={() => setShowInfo(prev => !prev)}>
                                    {userData.fullName?.slice(0, 2).toUpperCase()}
                                </div>
                                {showInfo && (
                                    <div className='absolute right-0 mt-3 w-[200px] bg-white border border-gray-200 shadow-xl p-3 flex flex-col z-[1000]'>
                                        <div className='text-xs font-bold text-gray-500 pb-2 border-b border-gray-100 truncate mb-2 uppercase tracking-wide'>
                                            {userData.fullName}
                                        </div>
                                        {userData.role === "user" && (
                                            <>
                                                <SLink to="/my-orders" onClick={() => setShowInfo(false)} className='text-sm text-black font-bold block py-1.5 hover:text-[#24672E] transition-colors'>My Orders</SLink>
                                                <SLink to="/membership" onClick={() => setShowInfo(false)} className='text-sm text-[#24672E] font-bold block py-1.5 hover:text-black transition-colors flex items-center gap-1.5'>
                                                    👑 Membership & 1% Coins
                                                </SLink>
                                            </>
                                        )}
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
                                <div className='flex items-center gap-2 pr-3 mr-3 max-w-[50%]'>
                                    <FaLocationDot size={14} className='text-[#FFDD00] flex-shrink-0' />
                                    <div className='text-[10px] font-bold text-black uppercase tracking-wider truncate'>
                                        {city || "Select City"}
                                    </div>
                                </div>
                                <div className='flex items-center flex-1'>
                                    <input type="text" placeholder='Search...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClick={handleSearchClick} className='bg-transparent outline-none text-sm w-full text-black pl-3' autoFocus />
                                    <RxCross2 size={20} className='text-gray-500 ml-2 cursor-pointer flex-shrink-0' onClick={() => { setShowSearch(false); setShowDropdown(false); }} />
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
                            <RxCross2 size={28} onClick={() => setShowMobileNav(false)} className='cursor-pointer text-black hover:text-[#FFDD00]' />
                        </div>
                        {userData?.role !== "admin" && (
                            <div className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <React.Fragment key={link.name}>
                                        {link.dropdown ? (
                                            <div className="flex flex-col">
                                                <div
                                                    className="flex items-center justify-between py-1 cursor-pointer group"
                                                    onClick={() => setMobileShopOpen(prev => !prev)}
                                                >
                                                    <SLink
                                                        to={link.path}
                                                        onClick={() => setShowMobileNav(false)}
                                                        className="text-[15px] font-bold uppercase tracking-widest text-[#24672E] hover:underline"
                                                    >
                                                        {link.name}
                                                    </SLink>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setMobileShopOpen(prev => !prev); }}
                                                        className="p-2 text-[#24672E] hover:text-[#FFDD00] transition-colors"
                                                    >
                                                        {mobileShopOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                    </button>
                                                </div>

                                                {mobileShopOpen && (
                                                    <div className="flex flex-col gap-2.5 pl-4 py-2 bg-gray-50/90 rounded-xl my-1 border border-gray-100 animate-in fade-in duration-200">
                                                        {link.dropdown.map((sub) => (
                                                            <SLink
                                                                key={sub.name}
                                                                to={sub.path}
                                                                onClick={() => {
                                                                    setShowMobileNav(false);
                                                                    setMobileShopOpen(false);
                                                                }}
                                                                className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-widest text-gray-700 py-1.5 hover:text-[#24672E]"
                                                            >
                                                                {sub.image && (
                                                                    <img src={sub.image} alt={sub.name} className="w-6 h-6 object-cover rounded-md border border-gray-200" />
                                                                )}
                                                                {sub.name}
                                                            </SLink>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <SLink
                                                to={link.path}
                                                onClick={() => setShowMobileNav(false)}
                                                className={`text-[15px] font-bold uppercase tracking-widest underline-offset-8 decoration-2 transition-all block ${link.special ? 'text-[#FFDD00] bg-black p-3 rounded-xl text-center' : 'text-[#24672E] hover:underline'}`}
                                            >
                                                {link.name}
                                            </SLink>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                        <div className="mt-8 border-t border-gray-100 pt-6 space-y-4">
                            {userData?.role !== "admin" && (
                                <div
                                    onClick={() => {
                                        if (!userData) {
                                            toast.error("Please Sign In to view your cart");
                                            setShowMobileNav(false);
                                        } else {
                                            navigate("/cart");
                                            setShowMobileNav(false);
                                        }
                                    }}
                                    className="flex items-center justify-between bg-gray-50 p-4 rounded-xl cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <FaCartShopping size={20} className="text-black" />
                                        <span className="font-bold uppercase tracking-widest text-xs">My Cart</span>
                                    </div>
                                    <span className="bg-[#FFDD00] text-black font-bold h-6 w-6 rounded-full flex items-center justify-center text-[10px]">
                                        {cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0)}
                                    </span>
                                </div>
                            )}
                            {userData && (
                                <SLink to="/my-orders" onClick={() => setShowMobileNav(false)} className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl cursor-pointer">
                                    <Package size={20} className="text-black" />
                                    <span className="font-bold uppercase tracking-widest text-xs">My Orders</span>
                                </SLink>
                            )}
                            {!userData && (
                                <SLink to="/signin" onClick={() => setShowMobileNav(false)} className="w-full btn-primary text-sm whitespace-nowrap block text-center">Login / Register</SLink>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </React.Fragment>
    );
};
export default Navbar;
