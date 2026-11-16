import React, { useState, useEffect } from "react";
import { ShieldCheck, Cookie, Settings, Check, X, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { serverUrl } from "../App";

const COOKIE_STORAGE_KEY = "ownfresh_cookie_consent";

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [functionalCookies, setFunctionalCookies] = useState(true);
  const [analyticsCookies, setAnalyticsCookies] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Check if consent has already been recorded
    try {
      const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!stored) {
        // Show after small delay for smooth entrance
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(stored);
        if (parsed) {
          setFunctionalCookies(Boolean(parsed.functional));
          setAnalyticsCookies(Boolean(parsed.analytics));
        }
      }
    } catch (e) {
      setVisible(true);
    }

    // Listen for custom event from footer or settings to re-open modal
    const handleReopen = () => {
      try {
        const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setFunctionalCookies(Boolean(parsed.functional));
          setAnalyticsCookies(Boolean(parsed.analytics));
        }
      } catch (e) {}
      setShowCustomize(true);
      setVisible(true);
    };

    window.addEventListener("open-cookie-settings", handleReopen);
    return () => window.removeEventListener("open-cookie-settings", handleReopen);
  }, []);

  const saveConsent = (consentData) => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consentData));
    } catch (e) {}

    // Record consent with backend audit log (DPDPA 2023 / GDPR compliance)
    const token = localStorage.getItem("oil_token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${serverUrl}/api/user/cookie-consent`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(consentData),
    }).catch(() => {});

    setSavedSuccess(true);
    setTimeout(() => {
      setVisible(false);
      setShowCustomize(false);
      setSavedSuccess(false);
    }, 600);
  };

  const handleAcceptAll = () => {
    saveConsent({
      accepted: true,
      essential: true,
      functional: true,
      analytics: true,
      consentDate: new Date().toISOString(),
    });
  };

  const handleEssentialOnly = () => {
    saveConsent({
      accepted: true,
      essential: true,
      functional: false,
      analytics: false,
      consentDate: new Date().toISOString(),
    });
  };

  const handleSaveCustomPreferences = () => {
    saveConsent({
      accepted: true,
      essential: true,
      functional: functionalCookies,
      analytics: analyticsCookies,
      consentDate: new Date().toISOString(),
    });
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      role="region"
      className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-5 text-stone-800 dark:text-stone-100 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-2">
                Cookie & Privacy Choices
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  DPDPA 2023
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                OwnFresh Agro Industries respects your privacy & data rights.
              </p>
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
          We use authenticated cookies & secure browser storage to protect your account session, enable PhonePe payment transactions, transfer your active cart & delivery addresses across your devices, and ensure cold-pressed fresh oil orders are fulfilled seamlessly. Read our{" "}
          <Link
            to="/privacy-policy"
            className="text-emerald-600 dark:text-emerald-400 underline font-medium hover:text-emerald-700"
          >
            Privacy Policy
          </Link>
          .
        </p>

        {/* Detailed Preferences Accordion */}
        {showCustomize && (
          <div className="space-y-3 mb-4 pt-3 border-t border-stone-200 dark:border-stone-800">
            {/* Essential Cookies */}
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Strictly Essential (Always Active)</span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  Required for secure account login, JWT authentication, CSRF safety, and PhonePe payment checkout.
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 shrink-0">
                Mandatory
              </span>
            </div>

            {/* Functional & Cross-Device Sync Cookies */}
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                  Functional & Cross-Device Cart Transfer
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  Enables transferring your cart, selected bottles, saved delivery address, and contact number seamlessly between your phone and laptop.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={functionalCookies}
                  onChange={(e) => setFunctionalCookies(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-stone-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Analytics Cookies */}
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                  Anonymous Performance & Analytics
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  Helps us analyze page load speeds and traffic patterns to optimize oil dispatch operations. No personal profile data is shared.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={analyticsCookies}
                  onChange={(e) => setAnalyticsCookies(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-stone-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
          {savedSuccess ? (
            <div className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <Check className="w-4 h-4" />
              Preferences Saved Successfully!
            </div>
          ) : (
            <>
              {showCustomize ? (
                <>
                  <button
                    onClick={handleSaveCustomPreferences}
                    className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-98"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="py-2 px-3 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  >
                    Back
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-none py-2 px-4 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-98"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleEssentialOnly}
                    className="flex-1 sm:flex-none py-2 px-3 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition active:scale-98"
                  >
                    Essential Only
                  </button>
                  <button
                    onClick={() => setShowCustomize(true)}
                    className="py-2 px-2.5 text-xs font-medium rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition flex items-center gap-1 ml-auto"
                    title="Customize cookie choices"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Customize</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default CookieConsentBanner;
