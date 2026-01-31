import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UrlState {
  query?: string;
  node?: string;
  depth?: number;
}

export const useUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);

  // Get current state from URL
  const getUrlState = useCallback((): UrlState => {
    return {
      query: searchParams.get('q') || undefined,
      node: searchParams.get('node') || undefined,
      depth: searchParams.get('depth') ? parseInt(searchParams.get('depth')!, 10) : undefined,
    };
  }, [searchParams]);

  // Update URL state without navigation
  const setUrlState = useCallback(
    (state: UrlState, replace = false) => {
      const newParams = new URLSearchParams();

      if (state.query) {
        newParams.set('q', state.query);
      }
      if (state.node) {
        newParams.set('node', state.node);
      }
      if (state.depth !== undefined && state.depth > 0) {
        newParams.set('depth', state.depth.toString());
      }

      setSearchParams(newParams, { replace });
    },
    [setSearchParams]
  );

  // Clear URL state
  const clearUrlState = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Check if this is initial mount with URL params
  const hasInitialState = useCallback(() => {
    return isInitialMount.current && (searchParams.has('q') || searchParams.has('node'));
  }, [searchParams]);

  // Mark as no longer initial mount
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  return {
    getUrlState,
    setUrlState,
    clearUrlState,
    hasInitialState,
    searchParams,
  };
};
