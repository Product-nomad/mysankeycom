import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SankeyData, SankeyNode, SankeyLink, DataSource } from '@/types/sankey';

export type { SankeyData, SankeyNode, SankeyLink, DataSource };

export interface HistoryEntry {
  data: SankeyData;
  label: string;
  query: string;
}

// Vibrant color palette for the nodes
const colorPalette = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#06b6d4', '#f97316', '#84cc16', '#a855f7', '#14b8a6',
  '#f43f5e', '#6366f1', '#22c55e', '#eab308', '#0ea5e9',
];

export const useSankeyData = () => {
  const [data, setData] = useState<SankeyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [originalQuery, setOriginalQuery] = useState<string>('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);

  const addColorsToNodes = useCallback((nodes: { name: string }[]): SankeyNode[] => {
    return nodes.map((node, index) => ({
      name: node.name,
      itemStyle: { color: colorPalette[index % colorPalette.length] },
    }));
  }, []);

  const generateSankeyData = async (query: string) => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentQuery(query);
    setOriginalQuery(query);
    setHistory([]);
    setBreadcrumbs(['Home']);

    try {
      const { data: responseData, error: fnError } = await supabase.functions.invoke(
        'generate-sankey-data',
        {
          body: { query },
        }
      );

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate diagram');
      }

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      const nodesWithColors = addColorsToNodes(responseData.nodes);
      const newData: SankeyData = {
        nodes: nodesWithColors,
        links: responseData.links,
        unit: responseData.unit,
        sources: responseData.sources,
      };

      setData(newData);
      toast.success(`Generated diagram for "${query}"`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate diagram';
      setError(message);
      toast.error(message);
      console.error('Sankey generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setDataFromUpload = useCallback((uploadedData: SankeyData) => {
    const nodesWithColors = addColorsToNodes(uploadedData.nodes);
    const newData: SankeyData = {
      ...uploadedData,
      nodes: nodesWithColors,
    };
    setData(newData);
    setCurrentQuery('Uploaded Data');
    setOriginalQuery('Uploaded Data');
    setHistory([]);
    setBreadcrumbs(['Home']);
    toast.success('Data imported successfully');
  }, [addColorsToNodes]);

  const drillDown = async (nodeName: string) => {
    // If no data loaded yet (demo mode), start a new search for the clicked node
    if (!originalQuery) {
      await generateSankeyData(nodeName);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Save current state to history
    const historyEntry: HistoryEntry = {
      data: data!,
      label: breadcrumbs[breadcrumbs.length - 1] || 'Home',
      query: currentQuery,
    };
    setHistory(prev => [...prev, historyEntry]);
    setBreadcrumbs(prev => [...prev, nodeName]);
    setCurrentQuery(nodeName);

    try {
      const { data: responseData, error: fnError } = await supabase.functions.invoke(
        'generate-sankey-data',
        {
          body: { 
            originalQuery: originalQuery,
            clickedNodeName: nodeName,
          },
        }
      );

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate drill-down');
      }

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      const nodesWithColors = addColorsToNodes(responseData.nodes);
      const newData: SankeyData = {
        nodes: nodesWithColors,
        links: responseData.links,
        unit: responseData.unit,
        sources: responseData.sources,
      };

      setData(newData);
      toast.success(`Drilling into "${nodeName}"`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to drill down';
      setError(message);
      toast.error(message);
      // Revert history on error
      setHistory(prev => prev.slice(0, -1));
      setBreadcrumbs(prev => prev.slice(0, -1));
      setCurrentQuery(historyEntry.query);
      console.error('Drill-down error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = useCallback(() => {
    if (history.length === 0) return;

    const previousEntry = history[history.length - 1];
    setData(previousEntry.data);
    setCurrentQuery(previousEntry.query);
    setHistory(prev => prev.slice(0, -1));
    setBreadcrumbs(prev => prev.slice(0, -1));
    toast.info('Returned to previous view');
  }, [history]);

  const goToBreadcrumb = useCallback((index: number) => {
    if (index >= breadcrumbs.length - 1) return; // Already at this level

    const stepsBack = breadcrumbs.length - 1 - index;
    const targetEntry = history[history.length - stepsBack];
    
    if (targetEntry) {
      setData(targetEntry.data);
      setCurrentQuery(targetEntry.query);
      setHistory(prev => prev.slice(0, history.length - stepsBack));
      setBreadcrumbs(prev => prev.slice(0, index + 1));
      toast.info(`Returned to ${breadcrumbs[index]}`);
    }
  }, [history, breadcrumbs]);

  const clearData = () => {
    setData(null);
    setError(null);
    setCurrentQuery('');
    setOriginalQuery('');
    setHistory([]);
    setBreadcrumbs([]);
  };

  const canGoBack = history.length > 0;

  return {
    data,
    isLoading,
    error,
    currentQuery,
    originalQuery,
    history,
    breadcrumbs,
    canGoBack,
    generateSankeyData,
    setDataFromUpload,
    drillDown,
    goBack,
    goToBreadcrumb,
    clearData,
  };
};
