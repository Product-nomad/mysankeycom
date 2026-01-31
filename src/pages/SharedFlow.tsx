import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GitBranch, Loader2, AlertCircle, ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SankeyChart from '@/components/SankeyChart';
import SEOHead from '@/components/SEOHead';
import FlowAnalysis from '@/components/FlowAnalysis';
import RelatedFlows from '@/components/RelatedFlows';
import DataSources from '@/components/DataSources';
import ShareDropdown from '@/components/ShareDropdown';
import { supabase } from '@/integrations/supabase/client';
import type { SankeyData, ChartSettings } from '@/types/sankey';

interface FlowData {
  title: string;
  description: string | null;
  data: SankeyData;
  settings: ChartSettings;
  created_at: string;
  updated_at: string;
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
          .from('user_flows_public')
          .select('title, description, data, settings, created_at, updated_at')
          .eq('share_slug', slug)
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
          title: data.title!,
          description: data.description,
          data: data.data as unknown as SankeyData,
          settings: data.settings as unknown as ChartSettings,
          created_at: data.created_at!,
          updated_at: data.updated_at!,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load flow');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlow();
  }, [slug]);

  // Generate SEO metadata
  const seoData = useMemo(() => {
    if (!flow) return null;

    const pageTitle = `${flow.title} Visualized: Interactive Flow Diagram | MySankey`;
    const pageDescription = flow.description || 
      `Explore an interactive Sankey diagram showing the flow of ${flow.title}. Discover insights and relationships in this visual data analysis.`;
    const pageUrl = `${window.location.origin}/flow/${slug}`;
    
    // For OG image, we'd ideally have a server-rendered image
    // For now, use a placeholder or the app's default social image
    const ogImage = `${window.location.origin}/og-image.png`;

    return {
      title: pageTitle,
      description: pageDescription.slice(0, 155),
      ogImage,
      ogUrl: pageUrl,
      publishedTime: flow.created_at,
      modifiedTime: flow.updated_at,
    };
  }, [flow, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading flow...</p>
        </div>
      </div>
    );
  }

  if (error || !flow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SEOHead
          title="Flow Not Found | MySankey"
          description="The requested Sankey diagram could not be found."
        />
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Flow Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link to="/explore">
                Browse Flows
              </Link>
            </Button>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to MySankey
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(flow.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const shareUrl = `${window.location.origin}/flow/${slug}`;

  return (
    <div className="min-h-screen bg-background">
      {seoData && (
        <SEOHead
          title={seoData.title}
          description={seoData.description}
          ogImage={seoData.ogImage}
          ogUrl={seoData.ogUrl}
          type="article"
          publishedTime={seoData.publishedTime}
          modifiedTime={seoData.modifiedTime}
        />
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">MySankey</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/explore">Explore</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Create Your Own</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <article className="container mx-auto max-w-6xl">
          {/* Title Section */}
          <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {flow.title}
            </h1>
            {flow.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
                {flow.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <time dateTime={flow.updated_at}>Updated {formattedDate}</time>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Share2 className="w-4 h-4" />
                <ShareDropdown url={shareUrl} title={flow.title} />
              </div>
            </div>
          </header>

          {/* Chart Actions */}
          <div className="flex items-center justify-end gap-2 mb-4">
            {flow.data.sources && flow.data.sources.length > 0 && (
              <DataSources sources={flow.data.sources} />
            )}
          </div>

          {/* Interactive Chart */}
          <section className="bg-card rounded-2xl border border-border/50 shadow-soft p-4 md:p-8">
            <SankeyChart
              className="w-full h-[500px] md:h-[600px]"
              data={flow.data}
              settings={flow.settings}
            />
            {flow.data.unit && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Values shown in <strong>{flow.data.unit}</strong>
              </p>
            )}
          </section>

          {/* AI Analysis Section - Prevents thin content */}
          <FlowAnalysis title={flow.title} data={flow.data} />

          {/* Related Flows - Internal linking for SEO */}
          <RelatedFlows currentSlug={slug!} currentTitle={flow.title} />
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>
            Created with{' '}
            <Link to="/" className="text-primary hover:underline">
              MySankey
            </Link>
            {' '}— AI-Powered Sankey Diagrams
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SharedFlow;
