import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

/**
 * Analytics provider that automatically tracks page views
 * and initializes analytics based on cookie consent.
 */
const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { trackPageView } = useAnalytics();

  // Track page views on route changes
  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location, trackPageView]);

  return <>{children}</>;
};

export default AnalyticsProvider;
