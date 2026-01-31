import { ExternalLink, Shield, BarChart3, BookOpen, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { DataSource } from '@/types/sankey';
import { cn } from '@/lib/utils';

interface DataSourcesProps {
  sources?: DataSource[];
}

const sourceTypeConfig = {
  official: { icon: Shield, label: 'Official', className: 'badge-verified' },
  industry: { icon: BarChart3, label: 'Industry', className: 'badge-estimated' },
  research: { icon: BookOpen, label: 'Research', className: 'badge-estimated' },
  estimate: { icon: Sparkles, label: 'AI Estimate', className: 'badge-projected' },
};

const DataSources = ({ sources }: DataSourcesProps) => {
  if (!sources || sources.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="btn-glass">
          <BookOpen className="w-4 h-4 mr-2" />
          Sources ({sources.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2 glass-strong" align="end">
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            Data Sources
          </h4>
          {sources.map((source, idx) => {
            const config = sourceTypeConfig[source.type] || sourceTypeConfig.estimate;
            const Icon = config.icon;

            return (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Badge className={cn('h-5 px-1.5 text-[10px] shrink-0', config.className)}>
                  <Icon className="h-2.5 w-2.5 mr-1" />
                  {config.label}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{source.name}</p>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline flex items-center gap-0.5 mt-0.5"
                    >
                      View source
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DataSources;
