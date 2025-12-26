/**
 * SEO Utilities for Reflective Pomodoro
 * Provides helper functions for SEO optimization including structured data and schema markup
 */

/**
 * Generates JSON-LD structured data for the Pomodoro application
 */
export const generateAppSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Reflective Pomodoro",
    "description": "AI-powered Pomodoro timer with session reflections and community features",
    "url": "https://www.reflectivepomodoro.com",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    }
  };
};

/**
 * Generates JSON-LD structured data for Organization
 */
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Reflective Pomodoro",
    "url": "https://www.reflectivepomodoro.com",
    "logo": "https://www.reflectivepomodoro.com/pomodoro.png",
    "description": "Productivity timer with AI reflections",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@reflectivepomodoro.com"
    }
  };
};

/**
 * Generates JSON-LD structured data for a WebSite
 */
export const generateWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Reflective Pomodoro",
    "url": "https://www.reflectivepomodoro.com",
    "description": "AI-powered Pomodoro timer with session reflections",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.reflectivepomodoro.com/#search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
};

/**
 * Injects JSON-LD structured data into the document head
 */
export const injectSchemaMarkup = (schema: Record<string, unknown>) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  script.async = true;
  
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  const schemaType = (schema as Record<string, unknown>)["@type"];
  
  let exists = false;
  existingScripts.forEach(existingScript => {
    try {
      const existingData = JSON.parse(existingScript.textContent || '{}');
      if (existingData["@type"] === schemaType) {
        existingScript.replaceWith(script);
        exists = true;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  });
  
  if (!exists) {
    document.head.appendChild(script);
  }
};

/**
 * Updates meta tags dynamically
 */
export const updateMetaTags = (tags: Record<string, string>) => {
  Object.entries(tags).forEach(([key, value]) => {
    let metaTag = document.querySelector(`meta[name="${key}"]`) as HTMLMetaElement;
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = key;
      document.head.appendChild(metaTag);
    }
    
    metaTag.content = value;
  });
};

/**
 * Updates page title and meta description
 */
export const updatePageSEO = (config: {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
}) => {
  document.title = config.title;
  
  updateMetaTags({
    description: config.description,
    ...(config.keywords && { keywords: config.keywords })
  });
};
