import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import FeatureCard from '@/components/FeatureCard';
import SankeyChart from '@/components/SankeyChart';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useSankeyData } from '@/hooks/useSankeyData';
import { Zap, Globe, TrendingUp, Database, X, Loader2, MousePointerClick } from 'lucide-react';
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
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Zap className="w-4 h-4" />
            Powerful flow visualization made simple
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-slide-up" style={{
          animationDelay: '0.1s'
        }}>
            Visualize Any Flow with
            <span className="text-gradient block mt-2 pb-1">Interactive Sankey Diagrams</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{
          animationDelay: '0.2s'
        }}>
            Transform complex data relationships into beautiful, interactive visualizations. Perfect for energy, finance, and supply chain analysis.
          </p>
          
          <div className="animate-slide-up" style={{
          animationDelay: '0.3s'
        }}>
            <SearchBar onSearch={generateSankeyData} isLoading={isLoading} />
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground animate-fade-in" style={{
          animationDelay: '0.4s'
        }}>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              AI-powered generation
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Click nodes to drill down
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sankey-3" />
              Export to any format
            </span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 px-4" id="examples">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {data ? `Flow Diagram: ${currentQuery}` : 'Interactive Demo'}
            </h2>
            
            {data && <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                  <MousePointerClick className="w-4 h-4" />
                  Click nodes to explore deeper
                </div>
                <Button variant="outline" onClick={clearData} size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>}
          </div>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && <div className="max-w-4xl mx-auto">
              <Breadcrumbs items={breadcrumbs} onNavigate={goToBreadcrumb} onBack={goBack} canGoBack={canGoBack} />
            </div>}
          
          <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-4 md:p-8 relative">
            {isLoading && <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground">
                    {canGoBack ? 'Drilling down...' : 'Generating your diagram...'}
                  </p>
                  <p className="text-sm text-muted-foreground">This may take a few seconds</p>
                </div>
              </div>}
            <SankeyChart className="w-full h-[500px]" data={data} onNodeClick={data ? drillDown : undefined} />
          </div>
        </div>
      </section>

      {/* Featured Flows Section */}
      <section className="py-20 px-4 bg-muted/30" id="features">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            
            
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredFlows.map((flow, index) => <div key={index} className="animate-slide-up cursor-pointer" style={{
            animationDelay: `${index * 0.1}s`
          }} onClick={() => generateSankeyData(flow.title)}>
                <FeatureCard {...flow} />
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="text-sm">
            © 2025 MySankey. Built with ❤️ for data visualization enthusiasts.
          </p>
        </div>
      </footer>
    </div>;
};
export default Index;