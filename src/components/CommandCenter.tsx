import { useState } from 'react';
import { Settings, History, Upload, Palette, ChevronLeft, ChevronRight, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';
import type { ChartSettings } from '@/types/sankey';
import { cn } from '@/lib/utils';
interface CommandCenterProps {
  settings: ChartSettings;
  onSettingsChange: (settings: ChartSettings) => void;
  history: Array<{
    label: string;
    query: string;
  }>;
  onHistorySelect?: (index: number) => void;
  onUploadClick?: () => void;
}
const CommandCenter = ({
  settings,
  onSettingsChange,
  history,
  onHistorySelect,
  onUploadClick
}: CommandCenterProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<'theme' | 'settings' | 'history'>('settings');
  const {
    theme,
    setTheme,
    resolvedTheme
  } = useTheme();
  const themes = [{
    id: 'default',
    label: 'Default',
    colors: ['#3b82f6', '#10b981', '#8b5cf6']
  }, {
    id: 'corporate',
    label: 'Corporate',
    colors: ['#1e40af', '#1e3a8a', '#3730a3']
  }, {
    id: 'energy',
    label: 'Energy',
    colors: ['#16a34a', '#15803d', '#84cc16']
  }, {
    id: 'sunset',
    label: 'Sunset',
    colors: ['#dc2626', '#ea580c', '#f59e0b']
  }, {
    id: 'glassmorphic',
    label: 'Neon',
    colors: ['#60a5fa', '#34d399', '#a78bfa']
  }];
  const alignOptions = [{
    id: 'left',
    label: 'Left'
  }, {
    id: 'right',
    label: 'Right'
  }, {
    id: 'justify',
    label: 'Justify'
  }];
  return <div className={cn('fixed left-0 top-16 bottom-0 z-40 transition-all duration-300', isCollapsed ? 'w-12' : 'w-64')}>
      <div className="h-full glass-strong flex flex-col border-r border-border/30">
        {/* Toggle button */}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-4 z-50 h-6 w-6 rounded-full glass border border-border/50">
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Navigation icons */}
        <div className="flex flex-col items-center gap-1 py-2 border-b border-border/30">
          <Button variant={activeTab === 'settings' ? 'secondary' : 'ghost'} size="icon" onClick={() => {
          setActiveTab('settings');
          setIsCollapsed(false);
        }} className="h-9 w-9" title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant={activeTab === 'theme' ? 'secondary' : 'ghost'} size="icon" onClick={() => {
          setActiveTab('theme');
          setIsCollapsed(false);
        }} className="h-9 w-9" title="Theme">
            <Palette className="h-4 w-4" />
          </Button>
          <Button variant={activeTab === 'history' ? 'secondary' : 'ghost'} size="icon" onClick={() => {
          setActiveTab('history');
          setIsCollapsed(false);
        }} className="h-9 w-9" title="History">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onUploadClick} className="h-9 w-9" title="Upload Data">
            <Upload className="h-4 w-4" />
          </Button>
        </div>

        {/* Collapsed state shows only icons */}
        {isCollapsed ? <div className="flex-1 flex flex-col items-center py-4 gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="h-9 w-9" title="Toggle theme">
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div> : <ScrollArea className="flex-1 px-3 py-3">
            {activeTab === 'settings' && <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Chart Settings
                </h3>

                {/* Node Alignment */}
                <div className="space-y-2">
                  <Label className="text-xs">Node Alignment</Label>
                  <div className="flex gap-1">
                    {alignOptions.map(opt => <Button key={opt.id} variant={settings.nodeAlign === opt.id ? 'secondary' : 'ghost'} size="sm" className="flex-1 text-xs h-7" onClick={() => onSettingsChange({
                ...settings,
                nodeAlign: opt.id as any
              })}>
                        {opt.label}
                      </Button>)}
                  </div>
                </div>

                {/* Link Opacity */}
                <div className="space-y-2">
                  <Label className="text-xs">Link Opacity: {Math.round(settings.linkOpacity * 100)}%</Label>
                  <Slider value={[settings.linkOpacity]} onValueChange={([val]) => onSettingsChange({
              ...settings,
              linkOpacity: val
            })} min={0.1} max={1} step={0.1} className="w-full" />
                </div>

                {/* Data Transparency Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Data Transparency</Label>
                    <p className="text-[10px] text-muted-foreground">Show confidence scores</p>
                  </div>
                  <Switch checked={settings.showConfidence ?? false} onCheckedChange={checked => onSettingsChange({
              ...settings,
              showConfidence: checked
            })} />
                </div>
              </div>}

            {activeTab === 'theme' && <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Color Theme
                </h3>

                {/* App Theme Toggle */}
                <div className="flex items-center justify-between p-2 rounded-lg glass">
                  <span className="text-xs font-medium">Dark Mode</span>
                  <Switch checked={resolvedTheme === 'dark'} onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')} />
                </div>

                {/* Chart Themes */}
                <div className="space-y-2">
                  {themes.map(t => <button key={t.id} onClick={() => onSettingsChange({
              ...settings,
              theme: t.id as any
            })} className={cn('w-full p-2 rounded-lg flex items-center gap-2 transition-all', settings.theme === t.id ? 'glass neon-glow-blue' : 'hover:bg-muted/50')}>
                      <div className="flex gap-0.5">
                        {t.colors.map((color, i) => <div key={i} className="w-3 h-3 rounded-full" style={{
                  backgroundColor: color
                }} />)}
                      </div>
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>)}
                </div>
              </div>}

            {activeTab === 'history' && <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Navigation History
                </h3>
                {history.length === 0 ? <p className="text-xs text-muted-foreground">No history yet</p> : <div className="space-y-1">
                    {history.map((entry, index) => <button key={index} onClick={() => onHistorySelect?.(index)} className="w-full text-left p-2 rounded-lg text-xs hover:bg-muted/50 transition-colors truncate">
                        {entry.label}
                      </button>)}
                  </div>}
              </div>}
          </ScrollArea>}
      </div>
    </div>;
};
export default CommandCenter;