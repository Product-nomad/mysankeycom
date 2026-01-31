import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, Loader2, Search, TrendingUp, Clock, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import FlowCard from '@/components/FlowCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import type { SankeyData, ChartSettings } from '@/types/sankey';

export interface PublicFlow {
  id: string;
  title: string;
  description: string | null;
  data: SankeyData;
  settings: ChartSettings;
  share_slug: string;
  created_at: string;
  updated_at: string;
}

// Skeleton card for loading state
const FlowCardSkeleton = () => (
  <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
    <Skeleton className="aspect-video w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

const Explore = () => {
  const [flows, setFlows] = useState<PublicFlow[]>([]);
  const [filteredFlows, setFilteredFlows] = useState<PublicFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPublicFlows = async () => {
      try {
        const { data, error } = await supabase
          .from('user_flows_public')
          .select('id, title, description, data, settings, share_slug, created_at, updated_at')
          .eq('is_public', true)
          .order('updated_at', { ascending: false });

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

        setFlows(typedFlows);
        setFilteredFlows(typedFlows);
      } catch (err) {
        console.error('Failed to fetch public flows:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicFlows();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFlows(flows);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = flows.filter(
      (flow) =>
        flow.title.toLowerCase().includes(query) ||
        flow.description?.toLowerCase().includes(query)
    );
    setFilteredFlows(filtered);
  }, [searchQuery, flows]);

  // Generate JSON-LD for collection page
  const collectionJsonLd = useMemo(() => {
    if (flows.length === 0) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Explore Sankey Diagrams | MySankey',
      description: 'Browse interactive Sankey diagrams for energy flows, trade balances, carbon emissions, and more.',
      url: 'https://mysankeycom.lovable.app/explore',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: flows.length,
        itemListElement: flows.slice(0, 20).map((flow, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Dataset',
            name: flow.title,
            description: flow.description || `Interactive Sankey diagram: ${flow.title}`,
            url: `https://mysankeycom.lovable.app/flow/${flow.share_slug}`,
          }
        }))
      }
    };
  }, [flows]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Explore Interactive Sankey Diagrams | MySankey"
        description="Browse AI-powered Sankey diagrams visualizing energy flows, trade balances, carbon emissions, and supply chains. Discover data insights through interactive flow visualizations."
        ogUrl="https://mysankeycom.lovable.app/explore"
        type="website"
      />
      
      {/* JSON-LD for collection */}
      {collectionJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      )}

      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>{flows.length > 0 ? `${flows.length} Flows Available` : 'Explore Featured Flows'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-slide-up">
            Discover Data Visualizations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Browse interactive Sankey diagrams created by our community. 
            Explore revenue flows, energy distributions, and more.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search flows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base rounded-full border-border/50 bg-card shadow-soft transition-shadow focus:shadow-glow"
              aria-label="Search flows"
            />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-6 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span><strong className="text-foreground">{flows.length}</strong> Public Flows</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Updated Daily</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>AI-Powered Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <FlowCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredFlows.length === 0 ? (
            <div className="text-center py-20">
              <GitBranch className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery ? 'No flows match your search' : 'No public flows yet'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Be the first to create and share a flow!'}
              </p>
              <Button asChild>
                <Link to="/">Create a Flow</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFlows.map((flow, index) => (
                <div 
                  key={flow.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                >
                  <FlowCard flow={flow} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to Create Your Own?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Turn any topic into a beautiful, interactive Sankey diagram in seconds using AI.
          </p>
          <Button size="lg" asChild className="shadow-glow">
            <Link to="/">
              <GitBranch className="w-5 h-5 mr-2" />
              Start Creating
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Explore;
