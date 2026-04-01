import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, Mail, User, MessageSquare } from 'lucide-react';

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.post(`${API_BASE_URL}/api/contact/submit`, formData);
      toast.success('Message sent! We will get back to you at my1ownfresh@gmail.com');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-[#FAFAFA]" data-aos="fade-up">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          
          {/* Left Side: Branding/Info */}
          <div className="w-full md:w-2/5 bg-[#181818] p-10 md:p-16 flex flex-col justify-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F9DD19] opacity-10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
              <span className="text-[#F9DD19] text-xs font-black uppercase tracking-[0.3em] mb-4 block">Get in touch</span>
              <h2 className="text-4xl font-black uppercase tracking-tight leading-tight mb-6">
                Have a <br />
                <span className="text-[#F9DD19]">Question?</span>
              </h2>
              <p className="text-gray-400 font-medium leading-relaxed mb-8">
                Reach out to us directly. We are here to help you choose the best cold-pressed oils for your health.
              </p>
              
              <div className="flex items-center gap-4 text-sm font-bold text-gray-300">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#F9DD19]" />
                </div>
                my1ownfresh@gmail.com
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="w-full md:w-3/5 p-10 md:p-16 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block opacity-60">Full Name</label>
                <div className="relative">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full border-b-2 border-gray-100 py-3 pl-8 outline-none focus:border-[#F9DD19] transition-all font-medium text-black placeholder-gray-300"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block opacity-60">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full border-b-2 border-gray-100 py-3 pl-8 outline-none focus:border-[#F9DD19] transition-all font-medium text-black placeholder-gray-300"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block opacity-60">Your Message</label>
                <div className="relative">
                  <MessageSquare className="absolute left-0 top-4 w-4 h-4 text-gray-300" />
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="w-full border-b-2 border-gray-100 py-3 pl-8 outline-none focus:border-[#F9DD19] transition-all font-medium text-black placeholder-gray-300 resize-none"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full group relative flex items-center justify-center gap-3 bg-black text-white py-5 px-10 rounded-full font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 overflow-hidden ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F9DD19] hover:text-black hover:shadow-xl'
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
