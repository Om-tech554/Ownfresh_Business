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
    "EMAIL;TYPE=INTERNET,WORK:ownfresh@ghanioils.com",
    "URL:https://www.ghanioils.com",
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
        <div className="w-full bg-white min-h-screen relative z-0">
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
                        <a href="mailto:ownfresh@ghanioils.com" className="text-gray-500 font-bold hover:text-black transition-colors cursor-pointer">ownfresh@ghanioils.com</a>
                    </div>

                    {/* Address block */}
                    <div className="p-10 flex flex-col items-center text-center group hover:bg-gray-50 transition-colors cursor-default">
                        <div className="w-14 h-14 bg-gray-50 group-hover:bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 transition-colors">
                            <MapPin className="w-6 h-6 text-[#FFDD00]" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-black mb-2">Location</h3>
                        <p className="text-gray-500 font-bold leading-relaxed text-sm">
                            1, Vir Maruti Complex, 30/13 Dhayari, Pune 411 041. Maharashtra, India.
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

            {/* 3. QR CODE CONTACT CARD SECTION */}
            <section className="w-full bg-[#FAFAFA] py-16 px-6 md:px-12 border-b border-gray-100">
                <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    {/* Left: QR Code Display with frame */}
                    <div className="flex flex-col items-center shrink-0">
                        <div className="p-4 bg-white rounded-2xl border-4 border-[#FFDD00] shadow-lg flex items-center justify-center relative group">
                            <QRCodeSVG 
                                value={vCardData} 
                                size={240} 
                                level="L"
                                marginSize={2}
                            />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-3 flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5 text-black" /> Scan with Phone Camera
                        </span>
                    </div>

                    {/* Right: Contact details summary & Call to Action */}
                    <div className="flex flex-col text-center md:text-left items-center md:items-start flex-1 w-full">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                            <span className="bg-black text-[#FFDD00] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full inline-block">
                                Digital Business Card
                            </span>
                            <span className="text-xs font-black text-black bg-[#FFDD00] px-2.5 py-1 rounded tracking-widest uppercase inline-block">
                                OWNFRESH AGRO INDUSTRIES
                            </span>
                        </div>

                        {/* Team Leadership List */}
                        <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 my-2 flex flex-col gap-2.5 text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-200/80 pb-2">
                                <span className="text-sm font-black text-black">Shrikishan Agarwal</span>
                                <span className="text-[11px] font-bold text-gray-700 bg-white px-2.5 py-0.5 rounded border border-gray-200 w-fit">Head - Research & Development</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-200/80 pb-2">
                                <span className="text-sm font-black text-black">Monali Salagare</span>
                                <span className="text-[11px] font-bold text-gray-700 bg-white px-2.5 py-0.5 rounded border border-gray-200 w-fit">Head - Food & Quality</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-sm font-black text-black">Omkar Chandra</span>
                                <span className="text-[11px] font-bold text-gray-700 bg-white px-2.5 py-0.5 rounded border border-gray-200 w-fit">Head - Technology</span>
                            </div>
                        </div>

                        <p className="text-gray-500 text-xs font-medium leading-relaxed my-2">
                            Scan this QR code with your smartphone camera to instantly save our official contact details, location, and website straight into your phone's address book.
                        </p>
                        
                        <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start mt-2">
                            <button
                                onClick={handleDownloadVCard}
                                className="inline-flex items-center gap-2 bg-black text-white hover:bg-[#FFDD00] hover:text-black font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl transition-all duration-300 shadow-md hover:scale-[1.02] cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                Save Contact (.vcf)
                            </button>
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
