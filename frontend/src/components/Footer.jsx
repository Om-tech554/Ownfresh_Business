import React, { useState } from "react";
import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../App";
import SLink from "../components/SLink";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
      <div className="grid md:grid-cols-4 gap-12">

        {/* Column 1 */}
        <div>
          <h2 className="text-2xl font-semibold text-black mb-6">
            OWNFRESH
          </h2>

          <p className="mb-4 leading-relaxed">
            Founded in Dhayari Pune, OwnFresh is committed to producing
            100% pure, stone-pressed oils from whole nuts and seeds.
          </p>

          <p className="leading-relaxed">
            OwnFresh champions 100% Botanic purity while empowering women.
          </p>

          <div className="flex gap-6 mt-6 text-black">
            {[Instagram, Facebook, Linkedin, FaXTwitter, Youtube].map(
              (Icon, index) => (
                <Icon
                  key={index}
                  size={20}
                  className="cursor-pointer transition-all duration-300 hover:scale-125 hover:text-yellow-600"
                />
              )
            )}
          </div>
        </div>

        {/* Company */}
       <div>
  <h3 className="text-lg font-semibold text-black mb-6">Company</h3>

  <ul className="space-y-4">
    {[
      { name: "About Us", path: "/about" },
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
            {["Certification", "Help Center"].map((item, index) => (
              <li
                key={index}
                className="relative w-fit cursor-pointer transition-all duration-300 hover:text-black"
              >
                {item}
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black transition-all duration-300 hover:w-full"></span>
              </li>
            ))}
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

  <div className="flex w-full max-w-md bg-white border border-gray-300 rounded-full overflow-hidden shadow-sm">
    
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="your@email.com"
      className="flex-1 px-5 py-3 text-sm outline-none"
    />

    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="px-6 py-3 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition duration-300 disabled:opacity-60"
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
