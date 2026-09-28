import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Activity,
  Search,
  ExternalLink,
  MousePointerClick,
  ArrowDownCircle,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Globe,
  Smartphone,
  Eye,
  ShoppingCart,
  MessageCircle,
  Phone,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  BookOpen
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");

const GoogleInsightsManager = () => {
  const [searchData, setSearchData] = useState({ topSearches: [], zeroResultSearches: [] });
  const [loadingSearch, setLoadingSearch] = useState(true);
  const [activeGuide, setActiveGuide] = useState("scrolls"); // 'scrolls' | 'search_console' | 'funnel'

  const fetchSearchAnalytics = async () => {
    try {
      setLoadingSearch(true);
      const res = await axios.get(`${API_BASE_URL}/api/analytics/search-analytics`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setSearchData({
          topSearches: res.data.topSearches || [],
          zeroResultSearches: res.data.zeroResultSearches || [],
        });
      }
    } catch (err) {
      console.error("Failed to load search analytics", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    fetchSearchAnalytics();
  }, []);

  const GA_ID = "G-BB6RGNVWCR";
  const SITE_URL = "https://myownfresh.com";
  const GA_ACCOUNT_EMAIL = "my1ownfresh@gmail.com";

  // Google Deep Links
  const GA_REALTIME_URL = "https://analytics.google.com/analytics/web/#/reports/dashboard";
  const GA_EVENTS_URL = "https://analytics.google.com/analytics/web/#/reports/events";
  const GSC_PERFORMANCE_URL = `https://search.google.com/search-console/performance/search-result?resource_id=${encodeURIComponent(SITE_URL + "/")}`;
  const GA_ECOMMERCE_URL = "https://analytics.google.com/analytics/web/#/reports/purchases";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fadeIn">
      {/* Top Banner / Status Overview */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E971D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#F9DD19]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E971D]/20 border border-[#1E971D]/40 text-[#4ade80] text-xs font-black tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              Google Ecosystem Active
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Google & Web Insights <Activity className="w-7 h-7 text-[#F9DD19] animate-pulse" />
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-medium">
              Monitor real-time visitor clicks, 25%–90% scroll engagement, organic Google search impressions, and store conversion telemetry.
            </p>
          </div>

          {/* Status Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">GA4 Measurement ID</p>
                <p className="font-extrabold text-white">{GA_ID}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3">
              <Globe className="w-4 h-4 text-sky-400" />
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Search Console</p>
                <p className="font-extrabold text-white">Verified ({SITE_URL})</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 sm:col-span-2 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#F9DD19]" />
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Master Google Account</p>
                <p className="font-extrabold text-amber-200">{GA_ACCOUNT_EMAIL}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK LAUNCH DIRECT ACTION PORTALS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-[#1E971D] dark:text-[#F9DD19]" /> Direct 1-Click Google Portals
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Instant deep-links into your verified Google dashboards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Realtime Live Users */}
          <a
            href={GA_REALTIME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white dark:bg-[#1D2530] hover:bg-emerald-50/50 dark:hover:bg-[#152a22] p-5 rounded-2xl border border-slate-200 dark:border-[#303B48] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  Real-Time Visitors
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Watch live active users on OwnFresh right now with live India map & devices.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Open GA4 Realtime</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Search Console Performance */}
          <a
            href={GSC_PERFORMANCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white dark:bg-[#1D2530] hover:bg-sky-50/50 dark:hover:bg-[#12283a] p-5 rounded-2xl border border-slate-200 dark:border-[#303B48] hover:border-sky-500/50 dark:hover:border-sky-500/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                  Search Console (SEO)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  See total organic Google clicks, search impressions, CTR, and exact search queries.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
              <span>Open Search Console</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* User Scrolls & Clicks (Events) */}
          <a
            href={GA_EVENTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white dark:bg-[#1D2530] hover:bg-amber-50/50 dark:hover:bg-[#2c2212] p-5 rounded-2xl border border-slate-200 dark:border-[#303B48] hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                <MousePointerClick className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Clicks & Scroll Depth
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  View how many users scrolled 25%–90% down and clicked WhatsApp/products.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>Open GA4 Events</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* E-Commerce Monetization */}
          <a
            href={GA_ECOMMERCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white dark:bg-[#1D2530] hover:bg-purple-50/50 dark:hover:bg-[#281a38] p-5 rounded-2xl border border-slate-200 dark:border-[#303B48] hover:border-purple-500/50 dark:hover:border-purple-500/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                  E-Commerce Sales
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Track revenue per oil variant (1L, 5L Groundnut, Mustard), checkout drops, and conversion rate.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
              <span>Open Purchases</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        </div>
      </div>

      {/* WHAT IS BEING TRACKED LIVE (React Telemetry Architecture) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Scroll Depth Tracking */}
        <div className="bg-white dark:bg-[#1D2530] p-6 rounded-3xl border border-slate-200 dark:border-[#303B48] shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">Scroll Depth Tracking</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Automatic reading engagement</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            When users read your product stories, culinary insights, or blog posts, the React app automatically fires <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-300 px-1 py-0.5 rounded font-mono text-[11px]">scroll_depth</code> events as they reach reading milestones:
          </p>

          <div className="space-y-3 pt-2">
            {[
              { depth: "25%", label: "Quick Scanners (Landed & Began Scrolling)", color: "bg-blue-500" },
              { depth: "50%", label: "Interested Readers (Midway through product)", color: "bg-amber-500" },
              { depth: "75%", label: "High Engagement (Browsed descriptions)", color: "bg-indigo-500" },
              { depth: "90%", label: "Full Completion (Viewed reviews & footer)", color: "bg-emerald-500" },
            ].map((milestone) => (
              <div key={milestone.depth} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span>{milestone.depth} Depth</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{milestone.label}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${milestone.color}`} style={{ width: milestone.depth }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-700/50 text-amber-900 dark:text-amber-200 text-xs font-medium">
            💡 <strong>Where to see this in GA4:</strong> Reports → Engagement → Events → look for <code className="font-mono bg-amber-100/90 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 px-1.5 py-0.5 rounded font-bold">scroll_depth</code>.
          </div>
        </div>

        {/* Card 2: Click & Lead Telemetry */}
        <div className="bg-white dark:bg-[#1D2530] p-6 rounded-3xl border border-slate-200 dark:border-[#303B48] shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">User Click Tracking</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Leads, buttons & interactions</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Every customer click on interactive elements is categorized and dispatched to GA4 as high-intent events:
          </p>

          <div className="space-y-3">
            {/* WhatsApp Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-[#132c1e] border border-emerald-300/80 dark:border-emerald-600/50 flex items-start gap-3 transition-colors">
              <MessageCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5 flex-wrap">
                  WhatsApp Inquiries <code className="font-mono text-[11px] bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-950 dark:text-emerald-100 px-1.5 py-0.5 rounded">contact_click</code>
                </h4>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 mt-1 font-medium leading-relaxed">
                  Fires whenever anyone taps the WhatsApp quick chat button on mobile or desktop.
                </p>
              </div>
            </div>

            {/* Phone Call Box */}
            <div className="p-3.5 rounded-2xl bg-sky-50/90 dark:bg-[#10273c] border border-sky-300/80 dark:border-sky-600/50 flex items-start gap-3 transition-colors">
              <Phone className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5 flex-wrap">
                  Phone Call Clicks <code className="font-mono text-[11px] bg-sky-200/80 dark:bg-sky-900/80 text-sky-950 dark:text-sky-100 px-1.5 py-0.5 rounded">contact_click</code>
                </h4>
                <p className="text-[11px] text-sky-800 dark:text-sky-300/90 mt-1 font-medium leading-relaxed">
                  Captures direct calls to <span className="font-bold underline decoration-sky-400 text-sky-950 dark:text-sky-100">+91 89997 73438</span> from the floating widget.
                </p>
              </div>
            </div>

            {/* Add to Cart Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-[#342410] border border-amber-300/80 dark:border-amber-600/50 flex items-start gap-3 transition-colors">
              <ShoppingCart className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5 flex-wrap">
                  Add to Cart Clicks <code className="font-mono text-[11px] bg-amber-200/80 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 px-1.5 py-0.5 rounded">add_to_cart</code>
                </h4>
                <p className="text-[11px] text-amber-800 dark:text-amber-300/90 mt-1 font-medium leading-relaxed">
                  Tracks product name, variant size (1L, 5L), price in INR, and cart total.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/90 dark:bg-[#132c1e] rounded-2xl border border-emerald-300/80 dark:border-emerald-600/50 text-emerald-950 dark:text-emerald-200 text-xs font-medium">
            ✅ Both <code className="font-mono font-bold bg-emerald-200/80 dark:bg-emerald-900/80 px-1 rounded">contact_click</code> and <code className="font-mono font-bold bg-emerald-200/80 dark:bg-emerald-900/80 px-1 rounded">add_to_cart</code> are tagged as Key Conversion Events.
          </div>
        </div>

        {/* Card 3: E-Commerce Conversion Funnel */}
        <div className="bg-white dark:bg-[#1D2530] p-6 rounded-3xl border border-slate-200 dark:border-[#303B48] shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">5-Step Purchase Funnel</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Drop-off tracking from visit to sale</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Your React code guides Google Analytics through every stage of the checkout journey:
          </p>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
            {[
              { step: 1, name: "view_item", desc: "Customer views cold pressed oil product page" },
              { step: 2, name: "add_to_cart", desc: "Customer adds oil bottle or can to cart" },
              { step: 3, name: "view_cart", desc: "Customer opens slide-over cart to review items" },
              { step: 4, name: "begin_checkout", desc: "Customer enters checkout with address details" },
              { step: 5, name: "purchase", desc: "Order confirmed with transaction ID & INR total" },
            ].map((s) => (
              <div key={s.step} className="relative">
                <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-[#FFD600] text-white dark:text-black font-extrabold text-[10px] flex items-center justify-center">
                  {s.step}
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-[#F9DD19]">{s.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-300 font-medium">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/80 dark:border-indigo-700/50 text-indigo-950 dark:text-indigo-200 text-xs font-medium">
            📊 In GA4, go to <strong>Explore → Funnel Exploration</strong> to see where users drop off.
          </div>
        </div>
      </div>

      {/* INTERNAL SEARCH INSIGHTS (LIVE FROM DATABASE) */}
      <div className="bg-white dark:bg-[#1D2530] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#303B48] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Store Internal Search Query Intelligence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Real terms customers type into the OwnFresh search bar (synced with GA4 <code className="font-mono text-slate-700 dark:text-amber-300">search</code> event)
            </p>
          </div>
          <button
            onClick={fetchSearchAnalytics}
            disabled={loadingSearch}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSearch ? "animate-spin" : ""}`} />
            Refresh Queries
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Searched Queries */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#141b24] border border-slate-200/70 dark:border-[#263342] space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Most Popular Customer Searches
            </h3>
            {loadingSearch ? (
              <div className="py-8 text-center text-xs text-slate-400 font-bold animate-pulse">Loading queries...</div>
            ) : searchData.topSearches.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No search logs recorded yet.</div>
            ) : (
              <div className="space-y-2">
                {searchData.topSearches.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-[#1c2430] rounded-xl border border-slate-100 dark:border-[#2f3d4e] text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 w-4 font-mono">#{idx + 1}</span>
                      {s.query}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-[11px]">
                      {s.count} searches
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zero Result Searches (Missed Opportunities) */}
          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-[#231a0e] border border-amber-200/60 dark:border-amber-900/50 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Zero-Result Searches (Wanted by Customers)
            </h3>
            <p className="text-[11px] text-amber-700 dark:text-amber-300/80 font-medium">
              Customers searched for these words, but nothing showed up! Consider adding these product variants or keywords to tags.
            </p>
            {loadingSearch ? (
              <div className="py-8 text-center text-xs text-amber-500 font-bold animate-pulse">Checking zero-result terms...</div>
            ) : searchData.zeroResultSearches.length === 0 ? (
              <div className="py-8 text-center text-xs text-amber-600 dark:text-amber-400">Great job! All customer searches found matching products.</div>
            ) : (
              <div className="space-y-2">
                {searchData.zeroResultSearches.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-[#1c2430] rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs">
                    <span className="font-bold text-slate-800 dark:text-amber-200">"{s.query}"</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-black text-[11px]">
                      {s.count} missed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP INTEGRATION WALKTHROUGHS */}
      <div className="bg-white dark:bg-[#1D2530] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#303B48] shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Google Setup Knowledgebase & Walkthroughs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Step-by-step guidance to unlock full reporting power inside Google Analytics for OwnFresh
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "search_console", label: "1. Show Search Console in GA4 Menu" },
            { id: "scrolls", label: "2. How to View Scrolls & Clicks in GA4" },
            { id: "funnel", label: "3. Build E-Commerce Drop-Off Funnel" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveGuide(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeGuide === tab.id
                  ? "bg-slate-900 dark:bg-[#FFD600] text-white dark:text-black shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeGuide === "search_console" && (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed animate-fadeIn">
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 text-sky-950 dark:text-sky-200 space-y-2">
              <h4 className="font-black text-sm text-sky-900 dark:text-sky-200">Publish Search Console into GA4 Navigation</h4>
              <p>
                Even after linking Search Console in Google Analytics, Google hides it by default until you <strong>Publish</strong> the collection. Follow these 4 clicks:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 font-semibold text-sky-900 dark:text-sky-300 pt-1">
                <li>Open Google Analytics → click <strong>Reports</strong> (bar chart icon on left).</li>
                <li>At the very bottom of the left menu, click <strong>Library</strong> (folder icon).</li>
                <li>Under "Collections", look for the card titled <strong>Search Console</strong>.</li>
                <li>Click the <strong>3 vertical dots (⋮)</strong> on that card and select <strong>Publish</strong>.</li>
              </ol>
              <p className="pt-1 text-[11px] text-sky-800 dark:text-sky-300/80">
                🎉 Immediately, a new section named <strong>Search Console</strong> will appear on your left sidebar containing <em>"Queries"</em> and <em>"Google Organic Search Traffic"</em>!
              </p>
            </div>
          </div>
        )}

        {activeGuide === "scrolls" && (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed animate-fadeIn">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-950 dark:text-amber-200 space-y-2">
              <h4 className="font-black text-sm text-amber-900 dark:text-amber-200">How to inspect user scrolls and clicks in GA4</h4>
              <p>
                Your React application sends standard events for scrolls and clicks. Here is where to see them:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 font-semibold text-amber-900 dark:text-amber-300 pt-1">
                <li>Go to <strong>Reports → Engagement → Events</strong>.</li>
                <li>You will see a table listing all events:
                  <ul className="list-disc list-inside pl-4 pt-1 font-normal text-amber-950 dark:text-amber-200 space-y-1">
                    <li><code className="font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 px-1 rounded">scroll_depth</code>: Users scrolling 25%, 50%, 75%, and 90% of the page.</li>
                    <li><code className="font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 px-1 rounded">scroll</code>: Google's 90% bottom-of-page scroll trigger.</li>
                    <li><code className="font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 px-1 rounded">contact_click</code>: Customer WhatsApp, Phone Call, and Email interactions.</li>
                    <li><code className="font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 px-1 rounded">click</code>: Outbound link clicks.</li>
                  </ul>
                </li>
                <li>Click directly on <code className="font-mono font-bold">scroll_depth</code> to see which oil product pages get read the most!</li>
              </ol>
            </div>
          </div>
        )}

        {activeGuide === "funnel" && (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed animate-fadeIn">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-200 space-y-2">
              <h4 className="font-black text-sm text-emerald-900 dark:text-emerald-200">Building your 5-Step Checkout Funnel</h4>
              <p>
                To see the exact percentage of people who add oil to cart but drop off before paying:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 font-semibold text-emerald-900 dark:text-emerald-300 pt-1">
                <li>In GA4, click <strong>Explore</strong> (compass icon on left menu).</li>
                <li>Click <strong>Funnel exploration</strong> template.</li>
                <li>Under "Steps", edit the steps to match OwnFresh React events:
                  <ul className="list-disc list-inside pl-4 pt-1 font-normal text-emerald-950 dark:text-emerald-200 space-y-1">
                    <li>Step 1: Event = <code className="font-mono font-bold bg-emerald-200/60 dark:bg-emerald-900/60 px-1 rounded">view_item</code></li>
                    <li>Step 2: Event = <code className="font-mono font-bold bg-emerald-200/60 dark:bg-emerald-900/60 px-1 rounded">add_to_cart</code></li>
                    <li>Step 3: Event = <code className="font-mono font-bold bg-emerald-200/60 dark:bg-emerald-900/60 px-1 rounded">begin_checkout</code></li>
                    <li>Step 4: Event = <code className="font-mono font-bold bg-emerald-200/60 dark:bg-emerald-900/60 px-1 rounded">purchase</code></li>
                  </ul>
                </li>
                <li>You will get an automated visual conversion bar chart showing exact conversion drop-offs.</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleInsightsManager;
