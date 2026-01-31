import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GitBranch } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import FlowCard from './FlowCard';
import type { PublicFlow } from '@/pages/Explore';
import type { SankeyData, ChartSettings } from '@/types/sankey';

interface RelatedFlowsProps {
  currentSlug: string;
  currentTitle: string;
}

const RelatedFlows = ({ currentSlug, currentTitle }: RelatedFlowsProps) => {
  const [relatedFlows, setRelatedFlows] = useState<PublicFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedFlows = async () => {
      try {
        // Fetch other public flows, excluding the current one
        const { data, error } = await supabase
          .from('user_flows_public')
          .select('id, title, description, data, settings, share_slug, created_at, updated_at')
          .eq('is_public', true)
          .neq('share_slug', currentSlug)
          .order('updated_at', { ascending: false })
          .limit(4);

        if (error) throw error;

        const typedFlows: PublicFlow[] = (data || []).map((flow) => ({
          id: flow.id!,
          title: flow.title!,
          description: flow.description,
          data: flow.data as unknown as SankeyData,
          settings: flow.settings as unknown as ChartSettings,
          share_slug: flow.share_slug!,
          created_at: flow.created_at!,
          updated_at: flow.updated_at!,
        }));

        setRelatedFlows(typedFlows);
      } catch (err) {
        console.error('Failed to fetch related flows:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedFlows();
  }, [currentSlug]);

  if (isLoading || relatedFlows.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-12 border-t border-border/50">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Related Flows</h2>
            <p className="text-sm text-muted-foreground">Explore more visualizations</p>
          </div>
        </div>
        <Link
          to="/explore"
          className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedFlows.map((flow) => (
          <FlowCard key={flow.id} flow={flow} />
        ))}
      </div>
    </section>
  );
};

export default RelatedFlows;
