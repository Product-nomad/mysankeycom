import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Filter, Eye, Info } from 'lucide-react';

export interface OutlierSettings {
  keepOutliers: boolean;
  groupSmallValues: boolean;
  smallValueThreshold: number; // Percentage (e.g., 0.01 = 1%)
}

interface OutlierToggleProps {
  settings: OutlierSettings;
  onSettingsChange: (settings: OutlierSettings) => void;
  outlierCount?: number;
  smallValueCount?: number;
}

const OutlierToggle = ({ 
  settings, 
  onSettingsChange, 
  outlierCount = 0,
  smallValueCount = 0
}: OutlierToggleProps) => {
  return (
    <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Filter className="h-4 w-4 text-primary" />
        Pro Settings
        <Badge variant="outline" className="text-xs">Analyst Mode</Badge>
      </div>

      {/* Keep Outliers Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="keep-outliers" className="text-xs cursor-pointer">
            Keep All Values (Including Outliers)
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px] text-xs">
                When enabled, negative values and statistical outliers will remain visible. 
                Useful for spotting significant deviations like $1 discrepancies.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {outlierCount > 0 && (
            <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              {outlierCount} outliers
            </Badge>
          )}
        </div>
        <Switch
          id="keep-outliers"
          checked={settings.keepOutliers}
          onCheckedChange={(checked) => 
            onSettingsChange({ ...settings, keepOutliers: checked })
          }
        />
      </div>

      {/* Group Small Values Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="group-small" className="text-xs cursor-pointer">
            Group Small Values into "Others"
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px] text-xs">
                Automatically aggregates the smallest 15% of links into an "Others" node 
                when a source exceeds the threshold. Helps reduce visual clutter.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {smallValueCount > 0 && settings.groupSmallValues && (
            <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
              {smallValueCount} groupable
            </Badge>
          )}
        </div>
        <Switch
          id="group-small"
          checked={settings.groupSmallValues}
          onCheckedChange={(checked) => 
            onSettingsChange({ ...settings, groupSmallValues: checked })
          }
        />
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground">
        {settings.keepOutliers 
          ? "All data points visible — review carefully for significant deviations."
          : "Outliers will be normalized (negative → absolute values)."
        }
      </p>
    </div>
  );
};

export default OutlierToggle;
