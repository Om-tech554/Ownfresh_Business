import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, ShoppingBag, Sparkles, ShoppingCart, User } from "lucide-react";
import SLink from "./SLink";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, cartItems } = useSelector((state) => state.user);

  const cartCount = (cartItems || []).reduce((acc, item) => acc + (item.quantity || 0), 0);

  // Hidden on admin pages, blogs editor, and checkout
  const hideOnPaths = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/checkout",
    "/cart",
    "/order-success",
  ];

  if (
    hideOnPaths.includes(location.pathname) ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/blogs")
  ) {
    return null;
  }

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/",
      isActive: location.pathname === "/" && !location.hash,
    },
    {
      id: "shop",
      label: "Shop",
      icon: ShoppingBag,
      path: "/shop",
      isActive: location.pathname === "/shop",
    },
    {
      id: "purpose",
      label: "Purpose",
      icon: Sparkles,
      path: "/#purpose-section",
      onClick: (e) => {
        if (location.pathname === "/") {
          const el = document.getElementById("purpose-section");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }
      },
      isActive: location.pathname === "/" && location.hash === "#purpose-section",
    },
    {
      id: "cart",
      label: "Cart",
      icon: ShoppingCart,
      path: "/cart",
      badge: cartCount > 0 ? cartCount : null,
      isActive: location.pathname === "/cart",
    },
    {
      id: "account",
      label: userData ? "Account" : "Login",
      icon: User,
      path: userData ? (userData.role === "admin" ? "/admin" : "/my-orders") : "/signin",
      isActive: location.pathname === "/my-orders" || location.pathname === "/signin" || location.pathname === "/membership",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A0D12]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-[#202731] lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom,8px)]">
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isCurrent = item.isActive;

          return (
            <SLink
              key={item.id}
              to={item.path}
              onClick={item.onClick}
              scroll={item.id !== "purpose"}
              className={`flex flex-col items-center justify-center h-full w-full relative py-1 active:scale-95 transition-all ${isCurrent ? "text-[#1E971D] dark:text-[#FFD600]" : "text-slate-500 dark:text-[#818C9B] hover:text-slate-900 dark:hover:text-[#F5F7FA]"
                }`}
            >
              <div className="relative">
                <Icon
                  size={19}
                  className={`transition-colors ${isCurrent ? "text-[#1E971D] dark:text-[#FFD600] stroke-[2.5]" : "text-slate-600 dark:text-[#818C9B]"
                    }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#1E971D] dark:bg-[#FFD600] text-white dark:text-[#111318] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0A0D12] shadow-xs">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-wider mt-1 ${isCurrent ? "text-[#1E971D] dark:text-[#FFD600]" : "text-slate-500 dark:text-[#818C9B]"
                  }`}
              >
                {item.label}
              </span>
              {isCurrent && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-[#1E971D] dark:bg-[#FFD600] rounded-full" />
              )}
            </SLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
