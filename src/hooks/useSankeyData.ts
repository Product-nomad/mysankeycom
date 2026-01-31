import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SankeyNode {
  name: string;
  itemStyle?: { color: string };
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
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

  const generateSankeyData = async (query: string) => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentQuery(query);

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

      // Add colors to nodes
      const nodesWithColors: SankeyNode[] = responseData.nodes.map(
        (node: { name: string }, index: number) => ({
          name: node.name,
          itemStyle: { color: colorPalette[index % colorPalette.length] },
        })
      );

      setData({
        nodes: nodesWithColors,
        links: responseData.links,
      });

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

  const clearData = () => {
    setData(null);
    setError(null);
    setCurrentQuery('');
  };

  return {
    data,
    isLoading,
    error,
    currentQuery,
    generateSankeyData,
    clearData,
  };
};
