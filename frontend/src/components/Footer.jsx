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
    { Icon: FaYoutube, url: "https://www.youtube.com/@ownfresh_official", label: "YouTube" },
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
    <footer className="bg-[#f5f5f5] text-gray-600 pt-16 pb-8 px-6 md:px-20">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12">

        {/* Column 1 */}
        <div>
          <img 
            src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png" 
            alt="OwnFresh Logo" 
            className="h-10 w-auto object-contain mb-6" 
          />

          <p className="mb-4 leading-relaxed">
            Founded in Dhayari Pune, OwnFresh is committed to producing
            100% pure, stone-pressed oils from whole nuts and seeds.
          </p>

          <p className="leading-relaxed">
            OwnFresh champions 100% Botanic purity while empowering women.
          </p>

          <div className="flex gap-6 mt-6 text-black">
            {socialLinks.map(({ Icon, url, label }, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="cursor-pointer transition-all duration-300 hover:scale-125 hover:text-yellow-600"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-6">Company</h3>

          <ul className="space-y-4">
            {[
              { name: "About Us", path: "/whyownfresh" },
              { name: "Blogs", path: "/oilinsights" },
              { name: "Contact", path: "/contact" },
              { name: "WHY OWNFRESH ?", path: "/whyownfresh" },
            ].map((item, index) => (
              <li key={index} className="w-fit">
                <SLink
                  to={item.path}
                  className="group relative inline-block transition-all duration-300 hover:text-black"
                >
                  {item.name}
                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
                </SLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-6">Support</h3>
          <ul className="space-y-4">
            <li>
              <SLink
                to="/gallery?category=Certifications"
                className="group relative inline-block transition-all duration-300 hover:text-black"
              >
                Certification
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
              </SLink>
            </li>
            <li className="relative w-fit cursor-pointer transition-all duration-300 hover:text-black group">
              Help Center
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-6">
            Newsletter
          </h3>

          <p className="mb-6">
            Avail attractive discounts on your orders by joining our Newsletter
          </p>

          <div className="flex flex-row w-full max-w-md bg-white border border-gray-300 rounded-full overflow-hidden shadow-sm">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 min-w-0 px-5 py-3 text-sm outline-none bg-white text-black border-none rounded-none focus:ring-0"
            />

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="px-6 py-3 bg-black text-white text-sm font-semibold rounded-none hover:bg-[#FFDD00] hover:text-black transition duration-300 disabled:opacity-60 cursor-pointer shrink-0"
            >
              {loading ? "..." : "SUBSCRIBE"}
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="border-t mt-16 pt-6 text-center text-sm text-gray-500">
        <p className="hover:text-black transition duration-300">
          ©2026 OwnFresh Privacy Policy
        </p>
        <p className="mt-2">All rights reserved</p>
        <p className="mt-2 hover:text-black transition duration-300">
          Designed & developed by TechNewity
        </p>
      </div>
    </footer>
  );
};

export default Footer;
