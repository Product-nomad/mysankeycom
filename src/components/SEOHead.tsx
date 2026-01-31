import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  ogUrl?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string;
  author?: string;
  noIndex?: boolean;
}

const SEOHead = ({
  title,
  description,
  ogImage,
  ogUrl,
  type = 'article',
  publishedTime,
  modifiedTime,
  keywords,
  author = 'MySankey',
  noIndex = false,
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

    // Helper to set or update a link tag
    const setLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Standard meta tags
    setMeta('description', description, true);
    setMeta('author', author, true);
    
    // Keywords (if provided)
    if (keywords) {
      setMeta('keywords', keywords, true);
    }

    // Robots directive
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow', true);

    // Canonical URL
    if (ogUrl) {
      setLink('canonical', ogUrl);
    }

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
      setMeta('article:author', author);
    }

    // Site name
    setMeta('og:site_name', 'MySankey');
    setMeta('og:locale', 'en_US');

    // Cleanup function to restore default title
    return () => {
      document.title = 'MySankey - AI-Powered Sankey Diagrams';
    };
  }, [title, description, ogImage, ogUrl, type, publishedTime, modifiedTime, keywords, author, noIndex]);

  return null;
};

export default SEOHead;
