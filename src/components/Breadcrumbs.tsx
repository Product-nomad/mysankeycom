import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface BreadcrumbsProps {
  items: string[];
  onNavigate: (index: number) => void;
  onBack: () => void;
  canGoBack: boolean;
}
const Breadcrumbs = ({
  items,
  onNavigate,
  onBack,
  canGoBack
}: BreadcrumbsProps) => {
  if (items.length === 0) return null;
  return <div className="flex items-center gap-3 mb-6">
      {canGoBack && <Button variant="outline" size="sm" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>}
      
      <nav className="flex items-center gap-1 text-sm">
        {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isHome = index === 0;
        return <div key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground/50" />}
              
            </div>;
      })}
      </nav>
    </div>;
};
export default Breadcrumbs;