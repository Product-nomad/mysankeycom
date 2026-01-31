import { GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Header = () => {
  return <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">MySankey</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          
          
        </nav>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-sm font-medium">
            Sign In
          </Button>
          <Button className="gradient-hero text-primary-foreground text-sm font-medium">
            Get Started
          </Button>
        </div>
      </div>
    </header>;
};
export default Header;