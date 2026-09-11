import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, Mail, User, MessageSquare } from 'lucide-react';
import { serverUrl } from '../App';

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/contact/submit`, formData);
      toast.success('Thanks for reaching out! We will get back to you shortly.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-[#FAFAFA] dark:bg-[#0B0F14] transition-colors duration-250" data-aos="fade-up">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white dark:bg-[#171D26] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-[#27313D] transition-colors duration-250">

          {/* Left Side: Branding/Info */}
          <div className="w-full md:w-2/5 bg-[#181818] dark:bg-[#111720] p-10 md:p-16 flex flex-col justify-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFDD00] dark:bg-[#FFD600] opacity-10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <span className="text-[#FFDD00] dark:text-[#FFD600] text-xs font-black uppercase tracking-[0.3em] mb-4 block">Get in touch</span>
              <h2 className="text-4xl font-black uppercase tracking-tight leading-tight mb-6 text-white dark:text-[#F7F9FC]">
                Have a <br />
                <span className="text-[#FFDD00] dark:text-[#FFD600]">Question?</span>
              </h2>
              <p className="text-gray-400 dark:text-[#B7C1CE] font-medium leading-relaxed mb-8">
                Reach out to us directly. We are here to help you choose the best stone-pressed oils for your health.
              </p>

              <a href="mailto:contact@myownfresh.com" className="flex items-center gap-4 text-sm font-bold text-gray-300 dark:text-[#F5F7FA] hover:text-[#FFDD00] dark:hover:text-[#FFD600] transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/5 dark:bg-[#1D2530] border border-transparent dark:border-[#303B48] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#FFDD00] dark:text-[#FFD600]" />
                </div>
                contact@myownfresh.com
              </a>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="w-full md:w-3/5 p-10 md:p-16 bg-white dark:bg-[#171D26] transition-colors duration-250">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label className="text-[10px] font-black text-black dark:text-[#B7C1CE] uppercase tracking-widest mb-2 block opacity-70 dark:opacity-90">Full Name</label>
                <div className="relative">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#818C9B]" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-transparent border-b-2 border-gray-100 dark:border-[#27313D] py-3 pl-8 outline-none focus:border-[#FFDD00] dark:focus:border-[#FFD600] transition-all font-medium text-black dark:text-[#F5F7FA] placeholder-gray-400 dark:placeholder-[#778393]"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-black dark:text-[#B7C1CE] uppercase tracking-widest mb-2 block opacity-70 dark:opacity-90">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#818C9B]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full bg-transparent border-b-2 border-gray-100 dark:border-[#27313D] py-3 pl-8 outline-none focus:border-[#FFDD00] dark:focus:border-[#FFD600] transition-all font-medium text-black dark:text-[#F5F7FA] placeholder-gray-400 dark:placeholder-[#778393]"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-black dark:text-[#B7C1CE] uppercase tracking-widest mb-2 block opacity-70 dark:opacity-90">Your Message</label>
                <div className="relative">
                  <MessageSquare className="absolute left-0 top-4 w-4 h-4 text-gray-400 dark:text-[#818C9B]" />
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="w-full bg-transparent border-b-2 border-gray-100 dark:border-[#27313D] py-3 pl-8 outline-none focus:border-[#FFDD00] dark:focus:border-[#FFD600] transition-all font-medium text-black dark:text-[#F5F7FA] placeholder-gray-400 dark:placeholder-[#778393] resize-none"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full group relative flex items-center justify-center gap-3 bg-black dark:bg-[#FFD600] text-white dark:text-[#111318] py-5 px-10 rounded-full font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 overflow-hidden cursor-pointer shadow-md ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FFDD00] dark:hover:bg-[#FFE45C] hover:text-black hover:shadow-xl'
                }`}
              >
                <span className="relative z-10">{loading ? 'Sending...' : 'Send Message'}</span>
                {!loading && <Send className="w-4 h-4 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
