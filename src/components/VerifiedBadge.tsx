import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  className?: string;
}

const VerifiedBadge = ({ className }: VerifiedBadgeProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={`bg-primary/10 text-primary border-primary/30 gap-1 ${className}`}
        >
          <CheckCircle className="w-3 h-3" />
          Verified by MySankey
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs max-w-[200px]">
          This flow has been generated with enhanced verification: 2026 baseline data, 
          cited sources, and editorial review.
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

export default VerifiedBadge;
