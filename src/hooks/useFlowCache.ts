import { useState, useCallback, useEffect } from 'react';
import type { SankeyData } from '@/types/sankey';

export interface CachedFlow {
  id: string;
  query: string;
  data: SankeyData;
  timestamp: number;
}

const CACHE_KEY = 'mysankey_flow_cache';
const MAX_CACHED_FLOWS = 5;

export const useFlowCache = () => {
  const [cachedFlows, setCachedFlows] = useState<CachedFlow[]>([]);

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CachedFlow[];
        setCachedFlows(parsed);
      }
    } catch (err) {
      console.error('Failed to load flow cache:', err);
    }
  }, []);

  // Save a flow to cache
  const cacheFlow = useCallback((query: string, data: SankeyData) => {
    setCachedFlows((prev) => {
      // Check if this query already exists
      const existingIndex = prev.findIndex(
        (f) => f.query.toLowerCase() === query.toLowerCase()
      );

      const newFlow: CachedFlow = {
        id: crypto.randomUUID(),
        query,
        data,
        timestamp: Date.now(),
      };

      let updated: CachedFlow[];

      if (existingIndex >= 0) {
        // Update existing entry and move to front
        updated = [
          newFlow,
          ...prev.slice(0, existingIndex),
          ...prev.slice(existingIndex + 1),
        ];
      } else {
        // Add new entry at front
        updated = [newFlow, ...prev];
      }

      // Keep only the last N flows
      updated = updated.slice(0, MAX_CACHED_FLOWS);

      // Persist to localStorage
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist flow cache:', err);
      }

      return updated;
    });
  }, []);

  // Get a cached flow by query
  const getCachedFlow = useCallback(
    (query: string): SankeyData | null => {
      const cached = cachedFlows.find(
        (f) => f.query.toLowerCase() === query.toLowerCase()
      );
      return cached?.data || null;
    },
    [cachedFlows]
  );

  // Remove a flow from cache
  const removeFromCache = useCallback((id: string) => {
    setCachedFlows((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist flow cache:', err);
      }
      return updated;
    });
  }, []);

  // Clear entire cache
  const clearCache = useCallback(() => {
    setCachedFlows([]);
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (err) {
      console.error('Failed to clear flow cache:', err);
    }
  }, []);

  return {
    cachedFlows,
    cacheFlow,
    getCachedFlow,
    removeFromCache,
    clearCache,
  };
};
