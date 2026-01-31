import { Settings, Palette, AlignLeft, AlignRight, AlignJustify, Droplets, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import type { ChartSettings as ChartSettingsType } from '@/types/sankey';
import { COLOR_THEMES } from '@/types/sankey';

interface ChartSettingsProps {
  settings: ChartSettingsType;
  onSettingsChange: (settings: ChartSettingsType) => void;
}

const THEME_OPTIONS = [
  { value: 'default', label: 'Default', colors: COLOR_THEMES.default.slice(0, 4) },
  { value: 'corporate', label: 'Corporate Blue', colors: COLOR_THEMES.corporate.slice(0, 4) },
  { value: 'energy', label: 'Energy Green', colors: COLOR_THEMES.energy.slice(0, 4) },
  { value: 'sunset', label: 'Sunset', colors: COLOR_THEMES.sunset.slice(0, 4) },
] as const;

const ChartSettings = ({ settings, onSettingsChange }: ChartSettingsProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Chart Settings</SheetTitle>
          <SheetDescription>
            Customize the appearance of your Sankey diagram
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Color Theme */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <Label>Color Theme</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => onSettingsChange({ ...settings, theme: theme.value })}
                  className={`p-3 rounded-lg border transition-all ${
                    settings.theme === theme.value 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    {theme.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Node Alignment */}
          <div className="space-y-3">
            <Label>Node Alignment</Label>
            <ToggleGroup 
              type="single" 
              value={settings.nodeAlign}
              onValueChange={(value) => {
                if (value) onSettingsChange({ ...settings, nodeAlign: value as 'left' | 'right' | 'justify' });
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft className="w-4 h-4 mr-2" />
                Left
              </ToggleGroupItem>
              <ToggleGroupItem value="justify" aria-label="Justify">
                <AlignJustify className="w-4 h-4 mr-2" />
                Justify
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight className="w-4 h-4 mr-2" />
                Right
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Link Opacity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-muted-foreground" />
                <Label>Link Opacity</Label>
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.round(settings.linkOpacity * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.linkOpacity]}
              onValueChange={([value]) => onSettingsChange({ ...settings, linkOpacity: value })}
              min={0.1}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Node Threshold (Others Grouping) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <Label>Node Threshold</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              When a source has more than this many links, the smallest 15% are grouped into "Others"
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={5}
                max={50}
                value={settings.nodeThreshold ?? 10}
                onChange={(e) => onSettingsChange({ 
                  ...settings, 
                  nodeThreshold: Math.max(5, Math.min(50, parseInt(e.target.value) || 10)) 
                })}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">links</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChartSettings;
