import { ArrowRight, Drill, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';

interface LinkContext {
  source: string;
  target: string;
  value: number;
  unit?: string;
  confidence?: 'verified' | 'estimated' | 'projected';
}

interface NodeContext {
  name: string;
  totalValue: number;
  unit?: string;
  incomingCount: number;
  outgoingCount: number;
}

interface MobileContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onDrillDown: (nodeName: string) => void;
  linkContext?: LinkContext | null;
  nodeContext?: NodeContext | null;
}

const formatValue = (value: number, unit?: string) => {
  let formatted: string;
  if (value >= 1000000000) {
    formatted = `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    formatted = `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    formatted = `${(value / 1000).toFixed(1)}K`;
  } else {
    formatted = value.toLocaleString();
  }
  return unit ? `${formatted} ${unit}` : formatted;
};

const getConfidenceLabel = (confidence?: string) => {
  switch (confidence) {
    case 'verified':
      return { label: 'Verified', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    case 'estimated':
      return { label: 'Estimated', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    case 'projected':
      return { label: 'Projected', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    default:
      return null;
  }
};

const MobileContextDrawer = ({
  isOpen,
  onClose,
  onDrillDown,
  linkContext,
  nodeContext,
}: MobileContextDrawerProps) => {
  const handleDrillDown = (nodeName: string) => {
    onDrillDown(nodeName);
    onClose();
  };

  // Link view (flow between two nodes)
  if (linkContext) {
    const confidence = getConfidenceLabel(linkContext.confidence);

    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[70vh]">
          <DrawerHeader className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">Flow</Badge>
              {confidence && (
                <Badge variant="outline" className={`text-xs ${confidence.color}`}>
                  {confidence.label}
                </Badge>
              )}
            </div>
            <DrawerTitle className="text-xl">
              {linkContext.source} → {linkContext.target}
            </DrawerTitle>
            <DrawerDescription>
              Flow value: <strong>{formatValue(linkContext.value, linkContext.unit)}</strong>
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 py-2">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="text-center flex-1">
                <p className="text-sm text-muted-foreground mb-1">Source</p>
                <p className="font-medium">{linkContext.source}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground mx-4" />
              <div className="text-center flex-1">
                <p className="text-sm text-muted-foreground mb-1">Target</p>
                <p className="font-medium">{linkContext.target}</p>
              </div>
            </div>
          </div>

          <DrawerFooter className="pt-2">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleDrillDown(linkContext.source)}
                variant="outline"
                className="min-h-[44px]"
              >
                <Drill className="w-4 h-4 mr-2" />
                Explore {linkContext.source.length > 10 ? `${linkContext.source.slice(0, 10)}...` : linkContext.source}
              </Button>
              <Button
                onClick={() => handleDrillDown(linkContext.target)}
                className="min-h-[44px]"
              >
                <Drill className="w-4 h-4 mr-2" />
                Explore {linkContext.target.length > 10 ? `${linkContext.target.slice(0, 10)}...` : linkContext.target}
              </Button>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" className="min-h-[44px]">
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Node view
  if (nodeContext) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[70vh]">
          <DrawerHeader className="text-left">
            <Badge variant="secondary" className="text-xs w-fit mb-1">Node</Badge>
            <DrawerTitle className="text-xl">{nodeContext.name}</DrawerTitle>
            <DrawerDescription>
              Total value: <strong>{formatValue(nodeContext.totalValue, nodeContext.unit)}</strong>
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
                <p className="text-2xl font-bold text-primary">{nodeContext.incomingCount}</p>
                <p className="text-sm text-muted-foreground">Incoming flows</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
                <p className="text-2xl font-bold text-accent">{nodeContext.outgoingCount}</p>
                <p className="text-sm text-muted-foreground">Outgoing flows</p>
              </div>
            </div>
          </div>

          <DrawerFooter className="pt-2">
            <Button
              onClick={() => handleDrillDown(nodeContext.name)}
              className="min-h-[44px]"
            >
              <Drill className="w-4 h-4 mr-2" />
              Drill Deeper into {nodeContext.name.length > 15 ? `${nodeContext.name.slice(0, 15)}...` : nodeContext.name}
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="min-h-[44px]">
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return null;
};

export default MobileContextDrawer;
