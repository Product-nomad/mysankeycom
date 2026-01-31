import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  ogUrl?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

const SEOHead = ({
  title,
  description,
  ogImage,
  ogUrl,
  type = 'article',
  publishedTime,
  modifiedTime,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to set or update a meta tag
    const setMeta = (property: string, content: string, isName = false) => {
      const attr = isName ? 'name' : 'property';
      let meta = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Standard meta tags
    setMeta('description', description, true);

    // Open Graph tags
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:type', type);
    
    if (ogUrl) {
      setMeta('og:url', ogUrl);
    }
    
    if (ogImage) {
      setMeta('og:image', ogImage);
      setMeta('og:image:width', '1200');
      setMeta('og:image:height', '630');
      setMeta('og:image:alt', title);
    }

    // Twitter Card tags
    setMeta('twitter:card', 'summary_large_image', true);
    setMeta('twitter:title', title, true);
    setMeta('twitter:description', description, true);
    
    if (ogImage) {
      setMeta('twitter:image', ogImage, true);
    }

    // Article-specific tags
    if (type === 'article') {
      if (publishedTime) {
        setMeta('article:published_time', publishedTime);
      }
      if (modifiedTime) {
        setMeta('article:modified_time', modifiedTime);
      }
    }

    // Site name
    setMeta('og:site_name', 'MySankey');

    // Cleanup function to restore default title
    return () => {
      document.title = 'MySankey - AI-Powered Sankey Diagrams';
    };
  }, [title, description, ogImage, ogUrl, type, publishedTime, modifiedTime]);

  return null;
};

export default SEOHead;
