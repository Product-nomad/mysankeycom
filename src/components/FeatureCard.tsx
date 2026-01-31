import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
interface FeatureCardProps {
  title: string;
  description: string;
  category: string;
  nodes: number;
  gradient?: string;
}
const FeatureCard = ({
  title,
  description,
  category,
  nodes,
  gradient
}: FeatureCardProps) => {
  return <Card className="group cursor-pointer overflow-hidden border-border/50 bg-card shadow-card transition-all duration-300 hover:shadow-soft hover:-translate-y-1">
      
      <CardContent className="p-5">
        <Badge variant="secondary" className="mb-3 text-xs font-medium">
          {category}
        </Badge>
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {nodes} nodes
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Explore
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </CardContent>
    </Card>;
};
export default FeatureCard;