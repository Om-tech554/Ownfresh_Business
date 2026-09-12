/**
 * MyOwnFresh - Google Analytics 4 (GA4) & E-commerce Analytics Module
 * Complies with official Google Analytics 4 Ecommerce Schema.
 * Strict Privacy: Never transmits passwords, payment card details, auth tokens, or PII.
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-E6M9R9P9E7";

let isInitialized = false;

/**
 * Initialize GA4 script dynamically if not already loaded
 */
export const initGA = () => {
  if (typeof window === "undefined" || isInitialized) return;

  if (!window.dataLayer) {
    window.dataLayer = window.dataLayer || [];
  }

  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

  // Load GA4 gtag.js script if measurement ID exists and not already injected
  if (GA_MEASUREMENT_ID && !document.getElementById("ga4-script")) {
    const script = document.createElement("script");
    script.id = "ga4-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false, // We manually track page views for SPA route changes
      anonymize_ip: true,
      cookie_flags: "SameSite=None;Secure",
    });
  }

  isInitialized = true;
};

/**
 * Safe gtag wrapper to prevent crashes when analytics is blocked by adblockers
 */
const sendEvent = (eventName, params = {}) => {
  try {
    initGA();
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
  } catch (err) {
    console.debug("[Analytics] Event dispatch skipped:", eventName, err?.message);
  }
};

/**
 * Track SPA Page View
 */
export const trackPageView = (path, title = document.title) => {
  sendEvent("page_view", {
    page_location: window.location.href,
    page_path: path || window.location.pathname,
    page_title: title,
  });
};

/**
 * Format product object to standard GA4 item format
 */
const formatGA4Item = (product, variant = null, quantity = 1) => {
  if (!product) return null;

  const price = Number(variant?.price || product?.price || product?.discountPrice || 0);
  const variantName = variant?.name || variant?.title || variant?.volume || product?.variantName || "Standard";

  return {
    item_id: String(product._id || product.id || ""),
    item_name: String(product.name || product.title || "Stone Pressed Oil"),
    item_category: String(product.category?.name || product.category || "Edible Oils"),
    item_variant: String(variantName),
    price: isNaN(price) ? 0 : price,
    quantity: Number(quantity) || 1,
    currency: "INR",
  };
};

/**
 * 1. View Item List (Category or Shop catalog view)
 */
export const trackViewItemList = (items = [], listName = "Catalog") => {
  const formattedItems = (items || [])
    .slice(0, 30) // Cap to first 30 items for payload efficiency
    .map((item, idx) => {
      const formatted = formatGA4Item(item);
      if (formatted) formatted.index = idx + 1;
      return formatted;
    })
    .filter(Boolean);

  if (formattedItems.length === 0) return;

  sendEvent("view_item_list", {
    item_list_id: listName.toLowerCase().replace(/\s+/g, "_"),
    item_list_name: listName,
    items: formattedItems,
  });
};

/**
 * 2. View Item (Product Details view)
 */
export const trackViewItem = (product, variant = null) => {
  const item = formatGA4Item(product, variant);
  if (!item) return;

  sendEvent("view_item", {
    currency: "INR",
    value: item.price,
    items: [item],
  });
};

/**
 * 3. Search (Internal site search tracking)
 */
export const trackSearch = (searchTerm, resultsCount = 0) => {
  if (!searchTerm || typeof searchTerm !== "string") return;
  const cleanTerm = searchTerm.trim().slice(0, 100);
  if (!cleanTerm) return;

  sendEvent("search", {
    search_term: cleanTerm,
    results_count: resultsCount,
  });

  // Also log to backend search analytics (non-blocking)
  try {
    const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");
    fetch(`${API_BASE_URL}/api/analytics/log-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: cleanTerm, resultsCount }),
    }).catch(() => {});
  } catch (e) {}
};

/**
 * 4. Add to Cart
 */
export const trackAddToCart = (product, variant = null, quantity = 1) => {
  const item = formatGA4Item(product, variant, quantity);
  if (!item) return;

  sendEvent("add_to_cart", {
    currency: "INR",
    value: item.price * (item.quantity || 1),
    items: [item],
  });

  // Track cart activity for cart abandonment analysis
  try {
    const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");
    fetch(`${API_BASE_URL}/api/analytics/log-cart-activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add",
        productId: item.item_id,
        variantName: item.item_variant,
        price: item.price,
        quantity: item.quantity,
      }),
    }).catch(() => {});
  } catch (e) {}
};

/**
 * 5. Remove from Cart
 */
export const trackRemoveFromCart = (product, variant = null, quantity = 1) => {
  const item = formatGA4Item(product, variant, quantity);
  if (!item) return;

  sendEvent("remove_from_cart", {
    currency: "INR",
    value: item.price * (item.quantity || 1),
    items: [item],
  });
};

/**
 * 6. View Cart
 */
export const trackViewCart = (cartItems = [], totalValue = 0) => {
  const items = (cartItems || [])
    .map((item) => formatGA4Item(item, { name: item.variantName, price: item.price }, item.quantity))
    .filter(Boolean);

  sendEvent("view_cart", {
    currency: "INR",
    value: Number(totalValue) || 0,
    items,
  });
};

/**
 * 7. Begin Checkout
 */
export const trackBeginCheckout = (cartItems = [], totalValue = 0, coupon = "") => {
  const items = (cartItems || [])
    .map((item) => formatGA4Item(item, { name: item.variantName, price: item.price }, item.quantity))
    .filter(Boolean);

  sendEvent("begin_checkout", {
    currency: "INR",
    value: Number(totalValue) || 0,
    coupon: coupon || undefined,
    items,
  });

  // Inform backend funnel
  try {
    const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");
    fetch(`${API_BASE_URL}/api/analytics/log-cart-activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "begin_checkout",
        cartValue: Number(totalValue) || 0,
        itemCount: items.length,
      }),
    }).catch(() => {});
  } catch (e) {}
};

/**
 * 8. Add Shipping Information
 */
export const trackAddShippingInfo = (cartItems = [], totalValue = 0, shippingTier = "Standard") => {
  const items = (cartItems || [])
    .map((item) => formatGA4Item(item, { name: item.variantName, price: item.price }, item.quantity))
    .filter(Boolean);

  sendEvent("add_shipping_info", {
    currency: "INR",
    value: Number(totalValue) || 0,
    shipping_tier: shippingTier,
    items,
  });
};

/**
 * 9. Add Payment Information
 */
export const trackAddPaymentInfo = (cartItems = [], totalValue = 0, paymentType = "online") => {
  const items = (cartItems || [])
    .map((item) => formatGA4Item(item, { name: item.variantName, price: item.price }, item.quantity))
    .filter(Boolean);

  sendEvent("add_payment_info", {
    currency: "INR",
    value: Number(totalValue) || 0,
    payment_type: paymentType,
    items,
  });
};

/**
 * 10. Purchase (Completed Transaction)
 */
export const trackPurchase = (order = {}) => {
  if (!order || (!order._id && !order.customOrderId && !order.id)) return;

  const transactionId = String(order.customOrderId || order._id || order.id);
  const totalValue = Number(order.totalAmount || order.price || 0);
  const tax = Number(order.taxAmount || (order.cgst || 0) + (order.sgst || 0) || 0);
  const shipping = Number(order.deliveryCharge || 0);
  const discount = Number(order.discountAmount || 0);
  const coupon = order.couponCode || undefined;

  const items = (order.items || order.products || [])
    .map((item) => ({
      item_id: String(item.productId || item._id || item.id || ""),
      item_name: String(item.name || item.title || "Stone Pressed Oil"),
      item_variant: String(item.variantName || "Standard"),
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      currency: "INR",
    }))
    .filter(Boolean);

  sendEvent("purchase", {
    transaction_id: transactionId,
    value: totalValue,
    tax: tax > 0 ? tax : undefined,
    shipping: shipping,
    currency: "INR",
    discount: discount > 0 ? discount : undefined,
    coupon: coupon,
    items,
  });

  // Mark cart purchased on backend
  try {
    const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");
    fetch(`${API_BASE_URL}/api/analytics/log-cart-activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "purchase",
        orderId: transactionId,
        totalAmount: totalValue,
      }),
    }).catch(() => {});
  } catch (e) {}
};

export default {
  initGA,
  trackPageView,
  trackViewItemList,
  trackViewItem,
  trackSearch,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewCart,
  trackBeginCheckout,
  trackAddShippingInfo,
  trackAddPaymentInfo,
  trackPurchase,
};
