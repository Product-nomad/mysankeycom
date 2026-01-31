import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, Loader2, Search, TrendingUp, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import FlowCard from '@/components/FlowCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            Explore Featured Flows
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Discover Data Visualizations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Browse interactive Sankey diagrams created by our community. 
            Explore revenue flows, energy distributions, and more.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search flows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base rounded-full border-border/50 bg-card"
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
              <GitBranch className="w-4 h-4" />
              <span>AI-Powered Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
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
              {filteredFlows.map((flow) => (
                <FlowCard key={flow.id} flow={flow} />
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
          <Button size="lg" asChild>
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
