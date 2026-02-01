import { 
  CheckCircle2, AlertTriangle, XCircle, BarChart3, 
  GitBranch, Copy, AlertCircle, Sparkles, DollarSign, Package
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { DataHealthReport as DataHealthReportType } from '@/utils/dataValidation';

interface DataHealthReportProps {
  report: DataHealthReportType;
  circularRowHighlight?: Set<number>;
}

const DataHealthReport = ({ report, circularRowHighlight }: DataHealthReportProps) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const FlowTypeIcon = report.flowType.type === 'financial' ? DollarSign : Package;

  return (
    <div className="space-y-4">
      {/* Health Score Header */}
      <div className={cn(
        "p-4 rounded-lg border",
        getHealthBg(report.healthScore)
      )}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Data Health Score
          </h4>
          <span className={cn("text-2xl font-bold", getHealthColor(report.healthScore))}>
            {report.healthScore}%
          </span>
        </div>
        <Progress 
          value={report.healthScore} 
          className="h-2"
          style={{
            '--progress-background': 'hsl(var(--muted))',
          } as React.CSSProperties}
        />
        <div className="mt-2 flex items-center gap-2">
          {report.isReady ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Ready to Visualize
            </Badge>
          ) : (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <XCircle className="h-3 w-3 mr-1" />
              Issues Need Resolution
            </Badge>
          )}
        </div>
      </div>

      {/* Flow Type Detection */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Semantic Flow Type</span>
          <Badge className={cn(
            "text-xs",
            report.flowType.confidence === 'high' 
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : report.flowType.confidence === 'medium'
              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              : 'bg-muted text-muted-foreground'
          )}>
            {report.flowType.confidence} confidence
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <FlowTypeIcon className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium capitalize">{report.flowType.type} Flow</span>
          <span className="text-xs text-muted-foreground">
            — Suggested unit: {report.flowType.suggestedUnit}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{report.flowType.reasoning}</p>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 p-2 rounded bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span>{report.validRows} Valid Rows</span>
        </div>
        
        {report.errorsFixed > 0 && (
          <div className="flex items-center gap-2 p-2 rounded bg-blue-500/10 border border-blue-500/20">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <span>{report.errorsFixed} Errors to Fix</span>
          </div>
        )}
        
        {report.duplicateRows.length > 0 && (
          <div className="flex items-center gap-2 p-2 rounded bg-purple-500/10 border border-purple-500/20">
            <Copy className="h-4 w-4 text-purple-400" />
            <span>{report.duplicateRows.length} Duplicate Pairs</span>
          </div>
        )}
        
        {report.outliersFound > 0 && (
          <div className="flex items-center gap-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span>{report.outliersFound} Outliers Found</span>
          </div>
        )}
      </div>

      {/* Missing Values */}
      {report.missingValues.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm w-full p-2 rounded hover:bg-muted/50 transition-colors">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span>Missing Values ({report.missingValues.reduce((s, m) => s + m.count, 0)} total)</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 p-2 rounded bg-muted/30 space-y-1">
              {report.missingValues.map(({ column, count }) => (
                <div key={column} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{column}</span>
                  <span className="text-yellow-400">{count} missing</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Circular References - Critical Section */}
      {report.circularReferences.hasCircular && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 space-y-2">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">
              Circular References Detected ({report.circularReferences.references.length})
            </span>
          </div>
          
          <ScrollArea className="h-24">
            <div className="space-y-2">
              {report.circularReferences.references.map((ref, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-2 rounded text-xs",
                    ref.severity === 'error' 
                      ? 'bg-red-500/20 border border-red-500/40'
                      : 'bg-yellow-500/20 border border-yellow-500/40'
                  )}
                >
                  <div className="flex items-center gap-1 flex-wrap">
                    {ref.path.map((node, j) => (
                      <span key={j} className="flex items-center gap-1">
                        <span className="font-medium">{node}</span>
                        {j < ref.path.length - 1 && <span className="text-muted-foreground">→</span>}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    Rows: {ref.rowIndices.map(r => r + 1).join(', ')}
                    {ref.severity === 'warning' && (
                      <span className="ml-2 text-yellow-400">(self-reference)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <p className="text-xs text-red-300">
            ⚠️ Circular references will be excluded from the visualization to prevent infinite loops.
          </p>
        </div>
      )}

      {/* Column Mapping Summary */}
      <div className="p-2 rounded bg-muted/30 text-xs space-y-1">
        <div className="font-medium mb-1">Column Mapping:</div>
        <div className="flex gap-4">
          <span><strong>Source:</strong> {report.columnMapping.source}</span>
          <span><strong>Target:</strong> {report.columnMapping.target}</span>
        </div>
        <div className="flex gap-4">
          <span><strong>Value:</strong> {report.columnMapping.value || 'Frequency count'}</span>
          {report.columnMapping.unit && (
            <span><strong>Unit:</strong> {report.columnMapping.unit}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataHealthReport;
