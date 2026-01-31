import { useCallback, useRef, forwardRef, useImperativeHandle, useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';
import type { SankeyData, ChartSettings } from '@/types/sankey';
import { COLOR_THEMES } from '@/types/sankey';
import { applyOthersGrouping, type OthersExpansion } from '@/utils/othersGrouping';

interface SankeyChartProps {
  className?: string;
  data?: SankeyData | null;
  onNodeClick?: (nodeName: string) => void;
  settings?: ChartSettings;
}

// Default sample data with unit for demo purposes
const defaultData: SankeyData = {
  nodes: [
    { name: 'Solar' }, { name: 'Wind' }, { name: 'Hydro' }, { name: 'Nuclear' },
    { name: 'Coal' }, { name: 'Natural Gas' }, { name: 'Electricity Grid' },
    { name: 'Industrial' }, { name: 'Residential' }, { name: 'Commercial' },
    { name: 'Transportation' }, { name: 'Manufacturing' }, { name: 'Heating' }, { name: 'Cooling' },
  ],
  links: [
    { source: 'Solar', target: 'Electricity Grid', value: 25, confidence: 'verified' },
    { source: 'Wind', target: 'Electricity Grid', value: 35, confidence: 'verified' },
    { source: 'Hydro', target: 'Electricity Grid', value: 20, confidence: 'verified' },
    { source: 'Nuclear', target: 'Electricity Grid', value: 30, confidence: 'verified' },
    { source: 'Coal', target: 'Electricity Grid', value: 15, confidence: 'estimated' },
    { source: 'Natural Gas', target: 'Electricity Grid', value: 25, confidence: 'estimated' },
    { source: 'Electricity Grid', target: 'Industrial', value: 45, confidence: 'projected' },
    { source: 'Electricity Grid', target: 'Residential', value: 35, confidence: 'projected' },
    { source: 'Electricity Grid', target: 'Commercial', value: 30, confidence: 'projected' },
    { source: 'Electricity Grid', target: 'Transportation', value: 20, confidence: 'projected' },
    { source: 'Industrial', target: 'Manufacturing', value: 30, confidence: 'estimated' },
    { source: 'Industrial', target: 'Heating', value: 15, confidence: 'estimated' },
    { source: 'Residential', target: 'Heating', value: 20, confidence: 'projected' },
    { source: 'Residential', target: 'Cooling', value: 15, confidence: 'projected' },
    { source: 'Commercial', target: 'Cooling', value: 18, confidence: 'projected' },
    { source: 'Commercial', target: 'Heating', value: 12, confidence: 'projected' },
  ],
  unit: 'GW',
};

const confidenceColors = {
  verified: '#10b981',
  estimated: '#f59e0b',
  projected: '#a855f7',
};

const SankeyChart = forwardRef<ReactECharts, SankeyChartProps>(
  ({ className, data, onNodeClick, settings }, ref) => {
    const chartRef = useRef<ReactECharts>(null);
    const onNodeClickRef = useRef(onNodeClick);
    const { resolvedTheme } = useTheme();
    const [expandedOthers, setExpandedOthers] = useState<Set<string>>(new Set());
    
    const chartData = data || defaultData;
    const isDark = resolvedTheme === 'dark';
    const unit = chartData.unit || '';
    const showConfidence = settings?.showConfidence ?? false;
    const nodeThreshold = settings?.nodeThreshold ?? 10;

    useEffect(() => {
      onNodeClickRef.current = onNodeClick;
    }, [onNodeClick]);

    useImperativeHandle(ref, () => chartRef.current as ReactECharts);

    // Apply "Others" grouping algorithm
    const { processedData, othersMap } = useMemo(() => {
      const result = applyOthersGrouping(
        chartData,
        { nodeThreshold, groupPercentage: 0.15 },
        expandedOthers
      );
      return { processedData: result.data, othersMap: result.othersMap };
    }, [chartData, nodeThreshold, expandedOthers]);

    // Calculate node totals from processed data
    const nodeTotals = new Map<string, number>();
    processedData.links.forEach(link => {
      nodeTotals.set(link.target, (nodeTotals.get(link.target) || 0) + link.value);
      if (!nodeTotals.has(link.source)) {
        const outgoing = processedData.links
          .filter(l => l.source === link.source)
          .reduce((sum, l) => sum + l.value, 0);
        nodeTotals.set(link.source, outgoing);
      }
    });

    const formatValue = (value: number, unitStr: string) => {
      if (!unitStr) return null;
      if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B ${unitStr}`;
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ${unitStr}`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K ${unitStr}`;
      return `${value.toLocaleString()} ${unitStr}`;
    };

    const getConfidenceLabel = (conf?: string) => {
      switch (conf) {
        case 'verified': return '✓ Verified';
        case 'estimated': return '≈ Estimated';
        case 'projected': return '✧ Projected';
        default: return '';
      }
    };

    // Apply theme colors to processed data
    const themedNodes = processedData.nodes.map((node, index) => {
      const themeColors = settings?.theme ? COLOR_THEMES[settings.theme] : COLOR_THEMES.default;
      const isOthersNode = node.name.includes('→ Others');
      return {
        ...node,
        itemStyle: { 
          color: isOthersNode ? 'hsl(var(--muted-foreground))' : themeColors[index % themeColors.length],
          opacity: isOthersNode ? 0.7 : 1,
        },
      };
    });

    // Apply confidence-based link colors if enabled
    const themedLinks = processedData.links.map((link) => {
      if (showConfidence && link.confidence) {
        return {
          ...link,
          lineStyle: {
            color: confidenceColors[link.confidence],
            opacity: settings?.linkOpacity ?? 0.5,
          },
        };
      }
      return link;
    });

    const nodeAlign = settings?.nodeAlign || 'justify';
    const linkOpacity = settings?.linkOpacity ?? 0.5;

    // Theme-aware colors for glassmorphic look
    const tooltipBg = isDark ? 'hsl(222, 47%, 10%)' : 'hsl(0, 0%, 100%)';
    const tooltipBorder = isDark ? 'hsl(222, 30%, 25%)' : 'hsl(210, 20%, 90%)';
    const tooltipText = isDark ? 'hsl(210, 20%, 98%)' : 'hsl(220, 25%, 10%)';
    const labelColor = isDark ? 'hsl(210, 20%, 90%)' : 'hsl(220, 25%, 10%)';

    const option = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderRadius: 8,
        padding: [8, 12],
        textStyle: {
          color: tooltipText,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 13,
        },
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const total = nodeTotals.get(params.name) || 0;
            const formattedValue = formatValue(total, unit);
            const isOthersNode = params.name.includes('→ Others');
            const actionText = isOthersNode 
              ? 'Click to expand grouped items' 
              : 'Click to expand details';
            
            return `<div style="padding: 2px 0;">
              <strong style="font-size: 14px;">${params.name}</strong>
              ${formattedValue ? `<div style="font-size: 13px; margin-top: 6px; opacity: 0.9;">Total: ${formattedValue}</div>` : ''}
              <div style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#64748b'}; margin-top: 6px;">
                ${actionText}
              </div>
            </div>`;
          }
          const formattedValue = formatValue(params.data.value, unit);
          const confidence = params.data.confidence;
          const confLabel = showConfidence ? getConfidenceLabel(confidence) : '';
          const confColor = confidence ? confidenceColors[confidence as keyof typeof confidenceColors] : '';
          
          return `<div style="padding: 2px 0;">
            <strong style="font-size: 14px;">${params.data.source} → ${params.data.target}</strong>
            ${formattedValue ? `<div style="font-size: 13px; margin-top: 6px; opacity: 0.9;">${formattedValue}</div>` : ''}
            ${confLabel ? `<div style="font-size: 11px; color: ${confColor}; margin-top: 4px;">${confLabel}</div>` : ''}
          </div>`;
        },
      },
      series: [
        {
          type: 'sankey',
          layoutIterations: 64,
          emphasis: { focus: 'adjacency' },
          nodeAlign,
          lineStyle: {
            color: showConfidence ? 'source' : 'gradient',
            curveness: 0.5,
            opacity: linkOpacity,
          },
          nodeWidth: 12,
          nodeGap: 8,
          left: '1%',
          right: '15%',
          top: '2%',
          bottom: '2%',
          label: {
            show: true,
            position: 'right',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 9,
            fontWeight: 500,
            color: labelColor,
            overflow: 'truncate',
            ellipsis: '...',
            width: 90,
            formatter: (params: any) => {
              if (params.name.length > 14) {
                return params.name.substring(0, 12) + '...';
              }
              return params.name;
            },
          },
          data: themedNodes,
          links: themedLinks,
        },
      ],
    };

    const handleChartReady = useCallback((chart: any) => {
      chart.on('click', 'series.sankey', (params: any) => {
        if (params.dataType === 'node') {
          const nodeName = params.name;
          
          // Check if this is an "Others" node - if so, expand it
          if (nodeName.includes('→ Others')) {
            // Extract the source node name from "Source → Others"
            const sourceNode = nodeName.replace(' → Others', '');
            setExpandedOthers((prev) => {
              const next = new Set(prev);
              if (next.has(sourceNode)) {
                next.delete(sourceNode);
              } else {
                next.add(sourceNode);
              }
              return next;
            });
          } else if (onNodeClickRef.current) {
            onNodeClickRef.current(nodeName);
          }
        }
      });

      chart.on('mouseover', 'series.sankey', (params: any) => {
        if (params.dataType === 'node') {
          chart.getZr().setCursorStyle('pointer');
        }
      });

      chart.on('mouseout', 'series.sankey', () => {
        chart.getZr().setCursorStyle('default');
      });
    }, []);

    return (
      <div className={className}>
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: '100%', width: '100%', minHeight: '400px' }}
          opts={{ renderer: 'svg' }}
          notMerge={true}
          lazyUpdate={true}
          onChartReady={handleChartReady}
        />
      </div>
    );
  }
);

SankeyChart.displayName = 'SankeyChart';

export default SankeyChart;
