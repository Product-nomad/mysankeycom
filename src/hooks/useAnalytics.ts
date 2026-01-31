import { useEffect, useCallback } from 'react';
import { getConsentPreferences, hasConsented } from '@/components/CookieConsent';

// Replace with your GA4 Measurement ID
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

let isGtagLoaded = false;

const loadGtag = () => {
  if (isGtagLoaded || typeof window === 'undefined') return;
  
  // Check consent before loading
  const preferences = getConsentPreferences();
  if (!preferences?.analytics) return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  // Set initial config with consent mode
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });

  // Load the GA4 script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  isGtagLoaded = true;
  console.log('[Analytics] GA4 loaded with consent');
};

const removeGtag = () => {
  if (!isGtagLoaded) return;

  // Remove gtag script
  const scripts = document.querySelectorAll(`script[src*="googletagmanager.com/gtag"]`);
  scripts.forEach((script) => script.remove());

  // Clear dataLayer and gtag
  window.dataLayer = [];
  delete (window as Partial<Window>).gtag;

  // Remove GA cookies
  const cookies = document.cookie.split(';');
  cookies.forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('_ga') || name.startsWith('_gid')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });

  isGtagLoaded = false;
  console.log('[Analytics] GA4 removed');
};

export const useAnalytics = () => {
  useEffect(() => {
    // Initial load if already consented
    if (hasConsented()) {
      const preferences = getConsentPreferences();
      if (preferences?.analytics) {
        loadGtag();
      }
    }

    // Listen for consent updates
    const handleConsentUpdate = (event: CustomEvent<{ analytics: boolean }>) => {
      if (event.detail.analytics) {
        loadGtag();
      } else {
        removeGtag();
      }
    };

    window.addEventListener('consentUpdated', handleConsentUpdate as EventListener);

    return () => {
      window.removeEventListener('consentUpdated', handleConsentUpdate as EventListener);
    };
  }, []);

  const trackEvent = useCallback((eventName: string, params?: Record<string, unknown>) => {
    if (!isGtagLoaded || !window.gtag) return;
    
    window.gtag('event', eventName, params);
  }, []);

  const trackPageView = useCallback((pagePath: string, pageTitle?: string) => {
    if (!isGtagLoaded || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }, []);

  return {
    trackEvent,
    trackPageView,
    isEnabled: isGtagLoaded,
  };
};

export default useAnalytics;
