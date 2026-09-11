import React, { useState } from "react";
import { FaInstagram, FaFacebookF, FaXTwitter, FaYoutube, FaLinkedinIn } from "react-icons/fa6";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../App";
import SLink from "../components/SLink";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const socialLinks = [
    { Icon: FaInstagram, url: "https://www.instagram.com/ownfresh_official/", label: "Instagram" },
    { Icon: FaFacebookF, url: "https://www.facebook.com/ownfresh.official", label: "Facebook" },
    { Icon: FaXTwitter, url: "https://x.com/ownfresh_off", label: "X" },
    { Icon: FaYoutube, url: "https://www.youtube.com/@OwnFreshOfficial", label: "YouTube" },
    { Icon: FaLinkedinIn, url: "https://www.linkedin.com/company/ownfresh/", label: "LinkedIn" }
  ];

  const handleSubscribe = async () => {
    if (!email) {
      return toast.error("Please enter your email");
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error("Please enter a valid email");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${serverUrl}/api/newsletter/subscribe`,
        { email }
      );

      toast.success(res.data.message);
      setEmail(""); // clear input
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="print:hidden bg-[#f5f5f5] dark:bg-[#080B10] text-gray-600 dark:text-[#8C97A6] border-t border-transparent dark:border-[#202731] pt-16 pb-36 sm:pb-32 lg:pb-12 px-6 md:px-20 transition-colors duration-250">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12">

        {/* Column 1 */}
        <div>
          <img
            src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png"
            alt="OwnFresh Logo"
            className="h-10 w-auto object-contain mb-6"
          />

          <p className="mb-4 leading-relaxed dark:text-[#8C97A6]">
            Founded in Dhayari Pune, OwnFresh is committed to producing
            Premium Grade Pure Oil, stone-pressed oils from whole nuts and seeds.
          </p>

          <p className="leading-relaxed dark:text-[#8C97A6]">
            OwnFresh champions Premium Grade Pure Oil Botanic purity while empowering women.
          </p>

          <div className="flex gap-6 mt-6 text-black dark:text-[#AEB8C5]">
            {socialLinks.map(({ Icon, url, label }, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="cursor-pointer transition-all duration-300 hover:scale-125 hover:text-yellow-600 dark:hover:text-[#FFD600]"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-[#E8ECF2] mb-6">Company</h3>

          <ul className="space-y-4">
            {[
              { name: "About Us", path: "/whyownfresh" },
              { name: "Blogs", path: "/oilinsights" },
              { name: "Contact", path: "/contact" },
              { name: "1% Prime", path: "/membership" },
              { name: "WHY OWNFRESH ?", path: "/whyownfresh" },
            ].map((item, index) => (
              <li key={index} className="w-fit">
                <SLink
                  to={item.path}
                  className="group relative inline-block transition-all duration-300 hover:text-black dark:text-[#AEB8C5] dark:hover:text-[#FFD600]"
                >
                  {item.name}
                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black dark:bg-[#FFD600] transition-all duration-300 group-hover:w-full"></span>
                </SLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-[#E8ECF2] mb-6">Support & Policies</h3>
          <ul className="space-y-4">
            <li>
              <SLink
                to="/gallery?category=Certifications"
                className="group relative inline-block transition-all duration-300 hover:text-black dark:text-[#AEB8C5] dark:hover:text-[#FFD600]"
              >
                Certification
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black dark:bg-[#FFD600] transition-all duration-300 group-hover:w-full"></span>
              </SLink>
            </li>
            <li>
              <SLink
                to="/privacy-policy"
                className="group relative inline-block transition-all duration-300 hover:text-black dark:text-[#AEB8C5] dark:hover:text-[#FFD600]"
              >
                Privacy Policy
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black dark:bg-[#FFD600] transition-all duration-300 group-hover:w-full"></span>
              </SLink>
            </li>
            <li>
              <SLink
                to="/terms-and-conditions"
                className="group relative inline-block transition-all duration-300 hover:text-black dark:text-[#AEB8C5] dark:hover:text-[#FFD600]"
              >
                Terms & Conditions
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black dark:bg-[#FFD600] transition-all duration-300 group-hover:w-full"></span>
              </SLink>
            </li>
            <li>
              <SLink
                to="/refund-policy"
                className="group relative inline-block transition-all duration-300 hover:text-black dark:text-[#AEB8C5] dark:hover:text-[#FFD600]"
              >
                Refund Policy
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black dark:bg-[#FFD600] transition-all duration-300 group-hover:w-full"></span>
              </SLink>
            </li>
            <li>
              <SLink
                to="/shipping-policy"
                className="group relative inline-block transition-all duration-300 hover:text-black dark:text-[#AEB8C5] dark:hover:text-[#FFD600]"
              >
                Shipping Policy
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black dark:bg-[#FFD600] transition-all duration-300 group-hover:w-full"></span>
              </SLink>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="w-full">
          <h3 className="text-lg font-semibold text-black dark:text-[#E8ECF2] mb-4 sm:mb-6">
            Newsletter
          </h3>

          <p className="mb-4 sm:mb-6 text-sm text-gray-600 dark:text-[#8C97A6] leading-relaxed">
            Avail attractive discounts on your orders by joining our Newsletter
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubscribe();
            }}
            className="w-full max-w-md"
          >
            <div className="flex flex-col sm:flex-row w-full bg-white dark:bg-[#151B23] border border-gray-300 dark:border-[#29333F] rounded-2xl sm:rounded-full overflow-hidden shadow-xs focus-within:border-[#1E971D] dark:focus-within:border-[#FFD600] focus-within:ring-2 focus-within:ring-[#1E971D]/20 dark:focus-within:ring-[#FFD600]/20 transition-all p-1 sm:p-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email address for newsletter"
                className="w-full sm:flex-1 min-w-0 px-4 py-3 text-sm outline-none bg-transparent text-slate-900 dark:text-[#F5F7FA] placeholder:text-gray-400 dark:placeholder:text-[#778393] rounded-xl sm:rounded-none border-none focus:ring-0"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-black dark:bg-[#FFD600] text-white dark:text-[#111318] text-xs sm:text-sm font-extrabold tracking-wider uppercase rounded-xl sm:rounded-full hover:bg-[#FFDD00] dark:hover:bg-[#FFE45C] hover:text-black transition-all duration-300 disabled:opacity-60 cursor-pointer shrink-0 text-center active:scale-[0.98]"
              >
                {loading ? "..." : "SUBSCRIBE"}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Secure Payments Footer Section */}
      <div className="border-t border-gray-200 dark:border-[#202731] mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-500 dark:text-[#8C97A6]">
        <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
          <span className="text-gray-900 dark:text-[#E8ECF2] text-sm font-black tracking-tight">Secure & Easy Payments</span>
          <span>We support: Credit Card • Debit Card • UPI • Net Banking</span>
        </div>
        <div className="flex gap-3">
          <span className="px-3 py-1.5 bg-white dark:bg-[#171D26] border border-gray-300 dark:border-[#27313D] rounded-md text-gray-800 dark:text-[#AEB8C5] font-extrabold uppercase tracking-wider text-[9px] shadow-sm select-none">UPI</span>
          <span className="px-3 py-1.5 bg-white dark:bg-[#171D26] border border-gray-300 dark:border-[#27313D] rounded-md text-gray-800 dark:text-[#AEB8C5] font-extrabold uppercase tracking-wider text-[9px] shadow-sm select-none">Cards</span>
          <span className="px-3 py-1.5 bg-white dark:bg-[#171D26] border border-gray-300 dark:border-[#27313D] rounded-md text-gray-800 dark:text-[#AEB8C5] font-extrabold uppercase tracking-wider text-[9px] shadow-sm select-none">Net Banking</span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 dark:border-[#202731] mt-8 pt-6 pb-2 text-center text-xs sm:text-sm text-gray-500 dark:text-[#8C97A6] relative z-10 flex flex-col items-center justify-center gap-2">
        <p className="hover:text-black dark:hover:text-[#F5F7FA] transition duration-300 font-medium">
          © 2026 OwnFresh. All rights reserved.
        </p>
        <p className="flex items-center justify-center flex-wrap gap-1 text-xs text-gray-600 dark:text-[#8C97A6] font-medium">
          <span>Designed & developed by</span>
          <a
            href="https://www.technewity.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center font-bold text-[#1E971D] dark:text-[#19C37D] hover:text-black dark:hover:text-[#FFD600] hover:underline px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-[#151B23] hover:bg-emerald-100 dark:hover:bg-[#1D2530] transition-all border border-emerald-200/80 dark:border-[#27313D] shadow-2xs"
          >
            TechNewity Labs
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
