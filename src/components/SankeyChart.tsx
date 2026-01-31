import { useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactECharts from 'echarts-for-react';
import type { SankeyData } from '@/hooks/useSankeyData';
import type { ChartSettings } from '@/types/sankey';
import { COLOR_THEMES } from '@/types/sankey';

interface SankeyChartProps {
  className?: string;
  data?: SankeyData | null;
  onNodeClick?: (nodeName: string) => void;
  settings?: ChartSettings;
}

// Default sample data
const defaultData: SankeyData = {
  nodes: [
    { name: 'Solar', itemStyle: { color: '#f59e0b' } },
    { name: 'Wind', itemStyle: { color: '#10b981' } },
    { name: 'Hydro', itemStyle: { color: '#3b82f6' } },
    { name: 'Nuclear', itemStyle: { color: '#8b5cf6' } },
    { name: 'Coal', itemStyle: { color: '#6b7280' } },
    { name: 'Natural Gas', itemStyle: { color: '#f97316' } },
    { name: 'Electricity Grid', itemStyle: { color: '#0ea5e9' } },
    { name: 'Industrial', itemStyle: { color: '#64748b' } },
    { name: 'Residential', itemStyle: { color: '#14b8a6' } },
    { name: 'Commercial', itemStyle: { color: '#a855f7' } },
    { name: 'Transportation', itemStyle: { color: '#ec4899' } },
    { name: 'Manufacturing', itemStyle: { color: '#f43f5e' } },
    { name: 'Heating', itemStyle: { color: '#ef4444' } },
    { name: 'Cooling', itemStyle: { color: '#06b6d4' } },
  ],
  links: [
    { source: 'Solar', target: 'Electricity Grid', value: 25 },
    { source: 'Wind', target: 'Electricity Grid', value: 35 },
    { source: 'Hydro', target: 'Electricity Grid', value: 20 },
    { source: 'Nuclear', target: 'Electricity Grid', value: 30 },
    { source: 'Coal', target: 'Electricity Grid', value: 15 },
    { source: 'Natural Gas', target: 'Electricity Grid', value: 25 },
    { source: 'Electricity Grid', target: 'Industrial', value: 45 },
    { source: 'Electricity Grid', target: 'Residential', value: 35 },
    { source: 'Electricity Grid', target: 'Commercial', value: 30 },
    { source: 'Electricity Grid', target: 'Transportation', value: 20 },
    { source: 'Industrial', target: 'Manufacturing', value: 30 },
    { source: 'Industrial', target: 'Heating', value: 15 },
    { source: 'Residential', target: 'Heating', value: 20 },
    { source: 'Residential', target: 'Cooling', value: 15 },
    { source: 'Commercial', target: 'Cooling', value: 18 },
    { source: 'Commercial', target: 'Heating', value: 12 },
  ],
};

const SankeyChart = forwardRef<ReactECharts, SankeyChartProps>(
  ({ className, data, onNodeClick, settings }, ref) => {
    const chartRef = useRef<ReactECharts>(null);
    const chartData = data || defaultData;

    // Forward the ref so parent can access chart instance
    useImperativeHandle(ref, () => chartRef.current as ReactECharts);

    // Apply theme colors to nodes
    const themedNodes = chartData.nodes.map((node, index) => {
      const themeColors = settings?.theme ? COLOR_THEMES[settings.theme] : COLOR_THEMES.default;
      return {
        ...node,
        itemStyle: { color: themeColors[index % themeColors.length] },
      };
    });

    const nodeAlign = settings?.nodeAlign || 'justify';
    const linkOpacity = settings?.linkOpacity ?? 0.5;

    const option = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        backgroundColor: 'hsl(220, 25%, 10%)',
        borderColor: 'hsl(220, 20%, 20%)',
        textStyle: {
          color: 'hsl(210, 20%, 98%)',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            return `<div style="padding: 4px 0;">
              <strong>${params.name}</strong>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
                Click to expand details
              </div>
            </div>`;
          }
          return `${params.data.source} → ${params.data.target}<br/>Value: ${params.data.value}`;
        },
      },
      series: [
        {
          type: 'sankey',
          layout: 'none',
          emphasis: {
            focus: 'adjacency',
          },
          nodeAlign: nodeAlign,
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
            opacity: linkOpacity,
          },
          nodeWidth: 20,
          nodeGap: 14,
          label: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            color: 'hsl(220, 25%, 10%)',
          },
          data: themedNodes,
          links: chartData.links,
        },
      ],
    };

    const handleChartReady = useCallback(
      (chart: any) => {
        chart.on('click', 'series.sankey', (params: any) => {
          if (params.dataType === 'node' && onNodeClick) {
            onNodeClick(params.name);
          }
        });

        // Add cursor pointer on node hover
        chart.on('mouseover', 'series.sankey', (params: any) => {
          if (params.dataType === 'node') {
            chart.getZr().setCursorStyle('pointer');
          }
        });

        chart.on('mouseout', 'series.sankey', () => {
          chart.getZr().setCursorStyle('default');
        });
      },
      [onNodeClick]
    );

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
