import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Loader2, Play, Pause, RotateCcw, Database } from 'lucide-react';
import { toast } from 'sonner';

const GALLERY_TOPICS = [
  // Geopolitics & Macro (1-10)
  { id: 1, category: 'Geopolitics & Macro', title: '2026 US Federal Budget: Discretionary vs Mandatory Spending' },
  { id: 2, category: 'Geopolitics & Macro', title: 'The New Economic Nationalism: US Industrial Subsidy Flows' },
  { id: 3, category: 'Geopolitics & Macro', title: 'EU-China Trade War: EV & Solar Component Overcapacity' },
  { id: 4, category: 'Geopolitics & Macro', title: 'Global Semiconductor Pipeline: TSMC to NVIDIA to Data Centers' },
  { id: 5, category: 'Geopolitics & Macro', title: 'The Rise of Critical Mineral Alliances: Rare Earth Processing' },
  { id: 6, category: 'Geopolitics & Macro', title: 'South-South Trade Growth: Intra-Asia Merchandise Flows' },
  { id: 7, category: 'Geopolitics & Macro', title: 'USMCA Review: Regional Supply Chain Realignment' },
  { id: 8, category: 'Geopolitics & Macro', title: 'UN Global Growth Projections: Mature vs Developing Economies' },
  { id: 9, category: 'Geopolitics & Macro', title: 'The Global Arms Trade: Top 10 Exporters 2026' },
  { id: 10, category: 'Geopolitics & Macro', title: 'The IMF Debt Sustainability Map: High-Interest Burden Nations' },
  
  // Corporate & AI Economy (11-20)
  { id: 11, category: 'Corporate & AI Economy', title: "OpenAI's $1 Trillion Data Center Capex Plan" },
  { id: 12, category: 'Corporate & AI Economy', title: 'The Circular AI Deals Network: Microsoft-NVIDIA-OpenAI' },
  { id: 13, category: 'Corporate & AI Economy', title: 'Apple Q1 2026: iPhone 17 vs. Services Revenue Split' },
  { id: 14, category: 'Corporate & AI Economy', title: "NVIDIA's Data Center Dominance: AI Enablers vs. Infrastructure" },
  { id: 15, category: 'Corporate & AI Economy', title: "Amazon's 2026 Logistics: 3P Fees vs. AWS Profit Margins" },
  { id: 16, category: 'Corporate & AI Economy', title: 'The Netflix Content Spend: Local vs. Global Production' },
  { id: 17, category: 'Corporate & AI Economy', title: 'The Digital Advertising Duopoly: Google vs. Meta vs. Amazon Ads' },
  { id: 18, category: 'Corporate & AI Economy', title: "Tesla's Green Revenue: Regulatory Credits vs. Vehicle Sales" },
  { id: 19, category: 'Corporate & AI Economy', title: 'Luxury Conglomerates: LVMH Portfolio Performance' },
  { id: 20, category: 'Corporate & AI Economy', title: 'The Gig Economy Flow: Uber Gross Bookings vs. Driver Pay' },
  
  // Energy & Sustainability (21-30)
  { id: 21, category: 'Energy & Sustainability', title: 'The Politics of Energy: Data Center Power Surge (10% Annual Growth)' },
  { id: 22, category: 'Energy & Sustainability', title: 'The Nuclear Renaissance: Small Modular Reactor Investment' },
  { id: 23, category: 'Energy & Sustainability', title: 'Green Hydrogen Pipeline: Electrolyzer Input to Industry' },
  { id: 24, category: 'Energy & Sustainability', title: 'Global Warming 2025-2026: Record Heat Anomalies by Month' },
  { id: 25, category: 'Energy & Sustainability', title: 'The Plastic Life Cycle: Production to Ocean Leakage' },
  { id: 26, category: 'Energy & Sustainability', title: 'EV Battery Supply Chain: Lithium Sourcing to 2nd Life' },
  { id: 27, category: 'Energy & Sustainability', title: 'The Carbon Offset Market: Verification vs. Actual Absorption' },
  { id: 28, category: 'Energy & Sustainability', title: "EU 'Low Decarb Diet': Energy Sources by Nation" },
  { id: 29, category: 'Energy & Sustainability', title: 'Global Desalination: Brine Discharge vs. Potable Output' },
  { id: 30, category: 'Energy & Sustainability', title: 'The Food Waste Flow: Production to Household Loss' },
  
  // Personal Finance & Lifestyle (31-40)
  { id: 31, category: 'Personal Finance & Lifestyle', title: 'The $100k Salary Breakdown: 2026 Tax Brackets & HCOL Living' },
  { id: 32, category: 'Personal Finance & Lifestyle', title: 'BNPL Growth: Affirm & Klarna vs. Traditional Credit Stigma' },
  { id: 33, category: 'Personal Finance & Lifestyle', title: 'The Wealthy Migration: UK Non-Dom Exit Flows to UAE/Italy' },
  { id: 34, category: 'Personal Finance & Lifestyle', title: 'The Cost of Raising a Child 2026: Childcare vs. Inflation' },
  { id: 35, category: 'Personal Finance & Lifestyle', title: 'The Creator Economy: TikTok Views to Brand Deal Revenue' },
  { id: 36, category: 'Personal Finance & Lifestyle', title: 'Retirement Nest Egg: 4% Withdrawal vs. 2026 Healthcare Costs' },
  { id: 37, category: 'Personal Finance & Lifestyle', title: 'Home Ownership 2026: Principal vs. Escrow vs. Insurance' },
  { id: 38, category: 'Personal Finance & Lifestyle', title: 'The Digital Nomad Budget: Lisbon vs. Bali vs. Mexico City' },
  { id: 39, category: 'Personal Finance & Lifestyle', title: 'Subscription Fatigue: Total Household Digital SaaS Spend' },
  { id: 40, category: 'Personal Finance & Lifestyle', title: 'The Pet Economy: Lifetime Cost of Large Breed Ownership' },
  
  // Social & Trend (41-50)
  { id: 41, category: 'Social & Trend', title: "France's Natural Decrease: 2025 Births vs. Deaths Turning Point" },
  { id: 42, category: 'Social & Trend', title: 'Global Refugee Flows: Displaced Persons by Host Nation' },
  { id: 43, category: 'Social & Trend', title: 'The Premier League 2025 Summer Transfer Spend' },
  { id: 44, category: 'Social & Trend', title: 'The F1 Team Budget Cap: R&D vs. Driver Salaries' },
  { id: 45, category: 'Social & Trend', title: 'The Music Streaming Cent: Spotify to Label to Independent Artist' },
  { id: 46, category: 'Social & Trend', title: 'The Esports Economy: Sponsor Dollars to Prize Pools' },
  { id: 47, category: 'Social & Trend', title: 'Video Game Revenue: Microtransactions vs. Game Sales' },
  { id: 48, category: 'Social & Trend', title: 'The "Glowcation" Economy: Wellness Retreat Spending' },
  { id: 49, category: 'Social & Trend', title: 'Digital Minimalism: Analogue Hobby Spending vs. Screen Time' },
  { id: 50, category: 'Social & Trend', title: 'The Space Economy: Commercial LEO Satellites vs. Gov NASA Spending' },
];

type TopicStatus = 'pending' | 'generating' | 'success' | 'error';

interface TopicProgress {
  status: TopicStatus;
  error?: string;
  slug?: string;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
};

const AdminSeed = () => {
  const [progress, setProgress] = useState<Record<number, TopicProgress>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pauseRef = useRef(false);
  const abortRef = useRef(false);

  const completedCount = Object.values(progress).filter(p => p.status === 'success').length;
  const errorCount = Object.values(progress).filter(p => p.status === 'error').length;
  const progressPercent = (completedCount / GALLERY_TOPICS.length) * 100;

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const generateSingleFlow = async (topic: typeof GALLERY_TOPICS[0]): Promise<void> => {
    setProgress(prev => ({ ...prev, [topic.id]: { status: 'generating' } }));

    try {
      // Call the seed edge function
      const { data, error } = await supabase.functions.invoke('seed-gallery-flow', {
        body: { 
          title: topic.title,
          category: topic.category 
        }
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Unknown error');

      setProgress(prev => ({ 
        ...prev, 
        [topic.id]: { status: 'success', slug: data.slug } 
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      console.error(`Failed to generate "${topic.title}":`, errorMessage);
      setProgress(prev => ({ 
        ...prev, 
        [topic.id]: { status: 'error', error: errorMessage } 
      }));
    }
  };

  const startSeeding = async () => {
    setIsRunning(true);
    setIsPaused(false);
    pauseRef.current = false;
    abortRef.current = false;

    toast.info('Starting Gallery of Truth seeding...');

    for (const topic of GALLERY_TOPICS) {
      // Check for abort
      if (abortRef.current) {
        toast.warning('Seeding aborted');
        break;
      }

      // Check for pause
      while (pauseRef.current && !abortRef.current) {
        await delay(500);
      }

      // Skip already completed topics
      if (progress[topic.id]?.status === 'success') {
        continue;
      }

      await generateSingleFlow(topic);

      // Add delay between generations to avoid rate limiting
      if (!abortRef.current) {
        await delay(2000);
      }
    }

    setIsRunning(false);
    setIsPaused(false);
    
    const finalCompleted = Object.values(progress).filter(p => p.status === 'success').length;
    if (finalCompleted === GALLERY_TOPICS.length) {
      toast.success('Gallery of Truth seeding complete!');
    }
  };

  const pauseSeeding = () => {
    pauseRef.current = true;
    setIsPaused(true);
    toast.info('Seeding paused');
  };

  const resumeSeeding = () => {
    pauseRef.current = false;
    setIsPaused(false);
    toast.info('Seeding resumed');
  };

  const resetSeeding = () => {
    abortRef.current = true;
    setIsRunning(false);
    setIsPaused(false);
    setProgress({});
    toast.info('Seeding reset');
  };

  const retryFailed = async () => {
    const failedTopics = GALLERY_TOPICS.filter(t => progress[t.id]?.status === 'error');
    if (failedTopics.length === 0) {
      toast.info('No failed topics to retry');
      return;
    }

    setIsRunning(true);
    toast.info(`Retrying ${failedTopics.length} failed topics...`);

    for (const topic of failedTopics) {
      if (abortRef.current) break;
      await generateSingleFlow(topic);
      await delay(2000);
    }

    setIsRunning(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Geopolitics & Macro': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Corporate & AI Economy': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Energy & Sustainability': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Personal Finance & Lifestyle': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'Social & Trend': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status: TopicStatus) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="glass border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Gallery of Truth Seeder</CardTitle>
                <CardDescription>
                  Generate 50 high-fidelity Sankey flows with 2026 data
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Overview */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {completedCount} / {GALLERY_TOPICS.length} completed
                  {errorCount > 0 && <span className="text-red-500 ml-2">({errorCount} failed)</span>}
                </span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              {!isRunning ? (
                <Button onClick={startSeeding} className="gap-2">
                  <Play className="w-4 h-4" />
                  Start Seeding
                </Button>
              ) : isPaused ? (
                <Button onClick={resumeSeeding} className="gap-2">
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
              ) : (
                <Button onClick={pauseSeeding} variant="secondary" className="gap-2">
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}
              
              <Button 
                onClick={resetSeeding} 
                variant="outline" 
                className="gap-2"
                disabled={Object.keys(progress).length === 0}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>

              {errorCount > 0 && !isRunning && (
                <Button onClick={retryFailed} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Retry {errorCount} Failed
                </Button>
              )}
            </div>

            {/* Topic List */}
            <ScrollArea className="h-[500px] rounded-lg border border-border/50 p-4">
              <div className="space-y-2">
                {GALLERY_TOPICS.map((topic) => (
                  <div
                    key={topic.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      progress[topic.id]?.status === 'generating' 
                        ? 'bg-primary/5 border-primary/30' 
                        : progress[topic.id]?.status === 'success'
                        ? 'bg-green-500/5 border-green-500/30'
                        : progress[topic.id]?.status === 'error'
                        ? 'bg-red-500/5 border-red-500/30'
                        : 'bg-muted/30 border-border/30'
                    }`}
                  >
                    <span className="text-sm text-muted-foreground w-6">
                      {topic.id}
                    </span>
                    {getStatusIcon(progress[topic.id]?.status || 'pending')}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{topic.title}</p>
                      {progress[topic.id]?.error && (
                        <p className="text-xs text-red-400 truncate">
                          {progress[topic.id].error}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className={getCategoryColor(topic.category)}>
                      {topic.category.split(' ')[0]}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSeed;
