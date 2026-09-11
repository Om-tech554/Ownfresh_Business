import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShoppingCart,
  Zap,
  Check,
  Star,
  ShieldCheck,
  Award,
  Leaf,
  Flame,
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  CheckCircle2,
  Package,
  Droplets,
  Thermometer,
  Clock,
  Heart,
  Shield,
  FileText,
  Layers,
  Utensils,
  Plus,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Eye
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/userslice";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import { cleanProductName, getDynamicName } from "../utils/productUtils";
import SLink from "../components/SLink";
import SEO from "../components/SEO";
import ProductReviews from "../components/ProductReviews";
import { motion, AnimatePresence } from "framer-motion";

const OIL_KNOWLEDGE_BASE = {
  groundnut: {
    categoryName: "Groundnut Oil",
    badgeTitle: "Heart-Healthy MUFA & Resveratrol",
    themeColor: "#D97706",
    smokePoint: "225°C (437°F)",
    shelfLife: "9 to 12 Months",
    origin: "Single-Origin Maharashtra & Saurashtra Seeds",
    extractionType: "Traditional Granite Stone Kolhu (14–16 RPM)",
    fatProfile: "48% MUFA (Oleic) • 32% PUFA (Linoleic) • 20% Saturated",
    aromaProfile: "Deep nutty roasted aroma with rich golden clarity",
    bestFor: ["Deep Frying & Puris", "Daily Indian Curries & Sabzis", "Maharashtrian & Gujarati Tadka", "Crispy Stir-Fries"],
    keyNutrients: ["Resveratrol Antioxidant", "Plant Sterols (Beta-sitosterol)", "Natural Vitamin E (Tocopherols)", "Zero Trans-Fats"],
    steps: [
      { step: "01", title: "Grade-A Seed Selection", desc: "Handpicked, sun-dried peanut kernels tested for zero aflatoxins." },
      { step: "02", title: "Stone Kolhu Grinding", desc: "Crushed gently in traditional granite stone mill at 14–16 RPM." },
      { step: "03", title: "Cold Friction Seepage", desc: "Extracted without artificial heat; temperatures stay under 40°C." },
      { step: "04", title: "Cotton Cloth Filtration", desc: "Naturally settled 24 hours & gravity-filtered through fine cotton mesh." },
      { step: "05", title: "Fresh Bottling", desc: "Packed in UV-safe, food-grade containers to seal in native antioxidants." }
    ],
    faqs: [
      {
        q: "Is OwnFresh Stone-Pressed Groundnut Oil suitable for deep frying?",
        a: "Yes, absolutely. With a high smoke point of 225°C (437°F) and low moisture content, stone-pressed groundnut oil is one of India's safest and most heat-stable natural cooking oils for puris, pakodas, and samosas."
      },
      {
        q: "How does stone pressing differ from industrial refined peanut oil?",
        a: "Refined peanut oils are treated with hexane chemical solvents, caustic soda bleaching, and 200°C deodorization which strips away all resveratrol and vitamin E. OwnFresh stone pressing uses slow granite pestles without any chemicals, preserving 100% natural nutty flavor and active antioxidants."
      },
      {
        q: "Why is the oil slightly thick and richly colored?",
        a: "That rich golden hue and body are natural indicators of unbleached purity! Because we don't chemically bleach our oil, natural carotenoids and micro-nutrients remain intact."
      },
      {
        q: "How should I store this stone-pressed groundnut oil?",
        a: "Store the bottle in a dry, cool cabinet away from direct stove heat or sunlight. Keep the lid sealed tightly after each use to maintain its freshly pressed aroma."
      }
    ]
  },
  mustard: {
    categoryName: "Mustard Oil",
    badgeTitle: "Natural Pungency & Allyl Isothiocyanate",
    themeColor: "#CA8A04",
    smokePoint: "250°C (482°F)",
    shelfLife: "12 Months (Natural Preservation)",
    origin: "High-Grade Black & Yellow Mustard Seeds",
    extractionType: "Kacchi Ghani Traditional Stone Mill (Kolhu)",
    fatProfile: "60% MUFA (Erucic & Oleic) • 21% PUFA (Omega-3 & 6) • 12% SFA",
    aromaProfile: "Sharp, pungent, authentic aroma with golden-amber hue",
    bestFor: ["North Indian & Bengali Curries", "Pickle Preservation (Natural Shelf Life)", "Sarson ka Saag & Tadka", "Ayurvedic Body & Muscle Massage"],
    keyNutrients: ["Allyl Isothiocyanate", "Alpha-Linolenic Acid (Omega-3)", "Selenium & Zinc Trace Minerals", "Vitamin E Antioxidants"],
    steps: [
      { step: "01", title: "Mature Seed Sorting", desc: "Cleaned and sun-dried high-oil-content mustard seeds." },
      { step: "02", title: "Kacchi Ghani Pressing", desc: "Slowly crushed in wooden-stone Ghani preserving natural volatile oils." },
      { step: "03", title: "Zero-Evaporation Flow", desc: "Low-temperature friction locks in sharp pungency and enzymes." },
      { step: "04", title: "Gravity Cloth Sieve", desc: "Filtered through pure cotton fabric without bleaching or deodorization." },
      { step: "05", title: "Airtight Seal", desc: "Sealed in protective containers to maintain distinctive aroma freshness." }
    ],
    faqs: [
      {
        q: "Why does OwnFresh Mustard Oil have such a strong, sharp pungency?",
        a: "The signature pungency comes from natural Allyl Isothiocyanate compounds present in fresh mustard seeds. High industrial heat destroys this compound, but our low-RPM stone Kolhu method locks it in completely."
      },
      {
        q: "Can this oil be used for homemade mango and chili pickles?",
        a: "Yes! OwnFresh stone-pressed mustard oil acts as a potent natural antimicrobial preservative, preventing fungal growth and keeping your traditional homemade pickles crisp and fresh for over a year."
      },
      {
        q: "Is this mustard oil safe for traditional body massage and hair care?",
        a: "Yes. Stone-pressed mustard oil has been used in Ayurvedic warm oil therapy (Abhyanga) for centuries to stimulate blood circulation, relieve joint stiffness, and strengthen hair follicles."
      },
      {
        q: "What is the smoke point of this stone-pressed mustard oil?",
        a: "It has one of the highest natural smoke points among unrefined oils at 250°C (482°F), making it fantastic for high-flame North Indian tadkas and searing."
      }
    ]
  },
  coconut: {
    categoryName: "Coconut Oil",
    badgeTitle: "50%+ Lauric Acid & Medium Chain Triglycerides",
    themeColor: "#16A34A",
    smokePoint: "177°C (350°F)",
    shelfLife: "12 Months",
    origin: "100% Sulfur-Free Sun-Dried Coastal Copra",
    extractionType: "Cold Stone Kolhu Pressing",
    fatProfile: "65% Medium Chain Triglycerides (MCTs) • 50%+ Lauric Acid",
    aromaProfile: "Fresh, sweet, natural coconut aroma with water-like clarity",
    bestFor: ["South Indian Cooking & Kerala Roasts", "Baking & Bulletproof Coffee", "Deep Scalp & Hair Nourishment", "Baby Skin Care & Oil Pulling (Gandusha)"],
    keyNutrients: ["Lauric Acid (Converts to Monolaurin)", "Caprylic & Capric Acid", "Natural Vitamin E", "Antimicrobial Lipids"],
    steps: [
      { step: "01", title: "Sulfur-Free Copra", desc: "Naturally sun-dried mature coconut halves free from sulfur smoke." },
      { step: "02", title: "Gentle Stone Churning", desc: "Crushed slowly in stone Kolhu without thermal friction damage." },
      { step: "03", title: "Virgin Raw Stream", desc: "First-press pure coconut oil flows naturally at ambient temperature." },
      { step: "04", title: "Micro-Fiber Separation", desc: "Passed through multi-layer cotton cloth to separate fine coconut pulp." },
      { step: "05", title: "Hygienic Bottling", desc: "Poured into clean, airtight bottles preserving raw sweetness." }
    ],
    faqs: [
      {
        q: "Why does OwnFresh Coconut Oil solidify during winter?",
        a: "Pure stone-pressed coconut oil naturally solidifies below 24°C (75°F) because of its high concentration of healthy saturated MCTs and Lauric Acid. This is a hallmark proof of 100% unadulterated coconut oil with zero chemical mineral oil blending."
      },
      {
        q: "Is this coconut oil suitable for daily Ayurvedic oil pulling (Gandusha)?",
        a: "Absolutely. Because it is extracted without chemical bleaches or sulfur fumes, it contains natural antimicrobial Lauric Acid that promotes oral hygiene, strengthens gums, and freshens breath."
      },
      {
        q: "Can I use it for my baby's massage and scalp nourishing?",
        a: "Yes, it is 100% gentle, food-grade, and free of synthetic fragrances or mineral oils, making it safe and nourishing for sensitive baby skin and hair growth."
      },
      {
        q: "What makes sulfur-free copra so important?",
        a: "Commercial copra is often treated with sulfur dioxide fumes to artificially prevent mold. OwnFresh uses only natural sun-dried coastal copra with zero sulfur, preserving a clean, sweet natural aroma."
      }
    ]
  },
  sesame: {
    categoryName: "Sesame Oil",
    badgeTitle: "Queen of Ayurveda • Sesamol & Sesamin",
    themeColor: "#EA580C",
    smokePoint: "210°C (410°F)",
    shelfLife: "12 Months",
    origin: "Graded Natural White & Brown Sesame Seeds",
    extractionType: "Traditional Stone Mill (Lakdi-Stone Ghani)",
    fatProfile: "41% MUFA (Oleic) • 44% PUFA (Linoleic) • 15% SFA",
    aromaProfile: "Warm earthy nutty fragrance with deep amber hue",
    bestFor: ["South Indian Tempering (Sambar, Rasam, Chutneys)", "Idli-Podi Seasoning Paste", "Pickles & Chutney Powders", "Abhyanga Massage & Oil Pulling"],
    keyNutrients: ["Sesamol & Sesamin Lignans", "Bioavailable Calcium & Zinc", "Vitamin E Complex", "Omega-6 & 9 Fatty Acids"],
    steps: [
      { step: "01", title: "Pesticide-Free Sesame", desc: "Graded whole sesame seeds cleaned of dust and fine hulls." },
      { step: "02", title: "Slow Kolhu Rotation", desc: "Crushed under heavy granite pestles at low speed to prevent burning." },
      { step: "03", title: "Unheated Amber Extraction", desc: "Flows unheated, preserving delicate Sesamol antioxidant rings." },
      { step: "04", title: "Cloth Settling", desc: "Settled naturally 24 hours followed by cotton sieve cloth filtration." },
      { step: "05", title: "UV-Shield Packaging", desc: "Bottled in food-grade packaging that shields bioactives from sunlight." }
    ],
    faqs: [
      {
        q: "Why is stone-pressed sesame oil called the 'Queen of Ayurveda'?",
        a: "Sesame oil has the highest skin penetration rate among all natural plant oils. Rich in Sesamol, Sesamin, and natural zinc, it deeply nourishes joint tissues and soothes Vata dosha."
      },
      {
        q: "How does this taste when mixed with South Indian Idli Podi?",
        a: "It produces the authentic, rich nutty aroma that South Indian households love. A single spoonful drizzled over warm idlis with gunpowder creates an unforgettable culinary experience."
      },
      {
        q: "Does this sesame oil contain any added palm or mineral oil blends?",
        a: "Never. Every drop of OwnFresh Sesame Oil is 100% single-press from graded sesame seeds, with zero blending or dilution."
      }
    ]
  },
  sunflower: {
    categoryName: "Sunflower Oil",
    badgeTitle: "High Vitamin E & Light Heart-Healthy Omega-6",
    themeColor: "#EAB308",
    smokePoint: "225°C (440°F)",
    shelfLife: "9 Months",
    origin: "Premium Non-GMO Sunflower Kernels",
    extractionType: "Traditional Stone Kolhu Pressing",
    fatProfile: "65% PUFA (Linoleic) • 25% MUFA (Oleic) • 10% SFA",
    aromaProfile: "Light, neutral, non-sticky with clear golden brilliance",
    bestFor: ["All-Round Daily Cooking & Frying", "Delicate Sautéing & Baking", "Continental Salad Dressings", "Skin Hydration & Scalp Massage"],
    keyNutrients: ["High Vitamin E (Alpha-tocopherol)", "Selenium & Zinc", "Linoleic Acid (Essential Omega-6)", "Zero Trans-Fats"],
    steps: [
      { step: "01", title: "Non-GMO Seeds", desc: "Dehulled sunflower kernels selected from sustainable farms." },
      { step: "02", title: "Low-RPM Stone Press", desc: "Crushed gently in stone mill without chemical hexane solvents." },
      { step: "03", title: "Raw Golden Stream", desc: "Unheated oil seeps naturally with vital micronutrients intact." },
      { step: "04", title: "Cotton Sieve Filter", desc: "Filtered purely through cotton mesh to retain golden clarity." },
      { step: "05", title: "Oxygen-Barrier Pack", desc: "Sealed fresh to prevent lipid photo-oxidation." }
    ],
    faqs: [
      {
        q: "How does stone-pressed sunflower oil differ from supermarket refined sunflower oil?",
        a: "Supermarket sunflower oils are industrially extracted using chemical solvents at extreme heat and bleached with chemical clays. OwnFresh stone-pressed sunflower oil preserves native Vitamin E (Alpha-tocopherol) and essential fatty acids in their purest natural state."
      },
      {
        q: "Does it have a strong flavor that alters delicate dish tastes?",
        a: "No, stone-pressed sunflower oil is light, clean, and naturally delicate. It lets the natural spices and vegetables in your cooking shine without overwhelming them."
      }
    ]
  },
  safflower: {
    categoryName: "Safflower Oil",
    badgeTitle: "Cardiologist Recommended • High Oleic Kardi",
    themeColor: "#D97706",
    smokePoint: "232°C (450°F)",
    shelfLife: "12 Months",
    origin: "Selected Indigenous Kardi (Safflower) Seeds",
    extractionType: "Traditional Stone Ghani (Kolhu)",
    fatProfile: "75% High Oleic/Linoleic Fatty Acids • 15% PUFA • 10% SFA",
    aromaProfile: "Subtle nutty, clean aroma with bright golden tone",
    bestFor: ["Diabetic & Cardiac Diets", "High-Heat Sautéing & Roasting", "Salad Dressings & Drizzles", "Low-Calorie Everyday Indian Cooking"],
    keyNutrients: ["High Oleic Acid Profile", "Phytosterols for Lipid Balance", "Natural Vitamin E", "Arterial Anti-Inflammatory Compounds"],
    steps: [
      { step: "01", title: "Cleaned Kardi Seeds", desc: "High-oil-content safflower seeds freed from impurities." },
      { step: "02", title: "Stone Pestle Churning", desc: "Crushed under stone pestle at 14 RPM ensuring zero heating." },
      { step: "03", title: "Pure Unrefined Yield", desc: "Natural golden oil flows with natural plant sterols undamaged." },
      { step: "04", title: "Micro Cotton Filter", desc: "Filtered through organic cotton cloth without chemical clays." },
      { step: "05", title: "Secure Food-Grade Bottling", desc: "Sealed in food-safe containers for long-lasting freshness." }
    ],
    faqs: [
      {
        q: "Why is Stone-Pressed Safflower (Kardi) Oil recommended for cardiovascular health?",
        a: "Safflower oil is exceptionally rich in Oleic acid and natural phytosterols, which clinical nutrition studies show helps regulate cholesterol ratios and support arterial elasticity."
      },
      {
        q: "Is Kardi oil suitable for everyday Indian cooking?",
        a: "Yes, it has a high smoke point (232°C) and a light, pleasing aroma that works smoothly for daily sabzis, dals, and sautéed vegetables."
      }
    ]
  },
  combo: {
    categoryName: "Multi-Oil Combo Pack",
    badgeTitle: "Complete Kitchen Starter Bundle • 100% Stone Pressed",
    themeColor: "#1E971D",
    smokePoint: "177°C – 250°C (Variety-dependent)",
    shelfLife: "9 to 12 Months",
    origin: "Curated Single-Origin Seeds From Sustainable Farms",
    extractionType: "Dedicated Stone Kolhu Batches Per Oil Variety",
    fatProfile: "Balanced Blend of MUFA, PUFA, MCTs, Lauric Acid & Sesamol",
    aromaProfile: "Authentic varietal aromas tailored for every traditional Indian dish",
    bestFor: ["All-in-One Family Cooking", "Deep Frying (Groundnut/Mustard)", "South Indian & Hair Care (Coconut)", "Tempering & Massage (Sesame)"],
    keyNutrients: ["Broad Spectrum Antioxidants", "Vitamin E & Lignans", "Omega-3, 6, 9 & MCTs", "Zero Additives or Blending Agents"],
    steps: [
      { step: "01", title: "Multi-Seed Sourcing", desc: "Finest single-origin seeds for each specific oil variety." },
      { step: "02", title: "Dedicated Stone Presses", desc: "Extracted separately in stone Kolhu to prevent cross-flavoring." },
      { step: "03", title: "Zero Heat Processing", desc: "Cold unheated extraction under 40°C across all bottles." },
      { step: "04", title: "Cloth Filtration", desc: "Natural gravity settling and organic cotton cloth filtration." },
      { step: "05", title: "Pure Fresh Bottling", desc: "Sealed in food-grade airtight bottles for doorstep freshness." }
    ],
    faqs: [
      {
        q: "Why should my kitchen use different stone-pressed oils instead of just one?",
        a: "Different culinary dishes require specific smoke points and fatty acid compositions. For example, Groundnut and Mustard oils are ideal for high-heat frying and tadkas, Coconut oil for coastal curries and wellness, and Sesame oil for tempering and rasams."
      },
      {
        q: "What oil varieties are included in the combo pack?",
        a: "OwnFresh combo packs feature our bestselling 100% stone-pressed oils including Groundnut, Mustard, Coconut, Sesame, Safflower, and Sunflower oils to satisfy all your daily kitchen cooking needs."
      }
    ]
  }
};

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);

  const [product, setProduct] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [allProductsList, setAllProductsList] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);

  // Frequently Bought Together Bundle States
  const [fbtMain, setFbtMain] = useState(true);
  const [fbtAdd1, setFbtAdd1] = useState(true);
  const [fbtAdd2, setFbtAdd2] = useState(true);

  // Variant & Quantity Selector States
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedQty, setSelectedQty] = useState(1);

  // Gallery Active Image & Zoom
  const [activeImage, setActiveImage] = useState("");
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'method', 'specs', 'faqs', 'label', 'reviews'

  const oilInfo = useMemo(() => {
    if (!product) return OIL_KNOWLEDGE_BASE.mustard;
    const nameLower = (product.name || "").toLowerCase();
    if (nameLower.includes("groundnut") || nameLower.includes("peanut")) return OIL_KNOWLEDGE_BASE.groundnut;
    if (nameLower.includes("coconut")) return OIL_KNOWLEDGE_BASE.coconut;
    if (nameLower.includes("sesame") || nameLower.includes("til")) return OIL_KNOWLEDGE_BASE.sesame;
    if (nameLower.includes("sunflower")) return OIL_KNOWLEDGE_BASE.sunflower;
    if (nameLower.includes("safflower") || nameLower.includes("kardi")) return OIL_KNOWLEDGE_BASE.safflower;
    if (nameLower.includes("combo")) return OIL_KNOWLEDGE_BASE.combo;
    return OIL_KNOWLEDGE_BASE.mustard;
  }, [product]);

  const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");

  /* Fetch Single Product */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/product/${id}`)
      .then((res) => {
        const prod = res.data.product;
        setProduct(prod);
        if (prod.variants && prod.variants.length > 0) {
          const activeVariants = prod.variants.filter((v) => v.status === "Active");
          if (activeVariants.length > 0) {
            const nameLower = (prod.name || "").toLowerCase();
            let matched = null;
            if (nameLower.includes("250")) {
              matched = activeVariants.find((v) => v.name.toLowerCase().includes("250"));
            } else if (nameLower.includes("500")) {
              matched = activeVariants.find((v) => v.name.toLowerCase().includes("500"));
            } else if (nameLower.includes("1 l") || nameLower.includes("1l") || nameLower.includes("1-l") || nameLower.includes("1 liter") || nameLower.includes("1 litre")) {
              matched = activeVariants.find((v) => v.name.toLowerCase().includes("1 l") || v.name.toLowerCase().includes("1l") || v.name.toLowerCase().includes("1 liter") || v.name.toLowerCase().includes("1 litre"));
            } else if (nameLower.includes("5 l") || nameLower.includes("5l") || nameLower.includes("5-l") || nameLower.includes("5 liter") || nameLower.includes("5 litre")) {
              matched = activeVariants.find((v) => v.name.toLowerCase().includes("5 l") || v.name.toLowerCase().includes("5l") || v.name.toLowerCase().includes("5 liter") || v.name.toLowerCase().includes("5 litre"));
            }
            const initialVariant = matched || activeVariants[0];
            setSelectedVariant(initialVariant);
            const initialImg = initialVariant.image || (initialVariant.images && initialVariant.images[0]) || prod.image;
            setActiveImage(initialImg);
          }
        } else {
          setActiveImage(prod.image);
        }
      })
      .catch((err) => console.log(err));
  }, [id, API_BASE_URL]);

  /* Fetch Related & All Products for Recently Viewed matching */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/product/all?limit=50`)
      .then((res) => {
        const data = res.data.products || [];
        setAllProductsList(data);
        const filtered = data.filter((p) => p._id !== id).slice(0, 4);
        setRecentProducts(filtered);
      })
      .catch((err) => console.log(err));
  }, [id, API_BASE_URL]);

  /* Track Recently Viewed in localStorage */
  useEffect(() => {
    if (id && product) {
      try {
        const stored = JSON.parse(localStorage.getItem("ownfresh_recently_viewed") || "[]");
        const updated = [id, ...stored.filter((item) => item !== id)].slice(0, 8);
        localStorage.setItem("ownfresh_recently_viewed", JSON.stringify(updated));
      } catch (e) {
        console.error("Error updating recently viewed", e);
      }
    }
  }, [id, product]);

  /* Build Recently Viewed Products List */
  useEffect(() => {
    if (allProductsList.length > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem("ownfresh_recently_viewed") || "[]");
        const otherIds = stored.filter((savedId) => savedId !== id);
        const matched = otherIds
          .map((savedId) => allProductsList.find((p) => p._id === savedId))
          .filter(Boolean);
        setRecentlyViewed(matched);
      } catch (e) { }
    }
  }, [id, allProductsList]);

  // Frequently Bought Together Complementary Products
  const fbtItem1 = recentProducts[0] || null;
  const fbtItem2 = recentProducts[1] || null;

  const fbtVariant1 = useMemo(() => {
    if (!fbtItem1) return null;
    return fbtItem1.variants?.find((v) => v.status === "Active") || fbtItem1.variants?.[0] || null;
  }, [fbtItem1]);

  const fbtVariant2 = useMemo(() => {
    if (!fbtItem2) return null;
    return fbtItem2.variants?.find((v) => v.status === "Active") || fbtItem2.variants?.[0] || null;
  }, [fbtItem2]);

  const fbtPrice1 = fbtVariant1 ? (fbtVariant1.salePrice || fbtVariant1.price) : (fbtItem1?.price || 0);
  const fbtPrice2 = fbtVariant2 ? (fbtVariant2.salePrice || fbtVariant2.price) : (fbtItem2?.price || 0);

  const fbtTotalPrice = useMemo(() => {
    let sum = 0;
    if (fbtMain && selectedVariant) sum += (selectedVariant.salePrice || selectedVariant.price);
    if (fbtAdd1 && fbtItem1) sum += fbtPrice1;
    if (fbtAdd2 && fbtItem2) sum += fbtPrice2;
    return sum;
  }, [fbtMain, fbtAdd1, fbtAdd2, selectedVariant, fbtItem1, fbtItem2, fbtPrice1, fbtPrice2]);

  const fbtCount = (fbtMain ? 1 : 0) + (fbtAdd1 && fbtItem1 ? 1 : 0) + (fbtAdd2 && fbtItem2 ? 1 : 0);

  const handleAddBundleToCart = () => {
    let addedCount = 0;

    if (fbtMain && selectedVariant) {
      const itemImage = selectedVariant.image || (selectedVariant.images && selectedVariant.images[0]) || product.image;
      dispatch(
        addToCart({
          ...product,
          _id: `${product._id}_${selectedVariant._id}`,
          productId: product._id,
          variantId: selectedVariant._id,
          name: getDynamicName(product.name, selectedVariant.name),
          variantName: selectedVariant.name,
          price: selectedVariant.salePrice || selectedVariant.price,
          image: itemImage,
          quantity: 1,
        })
      );
      addedCount++;
    }

    if (fbtAdd1 && fbtItem1 && fbtVariant1) {
      const itemImage = fbtVariant1.image || (fbtVariant1.images && fbtVariant1.images[0]) || fbtItem1.image;
      dispatch(
        addToCart({
          ...fbtItem1,
          _id: `${fbtItem1._id}_${fbtVariant1._id}`,
          productId: fbtItem1._id,
          variantId: fbtVariant1._id,
          name: getDynamicName(fbtItem1.name, fbtVariant1.name),
          variantName: fbtVariant1.name,
          price: fbtVariant1.salePrice || fbtVariant1.price,
          image: itemImage,
          quantity: 1,
        })
      );
      addedCount++;
    }

    if (fbtAdd2 && fbtItem2 && fbtVariant2) {
      const itemImage = fbtVariant2.image || (fbtVariant2.images && fbtVariant2.images[0]) || fbtItem2.image;
      dispatch(
        addToCart({
          ...fbtItem2,
          _id: `${fbtItem2._id}_${fbtVariant2._id}`,
          productId: fbtItem2._id,
          variantId: fbtVariant2._id,
          name: getDynamicName(fbtItem2.name, fbtVariant2.name),
          variantName: fbtVariant2.name,
          price: fbtVariant2.salePrice || fbtVariant2.price,
          image: itemImage,
          quantity: 1,
        })
      );
      addedCount++;
    }

    if (addedCount > 0) {
      toast.success(`${addedCount} bundle items added to cart!`);
    } else {
      toast.error("Please select at least one item from the bundle");
    }
  };

  // When selectedVariant changes, update activeImage and gallery
  const currentGalleryImages = useMemo(() => {
    if (!product) return [];
    let list = [];
    if (selectedVariant) {
      if (selectedVariant.image) list.push(selectedVariant.image);
      if (Array.isArray(selectedVariant.images)) {
        list.push(...selectedVariant.images);
      }
      if (selectedVariant.labelImage) list.push(selectedVariant.labelImage);
    }
    if (Array.isArray(product.images)) {
      list.push(...product.images);
    }
    if (product.image) list.push(product.image);
    if (product.labelImage) list.push(product.labelImage);

    // Deduplicate
    return list.filter((img, idx, arr) => Boolean(img) && arr.indexOf(img) === idx);
  }, [selectedVariant, product]);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    const varImg = variant.image || (variant.images && variant.images[0]) || product.image;
    setActiveImage(varImg);
  };

  const displayName = getDynamicName(product?.name, selectedVariant?.name);
  const currentPrice = selectedVariant ? (selectedVariant.salePrice || selectedVariant.price) : (product?.price || 0);
  const regularPrice = selectedVariant ? selectedVariant.price : (product?.price || 0);
  const finalQuantity = Number(selectedQty) || 1;
  const isDiscounted = selectedVariant?.salePrice && selectedVariant.salePrice < selectedVariant.price;
  const discountPercent = isDiscounted
    ? Math.round(((selectedVariant.price - selectedVariant.salePrice) / selectedVariant.price) * 100)
    : 0;

  /* --- Add To Cart --- */
  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a bottle size");
      return;
    }
    if (selectedVariant.stockQuantity <= 0) {
      toast.error("This size is currently out of stock");
      return;
    }

    const itemImage = selectedVariant.image || (selectedVariant.images && selectedVariant.images[0]) || product.image;
    const cartItem = {
      ...product,
      _id: `${product._id}_${selectedVariant._id}`,
      productId: product._id,
      variantId: selectedVariant._id,
      name: displayName,
      variantName: selectedVariant.name,
      price: selectedVariant.salePrice || selectedVariant.price,
      image: itemImage,
      quantity: finalQuantity,
    };
    dispatch(addToCart(cartItem));
    toast.success(`${displayName} added to cart!`);
  };

  /* --- Buy Now --- */
  const handleBuyNow = () => {
    if (!selectedVariant) {
      toast.error("Please select a bottle size");
      return;
    }
    if (selectedVariant.stockQuantity <= 0) {
      toast.error("This size is currently out of stock");
      return;
    }

    const itemImage = selectedVariant.image || (selectedVariant.images && selectedVariant.images[0]) || product.image;
    const cartItem = {
      ...product,
      _id: `${product._id}_${selectedVariant._id}`,
      productId: product._id,
      variantId: selectedVariant._id,
      name: displayName,
      variantName: selectedVariant.name,
      price: selectedVariant.salePrice || selectedVariant.price,
      image: itemImage,
      quantity: finalQuantity,
    };
    dispatch(addToCart(cartItem));
    navigate("/checkout");
  };

  const handleRecentAddToCart = (prod, variant) => {
    if (!user) {
      toast.error("Please sign in to add to cart", { duration: 1500 });
      setTimeout(() => navigate("/signin"), 500);
      return;
    }
    const itemDisplayName = getDynamicName(prod.name, variant.name);
    const varImg = variant.image || (variant.images && variant.images[0]) || prod.image;

    const cartItem = {
      ...prod,
      _id: `${prod._id}_${variant._id}`,
      productId: prod._id,
      variantId: variant._id,
      name: itemDisplayName,
      variantName: variant.name,
      price: variant.salePrice || variant.price,
      image: varImg,
      quantity: 1,
    };
    dispatch(addToCart(cartItem));
    toast.success(`${itemDisplayName} added to cart!`);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0B0F14]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E971D] dark:border-[#FFD600]"></div>
      </div>
    );
  }

  const renderBadgeIcon = (iconName, size = 12) => {
    switch (iconName) {
      case "Award": return <Award size={size} />;
      case "Leaf": return <Leaf size={size} />;
      case "ShieldCheck": return <ShieldCheck size={size} />;
      case "Sparkles": return <Sparkles size={size} />;
      case "Star": return <Star size={size} />;
      default: return null;
    }
  };

  return (
    <>
      <SEO
        title={displayName || cleanProductName(product.name)}
        description={product.shortDesc}
        image={activeImage || product.image}
        url={`/product/${product._id}`}
        type="product"
      />
      <Navbar />

      <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-8 md:px-16 lg:px-20 bg-[#fafafa] dark:bg-[#0B0F14] pb-44 lg:pb-12 transition-colors duration-250">
        <div className="max-w-7xl mx-auto">

          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 dark:text-[#818C9B] uppercase tracking-widest mb-6 sm:mb-8 overflow-x-auto no-scrollbar">
            <SLink to="/" className="hover:text-slate-800 dark:hover:text-[#F5F7FA] whitespace-nowrap transition-colors">Home</SLink>
            <span>/</span>
            <SLink to="/shop" className="hover:text-slate-800 dark:hover:text-[#F5F7FA] whitespace-nowrap transition-colors">Shop</SLink>
            <span>/</span>
            <span className="text-slate-800 dark:text-[#FFD600] truncate">{displayName || cleanProductName(product.name)}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* ── LEFT: DYNAMIC MULTI-IMAGE GALLERY (5 COLS) ── */}
            <div className="lg:col-span-6 flex flex-col gap-3 sm:gap-4 lg:sticky lg:top-28">

              {/* MAIN HERO IMAGE CONTAINER */}
              <div className="relative w-full h-[300px] xs:h-[360px] sm:h-[480px] bg-white dark:bg-[#151B23] rounded-2xl sm:rounded-3xl p-4 sm:p-10 border border-slate-200/80 dark:border-[#27313D] shadow-xs flex items-center justify-center overflow-hidden group transition-colors">

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1 z-10">
                  {product.tags && product.tags.map((tag, idx) => {
                    if (!tag) return null;
                    const rawName = typeof tag === "object" ? tag.name : tag;
                    const tagName = rawName && typeof rawName === "string" ? rawName.trim() : "";
                    const tagBg = typeof tag === "object" ? tag.bgColor : "#1E971D";
                    const tagColor = typeof tag === "object" ? tag.textColor : "#ffffff";
                    const rawIcon = typeof tag === "object" ? tag.icon : null;
                    const tagIcon = rawIcon === "Flame" ? null : rawIcon;
                    const tagImage = typeof tag === "object" ? tag.imageUrl : null;

                    if (!tagName && !tagImage && !tagIcon) return null;

                    return (
                      <span
                        key={idx}
                        style={{ backgroundColor: tagBg, color: tagColor }}
                        className={`inline-flex items-center justify-center font-black shadow-xs ${tagName
                            ? "gap-1 sm:gap-1.5 text-[8px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-wider"
                            : "w-6 h-6 sm:w-7 sm:h-7 rounded-full p-0 aspect-square shrink-0"
                          }`}
                      >
                        {tagImage ? (
                          <img
                            src={tagImage}
                            alt=""
                            className={tagName ? "w-3.5 h-3.5 object-contain rounded" : "w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain rounded-full"}
                          />
                        ) : (
                          tagIcon && renderBadgeIcon(tagIcon, tagName ? 12 : 14)
                        )}
                        {tagName && <span>{tagName}</span>}
                      </span>
                    );
                  })}
                </div>

                {/* Lightbox Trigger */}
                <button
                  onClick={() => setIsZoomOpen(true)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 bg-white/90 dark:bg-[#1D2530] hover:bg-white dark:hover:bg-[#222B37] text-slate-700 dark:text-[#F5F7FA] rounded-xl shadow-sm border border-slate-100 dark:border-[#2A3440] opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-10 cursor-pointer"
                  title="Zoom Image"
                >
                  <Maximize2 size={15} />
                </button>

                {/* Main Product Image with Smooth Transition */}
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={activeImage || product.image}
                  alt={displayName}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png";
                  }}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal cursor-pointer"
                  onClick={() => setIsZoomOpen(true)}
                />

                {/* Selected Bottle Size Watermark / Pill */}
                {selectedVariant && (
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-slate-900/85 dark:bg-[#1D2530]/90 backdrop-blur-sm text-white dark:text-[#FFD600] border border-transparent dark:border-[#2A3440] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                    {selectedVariant.name}
                  </div>
                )}
              </div>

              {/* THUMBNAILS CAROUSEL */}
              {currentGalleryImages.length > 1 && (
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {currentGalleryImages.map((imgUrl, idx) => {
                    const isSelected = activeImage === imgUrl;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(imgUrl)}
                        className={`w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 bg-white dark:bg-[#151B23] border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer ${isSelected
                            ? "border-[#1E971D] dark:border-[#FFD600] shadow-md scale-102"
                            : "border-slate-200 dark:border-[#27313D] hover:border-slate-300 dark:hover:border-[#34404E] opacity-70 hover:opacity-100"
                          }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── RIGHT: PRODUCT DETAILS & VARIANT SELECTOR (7 COLS) ── */}
            {/* ── RIGHT: PRODUCT DETAILS & VARIANT SELECTOR (7 COLS) ── */}
            <div className="lg:col-span-6 flex flex-col justify-center">

              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-emerald-50 dark:bg-[#17221F] text-[#1E971D] dark:text-[#19C37D] border border-emerald-100 dark:border-[#26333A] uppercase tracking-widest">
                  {product.category?.name || "Traditional Stone Pressed"}
                </span>

                <div className="flex items-center gap-1.5 text-amber-500 dark:text-[#FFD600]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-500 dark:fill-[#FFD600] stroke-amber-500 dark:stroke-[#FFD600]" />
                  ))}
                  <span className="text-xs font-bold text-slate-800 dark:text-[#F5F7FA] ml-1">5.0</span>
                  <span className="text-xs text-slate-400 dark:text-[#818C9B] font-semibold">(Verified Quality)</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-[#F7F9FC] tracking-tight uppercase leading-tight mt-2">
                {displayName || cleanProductName(product.name)}
              </h1>

              {/* SKU & Stock Info */}
              <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-400 dark:text-[#818C9B]">
                <span>SKU: <strong className="text-slate-700 dark:text-[#B7C1CE]">{selectedVariant?.sku || product.sku || "OF-OIL"}</strong></span>
                <span>•</span>
                {selectedVariant && selectedVariant.stockQuantity > 10 ? (
                  <span className="text-emerald-600 dark:text-[#19C37D] flex items-center gap-1">
                    <CheckCircle2 size={13} /> In Stock ({selectedVariant.stockQuantity} available)
                  </span>
                ) : selectedVariant && selectedVariant.stockQuantity > 0 ? (
                  <span className="text-orange-600 dark:text-orange-400 font-bold animate-pulse">
                    Low Stock: Only {selectedVariant.stockQuantity} left!
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-[#FF5C6C] font-bold">Currently Out of Stock</span>
                )}
              </div>

              {/* PRICE BOX */}
              <div className="mt-6 p-5 bg-white dark:bg-[#171D26] rounded-2xl border border-slate-200/80 dark:border-[#27313D] shadow-xs flex items-baseline gap-4 transition-colors">
                <span className="text-4xl sm:text-5xl font-black text-[#1E971D] dark:text-[#FFD600] font-mono">
                  ₹{Math.round(currentPrice * finalQuantity)}
                </span>

                {isDiscounted && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-400 dark:text-[#7F8997] line-through text-lg font-bold">
                      ₹{Math.round(regularPrice * finalQuantity)}
                    </span>
                    <span className="text-xs font-black text-red-600 dark:text-[#FF5C6C] bg-red-50 dark:bg-[#3D1418] px-2 py-0.5 rounded uppercase">
                      {discountPercent}% OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Short Description */}
              <p className="mt-6 text-slate-600 dark:text-[#B7C1CE] text-sm sm:text-base leading-relaxed">
                {product.shortDesc}
              </p>

              {/* ── BOTTLE SIZE / PACK SELECTOR ── */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-[#F7F9FC] flex items-center gap-2">
                    <Package size={16} className="text-[#1E971D] dark:text-[#FFD600]" /> {product.name?.toLowerCase().includes("combo") ? "Pack Options:" : "Available Bottle Sizes:"}
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-[#818C9B] font-bold">
                    Selected: <strong className="text-slate-800 dark:text-[#FFD600]">{selectedVariant?.name}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {product.variants?.filter((v) => v.status === "Active" && !v.name?.toLowerCase().includes("gift") && !v.name?.toLowerCase().includes("eco packaging")).map((variant) => {
                    const isSelected = selectedVariant?._id === variant._id;
                    const vPrice = variant.salePrice || variant.price;
                    return (
                      <button
                        key={variant._id}
                        onClick={() => handleVariantSelect(variant)}
                        className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${isSelected
                            ? "bg-[#1E971D] dark:bg-[#FFD600] border-[#1E971D] dark:border-[#FFD600] text-white dark:text-[#111318] shadow-md scale-102"
                            : "bg-white dark:bg-[#171D26] border-slate-200 dark:border-[#27313D] text-slate-800 dark:text-[#F5F7FA] hover:border-slate-300 dark:hover:border-[#34404E] hover:bg-slate-50 dark:hover:bg-[#1D2530]"
                          }`}
                      >
                        <span className="font-black text-xs uppercase tracking-wider block">
                          {variant.name}
                        </span>
                        <span className={`text-xs font-bold font-mono mt-1 ${isSelected ? "text-white dark:text-[#111318]" : "text-[#1E971D] dark:text-[#FFD600]"}`}>
                          ₹{vPrice}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── QUANTITY SELECTOR ── */}
              <div className="mt-8 flex items-center gap-6">
                <div>
                  <label className="text-xs font-black text-slate-400 dark:text-[#818C9B] uppercase tracking-widest block mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] rounded-2xl p-1 shadow-xs">
                    <button
                      onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                      className="w-10 h-10 flex items-center justify-center font-black text-slate-600 dark:text-[#B7C1CE] hover:bg-slate-100 dark:hover:bg-[#1D2530] rounded-xl transition-colors cursor-pointer text-lg"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-black text-base text-slate-900 dark:text-[#F5F7FA]">{selectedQty}</span>
                    <button
                      onClick={() => setSelectedQty(selectedQty + 1)}
                      className="w-10 h-10 flex items-center justify-center font-black text-slate-600 dark:text-[#B7C1CE] hover:bg-slate-100 dark:hover:bg-[#1D2530] rounded-xl transition-colors cursor-pointer text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex-1 pt-6">
                  <span className="text-xs text-slate-400 dark:text-[#818C9B] font-bold block mb-1">Total Bottle Volume:</span>
                  <span className="text-sm font-black text-slate-800 dark:text-[#F5F7FA] uppercase">
                    {finalQuantity} x {selectedVariant?.name || "Standard Size"}
                  </span>
                </div>
              </div>

              {/* ── ACTION BUTTONS ── */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={selectedVariant?.stockQuantity <= 0}
                  className="bg-slate-900 dark:bg-[#1D2530] dark:border dark:border-[#303B48] hover:bg-slate-800 dark:hover:bg-[#242E3A] text-white dark:text-[#F5F7FA] py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={selectedVariant?.stockQuantity <= 0}
                  className="bg-[#1E971D] hover:bg-[#167a17] dark:bg-[#FFD600] dark:hover:bg-[#FFE45C] text-white dark:text-[#111318] py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-[#1E971D]/20 dark:shadow-none active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Zap size={18} /> Buy Now
                </button>
              </div>

              {/* ── ASSURANCE BADGES ── */}
              <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-slate-200 dark:border-[#27313D]">
                <div className="flex flex-col items-center text-center p-3 bg-white dark:bg-[#171D26] rounded-2xl border border-slate-100 dark:border-[#27313D]">
                  <ShieldCheck size={20} className="text-[#1E971D] dark:text-[#19C37D] mb-1.5" />
                  <span className="text-[10px] font-black text-slate-800 dark:text-[#F5F7FA] uppercase tracking-wider">Lab Tested</span>
                  <span className="text-[9px] text-slate-400 dark:text-[#818C9B]">Zero Chemicals</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-white dark:bg-[#171D26] rounded-2xl border border-slate-100 dark:border-[#27313D]">
                  <Truck size={20} className="text-[#1E971D] dark:text-[#FFD600] mb-1.5" />
                  <span className="text-[10px] font-black text-slate-800 dark:text-[#F5F7FA] uppercase tracking-wider">Fast Delivery</span>
                  <span className="text-[9px] text-slate-400 dark:text-[#818C9B]">Safe Bottle Packing</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-white dark:bg-[#171D26] rounded-2xl border border-slate-100 dark:border-[#27313D]">
                  <Leaf size={20} className="text-[#1E971D] dark:text-[#19C37D] mb-1.5" />
                  <span className="text-[10px] font-black text-slate-800 dark:text-[#F5F7FA] uppercase tracking-wider">Stone Pressed</span>
                  <span className="text-[9px] text-slate-400 dark:text-[#818C9B]">Nutrients Preserved</span>
                </div>
              </div>

            </div>
          </div>

          {/* ── FREQUENTLY BOUGHT TOGETHER (FBT) BUNDLE ── */}
          {fbtItem1 && (
            <div className="mt-14 bg-white dark:bg-[#171D26] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-[#27313D] shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1E971D] dark:text-[#19C37D] bg-emerald-50 dark:bg-[#17221F] border border-emerald-200 dark:border-[#26333A] px-3 py-1 rounded-full inline-block mb-1">
                    Complete Kitchen Essentials Bundle
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-[#F7F9FC] uppercase tracking-tight">
                    Frequently Bought Together
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#B7C1CE] font-medium">
                    Pair your stone-pressed oil with complementary kitchen oils for diverse traditional cooking.
                  </p>
                </div>

                {fbtCount >= 2 && (
                  <span className="bg-emerald-600 dark:bg-[#19C37D] text-white dark:text-[#101318] text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider self-start md:self-auto shadow-xs animate-pulse">
                    ✓ Multi-Oil Combo Discount Available
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Bundle Images Connected with Plus (+) */}
                <div className="lg:col-span-7 flex items-center justify-start gap-2 sm:gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {/* Main item */}
                  <div className={`relative p-3 rounded-2xl border transition-all ${fbtMain ? "bg-white dark:bg-[#151B23] border-[#1E971D] dark:border-[#FFD600] shadow-sm ring-2 ring-[#1E971D]/10 dark:ring-[#FFD600]/10" : "bg-slate-100 dark:bg-[#111720] border-slate-200 dark:border-[#27313D] opacity-40"}`}>
                    <img
                      src={activeImage || product.image}
                      alt={displayName}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain mix-blend-multiply dark:mix-blend-normal"
                    />
                    <span className="text-[9px] font-black uppercase text-center block mt-1 text-slate-700 dark:text-[#B7C1CE] truncate max-w-[80px]">
                      This Item
                    </span>
                  </div>

                  {/* Plus 1 */}
                  {fbtItem1 && (
                    <>
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1D2530] border border-slate-200 dark:border-[#27313D] flex items-center justify-center text-slate-500 dark:text-[#B7C1CE] shrink-0 font-black text-sm">
                        +
                      </div>

                      <div className={`relative p-3 rounded-2xl border transition-all ${fbtAdd1 ? "bg-white dark:bg-[#151B23] border-[#1E971D] dark:border-[#FFD600] shadow-sm ring-2 ring-[#1E971D]/10 dark:ring-[#FFD600]/10" : "bg-slate-100 dark:bg-[#111720] border-slate-200 dark:border-[#27313D] opacity-40"}`}>
                        <img
                          src={fbtVariant1?.image || fbtItem1.image}
                          alt={fbtItem1.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-contain mix-blend-multiply dark:mix-blend-normal"
                        />
                        <span className="text-[9px] font-black uppercase text-center block mt-1 text-slate-700 dark:text-[#B7C1CE] truncate max-w-[80px]">
                          {fbtItem1.name.split(" ")[0]}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Plus 2 */}
                  {fbtItem2 && (
                    <>
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1D2530] border border-slate-200 dark:border-[#27313D] flex items-center justify-center text-slate-500 dark:text-[#B7C1CE] shrink-0 font-black text-sm">
                        +
                      </div>

                      <div className={`relative p-3 rounded-2xl border transition-all ${fbtAdd2 ? "bg-white dark:bg-[#151B23] border-[#1E971D] dark:border-[#FFD600] shadow-sm ring-2 ring-[#1E971D]/10 dark:ring-[#FFD600]/10" : "bg-slate-100 dark:bg-[#111720] border-slate-200 dark:border-[#27313D] opacity-40"}`}>
                        <img
                          src={fbtVariant2?.image || fbtItem2.image}
                          alt={fbtItem2.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-contain mix-blend-multiply dark:mix-blend-normal"
                        />
                        <span className="text-[9px] font-black uppercase text-center block mt-1 text-slate-700 dark:text-[#B7C1CE] truncate max-w-[80px]">
                          {fbtItem2.name.split(" ")[0]}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Checkboxes & Add Bundle Action */}
                <div className="lg:col-span-5 bg-slate-50 dark:bg-[#151B23] p-5 rounded-2xl border border-slate-200/80 dark:border-[#27313D] flex flex-col justify-between">
                  <div className="space-y-2.5 mb-4 text-xs">
                    {/* Main Checkbox */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={fbtMain}
                        onChange={(e) => setFbtMain(e.target.checked)}
                        className="w-4 h-4 rounded text-[#1E971D] dark:text-[#FFD600] accent-[#1E971D] dark:accent-[#FFD600] cursor-pointer"
                      />
                      <span className="font-bold text-slate-800 dark:text-[#F5F7FA] flex-1 truncate">
                        <strong>This Item:</strong> {displayName}
                      </span>
                      <span className="font-black font-mono text-slate-900 dark:text-[#FFD600]">
                        ₹{selectedVariant ? (selectedVariant.salePrice || selectedVariant.price) : product.price}
                      </span>
                    </label>

                    {/* Item 1 Checkbox */}
                    {fbtItem1 && (
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={fbtAdd1}
                          onChange={(e) => setFbtAdd1(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1E971D] dark:text-[#FFD600] accent-[#1E971D] dark:accent-[#FFD600] cursor-pointer"
                        />
                        <span className="font-medium text-slate-700 dark:text-[#B7C1CE] flex-1 truncate">
                          {getDynamicName(fbtItem1.name, fbtVariant1?.name)}
                        </span>
                        <span className="font-black font-mono text-slate-900 dark:text-[#FFD600]">₹{fbtPrice1}</span>
                      </label>
                    )}

                    {/* Item 2 Checkbox */}
                    {fbtItem2 && (
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={fbtAdd2}
                          onChange={(e) => setFbtAdd2(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1E971D] dark:text-[#FFD600] accent-[#1E971D] dark:accent-[#FFD600] cursor-pointer"
                        />
                        <span className="font-medium text-slate-700 dark:text-[#B7C1CE] flex-1 truncate">
                          {getDynamicName(fbtItem2.name, fbtVariant2?.name)}
                        </span>
                        <span className="font-black font-mono text-slate-900 dark:text-[#FFD600]">₹{fbtPrice2}</span>
                      </label>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 dark:border-[#27313D] flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-[#818C9B] uppercase tracking-wider block">
                        Total Bundle Price
                      </span>
                      <span className="text-xl font-black text-slate-900 dark:text-[#FFD600] font-mono">
                        ₹{fbtTotalPrice}
                      </span>
                    </div>

                    <button
                      onClick={handleAddBundleToCart}
                      disabled={fbtCount === 0}
                      className="px-5 py-3 bg-[#1E971D] hover:bg-[#167a17] dark:bg-[#FFD600] dark:hover:bg-[#FFE45C] text-white dark:text-[#111318] rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-[#1E971D]/20 dark:shadow-none active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <ShoppingCart size={14} /> Add ({fbtCount}) to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TABS: SPECIFICATIONS, METHOD, FAQS, BOTTLE LABEL & REVIEWS ── */}
          <div className="mt-20">
            {/* Tab Switcher */}
            <div className="flex items-center gap-2 sm:gap-4 border-b border-slate-200 dark:border-[#27313D] pb-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${activeTab === "overview"
                    ? "bg-[#1E971D] dark:bg-[#FFD600] text-white dark:text-[#111318] shadow-md shadow-[#1E971D]/20 dark:shadow-none"
                    : "text-slate-500 dark:text-[#818C9B] hover:text-slate-900 dark:hover:text-[#F5F7FA] hover:bg-slate-100 dark:hover:bg-[#171D26]"
                  }`}
              >
                <Leaf size={16} />
                Overview & Benefits
              </button>

              <button
                onClick={() => setActiveTab("method")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${activeTab === "method"
                    ? "bg-[#1E971D] dark:bg-[#FFD600] text-white dark:text-[#111318] shadow-md shadow-[#1E971D]/20 dark:shadow-none"
                    : "text-slate-500 dark:text-[#818C9B] hover:text-slate-900 dark:hover:text-[#F5F7FA] hover:bg-slate-100 dark:hover:bg-[#171D26]"
                  }`}
              >
                <RotateCcw size={16} />
                Stone-Pressed (Kolhu) Method
              </button>

              <button
                onClick={() => setActiveTab("specs")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${activeTab === "specs"
                    ? "bg-[#1E971D] dark:bg-[#FFD600] text-white dark:text-[#111318] shadow-md shadow-[#1E971D]/20 dark:shadow-none"
                    : "text-slate-500 dark:text-[#818C9B] hover:text-slate-900 dark:hover:text-[#F5F7FA] hover:bg-slate-100 dark:hover:bg-[#171D26]"
                  }`}
              >
                <FileText size={16} />
                Specifications & Uses
              </button>

              <button
                onClick={() => setActiveTab("faqs")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${activeTab === "faqs"
                    ? "bg-[#1E971D] dark:bg-[#FFD600] text-white dark:text-[#111318] shadow-md shadow-[#1E971D]/20 dark:shadow-none"
                    : "text-slate-500 dark:text-[#818C9B] hover:text-slate-900 dark:hover:text-[#F5F7FA] hover:bg-slate-100 dark:hover:bg-[#171D26]"
                  }`}
              >
                <HelpCircle size={16} />
                FAQs ({oilInfo.faqs?.length || 0})
              </button>

              {product.labelImage && (
                <button
                  onClick={() => setActiveTab("label")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${activeTab === "label"
                      ? "bg-[#1E971D] dark:bg-[#FFD600] text-white dark:text-[#111318] shadow-md shadow-[#1E971D]/20 dark:shadow-none"
                      : "text-slate-500 dark:text-[#818C9B] hover:text-slate-900 dark:hover:text-[#F5F7FA] hover:bg-slate-100 dark:hover:bg-[#171D26]"
                    }`}
                >
                  <Package size={16} />
                  Bottle Label
                </button>
              )}

              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${activeTab === "reviews"
                    ? "bg-[#1E971D] dark:bg-[#FFD600] text-white dark:text-[#111318] shadow-md shadow-[#1E971D]/20 dark:shadow-none"
                    : "text-slate-500 dark:text-[#818C9B] hover:text-slate-900 dark:hover:text-[#F5F7FA] hover:bg-slate-100 dark:hover:bg-[#171D26]"
                  }`}
              >
                <Star size={16} />
                Reviews
              </button>
            </div>

            {/* Tab Contents */}
            <div className="mt-8 bg-white dark:bg-[#171D26] p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-[#27313D] shadow-sm">
              {/* ── TAB 1: OVERVIEW & BENEFITS ── */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Highlight Header Card */}
                  <div className="p-6 bg-gradient-to-r from-emerald-50 via-slate-50 to-amber-50 dark:from-[#111720] dark:via-[#171D26] dark:to-[#111720] rounded-2xl border border-emerald-100 dark:border-[#27313D] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#1E971D] dark:text-[#19C37D] bg-white dark:bg-[#1D2530] px-3 py-1 rounded-full border border-emerald-200 dark:border-[#2A3440] inline-block mb-1.5">
                        {oilInfo.badgeTitle}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-[#F7F9FC] uppercase tracking-tight">
                        {displayName || product.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-[#B7C1CE] font-medium mt-1">
                        {product.shortDesc || oilInfo.shortDesc}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white dark:bg-[#151B23] p-3 rounded-xl border border-slate-200 dark:border-[#27313D] text-center shadow-xs">
                        <span className="text-[9px] font-black text-slate-400 dark:text-[#818C9B] uppercase tracking-wider block">Smoke Point</span>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-[#F5F7FA]">{oilInfo.smokePoint}</span>
                      </div>
                      <div className="bg-white dark:bg-[#151B23] p-3 rounded-xl border border-slate-200 dark:border-[#27313D] text-center shadow-xs">
                        <span className="text-[9px] font-black text-slate-400 dark:text-[#818C9B] uppercase tracking-wider block">Shelf Life</span>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-[#F5F7FA]">{oilInfo.shelfLife}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Bioactive Nutrients Grid */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-[#818C9B] mb-4 flex items-center gap-2">
                      <Sparkles size={14} className="text-[#1E971D] dark:text-[#FFD600]" /> Native Bioactives & Micronutrients
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {oilInfo.keyNutrients.map((nut, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#151B23] border border-slate-200/80 dark:border-[#27313D] flex items-start gap-3">
                          <CheckCircle2 size={16} className="text-[#1E971D] dark:text-[#19C37D] shrink-0 mt-0.5" />
                          <span className="text-xs font-bold text-slate-800 dark:text-[#F5F7FA] leading-snug">{nut}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fatty Acid Profile & Aroma */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-[#27313D]">
                    <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-[#17221F] border border-emerald-100 dark:border-[#26333A]">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-[#19C37D] font-bold text-xs uppercase tracking-wider mb-2">
                        <Heart size={16} className="text-[#1E971D] dark:text-[#19C37D]" /> Fatty Acid & Lipid Composition
                      </div>
                      <p className="text-xs text-slate-700 dark:text-[#B7C1CE] font-semibold leading-relaxed">
                        {oilInfo.fatProfile}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#818C9B] mt-2">
                        Zero industrial heat ensures double bonds in unsaturated fatty acids remain unbroken, maintaining original natural bioactivity.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-[#1F1C14] border border-amber-100 dark:border-[#3D3318]">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-[#FFD600] font-bold text-xs uppercase tracking-wider mb-2">
                        <Droplets size={16} className="text-amber-600 dark:text-[#FFD600]" /> Aroma & Sensory Characteristics
                      </div>
                      <p className="text-xs text-slate-700 dark:text-[#B7C1CE] font-semibold leading-relaxed">
                        {oilInfo.aromaProfile}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#818C9B] mt-2">
                        Unrefined, unbleached, and naturally settled without chemical deodorizers.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: 5-STEP STONE-PRESSED METHOD ── */}
              {activeTab === "method" && (
                <div className="space-y-8">
                  <div className="max-w-3xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1E971D] dark:text-[#19C37D] bg-emerald-50 dark:bg-[#17221F] border border-emerald-200 dark:border-[#26333A] px-3 py-1 rounded-full inline-block mb-2">
                      Ancient Ghani / Kolhu Heritage
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-[#F7F9FC] uppercase tracking-tight">
                      The Traditional Stone-Pressed Extraction Journey
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-[#B7C1CE] mt-1 leading-relaxed">
                      Unlike commercial factory oils extracted using high heat (&gt;200°C) and hexane chemical solvents, OwnFresh oils are gently pressed in slow-revolving granite stone mortars (Kolhu). No external heat, no refining chemicals, just raw natural essence.
                    </p>
                  </div>

                  {/* 5-Step Process Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {oilInfo.steps.map((st, i) => (
                      <div
                        key={i}
                        className="relative bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#27313D] rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
                      >
                        <div>
                          <span className="text-2xl font-black text-[#1E971D] dark:text-[#FFD600] tracking-tighter block mb-2 font-mono">
                            {st.step}
                          </span>
                          <h4 className="text-xs font-black uppercase tracking-wide text-slate-900 dark:text-[#F7F9FC] mb-2">
                            {st.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-[#B7C1CE] leading-relaxed">
                            {st.desc}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-[#27313D] flex items-center justify-between">
                          <CheckCircle2 size={14} className="text-[#1E971D] dark:text-[#19C37D]" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-[#818C9B]">Step {i + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Method Benchmarks */}
                  <div className="p-6 bg-slate-900 dark:bg-[#151B23] text-white rounded-2xl border border-transparent dark:border-[#27313D] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-[#EFDB27] dark:text-[#FFD600] block font-mono">14-16</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#818C9B]">Low RPM Pressing</span>
                    </div>
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-[#EFDB27] dark:text-[#FFD600] block font-mono">&lt; 40°C</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#818C9B]">Zero-Heat Friction</span>
                    </div>
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-[#EFDB27] dark:text-[#FFD600] block font-mono">100%</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#818C9B]">Single-Origin Seeds</span>
                    </div>
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-[#EFDB27] dark:text-[#FFD600] block font-mono">0%</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#818C9B]">Chemical Solvents</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: SPECIFICATIONS & CULINARY GUIDE ── */}
              {activeTab === "specs" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Technical Specs Table */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-[#818C9B] mb-4 flex items-center gap-2">
                        <FileText size={14} className="text-[#1E971D] dark:text-[#FFD600]" /> Technical Specifications
                      </h4>
                      <div className="border border-slate-200 dark:border-[#27313D] rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-[#202832] text-xs">
                        <div className="grid grid-cols-2 p-3.5 bg-slate-50/60 dark:bg-[#151B23] font-semibold text-slate-700 dark:text-[#B7C1CE]">
                          <span className="text-slate-400 dark:text-[#818C9B] font-bold uppercase tracking-wider text-[10px]">Extraction Method</span>
                          <span className="font-bold text-slate-900 dark:text-[#F5F7FA]">{oilInfo.extractionType}</span>
                        </div>
                        <div className="grid grid-cols-2 p-3.5 font-semibold text-slate-700 dark:text-[#B7C1CE]">
                          <span className="text-slate-400 dark:text-[#818C9B] font-bold uppercase tracking-wider text-[10px]">Raw Ingredient Source</span>
                          <span className="font-bold text-slate-900 dark:text-[#F5F7FA]">{oilInfo.origin}</span>
                        </div>
                        <div className="grid grid-cols-2 p-3.5 bg-slate-50/60 dark:bg-[#151B23] font-semibold text-slate-700 dark:text-[#B7C1CE]">
                          <span className="text-slate-400 dark:text-[#818C9B] font-bold uppercase tracking-wider text-[10px]">Smoke Point</span>
                          <span className="font-bold text-emerald-700 dark:text-[#19C37D]">{oilInfo.smokePoint}</span>
                        </div>
                        <div className="grid grid-cols-2 p-3.5 font-semibold text-slate-700 dark:text-[#B7C1CE]">
                          <span className="text-slate-400 dark:text-[#818C9B] font-bold uppercase tracking-wider text-[10px]">Shelf Life</span>
                          <span className="font-bold text-slate-900 dark:text-[#F5F7FA]">{oilInfo.shelfLife}</span>
                        </div>
                        <div className="grid grid-cols-2 p-3.5 bg-slate-50/60 dark:bg-[#151B23] font-semibold text-slate-700 dark:text-[#B7C1CE]">
                          <span className="text-slate-400 dark:text-[#818C9B] font-bold uppercase tracking-wider text-[10px]">Packaging Type</span>
                          <span className="font-bold text-slate-900 dark:text-[#F5F7FA]">Food-Grade UV Protected Airtight Bottle/Can</span>
                        </div>
                        <div className="grid grid-cols-2 p-3.5 font-semibold text-slate-700 dark:text-[#B7C1CE]">
                          <span className="text-slate-400 dark:text-[#818C9B] font-bold uppercase tracking-wider text-[10px]">Preservatives / Additives</span>
                          <span className="font-bold text-emerald-700 dark:text-[#19C37D]">Zero Added Chemicals, Zero Hexane</span>
                        </div>
                      </div>
                    </div>

                    {/* Culinary Guidelines */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-[#818C9B] mb-4 flex items-center gap-2">
                        <Utensils size={14} className="text-[#1E971D] dark:text-[#FFD600]" /> Recommended Culinary & Wellness Uses
                      </h4>
                      <div className="space-y-3">
                        {oilInfo.bestFor.map((use, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151B23] border border-slate-200/80 dark:border-[#27313D] flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1D2530] text-[#1E971D] dark:text-[#FFD600] border border-slate-200 dark:border-[#2A3440] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              {idx + 1}
                            </div>
                            <span className="text-xs font-extrabold text-slate-800 dark:text-[#F5F7FA]">{use}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-[#1F1C14] border border-amber-200/80 dark:border-[#3D3318]">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-[#FFD600] block mb-1">
                          Storage Instructions
                        </span>
                        <p className="text-[11px] text-amber-900 dark:text-[#B7C1CE] font-medium leading-relaxed">
                          Store in a cool, dry place away from direct sunlight. Reseal the cap tightly after every use to preserve fresh aroma and prevent natural lipid oxidation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 4: EXPERT FAQS ACCORDION ── */}
              {activeTab === "faqs" && (
                <div className="space-y-6">
                  <div className="max-w-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1E971D] dark:text-[#19C37D] bg-emerald-50 dark:bg-[#17221F] border border-emerald-200 dark:border-[#26333A] px-3 py-1 rounded-full inline-block mb-2">
                      Frequently Asked Questions
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-[#F7F9FC] uppercase tracking-tight">
                      Questions About {displayName || product.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-[#B7C1CE] mt-1">
                      Everything you need to know about our unheated stone-pressed extraction, smoke points, and daily health benefits.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {(oilInfo.faqs || []).map((faq, index) => {
                      const isOpen = openFaq === index;
                      return (
                        <div
                          key={index}
                          className="border border-slate-200/80 dark:border-[#27313D] rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-[#151B23] transition-all"
                        >
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : index)}
                            className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-[#F7F9FC] hover:text-[#1E971D] dark:hover:text-[#FFD600] transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-3 font-black">
                              <HelpCircle size={18} className="text-[#1E971D] dark:text-[#FFD600] shrink-0" />
                              {faq.q}
                            </span>
                            {isOpen ? (
                              <ChevronUp size={18} className="text-slate-400 dark:text-[#818C9B] shrink-0" />
                            ) : (
                              <ChevronDown size={18} className="text-slate-400 dark:text-[#818C9B] shrink-0" />
                            )}
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="px-5 pb-5 text-xs text-slate-600 dark:text-[#B7C1CE] font-medium leading-relaxed border-t border-slate-100 dark:border-[#27313D] bg-white dark:bg-[#171D26] pt-3"
                              >
                                {faq.a}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── TAB 5: BOTTLE LABEL ── */}
              {activeTab === "label" && product.labelImage && (
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-black uppercase tracking-wide text-slate-900 dark:text-[#F7F9FC] mb-6">
                    Official Packaging & Nutritional Bottle Label
                  </h3>
                  <div className="max-w-md w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-[#27313D] p-4 bg-slate-50 dark:bg-[#151B23]">
                    <img src={product.labelImage} alt="Bottle Label" className="w-full h-auto object-contain rounded-xl" />
                  </div>
                </div>
              )}

              {/* ── TAB 6: CUSTOMER REVIEWS ── */}
              {activeTab === "reviews" && (
                <ProductReviews productId={product._id} productName={product.name} />
              )}

              {/* Purity Guarantee Footer Ribbon */}
              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-[#27313D] flex flex-wrap items-center justify-between gap-4 text-[11px] font-bold text-slate-500 dark:text-[#818C9B]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#1E971D] dark:text-[#19C37D]" />
                  <span>100% Single-Origin Kernels</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-[#1E971D] dark:text-[#19C37D]" />
                  <span>Traditional Granite Stone Kolhu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-[#1E971D] dark:text-[#FFD600]" />
                  <span>Certified Food-Grade Standards</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf size={16} className="text-[#1E971D] dark:text-[#19C37D]" />
                  <span>Zero Chemicals & Unrefined</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RELATED PRODUCTS ── */}
          <div className="mt-20">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-slate-900 dark:text-[#F7F9FC]">
              Other Stone Pressed Oils You May Like
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentProducts.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  user={user}
                  onAddToCart={handleRecentAddToCart}
                />
              ))}
            </div>
          </div>

          {/* ── RECENTLY VIEWED BY YOU ── */}
          {recentlyViewed.length > 0 && (
            <div className="mt-20 pt-16 border-t border-slate-200/80 dark:border-[#27313D]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1E971D] dark:text-[#19C37D] bg-emerald-50 dark:bg-[#17221F] border border-emerald-200 dark:border-[#26333A] px-3 py-1 rounded-full inline-block mb-1">
                    Your Browsing History
                  </span>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-[#F7F9FC] flex items-center gap-2">
                    <Eye size={22} className="text-[#1E971D] dark:text-[#FFD600]" /> Recently Viewed Oils
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recentlyViewed.slice(0, 4).map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    user={user}
                    onAddToCart={handleRecentAddToCart}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── MOBILE STICKY PURCHASE BAR (Fixed on iPhone & Android) ── */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-[100] bg-white/95 dark:bg-[#0A0D12]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-[#202731] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[9px] font-bold text-slate-400 dark:text-[#818C9B] block uppercase tracking-wider truncate">
            {selectedVariant?.name || "Standard Size"}
          </span>
          <span className="text-base font-black text-slate-900 dark:text-[#FFD600] font-mono">
            ₹{currentPrice}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddToCart}
            disabled={selectedVariant?.stockQuantity <= 0}
            className="px-3.5 py-2.5 bg-slate-900 dark:bg-[#1D2530] dark:border dark:border-[#303B48] hover:bg-black dark:hover:bg-[#242E3A] text-white dark:text-[#F5F7FA] rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <ShoppingCart size={14} /> Add
          </button>
          <button
            onClick={handleBuyNow}
            disabled={selectedVariant?.stockQuantity <= 0}
            className="px-4 py-2.5 bg-[#1E971D] hover:bg-[#167a17] dark:bg-[#FFD600] dark:hover:bg-[#FFE45C] text-white dark:text-[#111318] rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#1E971D]/25 dark:shadow-none active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Zap size={14} /> Buy Now
          </button>
        </div>
      </div>

      {/* ── FULLSCREEN IMAGE LIGHTBOX MODAL ── */}
      <AnimatePresence>
        {isZoomOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[3000] flex items-center justify-center p-4">
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
            <div className="max-w-4xl max-h-[85vh] p-4 flex items-center justify-center">
              <img
                src={activeImage || product.image}
                alt={displayName}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductDetails;