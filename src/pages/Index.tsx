import { useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import FeatureCard from '@/components/FeatureCard';
import SankeyChart from '@/components/SankeyChart';
import FlowActions from '@/components/FlowActions';
import DiagramChat from '@/components/DiagramChat';
import DataUpload from '@/components/DataUpload';
import DataSources from '@/components/DataSources';
import MobileFlowView from '@/components/MobileFlowView';
import RecentFlows from '@/components/RecentFlows';
import { useSankeyData } from '@/hooks/useSankeyData';
import { useFlowCache } from '@/hooks/useFlowCache';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ChartSettings } from '@/types/sankey';
import { Zap, Globe, TrendingUp, Database, X, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const featuredFlows = [
  {
    title: 'Global Energy Flow',
    description: 'Visualize how energy flows from sources to end uses across different sectors worldwide.',
    category: 'Energy',
    nodes: 14,
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-600'
  },
  {
    title: 'US Trade Balance',
    description: 'Explore import and export relationships between the United States and major trading partners.',
    category: 'Economics',
    nodes: 22,
    gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600'
  },
  {
    title: 'Carbon Emissions',
    description: 'Track carbon emissions from industry sectors to atmospheric impact categories.',
    category: 'Environment',
    nodes: 18,
    gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600'
  },
  {
    title: 'Supply Chain Flow',
    description: 'Map complex supply chain relationships from raw materials to end consumers.',
    category: 'Business',
    nodes: 26,
    gradient: 'bg-gradient-to-br from-purple-500 to-pink-600'
  }
];

const stats = [
  { icon: Zap, value: '10K+', label: 'Diagrams Created' },
  { icon: Globe, value: '150+', label: 'Countries Covered' },
  { icon: TrendingUp, value: '99.9%', label: 'Uptime' },
  { icon: Database, value: '5M+', label: 'Data Points' }
];

const Index = () => {
  const chartRef = useRef<ReactECharts>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [settings, setSettings] = useState<ChartSettings>({
    theme: 'default',
    nodeAlign: 'justify',
    linkOpacity: 0.5,
    showConfidence: false,
    nodeThreshold: 10,
  });

  const {
    data,
    isLoading,
    currentQuery,
    breadcrumbs,
    canGoBack,
    history,
    generateSankeyData,
    setDataFromUpload,
    drillDown,
    goBack,
    goToBreadcrumb,
    clearData
  } = useSankeyData();

  const { cachedFlows, cacheFlow, getCachedFlow, removeFromCache, clearCache } = useFlowCache();

  // Sync URL with drill-down state
  useEffect(() => {
    if (data && currentQuery) {
      const params = new URLSearchParams();
      params.set('q', currentQuery);
      if (breadcrumbs.length > 1) {
        params.set('node', breadcrumbs[breadcrumbs.length - 1]);
        params.set('depth', (breadcrumbs.length - 1).toString());
      }
      setSearchParams(params, { replace: true });
    }
  }, [data, currentQuery, breadcrumbs, setSearchParams]);

  // Restore state from URL on initial load
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && !data) {
      // Check cache first
      const cached = getCachedFlow(query);
      if (cached) {
        setDataFromUpload(cached);
      } else {
        generateSankeyData(query);
      }
    }
  }, []); // Only run on mount

  // Cache flows after generation
  useEffect(() => {
    if (data && currentQuery && currentQuery !== 'Uploaded Data') {
      cacheFlow(currentQuery, data);
    }
  }, [data, currentQuery, cacheFlow]);

  // Handle search with cache check
  const handleSearch = useCallback(async (query: string) => {
    const cached = getCachedFlow(query);
    if (cached) {
      setDataFromUpload(cached);
    } else {
      await generateSankeyData(query);
    }
  }, [getCachedFlow, setDataFromUpload, generateSankeyData]);

  // Handle recent flow selection
  const handleRecentSelect = useCallback((query: string) => {
    const cached = getCachedFlow(query);
    if (cached) {
      setDataFromUpload(cached);
    } else {
      generateSankeyData(query);
    }
  }, [getCachedFlow, setDataFromUpload, generateSankeyData]);

  // Handle clear with URL reset
  const handleClear = useCallback(() => {
    clearData();
    setSearchParams({}, { replace: true });
  }, [clearData, setSearchParams]);


  return (
    <div className="min-h-screen bg-background">
      <Header onUploadClick={() => setIsUploadOpen(true)} />
      
      {/* Data Upload Dialog */}
      <DataUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataReady={setDataFromUpload}
      />

      {/* Main Content */}
      <div className="transition-all duration-300">
        {/* Hero Section */}
        <section className="pt-20 pb-8 px-4">
          <div className="container mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-primary text-sm font-medium mb-4 animate-fade-in">
              <Zap className="w-4 h-4" />
              Powerful flow visualization made simple
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Visualize Any Flow with
              <span className="text-gradient block mt-1 pb-1">Interactive Sankey Diagrams</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Transform complex data relationships into beautiful, interactive visualizations.
            </p>
            
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                AI-powered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Click to drill down
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sankey-3" />
                CSV/Excel import
              </span>
            </div>

            {/* Recent Flows (User Vault) */}
            {!data && cachedFlows.length > 0 && (
              <div className="animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: '0.5s' }}>
                <RecentFlows
                  flows={cachedFlows}
                  onSelect={handleRecentSelect}
                  onRemove={removeFromCache}
                  onClear={clearCache}
                />
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-6 px-4 border-y border-border/30 glass">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-2">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="py-8 px-4" id="examples">
          <div className="container mx-auto">
            <div className="text-center mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {data ? `Flow Diagram: ${currentQuery}` : 'Interactive Demo'}
              </h2>
              
              {data && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                  {canGoBack && (
                    <Button variant="outline" onClick={goBack} size="sm" className="btn-glass">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  
                  <DataSources sources={data.sources} />
                  
                  <FlowActions 
                    data={data} 
                    currentQuery={currentQuery} 
                    breadcrumbs={breadcrumbs} 
                    settings={settings} 
                    chartRef={chartRef} 
                  />
                  
                  <Button variant="outline" onClick={handleClear} size="sm" className="btn-glass">
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              )}
            </div>
            
            <div className="glass rounded-xl border border-border/30 shadow-soft p-2 sm:p-3 md:p-4 relative overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 glass-strong rounded-xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                    <p className="text-base font-medium text-foreground">
                      {canGoBack ? 'Drilling down...' : 'Generating your diagram...'}
                    </p>
                    <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                  </div>
                </div>
              )}
              
              {isMobile && data ? (
                <div className="h-[500px]">
                  <MobileFlowView data={data} onNodeClick={drillDown} settings={settings} />
                </div>
              ) : (
                <SankeyChart 
                  ref={chartRef} 
                  className="w-full h-[350px] sm:h-[400px] md:h-[450px] min-w-[320px]" 
                  data={data} 
                  onNodeClick={drillDown} 
                  settings={settings} 
                />
              )}
              
              {data && <DiagramChat data={data} query={currentQuery} />}
            </div>
          </div>
        </section>

        {/* Featured Flows Section */}
        <section className="py-8 px-4 glass" id="features">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredFlows.map((flow, index) => (
                <div 
                  key={index} 
                  className="animate-slide-up cursor-pointer" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleSearch(flow.title)}
                >
                  <FeatureCard {...flow} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Index;
