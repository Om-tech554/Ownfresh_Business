import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import { Sparkles, ShieldCheck, Heart, Award, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Droplets, CheckCircle2 } from 'lucide-react';
import { trackViewItemList } from '../utils/analytics';

// Rich Educational & SEO Knowledge Base for Stone Pressed Oils
const CATEGORY_DATA = {
  "groundnut-oil": {
    name: "Stone Pressed Groundnut Oil",
    categoryKey: "Groundnut Oil",
    tagline: "100% Traditional Stone Pressed Peanut Oil with Authentic Nutty Aroma",
    badge: "Heart-Healthy & High Smoke Point",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
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
    tagline: "Pure Gingelly / Til Oil Extracted with Natural Granite Wood-Stone Mills",
    badge: "Ayurvedic Super-Oil & Ancient Cooking Elixir",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    intro: "Revered as the 'Queen of Oils' in Ayurveda, our stone-pressed sesame oil is crushed from the finest whole sesame seeds. Rich in sesamol and sesamolin lignans, it delivers a distinctly warm, nutty taste and deep holistic wellness properties for cooking and body care.",
    benefits: [
      "Packed with powerful natural antioxidants: Sesamol & Sesamolin",
      "Balances Vata dosha and supports healthy cardiovascular function",
      "Deep golden color and signature roasted nutty flavor for authentic South & North Indian cuisine",
      "100% Raw, single-origin seeds, zero adulteration"
    ],
    faqs: [
      {
        q: "Can I use stone-pressed sesame oil for cooking as well as massage?",
        a: "Yes. Our sesame oil is 100% pure food-grade stone-pressed oil. It is wonderful for dosas, stir-fries, and tadkas, while also pure enough for Ayurvedic Abhyanga massage and oil pulling."
      },
      {
        q: "Does your sesame oil contain palm oil or synthetic additives?",
        a: "No! MyOwnFresh stone-pressed oils are strictly 100% single-ingredient oils with zero blending, zero palm oil, and zero synthetic additives."
      }
    ]
  },
  "mustard-oil": {
    name: "Stone Pressed Mustard Oil (Sarson Ka Tel)",
    categoryKey: "Mustard Oil",
    tagline: "Strong Pungency, High Allyl Isothiocyanate & Authentic Kacchi Ghani Flavor",
    badge: "Traditional Immunity & High Pungency",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    intro: "Experience the genuine zing of authentic Kacchi Ghani mustard oil. Extracted at low speeds in cold stone presses, it preserves natural allyl isothiocyanates, essential Omega-3 (ALA) and Omega-6 fatty acids, creating the quintessential pungent punch loved in pickles, curries, and winter cooking.",
    benefits: [
      "Signature sharp aroma & pungent taste from natural Allyl Isothiocyanate",
      "Optimum 1:1 ratio of Omega-3 and Omega-6 essential fatty acids",
      "Natural anti-bacterial and anti-fungal properties for pickling & marination",
      "Zero mineral oil, argemone-free, laboratory tested"
    ],
    faqs: [
      {
        q: "Why is stone pressed mustard oil better for pickles?",
        a: "Cold stone-pressed mustard oil preserves natural antimicrobial compounds and antioxidants that act as natural food preservatives, keeping your homemade pickles fresh and flavorful without artificial additives."
      }
    ]
  },
  "coconut-oil": {
    name: "Stone Pressed Virgin Coconut Oil",
    categoryKey: "Coconut Oil",
    tagline: "Fresh Sun-Dried Copra Extracted for Pure Tropical Nutrition & Aroma",
    badge: "Rich in Lauric Acid (MCTs)",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    intro: "Extracted from premium sulfur-free copra coconuts using cold stone ghani techniques, our coconut oil is crystal clear with a delicate, fresh coconut aroma. Rich in medium-chain triglycerides (MCTs) and lauric acid for fast energy, culinary delight, and holistic wellness.",
    benefits: [
      "Over 50% Lauric Acid — converts readily into clean metabolic energy",
      "Natural tropical fragrance without deodorizing chemicals or bleaches",
      "Exceptional for South Indian cooking, bulletproof coffee, hair & skin nourishment",
      "Solidifies naturally below 24°C, proving zero adulteration"
    ],
    faqs: [
      {
        q: "Why does pure coconut oil solidify in winter?",
        a: "Natural unrefined coconut oil has a melting point of approximately 24°C (76°F). Solidification at cooler temperatures is a natural physical property and proof of 100% purity with zero liquid paraffin or adulterants."
      }
    ]
  },
  "sunflower-oil": {
    name: "Stone Pressed Sunflower Oil",
    categoryKey: "Sunflower Oil",
    tagline: "Light, Golden & Naturally Rich in Vitamin E for Heart Wellness",
    badge: "Lightweight & Neutral Cooking",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
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
        a: "Refined sunflower oil undergoes aggressive degumming, neutralization with caustic soda, and high-temp deodorization. Stone-pressed sunflower oil is simply cold-pressed and micro-filtered, retaining vitamins and natural golden hue."
      }
    ]
  },
  "almond-oil": {
    name: "Pure Stone Pressed Sweet Almond Oil",
    categoryKey: "Almond Oil",
    tagline: "100% Cold Stone Extracted Sweet Almond Oil for Nutrition & Glow",
    badge: "Premium Food & Skin Grade",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    intro: "Crafted from hand-selected sweet almonds (Badam Giri) using slow cold-stone extraction. Extremely rich in Vitamin E, Omega-9 oleic acid, and minerals for memory nourishment, infant massage, and gourmet salads.",
    benefits: [
      "Highest natural concentration of Vitamin E",
      "Supports cognitive wellness and healthy skin radiance",
      "100% edible and cosmetic multi-purpose purity",
      "Extracted at <40°C in small artisanal batches"
    ],
    faqs: [
      {
        q: "Can this sweet almond oil be consumed with milk?",
        a: "Yes, 1-2 teaspoons of pure stone-pressed sweet almond oil in warm milk is a traditional Ayurvedic tonic for vitality, cognitive health, and smooth digestion."
      }
    ]
  }
};

const CategoryLandingPage = ({ defaultCategory = null }) => {
  const { slug } = useParams();
  const currentSlug = (slug || (defaultCategory ? defaultCategory.toLowerCase().replace(/\s+/g, '-') : 'groundnut-oil')).toLowerCase();
  
  const categoryInfo = CATEGORY_DATA[currentSlug] || {
    name: "Pure Stone Pressed Edible Oils",
    categoryKey: "Oils",
    tagline: "Traditional Kacchi Ghani Stone Pressed Cooking Oils Delivered Fresh",
    badge: "100% Natural & Chemical Free",
    heroImage: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    intro: "Explore MyOwnFresh range of unrefined, cold stone pressed edible cooking oils. Extracted slowly without heat to protect your family's health, vitality, and authentic culinary heritage.",
    benefits: [
      "Cold-extracted below 45°C to preserve vital nutrients and enzymes",
      "Zero chemical refining, bleaching, or deodorizing",
      "100% pure single-origin seeds from local farmers",
      "₹1,000+ orders qualify for 100% FREE DELIVERY"
    ],
    faqs: [
      {
        q: "Why choose stone pressed edible oils over refined oils?",
        a: "Stone pressed oils are extracted at room temperature without chemicals or synthetic preservatives, retaining all natural vitamins, polyphenols, and rich flavors."
      },
      {
        q: "What is the delivery policy for MyOwnFresh?",
        a: "Orders of ₹1,000 or more enjoy 100% FREE delivery across India. For orders below ₹1,000, low weight-based delivery charges apply."
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
    "url": `https://myownfresh.com/category/${currentSlug}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": filteredProducts.map((p, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `https://myownfresh.com/product/${p._id}`,
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
        keywords={`${categoryInfo.name}, cold pressed oil, stone pressed oil, wood pressed oil, traditional oil, unrefined cooking oil`}
        url={`/category/${currentSlug}`}
        image={categoryInfo.heroImage}
        schemaMarkup={schemaMarkup}
      />

      <Navbar />

      <main className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#1E971D] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#1E971D] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-slate-900">{categoryInfo.name}</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#1E971D] via-[#167415] to-[#125511] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden mb-12">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#FFDD00]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl space-y-4 relative z-10">
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
            <div className="pt-4 flex flex-wrap gap-4 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
                <ShieldCheck className="w-4 h-4 text-[#FFDD00]" /> 100% Cold Stone Pressed
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
                <Droplets className="w-4 h-4 text-[#FFDD00]" /> Unrefined & Chemical Free
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
                <Award className="w-4 h-4 text-[#FFDD00]" /> Free Delivery on ₹1,000+
              </span>
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
              to={`/category/${slugKey}`}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      <Footer />
    </div>
  );
};

export default CategoryLandingPage;
