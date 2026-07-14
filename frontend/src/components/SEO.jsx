import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = "website",
  schemaMarkup = null
}) => {
  const siteName = "Own Fresh";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = "Own Fresh offers premium stone-pressed oils, organic products, and fresh, healthy goods delivered to your doorstep.";
  const metaDescription = description || defaultDescription;
  
  // Default image (Use the one from your public folder or Cloudinary)
  const metaImage = image || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png";
  const metaUrl = url ? `https://frontend-ownfresh.onrender.com${url}` : "https://frontend-ownfresh.onrender.com";

  return (
    <Helmet>
      {/* Standard SEO Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph / Facebook / Instagram */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Structured Data (JSON-LD) for Google Search Results */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
