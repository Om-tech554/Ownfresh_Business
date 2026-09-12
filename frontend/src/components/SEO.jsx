import React from 'react';
import { Helmet } from 'react-helmet-async';

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
  const siteName = "MyOwnFresh";
  const defaultTitle = "MyOwnFresh | Pure Cold & Stone Pressed Edible Oils";
  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const defaultDescription = "MyOwnFresh offers 100% natural, chemical-free stone pressed edible cooking oils (Groundnut, Sesame, Mustard, Coconut, Almond). Free delivery on orders ₹1,000+.";
  const metaDescription = description || defaultDescription;
  
  const metaImage = image || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png";
  const cleanPath = url ? (url.startsWith('/') ? url : `/${url}`) : "";
  const finalUrl = canonicalUrl || `https://myownfresh.com${cleanPath}`;

  // Base Organization Schema for Google Knowledge Graph
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MyOwnFresh",
    "url": "https://myownfresh.com",
    "logo": metaImage,
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "contact@myownfresh.com",
      "contactType": "Customer Service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi", "Marathi"]
    },
    "sameAs": [
      "https://www.instagram.com/myownfresh",
      "https://www.facebook.com/myownfresh"
    ]
  };

  return (
    <Helmet>
      {/* Standard SEO Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
      
      {/* Canonical URL for Search Engines */}
      <link rel="canonical" href={finalUrl} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Global Organization Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      {/* Page Specific Structured Data (JSON-LD) */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
