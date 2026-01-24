import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AOS from "aos";
import axios from "axios";
import SLink from "../components/SLink";

const OilInsights = () => {
  const [blogs, setBlogs] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // STATIC BLOG DATA
  const staticBlogs = [
    {
      id: 1,
      title: "Why Cold-Pressed Oil is Better Than Refined Oil?",
      category: "Health",
      date: "January 2026",
      description:
        "Cold-pressed oils retain natural nutrients, antioxidants, and flavor without chemicals.",
      image:
        "https://images.unsplash.com/photo-1510627498534-cf7e9002facc",
    },
    {
      id: 2,
      title: "Top 5 Healthy Oils for Daily Cooking",
      category: "Nutrition",
      date: "January 2026",
      description:
        "Discover healthiest oils backed by Ayurveda & modern science.",
      image:
        "https://images.unsplash.com/photo-1604908176857-1e037c494a2e",
    },
    {
      id: 3,
      title: "How Mustard Oil Improves Digestion Naturally",
      category: "Wellness",
      date: "February 2026",
      description:
        "Mustard oil boosts digestion, improves metabolism, and reduces inflammation naturally.",
      image:
        "https://images.unsplash.com/photo-1598202493891-8f1c6fe5bc4e",
    },
  ];

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // FETCH DYNAMIC BLOGS
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/blog/all`);
        setBlogs(res.data.blogs || []);
      } catch (error) {
        console.log("Error loading blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <>
      <Navbar />

      <div className="w-full py-10 bg-[#fffdf8] mt-[100px]">

        {/* HERO */}
        <div className="max-w-5xl mx-auto text-center px-4" data-aos="fade-down">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#ff4d2d]">
            OwnFresh Oil Insights
          </h1>
          <p className="text-gray-700 mt-4 text-lg md:text-xl">
            Discover health benefits, science, and lifestyle insights.
          </p>
        </div>

        {/* STATIC BLOG SECTION */}
        <div className="max-w-6xl mx-auto flex flex-col gap-12 mt-16 px-4">
          <h2 className="text-3xl font-bold text-gray-900" data-aos="fade-up">
            Featured Insights
          </h2>

          {staticBlogs.map((blog) => (
            <div key={blog.id} className="max-w-4xl mx-auto w-full">
              <SLink
                to={`/oil-insights/static/${blog.id}`}
                className="flex flex-col md:flex-row gap-6 bg-white shadow-md hover:shadow-xl 
                           rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer"
                data-aos="fade-up"
              >
                {/* IMAGE */}
                <div className="w-full md:w-[40%] h-[230px] md:h-[220px] bg-white flex items-center justify-center">
                  <img
                    src={blog.image}
                    className="w-full h-full object-contain p-4"
                    alt={blog.title}
                  />
                </div>

                {/* TEXT */}
                <div className="w-full md:w-[60%] flex flex-col justify-center p-5">
                  <span className="text-sm text-[#ff4d2d] font-semibold">
                    {blog.category} • {blog.date}
                  </span>

                  <h2 className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">
                    {blog.title}
                  </h2>

                  <p className="text-gray-600 mt-3 leading-relaxed">
                    {blog.description}
                  </p>

                  <span className="mt-5 w-fit px-5 py-2 bg-[#ff4d2d] text-white rounded-xl font-bold shadow-md 
                                   hover:bg-[#e63626] transition-all duration-200 inline-block">
                    Read More →
                  </span>
                </div>
              </SLink>
            </div>
          ))}
        </div>

        {/* DYNAMIC BLOGS BELOW */}
        <div className="max-w-6xl mx-auto flex flex-col gap-12 mt-20 px-4">
          <h2 className="text-3xl font-bold text-gray-900" data-aos="fade-up">
            Latest Posts
          </h2>

          {blogs.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Loading blogs...</p>
          ) : (
            blogs.map((blog) => (
              <div key={blog._id} className="max-w-4xl mx-auto w-full">
                <SLink
                  to={`/blog/${blog._id}`}
                  className="flex flex-col md:flex-row gap-6 bg-white shadow-md hover:shadow-xl 
                             rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer"
                  data-aos="fade-up"
                >
                  {/* IMAGE */}
                  <div className="w-full md:w-[40%] h-[230px] md:h-[220px] bg-white flex items-center justify-center">
                    <img
                      src={blog.image}
                      className="w-full h-full object-contain p-4"
                      alt={blog.title}
                    />
                  </div>

                  {/* TEXT */}
                  <div className="w-full md:w-[60%] flex flex-col justify-center p-5">
                    <span className="text-sm text-[#ff4d2d] font-semibold">
                      {blog.category || "General"} • {blog.date || "Recently"}
                    </span>

                    <h2 className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">
                      {blog.title}
                    </h2>

                    <p className="text-gray-600 mt-3 leading-relaxed line-clamp-3">
                      {blog.description}
                    </p>

                    <span className="mt-5 w-fit px-5 py-2 bg-[#ff4d2d] text-white rounded-xl font-bold shadow-md 
                                     hover:bg-[#e63626] transition-all duration-200 inline-block">
                      Read More →
                    </span>
                  </div>
                </SLink>
              </div>
            ))
          )}
        </div>

        {/* CTA SECTION */}
        <div className="max-w-4xl mx-auto mt-20 text-center px-4" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Fresh, Pure & Healthy — Choose Better Oils Today!
          </h2>

          <SLink
            to="/shop"
            className="mt-6 inline-block px-6 py-3 bg-[#FFD700] text-black font-bold rounded-xl shadow-md 
                       hover:opacity-90 transition-all duration-200 cursor-pointer"
          >
            Explore Our Products
          </SLink>

          {/* Scroll to Top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-5 right-5 bg-[#FFD700] p-3 rounded-full shadow-lg 
                       hover:bg-[#ff4d2d] transition text-black font-bold"
          >
            ↑
          </button>
        </div>

      </div>
    </>
  );
};

export default OilInsights;
