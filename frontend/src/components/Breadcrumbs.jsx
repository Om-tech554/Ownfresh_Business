import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/**
 * Reusable SEO & User-friendly Breadcrumb Component
 * Renders both visible navigation and structured BreadcrumbList JSON-LD
 */
const Breadcrumbs = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  const baseUrl = "https://myownfresh.com";

  // Build matching BreadcrumbList Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.label,
      "item": item.path ? (item.path.startsWith("http") ? item.path : `${baseUrl}${item.path.startsWith("/") ? item.path : `/${item.path}`}`) : undefined
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-[#8C97A6] mb-4 sm:mb-6 uppercase tracking-wider"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1 hover:text-[#1E971D] dark:hover:text-[#FFD600] transition-colors"
          title="OwnFresh Home"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        {items.map((item, idx) => {
          if (idx === 0 && item.path === "/") return null; // Avoid duplicate home
          const isLast = idx === items.length - 1;

          return (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
              {isLast || !item.path ? (
                <span className="text-slate-900 dark:text-[#F7F9FC] font-bold truncate max-w-[200px] sm:max-w-xs">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-[#1E971D] dark:hover:text-[#FFD600] transition-colors truncate max-w-[150px] sm:max-w-[200px]"
                >
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
};

export default Breadcrumbs;
