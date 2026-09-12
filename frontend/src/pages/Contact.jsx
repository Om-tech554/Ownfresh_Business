import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Phone, Mail, MapPin, Share2, QrCode, Download } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaXTwitter, FaYoutube, FaLinkedinIn } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import SLink from '../components/SLink';
import { serverUrl } from '../App';
import { QRCodeSVG } from 'qrcode.react';

const vCardData = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Salagare;Monali;;;",
    "FN:Monali Salagare",
    "ORG:OWNFRESH AGRO INDUSTRIES",
    "TEL;TYPE=CELL,VOICE:+918999773438",
    "EMAIL;TYPE=INTERNET,WORK:contact@myownfresh.com",
    "URL:https://www.myownfresh.com",
    "ADR;TYPE=WORK:;;1, Vir Maruti Complex, 30/13 Dhayari;Pune;Maharashtra;411041;India",
    "END:VCARD"
].join("\r\n");

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

    const handleDownloadVCard = () => {
        const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Monali_Salagare_OwnFresh.vcf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Contact card (.vcf) downloaded!");
    };

    return (
        <div className="w-full bg-white dark:bg-[#0B0F14] min-h-screen relative z-0 transition-colors duration-250">
            <Navbar />

            {/* 1. HERO SECTION */}
            <section className="w-full bg-[#FAFAFA] dark:bg-[#111720] py-14 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 relative overflow-hidden border-b border-gray-100 dark:border-[#202832] flex flex-col items-center justify-center text-center">
                {/* Watermark hidden on mobile to prevent clipping / collision */}
                <span className="hidden sm:block absolute text-[10vw] font-black text-gray-200/20 dark:text-white/[0.02] uppercase tracking-tighter select-none z-0 pointer-events-none -top-6">OWNFRESH</span>
                
                <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
                    <span className="text-[11px] sm:text-xs font-black text-gray-500 dark:text-[#818C9B] uppercase tracking-[0.25em] mb-3 sm:mb-4 inline-block">
                        Get In Touch
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-black dark:text-[#F7F9FC] leading-snug sm:leading-tight uppercase tracking-tight max-w-3xl">
                        Connect with <span className="inline-block">OwnFresh</span> for <span className="text-[#24672E] dark:text-[#FFD600]">Premium Oils</span>
                    </h1>
                </div>
            </section>

            {/* 2. 4-COLUMN INFO STRIP */}
            <section className="w-full bg-white dark:bg-[#0B0F14] border-b border-gray-100 dark:border-[#202832] transition-colors duration-250">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 md:divide-x divide-gray-100 dark:divide-[#202832]">
                    
                    {/* Phone block */}
                    <div className="p-6 sm:p-8 md:p-10 flex flex-col items-center text-center group hover:bg-gray-50 dark:hover:bg-[#171D26] transition-colors cursor-default">
                        <div className="w-14 h-14 bg-gray-50 dark:bg-[#151B23] group-hover:bg-white dark:group-hover:bg-[#1D2530] rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-sm border border-gray-100 dark:border-[#27313D] transition-colors">
                            <Phone className="w-6 h-6 text-[#FFDD00] dark:text-[#FFD600]" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-[#F7F9FC] mb-2">Call Us</h3>
                        <a href="tel:+918999773438" className="text-gray-600 dark:text-[#B7C1CE] font-bold text-sm sm:text-base hover:text-black dark:hover:text-[#FFD600] transition-colors cursor-pointer">+91 8999 77 3438</a>
                    </div>

                    {/* Email block */}
                    <div className="p-6 sm:p-8 md:p-10 flex flex-col items-center text-center group hover:bg-gray-50 dark:hover:bg-[#171D26] transition-colors cursor-default">
                        <div className="w-14 h-14 bg-gray-50 dark:bg-[#151B23] group-hover:bg-white dark:group-hover:bg-[#1D2530] rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-sm border border-gray-100 dark:border-[#27313D] transition-colors">
                            <Mail className="w-6 h-6 text-[#FFDD00] dark:text-[#FFD600]" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-[#F7F9FC] mb-2">Email Us</h3>
                        <a href="mailto:contact@myownfresh.com" className="text-gray-600 dark:text-[#B7C1CE] font-bold text-sm sm:text-base hover:text-black dark:hover:text-[#FFD600] transition-colors cursor-pointer break-all sm:break-normal">contact@myownfresh.com</a>
                    </div>

                    {/* Address block */}
                    <div className="p-6 sm:p-8 md:p-10 flex flex-col items-center text-center group hover:bg-gray-50 dark:hover:bg-[#171D26] transition-colors cursor-default">
                        <div className="w-14 h-14 bg-gray-50 dark:bg-[#151B23] group-hover:bg-white dark:group-hover:bg-[#1D2530] rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-sm border border-gray-100 dark:border-[#27313D] transition-colors">
                            <MapPin className="w-6 h-6 text-[#FFDD00] dark:text-[#FFD600]" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-[#F7F9FC] mb-2">Location</h3>
                        <p className="text-gray-600 dark:text-[#B7C1CE] font-bold leading-relaxed text-xs sm:text-sm">
                            1, Vir Maruti Complex, 30/13 Dhayari, Pune 411 041. Maharashtra, India.
                        </p>
                    </div>

                    {/* Socials block */}
                    <div className="p-6 sm:p-8 md:p-10 flex flex-col items-center text-center group hover:bg-gray-50 dark:hover:bg-[#171D26] transition-colors cursor-default">
                        <div className="w-14 h-14 bg-gray-50 dark:bg-[#151B23] group-hover:bg-white dark:group-hover:bg-[#1D2530] rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-sm border border-gray-100 dark:border-[#27313D] transition-colors">
                            <Share2 className="w-6 h-6 text-[#FFDD00] dark:text-[#FFD600]" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-[#F7F9FC] mb-3">Follow Us</h3>
                        <div className="flex gap-2.5 sm:gap-3">
                            <a href="https://www.facebook.com/ownfresh.official" target="_blank" rel="noopener noreferrer" title="Facebook" className="w-9 h-9 rounded-full bg-black dark:bg-[#171D26] border dark:border-[#27313D] text-white flex items-center justify-center hover:bg-[#FFDD00] dark:hover:bg-[#FFD600] hover:text-black dark:hover:text-[#101318] cursor-pointer transition-all duration-300 hover:scale-110">
                                <FaFacebookF size={14} />
                            </a>
                            <a href="https://www.instagram.com/ownfresh_official/" target="_blank" rel="noopener noreferrer" title="Instagram" className="w-9 h-9 rounded-full bg-black dark:bg-[#171D26] border dark:border-[#27313D] text-white flex items-center justify-center hover:bg-[#FFDD00] dark:hover:bg-[#FFD600] hover:text-black dark:hover:text-[#101318] cursor-pointer transition-all duration-300 hover:scale-110">
                                <FaInstagram size={14} />
                            </a>
                            <a href="https://x.com/ownfresh_off" target="_blank" rel="noopener noreferrer" title="X (Twitter)" className="w-9 h-9 rounded-full bg-black dark:bg-[#171D26] border dark:border-[#27313D] text-white flex items-center justify-center hover:bg-[#FFDD00] dark:hover:bg-[#FFD600] hover:text-black dark:hover:text-[#101318] cursor-pointer transition-all duration-300 hover:scale-110">
                                <FaXTwitter size={14} />
                            </a>
                            <a href="https://www.youtube.com/@OwnFreshOfficial" target="_blank" rel="noopener noreferrer" title="YouTube" className="w-9 h-9 rounded-full bg-black dark:bg-[#171D26] border dark:border-[#27313D] text-white flex items-center justify-center hover:bg-[#FFDD00] dark:hover:bg-[#FFD600] hover:text-black dark:hover:text-[#101318] cursor-pointer transition-all duration-300 hover:scale-110">
                                <FaYoutube size={14} />
                            </a>
                            <a href="https://www.linkedin.com/company/ownfresh/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="w-9 h-9 rounded-full bg-black dark:bg-[#171D26] border dark:border-[#27313D] text-white flex items-center justify-center hover:bg-[#FFDD00] dark:hover:bg-[#FFD600] hover:text-black dark:hover:text-[#101318] cursor-pointer transition-all duration-300 hover:scale-110">
                                <FaLinkedinIn size={14} />
                            </a>
                        </div>
                    </div>

                </div>
            </section>

            {/* 3. QR CODE CONTACT CARD SECTION */}
            <section className="w-full bg-[#FAFAFA] dark:bg-[#111720] py-14 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 border-b border-gray-100 dark:border-[#202832] transition-colors duration-250">
                <div className="max-w-4xl mx-auto bg-white dark:bg-[#171D26] border border-gray-200 dark:border-[#27313D] rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center gap-8 md:gap-12 transition-colors duration-250">
                    {/* Left: QR Code Display with frame */}
                    <div className="flex flex-col items-center shrink-0">
                        <div className="p-4 bg-white rounded-2xl border-4 border-[#FFDD00] dark:border-[#FFD600] shadow-lg flex items-center justify-center relative group">
                            <QRCodeSVG 
                                value={vCardData} 
                                size={220} 
                                level="L"
                                marginSize={2}
                            />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-[#818C9B] mt-3 flex items-center gap-1.5">
                            <QrCode className="w-3.5 h-3.5 text-black dark:text-[#FFD600]" /> Scan with Phone Camera
                        </span>
                    </div>

                    {/* Right: Contact details summary & Call to Action */}
                    <div className="flex flex-col text-center md:text-left items-center md:items-start flex-1 w-full">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                            <span className="bg-black dark:bg-[#151B23] text-[#FFDD00] dark:text-[#FFD600] border dark:border-[#27313D] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full inline-block">
                                Digital Business Card
                            </span>
                            <span className="text-xs font-black text-black bg-[#FFDD00] dark:bg-[#FFD600] px-2.5 py-1 rounded tracking-widest uppercase inline-block">
                                OWNFRESH AGRO INDUSTRIES
                            </span>
                        </div>

                        {/* Team Leadership List */}
                        <div className="w-full bg-gray-50 dark:bg-[#151B23] border border-gray-100 dark:border-[#27313D] rounded-2xl p-4 my-2 flex flex-col gap-2.5 text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-200/80 dark:border-[#202832] pb-2">
                                <span className="text-sm font-black text-black dark:text-[#F7F9FC]">Shrikishan Agarwal</span>
                                <span className="text-[11px] font-bold text-gray-700 dark:text-[#B7C1CE] bg-white dark:bg-[#1D2530] px-2.5 py-0.5 rounded border border-gray-200 dark:border-[#27313D] w-fit">Head - Research & Development</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-200/80 dark:border-[#202832] pb-2">
                                <span className="text-sm font-black text-black dark:text-[#F7F9FC]">Monali Salagare</span>
                                <span className="text-[11px] font-bold text-gray-700 dark:text-[#B7C1CE] bg-white dark:bg-[#1D2530] px-2.5 py-0.5 rounded border border-gray-200 dark:border-[#27313D] w-fit">Head - Food & Quality</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-sm font-black text-black dark:text-[#F7F9FC]">Omkar Chandra</span>
                                <span className="text-[11px] font-bold text-gray-700 dark:text-[#B7C1CE] bg-white dark:bg-[#1D2530] px-2.5 py-0.5 rounded border border-gray-200 dark:border-[#27313D] w-fit">Head - Technology</span>
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-[#B7C1CE] text-xs font-medium leading-relaxed my-2">
                            Scan this QR code with your smartphone camera to instantly save our official contact details, location, and website straight into your phone's address book.
                        </p>
                        
                        <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start mt-2">
                            <button
                                onClick={handleDownloadVCard}
                                className="inline-flex items-center gap-2 bg-black dark:bg-[#FFD600] text-white dark:text-[#101318] hover:bg-[#FFDD00] dark:hover:bg-[#FFE45C] hover:text-black font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl transition-all duration-300 shadow-md hover:scale-[1.02] cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                Save Contact (.vcf)
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. 50/50 SPLIT: FORM & MAP */}
            <section className="w-full max-w-7xl mx-auto py-14 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12">
                <div className="flex flex-col lg:flex-row bg-white dark:bg-[#171D26] border border-gray-100 dark:border-[#27313D] shadow-2xl rounded-3xl overflow-hidden transition-colors duration-250">
                    
                    {/* Left: Form */}
                    <div className="w-full lg:w-[45%] p-6 sm:p-10 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#171D26] z-10 relative">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-black dark:text-[#F7F9FC] uppercase tracking-tight mb-2">Contact Us <span className="text-[#FFDD00] dark:text-[#FFD600]">Today</span></h2>
                        <p className="text-gray-500 dark:text-[#818C9B] text-xs sm:text-sm font-bold uppercase tracking-widest mb-8 sm:mb-10">We would love to hear from you.</p>

                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 sm:gap-6 w-full">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black text-black dark:text-[#B7C1CE] uppercase tracking-widest mb-2 opacity-60">Full Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Enter your name" 
                                    required
                                    className="w-full border-b-2 border-gray-200 dark:border-[#29333F] py-3 outline-none text-black dark:text-[#F5F7FA] font-medium focus:border-black dark:focus:border-[#FFD600] transition-colors bg-transparent placeholder-gray-400 dark:placeholder-[#778393]" 
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black text-black dark:text-[#B7C1CE] uppercase tracking-widest mb-2 opacity-60">Email Address</label>
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="Enter your email" 
                                    required
                                    className="w-full border-b-2 border-gray-200 dark:border-[#29333F] py-3 outline-none text-black dark:text-[#F5F7FA] font-medium focus:border-black dark:focus:border-[#FFD600] transition-colors bg-transparent placeholder-gray-400 dark:placeholder-[#778393]" 
                                />
                            </div>
                            <div className="flex flex-col mt-2">
                                <label className="text-[10px] font-black text-black dark:text-[#B7C1CE] uppercase tracking-widest mb-2 opacity-60">Your Message</label>
                                <textarea 
                                    rows="4" 
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    placeholder="How can we help you?" 
                                    required
                                    className="w-full border-b-2 border-gray-200 dark:border-[#29333F] py-3 outline-none text-black dark:text-[#F5F7FA] font-medium focus:border-black dark:focus:border-[#FFD600] transition-colors bg-transparent placeholder-gray-400 dark:placeholder-[#778393] resize-none" 
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`mt-4 sm:mt-6 w-full bg-black dark:bg-[#FFD600] text-white dark:text-[#101318] font-black uppercase tracking-[0.2em] text-xs py-4 sm:py-5 rounded-2xl transition-all duration-300 cursor-pointer ${loading ? 'opacity-50' : 'hover:bg-[#FFDD00] dark:hover:bg-[#FFE45C] hover:text-black'}`}
                            >
                                {loading ? 'Sending...' : 'Submit Message'}
                            </button>
                        </form>
                    </div>

                    {/* Right: Map (Responsive iFrame) */}
                    <div className="w-full lg:w-[55%] min-h-[320px] sm:min-h-[400px] lg:min-h-full bg-gray-100 dark:bg-[#151B23] relative">
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

            {/* 5. BOTTOM CTA (Dark charcoal in dark theme, yellow in light theme) */}
            <section className="w-full bg-[#FFDD00] dark:bg-[#111720] border-t dark:border-[#202832] py-14 sm:py-16 md:py-20 px-4 sm:px-6 mt-10 pb-28 md:pb-20 transition-colors duration-250">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-black dark:text-[#F7F9FC] leading-tight tracking-tight uppercase mb-3 sm:mb-4">
                            Switch to a <span className="text-black dark:text-[#FFD600]">Healthier Lifetime</span>
                        </h2>
                        <p className="text-black/80 dark:text-[#B7C1CE] font-bold uppercase tracking-widest text-xs sm:text-sm">
                            Pure, natural stone-pressed oils. Uncompromised Quality.
                        </p>
                    </div>
                    <SLink 
                        to="/shop" 
                        className="bg-black dark:bg-[#FFD600] text-white dark:text-[#101318] text-xs sm:text-sm font-black uppercase tracking-[0.2em] px-8 sm:px-10 py-4 sm:py-5 rounded-full hover:bg-white dark:hover:bg-[#FFE45C] hover:text-black dark:hover:text-[#101318] hover:shadow-2xl transition-all duration-300 shrink-0 inline-flex items-center justify-center cursor-pointer shadow-md"
                    >
                        Shop Now
                    </SLink>
                </div>
            </section>
            
        </div>
    );
};

export default Contact;
