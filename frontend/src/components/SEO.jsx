import React from 'react';
import { Helmet } from 'react-helmet-async';

const BASE_URL = "https://myownfresh.com";

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = "website",
  noindex = false,
  canonicalUrl = null,
  schemaMarkup = null
}) => {
  const brandName = "OwnFresh";
  const defaultTitle = "OwnFresh | Premium Quality Stone Pressed Cooking Oils";
  
  // Cleanly format title without redundant duplicate brand names
  let fullTitle = defaultTitle;
  if (title) {
    if (title.toLowerCase().includes("ownfresh") || title.toLowerCase().includes("myownfresh")) {
      fullTitle = title;
    } else {
      fullTitle = `${title} | ${brandName}`;
    }
  }

  const defaultDescription = "Buy authentic stone pressed cooking oils online in India. Unrefined Groundnut, Sesame, Mustard, Coconut, Safflower & Sunflower oils churned below 45°C without chemicals. Free delivery ₹999+.";
  const metaDescription = description || defaultDescription;
  
  const metaImage = image || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png";
  
  // Normalize canonical URL (strict non-trailing-slash policy except for root)
  let cleanPath = url ? (url.startsWith('/') ? url : `/${url}`) : "";
  cleanPath = cleanPath.split("?")[0].split("#")[0];
  if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
    cleanPath = cleanPath.slice(0, -1);
  }
  const finalUrl = canonicalUrl || (cleanPath ? `${BASE_URL}${cleanPath}` : `${BASE_URL}/`);

  return (
    <Helmet>
      {/* Standard SEO Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta 
        name="robots" 
        content={noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} 
      />
      
      {/* Canonical URL for Search Engines */}
      <link rel="canonical" href={finalUrl} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={brandName} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:url" content={finalUrl} />

      {/* Page-Specific Structured Data Only (No Duplicate Organization Schema) */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
