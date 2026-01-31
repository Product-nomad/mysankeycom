import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import FeatureCard from '@/components/FeatureCard';
import SankeyChart from '@/components/SankeyChart';
import Breadcrumbs from '@/components/Breadcrumbs';
import ChartSettings from '@/components/ChartSettings';
import FlowActions from '@/components/FlowActions';
import { useSankeyData } from '@/hooks/useSankeyData';
import type { ChartSettings as ChartSettingsType } from '@/types/sankey';
import { Zap, Globe, TrendingUp, Database, X, Loader2, MousePointerClick, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
const featuredFlows = [{
  title: 'Global Energy Flow',
  description: 'Visualize how energy flows from sources to end uses across different sectors worldwide.',
  category: 'Energy',
  nodes: 14,
  gradient: 'bg-gradient-to-br from-amber-500 to-orange-600'
}, {
  title: 'US Trade Balance',
  description: 'Explore import and export relationships between the United States and major trading partners.',
  category: 'Economics',
  nodes: 22,
  gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600'
}, {
  title: 'Carbon Emissions',
  description: 'Track carbon emissions from industry sectors to atmospheric impact categories.',
  category: 'Environment',
  nodes: 18,
  gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600'
}, {
  title: 'Supply Chain Flow',
  description: 'Map complex supply chain relationships from raw materials to end consumers.',
  category: 'Business',
  nodes: 26,
  gradient: 'bg-gradient-to-br from-purple-500 to-pink-600'
}];
const stats = [{
  icon: Zap,
  value: '10K+',
  label: 'Diagrams Created'
}, {
  icon: Globe,
  value: '150+',
  label: 'Countries Covered'
}, {
  icon: TrendingUp,
  value: '99.9%',
  label: 'Uptime'
}, {
  icon: Database,
  value: '5M+',
  label: 'Data Points'
}];
const Index = () => {
  const chartRef = useRef<ReactECharts>(null);
  const navigate = useNavigate();
  const [settings, setSettings] = useState<ChartSettingsType>({
    theme: 'default',
    nodeAlign: 'justify',
    linkOpacity: 0.5
  });
  const {
    data,
    isLoading,
    currentQuery,
    breadcrumbs,
    canGoBack,
    generateSankeyData,
    drillDown,
    goBack,
    goToBreadcrumb,
    clearData
  } = useSankeyData();
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
            <Zap className="w-4 h-4" />
            Powerful flow visualization made simple
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 animate-slide-up" style={{
          animationDelay: '0.1s'
        }}>
            Visualize Any Flow with
            <span className="text-gradient block mt-1 pb-1">Interactive Sankey Diagrams</span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 animate-slide-up" style={{
          animationDelay: '0.2s'
        }}>
            Transform complex data relationships into beautiful, interactive visualizations.
          </p>
          
          <div className="animate-slide-up" style={{
          animationDelay: '0.3s'
        }}>
            <SearchBar onSearch={generateSankeyData} isLoading={isLoading} />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-muted-foreground animate-fade-in" style={{
          animationDelay: '0.4s'
        }}>
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
              Export anywhere
            </span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-6 px-4 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-2">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>)}
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
            
            {data && <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                {/* Back button inline with other actions */}
                {canGoBack && (
                  <Button variant="outline" onClick={goBack} size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                
                <ChartSettings settings={settings} onSettingsChange={setSettings} />
                
                <FlowActions data={data} currentQuery={currentQuery} breadcrumbs={breadcrumbs} settings={settings} chartRef={chartRef} />
                
                <Button variant="outline" onClick={clearData} size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>}
          </div>
          
          <div className="bg-card rounded-xl border border-border/50 shadow-soft p-2 sm:p-3 md:p-4 relative overflow-x-auto">
            {/* Unit indicator */}
            {data?.unit && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/80 backdrop-blur-sm text-xs font-medium text-muted-foreground border border-border/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Values in {data.unit}
                </span>
              </div>
            )}
            {isLoading && <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-base font-medium text-foreground">
                    {canGoBack ? 'Drilling down...' : 'Generating your diagram...'}
                  </p>
                  <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                </div>
              </div>}
            <SankeyChart ref={chartRef} className="w-full h-[350px] sm:h-[400px] md:h-[450px] min-w-[320px]" data={data} onNodeClick={data ? drillDown : undefined} settings={settings} />
          </div>
        </div>
      </section>

      {/* Featured Flows Section */}
      <section className="py-8 px-4 bg-muted/30" id="features">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredFlows.map((flow, index) => <div key={index} className="animate-slide-up cursor-pointer" style={{
            animationDelay: `${index * 0.1}s`
          }} onClick={() => generateSankeyData(flow.title)}>
                <FeatureCard {...flow} />
              </div>)}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border/50">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="text-xs">
            © 2025 MySankey. Built with ❤️ for data visualization enthusiasts.
          </p>
        </div>
      </footer>
    </div>;
};
export default Index;