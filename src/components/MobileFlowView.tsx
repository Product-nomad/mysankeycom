import { useState, useMemo, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { ChevronDown, ChevronRight, ArrowRight, Shield, HelpCircle, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import MobileContextDrawer from './MobileContextDrawer';
import type { SankeyData, ChartSettings, SankeyLink } from '@/types/sankey';
import { COLOR_THEMES } from '@/types/sankey';
import { cn } from '@/lib/utils';

interface MobileFlowViewProps {
  data: SankeyData;
  onNodeClick?: (nodeName: string) => void;
  settings?: ChartSettings;
}

interface FlowGroup {
  source: string;
  totalValue: number;
  flows: Array<{
    target: string;
    value: number;
    confidence?: 'verified' | 'estimated' | 'projected';
  }>;
}

interface LinkContext {
  source: string;
  target: string;
  value: number;
  unit?: string;
  confidence?: 'verified' | 'estimated' | 'projected';
}

interface NodeContext {
  name: string;
  totalValue: number;
  unit?: string;
  incomingCount: number;
  outgoingCount: number;
}

const ConfidenceIcon = ({ confidence }: { confidence?: string }) => {
  switch (confidence) {
    case 'verified':
      return <Shield className="h-3 w-3 text-emerald-400" />;
    case 'estimated':
      return <HelpCircle className="h-3 w-3 text-amber-400" />;
    case 'projected':
      return <Sparkles className="h-3 w-3 text-purple-400" />;
    default:
      return null;
  }
};

const MobileFlowView = ({ data, onNodeClick, settings }: MobileFlowViewProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [linkContext, setLinkContext] = useState<LinkContext | null>(null);
  const [nodeContext, setNodeContext] = useState<NodeContext | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Group flows by source node
  const flowGroups = useMemo((): FlowGroup[] => {
    const groups = new Map<string, FlowGroup>();

    data.links.forEach((link) => {
      if (!groups.has(link.source)) {
        groups.set(link.source, {
          source: link.source,
          totalValue: 0,
          flows: [],
        });
      }
      const group = groups.get(link.source)!;
      group.totalValue += link.value;
      group.flows.push({
        target: link.target,
        value: link.value,
        confidence: link.confidence,
      });
    });

    // Sort by total value descending
    return Array.from(groups.values()).sort((a, b) => b.totalValue - a.totalValue);
  }, [data.links]);

  const toggleGroup = (source: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(source)) {
      newExpanded.delete(source);
    } else {
      newExpanded.add(source);
    }
    setExpandedGroups(newExpanded);
  };

  const handleLinkTap = useCallback((flow: FlowGroup['flows'][0], source: string) => {
    setLinkContext({
      source,
      target: flow.target,
      value: flow.value,
      unit: data.unit,
      confidence: flow.confidence,
    });
    setNodeContext(null);
    setDrawerOpen(true);
  }, [data.unit]);

  const handleNodeTap = useCallback((nodeName: string) => {
    const incomingCount = data.links.filter((l) => l.target === nodeName).length;
    const outgoingCount = data.links.filter((l) => l.source === nodeName).length;
    const totalValue = data.links
      .filter((l) => l.target === nodeName || l.source === nodeName)
      .reduce((sum, l) => sum + l.value, 0);

    setNodeContext({
      name: nodeName,
      totalValue,
      unit: data.unit,
      incomingCount,
      outgoingCount,
    });
    setLinkContext(null);
    setDrawerOpen(true);
  }, [data]);

  const handleDrillDown = useCallback((nodeName: string) => {
    onNodeClick?.(nodeName);
  }, [onNodeClick]);

  const formatValue = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  // Mini Sankey chart options for the top section
  const themeColors = settings?.theme ? COLOR_THEMES[settings.theme] : COLOR_THEMES.default;
  
  const miniChartOption = {
    tooltip: { show: false },
    series: [
      {
        type: 'sankey',
        layoutIterations: 32,
        emphasis: { focus: 'adjacency' },
        nodeAlign: 'justify',
        orient: 'vertical',
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.4,
        },
        nodeWidth: 8,
        nodeGap: 4,
        left: '5%',
        right: '5%',
        top: '5%',
        bottom: '5%',
        label: { show: false },
        data: data.nodes.map((node, i) => ({
          ...node,
          itemStyle: { color: themeColors[i % themeColors.length] },
        })),
        links: data.links,
      },
    ],
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mini-map Sankey (top 30%) */}
      <div className="h-[30%] min-h-[120px] relative glass rounded-t-xl overflow-hidden">
        <ReactECharts
          option={miniChartOption}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg' }}
        />
        <div className="absolute bottom-1 left-2 right-2 flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground">Flow Overview</span>
          {data.unit && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {data.unit}
            </Badge>
          )}
        </div>
      </div>

      {/* Flow List (bottom 70%) */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-1.5">
          {flowGroups.map((group, groupIdx) => {
            const isExpanded = expandedGroups.has(group.source);
            const nodeColor = themeColors[groupIdx % themeColors.length];

            return (
              <div
                key={group.source}
                className="rounded-lg overflow-hidden glass border border-border/30"
              >
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.source)}
                  className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/30 transition-colors min-h-[44px]"
                >
                  <div
                    className="w-2 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: nodeColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{group.source}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatValue(group.totalValue)} {data.unit} → {group.flows.length} flows
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Flows */}
                {isExpanded && (
                  <div className="border-t border-border/30 bg-muted/20">
                    {group.flows
                      .sort((a, b) => b.value - a.value)
                      .map((flow, flowIdx) => (
                        <button
                          key={flowIdx}
                          onClick={() => handleLinkTap(flow, group.source)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors min-h-[44px] border-b border-border/20 last:border-0"
                        >
                          <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="flex-1 text-sm truncate">{flow.target}</span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {settings?.showConfidence && (
                              <ConfidenceIcon confidence={flow.confidence} />
                            )}
                            <span className="text-xs font-medium tabular-nums">
                              {formatValue(flow.value)}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Context Drawer for touch interactions */}
      <MobileContextDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onDrillDown={handleDrillDown}
        linkContext={linkContext}
        nodeContext={nodeContext}
      />
    </div>
  );
};

export default MobileFlowView;
