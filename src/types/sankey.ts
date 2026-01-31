export interface SankeyNode {
  name: string;
  itemStyle?: { color: string };
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
  unit?: string;
}

export interface ChartSettings {
  theme: 'default' | 'corporate' | 'energy' | 'sunset';
  nodeAlign: 'left' | 'right' | 'justify';
  linkOpacity: number;
}

export interface BreadcrumbItem {
  label: string;
  query: string;
  data: SankeyData;
}

export interface UserFlow {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  query: string;
  data: SankeyData;
  breadcrumbs: BreadcrumbItem[];
  settings: ChartSettings;
  is_public: boolean;
  share_slug?: string;
  created_at: string;
  updated_at: string;
}

export const COLOR_THEMES = {
  default: [
    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4',
    '#ec4899', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#a855f7',
  ],
  corporate: [
    '#1e40af', '#1e3a8a', '#3730a3', '#312e81', '#1f2937', '#374151',
    '#4b5563', '#6b7280', '#0369a1', '#0284c7', '#0891b2', '#0f766e',
  ],
  energy: [
    '#16a34a', '#15803d', '#166534', '#14532d', '#84cc16', '#65a30d',
    '#4d7c0f', '#22c55e', '#86efac', '#22d3ee', '#06b6d4', '#0891b2',
  ],
  sunset: [
    '#dc2626', '#ea580c', '#f59e0b', '#eab308', '#f97316', '#fb923c',
    '#fbbf24', '#facc15', '#ef4444', '#f87171', '#fca5a5', '#fed7aa',
  ],
};
