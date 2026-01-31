import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { PublicFlow } from '@/pages/Explore';
import FlowThumbnail from './FlowThumbnail';

interface FlowCardProps {
  flow: PublicFlow;
}

const FlowCard = ({ flow }: FlowCardProps) => {
  const formattedDate = new Date(flow.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link to={`/flow/${flow.share_slug}`} className="group block">
      <Card className="h-full overflow-hidden border-border/50 bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300">
        {/* Thumbnail */}
        <div className="aspect-video bg-muted/50 relative overflow-hidden">
          <FlowThumbnail data={flow.data} settings={flow.settings} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              View <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {flow.title}
          </h3>
          
          {flow.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {flow.description}
            </p>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>Updated {formattedDate}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default FlowCard;
