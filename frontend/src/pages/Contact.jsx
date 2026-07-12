import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Phone, Mail, MapPin, Share2 } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaXTwitter, FaYoutube, FaLinkedinIn } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import SLink from '../components/SLink';
import { serverUrl } from '../App';

const Contact = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${serverUrl}/api/contact/submit`, formData);
            toast.success("Thanks for reaching out! We will get back to you shortly.");
            setFormData({ name: "", email: "", message: "" });
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-white min-h-screen relative z-0">
            <Toaster position="top-center" />
            <Navbar />

            {/* 1. HERO SECTION */}
            <section className="w-full bg-[#FAFAFA] py-24 px-6 md:px-12 relative overflow-hidden border-b border-gray-100 flex flex-col items-center justify-center text-center">
                {/* Watermark/Texture simulation */}
                <span className="absolute text-[12vw] font-black text-gray-100/30 uppercase tracking-tighter select-none z-0 pointer-events-none -top-10">OWNFRESH</span>
                
                <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
                    <span className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Get In Touch</span>
                    <h1 className="text-4xl md:text-6xl font-black text-black leading-tight uppercase tracking-tight">
                        Connect with OwnFresh for <span className="text-[#FFDD00]">Premium Oils</span>
                    </h1>
                </div>
            </section>

            {/* 2. 4-COLUMN INFO STRIP */}
            <section className="w-full bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 md:divide-x divide-gray-100">
                    
                    {/* Phone block */}
                    <div className="p-10 flex flex-col items-center text-center group hover:bg-gray-50 transition-colors cursor-default">
                        <div className="w-14 h-14 bg-gray-50 group-hover:bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 transition-colors">
                            <Phone className="w-6 h-6 text-[#FFDD00]" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-black mb-2">Call Us</h3>
                        <a href="tel:+918999773438" className="text-gray-500 font-bold hover:text-black transition-colors cursor-pointer">+91 8999 77 3438</a>
                    </div>

                    {/* Email block */}
                    <div className="p-10 flex flex-col items-center text-center group hover:bg-gray-50 transition-colors cursor-default">
                        <div className="w-14 h-14 bg-gray-50 group-hover:bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 transition-colors">
                            <Mail className="w-6 h-6 text-[#FFDD00]" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-black mb-2">Email Us</h3>
                        <a href="mailto:contact@myownfresh.com" className="text-gray-500 font-bold hover:text-black transition-colors cursor-pointer">contact@myownfresh.com</a>
                    </div>

                    {/* Address block */}
                    <div className="p-10 flex flex-col items-center text-center group hover:bg-gray-50 transition-colors cursor-default">
                        <div className="w-14 h-14 bg-gray-50 group-hover:bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 transition-colors">
                            <MapPin className="w-6 h-6 text-[#FFDD00]" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-black mb-2">Location</h3>
                        <p className="text-gray-500 font-bold leading-relaxed text-sm">
                            Survey No. 30/13, Shed No. 1, Vir Maruti Complex, Dhayari – Narhe Road, Pune.
                        </p>
                    </div>

                    {/* Socials block */}
                    <div className="p-10 flex flex-col items-center text-center group hover:bg-gray-50 transition-colors cursor-default">
                        <div className="w-14 h-14 bg-gray-50 group-hover:bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 transition-colors">
                            <Share2 className="w-6 h-6 text-[#FFDD00]" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-black mb-3">Follow Us</h3>
                        <div className="flex gap-3">
                            <a href="https://www.facebook.com/ownfresh.official" target="_blank" rel="noopener noreferrer" title="Facebook" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#FFDD00] hover:text-black cursor-pointer transition-all duration-300 hover:scale-110">
                                <FaFacebookF size={14} />
                            </a>
                            <a href="https://www.instagram.com/ownfresh_official/" target="_blank" rel="noopener noreferrer" title="Instagram" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#FFDD00] hover:text-black cursor-pointer transition-all duration-300 hover:scale-110">
                                <FaInstagram size={14} />
                            </a>
                            <a href="https://x.com/ownfresh_off" target="_blank" rel="noopener noreferrer" title="X (Twitter)" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#FFDD00] hover:text-black cursor-pointer transition-all duration-300 hover:scale-110">
                                <FaXTwitter size={14} />
                            </a>
                            <a href="https://www.youtube.com/@ownfresh_official" target="_blank" rel="noopener noreferrer" title="YouTube" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#FFDD00] hover:text-black cursor-pointer transition-all duration-300 hover:scale-110">
                                <FaYoutube size={14} />
                            </a>
                            <a href="https://www.linkedin.com/company/ownfresh/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#FFDD00] hover:text-black cursor-pointer transition-all duration-300 hover:scale-110">
                                <FaLinkedinIn size={14} />
                            </a>
                        </div>
                    </div>

                </div>
            </section>

            {/* 3. 50/50 SPLIT: FORM & MAP */}
            <section className="w-full max-w-7xl mx-auto py-24 px-6 md:px-12">
                <div className="flex flex-col lg:flex-row bg-white border border-gray-100 shadow-2xl overflow-hidden">
                    
                    {/* Left: Form */}
                    <div className="w-full lg:w-[45%] p-10 lg:p-16 flex flex-col justify-center bg-white z-10 relative">
                        <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight mb-2">Contact Us <span className="text-[#FFDD00]">Today</span></h2>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-10">We would love to hear from you.</p>

                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-6 w-full">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 opacity-60">Full Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Enter your name" 
                                    required
                                    className="w-full border-b-2 border-gray-200 py-3 outline-none text-black font-medium focus:border-black transition-colors bg-transparent placeholder-gray-300" 
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 opacity-60">Email Address</label>
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="Enter your email" 
                                    required
                                    className="w-full border-b-2 border-gray-200 py-3 outline-none text-black font-medium focus:border-black transition-colors bg-transparent placeholder-gray-300" 
                                />
                            </div>
                            <div className="flex flex-col mt-4">
                                <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 opacity-60">Your Message</label>
                                <textarea 
                                    rows="4" 
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    placeholder="How can we help you?" 
                                    required
                                    className="w-full border-b-2 border-gray-200 py-3 outline-none text-black font-medium focus:border-black transition-colors bg-transparent placeholder-gray-300 resize-none" 
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`mt-6 w-full bg-black text-white font-black uppercase tracking-[0.2em] text-xs py-5 transition-all duration-300 ${loading ? 'opacity-50' : 'hover:bg-[#FFDD00] hover:text-black'}`}
                            >
                                {loading ? 'Sending...' : 'Submit Message'}
                            </button>
                        </form>
                    </div>

                    {/* Right: Map (Responsive iFrame) */}
                    <div className="w-full lg:w-[55%] min-h-[400px] lg:min-h-full bg-gray-100 relative">
                        <iframe 
                            src="https://www.google.com/maps/embed?origin=mfe&pb=!1m4!2m1!1s1,+Laxmi+Industrial+Estate,+Dhayari+Pune!5e0!6i12!3m1!1sen!5m1!1sen" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title="OwnFresh Location Map"
                        ></iframe>
                    </div>

                </div>
            </section>

            {/* 4. YELLOW CTA */}
            <section className="w-full bg-[#FFDD00] py-20 px-6 mt-10">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-black text-black leading-tight tracking-tight uppercase mb-4">
                            Switch to a Healthier Lifetime
                        </h2>
                        <p className="text-black/70 font-bold uppercase tracking-widest text-sm">
                            Pure, natural stone-pressed oils. Uncompromised Quality.
                        </p>
                    </div>
                    <SLink 
                        to="/shop" 
                        className="bg-black text-white text-sm font-black uppercase tracking-[0.2em] px-10 py-5 rounded-full hover:bg-white hover:text-black hover:shadow-2xl transition-all duration-300 shrink-0 inline-flex items-center justify-center"
                    >
                        Shop Now
                    </SLink>
                </div>
            </section>
            
        </div>
    );
};

export default Contact;
