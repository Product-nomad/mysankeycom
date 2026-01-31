import { Clock, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { CachedFlow } from '@/hooks/useFlowCache';

interface RecentFlowsProps {
  flows: CachedFlow[];
  onSelect: (query: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const RecentFlows = ({ flows, onSelect, onRemove, onClear }: RecentFlowsProps) => {
  if (flows.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Recent Flows</span>
          <Badge variant="secondary" className="text-xs h-5">
            {flows.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-destructive h-7 px-2"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {flows.map((flow) => (
            <div
              key={flow.id}
              className="group relative flex-shrink-0 px-3 py-2 rounded-lg glass border border-border/30 hover:border-primary/50 transition-all cursor-pointer min-w-[140px] max-w-[200px]"
              onClick={() => onSelect(flow.query)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(flow.id);
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:border-destructive hover:text-destructive-foreground"
              >
                <X className="w-3 h-3" />
              </button>

              <p className="text-sm font-medium truncate text-foreground">{flow.query}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {flow.data.nodes.length} nodes
                </span>
                <span className="text-xs text-muted-foreground/50">•</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(flow.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default RecentFlows;
