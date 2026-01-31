import type { SankeyData, SankeyLink, SankeyNode } from '@/types/sankey';

export interface GroupingSettings {
  nodeThreshold: number; // Default: 10
  groupPercentage: number; // Default: 0.15 (15%)
}

export interface OthersExpansion {
  sourceNode: string;
  originalLinks: SankeyLink[];
}

const DEFAULT_SETTINGS: GroupingSettings = {
  nodeThreshold: 10,
  groupPercentage: 0.15,
};

/**
 * Apply "Others" grouping algorithm to Sankey data
 * If a source node has more than `nodeThreshold` outgoing links,
 * group the smallest `groupPercentage` of links into an "Others" node
 */
export const applyOthersGrouping = (
  data: SankeyData,
  settings: GroupingSettings = DEFAULT_SETTINGS,
  expandedOthers: Set<string> = new Set()
): { data: SankeyData; othersMap: Map<string, OthersExpansion> } => {
  const { nodeThreshold, groupPercentage } = settings;
  const othersMap = new Map<string, OthersExpansion>();

  // Group links by source
  const linksBySource = new Map<string, SankeyLink[]>();
  data.links.forEach((link) => {
    if (!linksBySource.has(link.source)) {
      linksBySource.set(link.source, []);
    }
    linksBySource.get(link.source)!.push(link);
  });

  const processedLinks: SankeyLink[] = [];
  const newNodes = new Set<string>(data.nodes.map((n) => n.name));

  linksBySource.forEach((links, source) => {
    // Skip if below threshold or if this "Others" is expanded
    if (links.length <= nodeThreshold || expandedOthers.has(source)) {
      processedLinks.push(...links);
      return;
    }

    // Sort by value ascending (smallest first)
    const sorted = [...links].sort((a, b) => a.value - b.value);

    // Calculate how many to group (smallest 15%)
    const numToGroup = Math.max(1, Math.floor(links.length * groupPercentage));
    const toGroup = sorted.slice(0, numToGroup);
    const toKeep = sorted.slice(numToGroup);

    // Create "Others" aggregation
    const othersNodeName = `${source} → Others`;
    const othersValue = toGroup.reduce((sum, l) => sum + l.value, 0);

    // Store the original links for expansion
    othersMap.set(source, {
      sourceNode: source,
      originalLinks: toGroup,
    });

    // Add "Others" node and link
    newNodes.add(othersNodeName);
    processedLinks.push({
      source,
      target: othersNodeName,
      value: othersValue,
      confidence: 'estimated', // Mark as estimated since it's aggregated
    });

    // Keep the rest
    processedLinks.push(...toKeep);
  });

  // Build final node list
  const finalNodes: SankeyNode[] = Array.from(newNodes).map((name) => {
    const existing = data.nodes.find((n) => n.name === name);
    return existing || { name };
  });

  return {
    data: {
      ...data,
      nodes: finalNodes,
      links: processedLinks,
    },
    othersMap,
  };
};

/**
 * Get the original links for an "Others" group
 */
export const getOthersLinks = (
  othersMap: Map<string, OthersExpansion>,
  sourceNode: string
): SankeyLink[] => {
  return othersMap.get(sourceNode)?.originalLinks || [];
};
