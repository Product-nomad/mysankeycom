import { useState } from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

const SearchBar = ({ onSearch, isLoading = false }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch?.(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-0 gradient-hero rounded-xl opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
        <div className="relative flex items-center bg-card border border-border/50 rounded-xl shadow-soft group-focus-within:shadow-glow transition-all duration-300">
          <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a company, country, or topic to visualize flow..."
            className="border-0 bg-transparent pl-12 pr-32 py-6 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isLoading}
          />
          <Button 
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 gradient-hero text-primary-foreground font-medium px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Visualize
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
