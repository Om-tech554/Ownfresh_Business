import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import AOS from "aos";
import { ArrowLeft } from "lucide-react";
import SLink from "../components/SLink";

// STATIC BLOG DATA (same as OilInsights)
const staticBlogs = [
  {
    id: 1,
    title: "Why Cold-Pressed Oil is Better Than Refined Oil?",
    subtitle:
      "Cold-pressed oils retain nutrients, antioxidants & natural flavor without heat or chemicals.",
    image:
      "https://myownfresh.com/wp-content/uploads/2025/06/Groundnut-1-600x600.png",
    category: "Health",
    date: "January 2026",
    content: `
Cold-pressed oils are extracted naturally, without exposing seeds to heat.

This helps retain:

• Antioxidants  
• Vitamins  
• Natural aroma  
• Pure taste  
• Healthy fatty acids  

Refined oils, on the other hand, go through chemical treatment, bleaching, and heating — which destroys nutrients.

💛 Benefits of Cold-Pressed Oils

• Boosts immunity  
• Improves heart health  
• Helps digestion  
• No chemicals or preservatives  
• Superior taste & aroma  

✨ Conclusion

Switching to cold-pressed oils is an easy and powerful lifestyle upgrade that your body will thank you for.
      `,
  },
  {
    id: 2,
    title: "Top 5 Healthy Oils for Daily Cooking",
    subtitle: "Choose oils that bring flavor, nutrition, and cooking performance.",
    image:
      "https://myownfresh.com/wp-content/uploads/2024/10/272d6f3f69f4e2e81051b6a17124b504.png",
    category: "Nutrition",
    date: "January 2026",
    content: `
Different cooking methods require different oils.

⭐ Top 5 Oils for Daily Use

1. **Groundnut Oil** — Great for frying  
2. **Coconut Oil** — For immunity & digestion  
3. **Mustard Oil** — Anti-inflammatory  
4. **Sesame Oil** — Heart-friendly  
5. **Sunflower Oil** — Vitamin-rich  

💡 Tip  
Always choose **cold-pressed** oils to avoid chemicals and retain nutrients.
    `,
  },
  {
    id: 3,
    title: "How Mustard Oil Improves Digestion Naturally",
    subtitle: "Mustard oil stimulates digestion and supports a healthy gut.",
    image:
      "https://argan-oil.ma/wp-content/uploads/2025/02/DALL%C2%B7E-2025-02-17-16.44.57-A-realistic-digital-illustration-of-traditional-cold-pressed-argan-oil-extraction-using-a-stone-mill.-The-scene-features-a-rustic-stone-grinder-crushi.webp",
    category: "Wellness",
    date: "February 2026",

    content: `
Mustard oil is widely used in Indian homes for cooking,
but not everyone knows that it offers significant digestive benefits.

⚡ Benefits

• Improves digestion  
• Reduces inflammation  
• Boosts metabolism  
• Supports detoxification  

### 📌 Summary
Adding mustard oil into your diet can support a healthy gut and immunity.
    `,
  },
];

const StaticBlogDetails = () => {
  const { id } = useParams();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Find blog by ID
  const blog = staticBlogs.find((b) => b.id === parseInt(id));

  if (!blog) {
    return (
      <>
        <Navbar />
        <div className="w-full h-screen flex items-center justify-center text-gray-600 text-lg">
          Blog not found.
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10 mt-15">

        {/* Back Button using SLink */}
        <SLink
          to="/Oilinsights"
          className="flex items-center gap-2 text-gray-700 hover:text-[#24672E] mb-6 transition cursor-pointer"
          data-aos="fade-right"
        >
          <ArrowLeft size={20} />
          Back to Insights
        </SLink>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight"
          data-aos="fade-down"
        >
          {blog.title}
        </h1>

        {/* Meta */}
        <div
          className="mt-4 text-sm text-gray-600 flex gap-3"
          data-aos="fade-down"
        >
          <span className="font-semibold text-[#24672E]">{blog.category}</span>
          <span>•</span>
          <span>{blog.date}</span>
        </div>

        {/* Image */}
        <div className="w-full mt-8 rounded-xl overflow-hidden shadow-lg" data-aos="zoom-in">
          <img
            src={blog.image}
            className="w-full h-[350px] md:h-[420px] object-contain bg-white p-4"
            alt={blog.title}
          />
        </div>

        {/* Subtitle */}
        <p
          className="mt-6 text-xl text-gray-700 leading-relaxed"
          data-aos="fade-up"
        >
          {blog.subtitle}
        </p>

        {/* Main Content */}
        <div
          className="mt-10 text-gray-700 text-lg leading-relaxed whitespace-pre-line"
          data-aos="fade-up"
        >
          {blog.content}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Fresh, Pure & Healthy — Choose Better Oils Today!
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Follow our insights for tips, recipes, and nutritional guidance.
          </p>

          <SLink
            to="/shop"
            className="mt-6 px-6 py-3 bg-[#FFD700] text-black font-bold rounded-xl shadow-md 
                       hover:opacity-90 transition-all duration-200 inline-block cursor-pointer"
          >
            Explore Our Products
          </SLink>
        </div>

      </div>
    </>
  );
};

export default StaticBlogDetails;
