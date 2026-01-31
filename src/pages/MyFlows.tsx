import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, Share2, Lock, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { SankeyData } from '@/types/sankey';

interface UserFlow {
  id: string;
  title: string;
  description: string | null;
  query: string;
  data: SankeyData;
  is_public: boolean;
  share_slug: string | null;
  created_at: string;
  updated_at: string;
}

const MyFlows = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [flows, setFlows] = useState<UserFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFlows();
    }
  }, [user]);

  const fetchFlows = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_flows')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setFlows((data || []) as unknown as UserFlow[]);
    } catch (error: any) {
      toast({
        title: 'Failed to load flows',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_flows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFlows((prev) => prev.filter((f) => f.id !== id));
      toast({ title: 'Flow deleted' });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleView = (flow: UserFlow) => {
    if (flow.share_slug) {
      navigate(`/flow/${flow.share_slug}`);
    } else {
      // Navigate to home with the flow data loaded
      navigate(`/?q=${encodeURIComponent(flow.query)}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Flows</h1>
            <p className="text-muted-foreground">
              Manage your saved Sankey diagrams
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : flows.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't saved any flows yet.
                </p>
                <Button onClick={() => navigate('/')}>
                  Create Your First Flow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {flows.map((flow) => (
                <Card key={flow.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {flow.title}
                        </CardTitle>
                        {flow.description && (
                          <CardDescription className="mt-1 line-clamp-2">
                            {flow.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge
                        variant={flow.is_public ? 'default' : 'secondary'}
                        className="ml-2 shrink-0"
                      >
                        {flow.is_public ? (
                          <>
                            <Globe className="w-3 h-3 mr-1" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Private
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <span>Query: </span>
                        <span className="font-medium text-foreground">
                          {flow.query}
                        </span>
                        <span className="mx-2">•</span>
                        <span>Updated {formatDate(flow.updated_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(flow)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {flow.is_public && flow.share_slug && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/flow/${flow.share_slug}`
                              );
                              toast({ title: 'Link copied!' });
                            }}
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Copy Link
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Flow</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{flow.title}"?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(flow.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyFlows;
