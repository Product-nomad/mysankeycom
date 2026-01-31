import { useMemo } from 'react';
import type { SankeyData, ChartSettings, COLOR_THEMES } from '@/types/sankey';

interface FlowThumbnailProps {
  data: SankeyData;
  settings?: ChartSettings;
}

// Simple SVG-based Sankey thumbnail for SEO and performance
const FlowThumbnail = ({ data, settings }: FlowThumbnailProps) => {
  const svgContent = useMemo(() => {
    if (!data?.nodes?.length || !data?.links?.length) {
      return null;
    }

    const width = 400;
    const height = 225;
    const padding = 20;

    // Build node positions (simplified left-to-right layout)
    const nodeMap = new Map<string, { x: number; y: number; value: number }>();
    const sourceNodes = new Set<string>();
    const targetNodes = new Set<string>();

    data.links.forEach((link) => {
      sourceNodes.add(link.source);
      targetNodes.add(link.target);
    });

    // Nodes that are only sources (leftmost)
    const leftNodes = [...sourceNodes].filter((n) => !targetNodes.has(n));
    // Nodes that are only targets (rightmost)
    const rightNodes = [...targetNodes].filter((n) => !sourceNodes.has(n));
    // Middle nodes
    const middleNodes = [...sourceNodes].filter((n) => targetNodes.has(n));

    const columns = [leftNodes, middleNodes, rightNodes].filter((col) => col.length > 0);
    const columnWidth = (width - 2 * padding) / Math.max(columns.length - 1, 1);

    columns.forEach((col, colIdx) => {
      const x = padding + colIdx * columnWidth;
      const nodeHeight = (height - 2 * padding) / col.length;

      col.forEach((nodeName, nodeIdx) => {
        const totalValue = data.links
          .filter((l) => l.source === nodeName || l.target === nodeName)
          .reduce((sum, l) => sum + l.value, 0);

        nodeMap.set(nodeName, {
          x,
          y: padding + nodeIdx * nodeHeight + nodeHeight / 2,
          value: totalValue,
        });
      });
    });

    // Color palette
    const colors = [
      '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4',
    ];

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <rect width={width} height={height} fill="url(#bg-gradient)" />

        {/* Links */}
        {data.links.slice(0, 15).map((link, idx) => {
          const source = nodeMap.get(link.source);
          const target = nodeMap.get(link.target);
          if (!source || !target) return null;

          const controlX1 = source.x + (target.x - source.x) * 0.4;
          const controlX2 = source.x + (target.x - source.x) * 0.6;

          return (
            <path
              key={idx}
              d={`M${source.x},${source.y} C${controlX1},${source.y} ${controlX2},${target.y} ${target.x},${target.y}`}
              fill="none"
              stroke={colors[idx % colors.length]}
              strokeWidth={Math.max(2, Math.min(8, link.value / 10))}
              strokeOpacity={0.4}
              strokeLinecap="round"
            />
          );
        })}

        {/* Nodes */}
        {[...nodeMap.entries()].slice(0, 12).map(([name, pos], idx) => (
          <circle
            key={name}
            cx={pos.x}
            cy={pos.y}
            r={6}
            fill={colors[idx % colors.length]}
            stroke="white"
            strokeWidth={2}
          />
        ))}
      </svg>
    );
  }, [data, settings]);

  if (!svgContent) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50">
        <span className="text-muted-foreground text-sm">No preview</span>
      </div>
    );
  }

  return svgContent;
};

export default FlowThumbnail;
