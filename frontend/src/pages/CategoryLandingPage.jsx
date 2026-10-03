import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductCard from '../components/ProductCard';
import { Sparkles, ShieldCheck, Heart, Award, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Droplets, CheckCircle2 } from 'lucide-react';
import { trackViewItemList } from '../utils/analytics';

// Rich Educational & SEO Knowledge Base for Stone Pressed Oils
const CATEGORY_DATA = {
  "groundnut-oil": {
    name: "Stone Pressed Groundnut Oil",
    categoryKey: "Groundnut Oil",
    tagline: "Traditional Stone Pressed Peanut Oil with Authentic Nutty Aroma",
    badge: "Heart-Healthy & High Smoke Point",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010997/products/Groundnut-3.png",
    intro: "Our stone-pressed (Kacchi Ghani) groundnut oil is extracted slowly using natural granite stone mills at room temperature (<45°C). By avoiding heat and chemical solvents, we preserve natural plant sterols, resveratrol, and vitamin E, giving you a deep golden oil packed with rich nutty flavor and heart-protecting antioxidants.",
    benefits: [
      "Zero Trans Fats & High Monounsaturated Fatty Acids (MUFA)",
      "Naturally high smoke point (230°C) — ideal for daily Indian deep frying & sautéing",
      "Retains natural antioxidants like Resveratrol & Vitamin E",
      "Unbleached, unrefined, zero chemical preservatives or synthetic colors"
    ],
    faqs: [
      {
        q: "What makes Stone Pressed Groundnut Oil different from refined groundnut oil?",
        a: "Refined groundnut oil is treated with high heat (up to 200°C), chemical bleaching agents, and hexane solvents, which strip nutrients and natural flavor. Stone-pressed groundnut oil is extracted at room temperature in stone mills, retaining all original fatty acids, vitamins, and natural aroma without chemicals."
      },
      {
        q: "Is MyOwnFresh Groundnut Oil suitable for everyday cooking and deep frying?",
        a: "Yes! Stone-pressed groundnut oil has a naturally high smoke point (around 225°C–230°C), making it exceptional for deep frying, sautéing, tadkas, and traditional regional cooking."
      },
      {
        q: "How should I store stone-pressed groundnut oil?",
        a: "Store in a cool, dry place away from direct sunlight. Because it contains zero chemical preservatives, keeping it tightly capped preserves its fresh aroma for up to 9–12 months."
      }
    ]
  },
  "sesame-oil": {
    name: "Stone Pressed Sesame Oil (Til Oil)",
    categoryKey: "Sesame Oil",
    tagline: "Pure Gingelly / Til Oil Extracted with Natural Granite Stone Mills",
    badge: "Ayurvedic Super-Oil & Ancient Cooking Elixir",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011005/products/sesame-3.png",
    intro: "Revered as the 'Queen of Oils' in Ayurveda, our stone-pressed sesame oil is crushed from the finest whole sesame seeds. Rich in sesamol and sesamolin lignans, it delivers a distinctly warm, nutty taste and deep holistic wellness properties for cooking and body care.",
    benefits: [
      "Packed with powerful natural antioxidants: Sesamol & Sesamolin",
      "Balances Vata dosha and supports healthy cardiovascular function",
      "Deep golden color and signature roasted nutty flavor for authentic South & North Indian cuisine",
      "Raw, single-origin seeds, zero adulteration"
    ],
    faqs: [
      {
        q: "Can I use stone-pressed sesame oil for cooking as well as massage?",
        a: "Yes. Our sesame oil is pure food-grade stone-pressed oil. It is wonderful for dosas, stir-fries, and tadkas, while also pure enough for Ayurvedic Abhyanga massage and oil pulling."
      },
      {
        q: "Does your sesame oil contain palm oil or synthetic additives?",
        a: "No! MyOwnFresh stone-pressed oils are strictly single-ingredient oils with zero blending, zero palm oil, and zero synthetic additives."
      }
    ]
  },
  "mustard-oil": {
    name: "Stone Pressed Mustard Oil (Sarson Ka Tel)",
    categoryKey: "Mustard Oil",
    tagline: "Strong Pungency, High Allyl Isothiocyanate & Authentic Kacchi Ghani Flavor",
    badge: "Traditional Immunity & High Pungency",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010978/products/Mustard-3.png",
    intro: "Experience the genuine zing of authentic Kacchi Ghani mustard oil. Extracted at low speeds in traditional stone presses, it preserves natural allyl isothiocyanates, essential Omega-3 (ALA) and Omega-6 fatty acids, creating the quintessential pungent punch loved in pickles, curries, and winter cooking.",
    benefits: [
      "Signature sharp aroma & pungent taste from natural Allyl Isothiocyanate",
      "Optimum 1:1 ratio of Omega-3 and Omega-6 essential fatty acids",
      "Natural anti-bacterial and anti-fungal properties for pickling & marination",
      "Zero mineral oil, argemone-free, laboratory tested"
    ],
    faqs: [
      {
        q: "Why is stone pressed mustard oil better for pickles?",
        a: "Traditional stone-pressed mustard oil preserves natural antimicrobial compounds and antioxidants that act as natural food preservatives, keeping your homemade pickles fresh and flavorful without artificial additives."
      }
    ]
  },
  "coconut-oil": {
    name: "Stone Pressed Virgin Coconut Oil",
    categoryKey: "Coconut Oil",
    tagline: "Fresh Sun-Dried Copra Extracted for Pure Tropical Nutrition & Aroma",
    badge: "Rich in Lauric Acid (MCTs)",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786876701/products/coconut-3.png",
    intro: "Extracted from premium sulfur-free copra coconuts using traditional stone ghani techniques, our coconut oil is crystal clear with a delicate, fresh coconut aroma. Rich in medium-chain triglycerides (MCTs) and lauric acid for fast energy, culinary delight, and holistic wellness.",
    benefits: [
      "Over 50% Lauric Acid — converts readily into clean metabolic energy",
      "Natural tropical fragrance without deodorizing chemicals or bleaches",
      "Exceptional for South Indian cooking, bulletproof coffee, hair & skin nourishment",
      "Solidifies naturally below 24°C, proving zero adulteration"
    ],
    faqs: [
      {
        q: "Why does pure coconut oil solidify in winter?",
        a: "Natural unrefined coconut oil has a melting point of approximately 24°C (76°F). Solidification at cooler temperatures is a natural physical property and proof of natural purity with zero liquid paraffin or adulterants."
      }
    ]
  },
  "sunflower-oil": {
    name: "Stone Pressed Sunflower Oil",
    categoryKey: "Sunflower Oil",
    tagline: "Light, Golden & Naturally Rich in Vitamin E for Heart Wellness",
    badge: "Lightweight & Neutral Cooking",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786010989/products/sunflower-3.png",
    intro: "Our stone-pressed sunflower oil is extracted from non-GMO sunflower seeds without heat or harsh solvents. Light on the stomach with a subtle floral aroma, it is the perfect healthy cooking oil for salads, daily curries, and baking.",
    benefits: [
      "Natural source of Vitamin E & healthy polyunsaturated fats",
      "Light texture with high absorption resistance in fried snacks",
      "Zero chemical degumming or bleaching agents",
      "Naturally non-GMO & unrefined"
    ],
    faqs: [
      {
        q: "Is stone pressed sunflower oil different from refined sunflower oil?",
        a: "Refined sunflower oil undergoes aggressive degumming, neutralization with caustic soda, and high-temp deodorization. Stone-pressed sunflower oil is simply stone-pressed and micro-filtered, retaining vitamins and natural golden hue."
      }
    ]
  },
    "safflower-oil": {
    name: "Stone Pressed Safflower Oil (Kardi Ka Tel)",
    categoryKey: "Safflower Oil",
    tagline: "Heart-Friendly High Linoleic Traditional Stone Pressed Kardi Oil",
    badge: "Cholesterol Care & High Smoke Point",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786877029/products/xqqbgwnyyslpumvaqoq1.png",
    intro: "Extracted slowly from golden safflower (Kusum / Kardi) seeds using natural granite stone ghani at room temperature (<45°C). Rich in natural polyunsaturated fatty acids and phytosterols, our unrefined stone-pressed safflower oil supports cardiovascular health and light, non-greasy cooking.",
    benefits: [
      "Rich in Omega-6 Linoleic Acid & natural Vitamin E",
      "Assists in healthy lipid profiles and cholesterol regulation",
      "High smoke point (232°C) suitable for versatile Indian sautéing, rotis & deep frying",
      "Unbleached, solvent-free, pure single-origin oil"
    ],
    faqs: [
      {
        q: "What is Kardi oil and why is it beneficial?",
        a: "Kardi (Safflower) oil is traditionally valued across Western and Central India for heart wellness. Stone-pressed Kardi oil maintains natural linoleic acid and antioxidants that help support arterial elasticity and healthy cholesterol levels."
      },
      {
        q: "Can stone-pressed safflower oil be used for high-temperature cooking?",
        a: "Yes! High-quality stone-pressed safflower oil has a naturally high smoke point (approx. 232°C), making it one of the most heat-stable unrefined oils for Indian culinary preparations."
      }
    ]
  },
};

const CategoryLandingPage = ({ defaultCategory = null }) => {
  const { slug } = useParams();
  const currentSlug = (slug || (defaultCategory ? defaultCategory.toLowerCase().replace(/\s+/g, '-') : 'groundnut-oil')).toLowerCase();
  
  const categoryInfo = CATEGORY_DATA[currentSlug] || {
    name: "Pure Stone Pressed Edible Oils",
    categoryKey: "Oils",
    tagline: "Traditional Kacchi Ghani Stone Pressed Cooking Oils Delivered Fresh",
    badge: "Premium Quality & Chemical Free",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    intro: "Explore MyOwnFresh range of unrefined, traditional stone pressed edible cooking oils. Extracted slowly without heat to protect your family's health, vitality, and authentic culinary heritage.",
    benefits: [
      "Cold-extracted below 45°C to preserve vital nutrients and enzymes",
      "Zero chemical refining, bleaching, or deodorizing",
      "Premium single-origin seeds from local farmers",
      "Eligible for FREE DELIVERY on Invoice Amount over Rs. 1,500/- OR when the Order Volume is 2 Kg & above."
    ],
    faqs: [
      {
        q: "Why choose stone pressed edible oils over refined oils?",
        a: "Stone pressed oils are extracted at room temperature without chemicals or synthetic preservatives, retaining all natural vitamins, polyphenols, and rich flavors."
      },
      {
        q: "What is the delivery policy for MyOwnFresh?",
        a: "Eligible for FREE DELIVERY on Invoice Amount over Rs. 1,500/- OR when the Order Volume is 2 Kg & above."
      }
    ]
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/product/all`);
        if (res.data?.products) {
          setProducts(res.data.products);
        }
      } catch (e) {
        console.error("Error fetching category products:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [API_BASE_URL]);

  // Filter products for this category
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (currentSlug === 'oils') return products;

    const key = categoryInfo.categoryKey.toLowerCase();
    const slugKeywords = currentSlug.split('-');

    return products.filter(p => {
      const name = (p.name || "").toLowerCase();
      const cat = (typeof p.category === 'object' ? p.category?.name : p.category || "").toLowerCase();
      return cat.includes(key) || name.includes(key) || slugKeywords.some(k => name.includes(k));
    });
  }, [products, currentSlug, categoryInfo]);

  // GA4 event tracking
  useEffect(() => {
    if (filteredProducts.length > 0) {
      trackViewItemList(filteredProducts, categoryInfo.name);
    }
  }, [filteredProducts, categoryInfo.name]);

  // Structured Data (JSON-LD) for Category Landing Page & FAQs
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${categoryInfo.name} | MyOwnFresh`,
    "description": categoryInfo.intro,
    "url": `https://myownfresh.com/${currentSlug}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": filteredProducts.map((p, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `https://myownfresh.com/product/${p.slug || p._id}`,
        "name": p.name
      }))
    }
  };

  const faqSchema = categoryInfo.faqs?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": categoryInfo.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  } : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <SEO
        title={categoryInfo.name}
        description={categoryInfo.intro.slice(0, 160)}
        keywords={`${categoryInfo.name}, stone pressed ${categoryInfo.categoryKey || "oil"}, authentic stone pressed oil, traditional stone ghani oil, pure unrefined cooking oil, wood stone pressed oil, OwnFresh stone pressed oil`}
        url={`/${currentSlug}`}
        image={categoryInfo.heroImage}
        schemaMarkup={schemaMarkup}
      />

      <Navbar />

      <main className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Visible & Semantic UI Breadcrumb Navigation */}
        <Breadcrumbs items={[
          { label: 'Home', path: '/' },
          { label: 'Stone Pressed Oils', path: '/shop' },
          { label: categoryInfo.name }
        ]} />

        {/* Hero Section with Perfect Matching Product Bottle Picture */}
        <div className="bg-gradient-to-br from-[#1E971D] via-[#167415] to-[#125511] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden mb-12">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#FFDD00]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/25 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest text-[#FFDD00] border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                {categoryInfo.badge}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {categoryInfo.name}
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-medium">
                {categoryInfo.tagline}
              </p>

              <p className="text-sm text-emerald-50/80 leading-relaxed max-w-2xl pt-2">
                {categoryInfo.intro}
              </p>

              {/* Value Badges */}
              <div className="pt-4 flex flex-wrap gap-2.5 sm:gap-3 text-xs font-bold">
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
                  <ShieldCheck className="w-4 h-4 text-[#FFDD00]" /> Authentic Stone Pressed
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
                  <Droplets className="w-4 h-4 text-[#FFDD00]" /> Unrefined & Chemical Free
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
                  <Award className="w-4 h-4 text-[#FFDD00]" /> Free Delivery on ₹1,500+ / 2kg
                </span>
              </div>
            </div>

            {/* Right Picture Showcase (4 cols on desktop) */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-48 sm:w-56 lg:w-64 aspect-square bg-white/15 dark:bg-black/30 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-white/20 shadow-2xl flex flex-col items-center justify-center group overflow-hidden">
                <img
                  src={categoryInfo.heroImage}
                  alt={categoryInfo.name}
                  className="max-h-[82%] max-w-[82%] object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-105"
                />
                <span className="mt-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-[#FFDD00] border border-white/10 truncate max-w-[90%]">
                  {categoryInfo.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <Link
            to="/oils"
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
              currentSlug === 'oils'
                ? 'bg-[#1E971D] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Oils
          </Link>
          {Object.entries(CATEGORY_DATA).map(([slugKey, cat]) => (
            <Link
              key={slugKey}
              to={`/${slugKey}`}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                currentSlug === slugKey
                  ? 'bg-[#1E971D] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.categoryKey}
            </Link>
          ))}
        </div>

        {/* Products Grid */}
        <section className="space-y-6 mb-16">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Available {categoryInfo.name} Products
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                Showing {filteredProducts.length} stone-pressed oil variants in stock
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#1E971D] hover:underline"
            >
              Explore Full Shop <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-3xl h-72 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <Droplets className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-black text-slate-800">Fresh Batch in Extraction</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto font-medium">
                Our stone mills are crushing fresh seeds for {categoryInfo.name}. Browse all other available oils in our store.
              </p>
              <Link
                to="/shop"
                className="inline-block px-6 py-2.5 bg-[#1E971D] text-white text-xs font-black rounded-xl shadow-md hover:bg-[#167415] transition-colors"
              >
                View All Available Oils
              </Link>
            </div>
          )}
        </section>

        {/* Benefits & Stone Press Extraction Details */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs mb-16 space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-widest text-[#1E971D]">
              Why Choose MyOwnFresh
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Key Health Benefits & Processing Integrity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryInfo.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-[#1E971D] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Section with Accordions & Structured Data */}
        {categoryInfo.faqs?.length > 0 && (
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs mb-12 space-y-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#1E971D]" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Frequently Asked Questions about {categoryInfo.name}
              </h2>
            </div>

            <div className="space-y-3">
              {categoryInfo.faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors text-sm sm:text-base"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-[#1E971D] shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      </div>
  );
};

export default CategoryLandingPage;
