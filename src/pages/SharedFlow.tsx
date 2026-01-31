import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GitBranch, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SankeyChart from '@/components/SankeyChart';
import Breadcrumbs from '@/components/Breadcrumbs';
import { supabase } from '@/integrations/supabase/client';
import type { SankeyData, ChartSettings } from '@/types/sankey';

interface FlowData {
  title: string;
  query: string;
  data: SankeyData;
  breadcrumbs: string[];
  settings: ChartSettings;
  created_at: string;
}

const SharedFlow = () => {
  const { slug } = useParams<{ slug: string }>();
  const [flow, setFlow] = useState<FlowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlow = async () => {
      if (!slug) {
        setError('Invalid share link');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('user_flows')
          .select('title, query, data, breadcrumbs, settings, created_at')
          .eq('share_slug', slug)
          .eq('is_public', true)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('This flow does not exist or is no longer public.');
          } else {
            throw fetchError;
          }
          return;
        }

        setFlow({
          title: data.title,
          query: data.query,
          data: data.data as unknown as SankeyData,
          breadcrumbs: (data.breadcrumbs || []) as unknown as string[],
          settings: data.settings as unknown as ChartSettings,
          created_at: data.created_at,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load flow');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlow();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared flow...</p>
        </div>
      </div>
    );
  }

  if (error || !flow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Flow Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to MySankey
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">MySankey</span>
          </Link>
          
          <Button variant="outline" asChild>
            <Link to="/">Create Your Own</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {flow.title}
            </h1>
            <p className="text-muted-foreground">
              Shared on {new Date(flow.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Breadcrumbs */}
          {flow.breadcrumbs.length > 0 && (
            <div className="max-w-4xl mx-auto mb-6">
              <Breadcrumbs 
                items={flow.breadcrumbs} 
                onNavigate={() => {}} 
                onBack={() => {}} 
                canGoBack={false} 
              />
            </div>
          )}

          {/* Chart */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-4 md:p-8">
            <SankeyChart
              className="w-full h-[500px]"
              data={flow.data}
              settings={flow.settings}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharedFlow;
