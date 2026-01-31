import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Loader2, RefreshCw, AlertTriangle, Clock, Eye, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import FlowThumbnail from '@/components/FlowThumbnail';
import type { SankeyData } from '@/types/sankey';

interface PendingUpdate {
  id: string;
  flow_id: string;
  old_data: SankeyData;
  new_data: SankeyData;
  old_total_value: number;
  new_total_value: number;
  change_percent: number;
  status: 'pending' | 'manual_review' | 'approved' | 'discarded';
  created_at: string;
  reviewed_at: string | null;
  user_flows: {
    id: string;
    title: string;
    query: string;
  };
}

interface SystemLog {
  id: string;
  function_name: string;
  flow_id: string | null;
  level: 'info' | 'warn' | 'error';
  message: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

const AdminPendingUpdates = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminCheck();
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<PendingUpdate | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    try {
      // Fetch pending updates with flow info
      const { data: updates, error: updatesError } = await supabase
        .from('pending_updates')
        .select('*, user_flows(id, title, query)')
        .in('status', ['pending', 'manual_review'])
        .order('created_at', { ascending: false });

      if (updatesError) throw updatesError;

      // Fetch recent system logs
      const { data: logs, error: logsError } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Cast with unknown first for type safety
      setPendingUpdates((updates || []) as unknown as PendingUpdate[]);
      setSystemLogs((logs || []) as unknown as SystemLog[]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleAction = async (updateId: string, action: 'approve' | 'discard') => {
    setProcessingId(updateId);
    try {
      const { data, error } = await supabase.functions.invoke('approve-pending-update', {
        body: { updateId, action },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Action failed');

      toast.success(action === 'approve' ? 'Flow updated successfully' : 'Update discarded');
      
      // Remove from list
      setPendingUpdates((prev) => prev.filter((u) => u.id !== updateId));
      setSelectedUpdate(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Action failed';
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('cron-refresh-gallery');

      if (error) throw new Error(error.message);

      toast.success(`Refresh complete: ${data?.processed || 0} flows processed`);
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Refresh failed';
      toast.error(errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'manual_review':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Review Required</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warn':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Warning</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const pendingCount = pendingUpdates.filter((u) => u.status === 'pending').length;
  const reviewCount = pendingUpdates.filter((u) => u.status === 'manual_review').length;
  const errorCount = systemLogs.filter((l) => l.level === 'error').length;

  // Show loading state while checking admin status
  if (isCheckingAdmin) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Verifying admin access...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show access denied if not admin
  if (!user || !isAdmin) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <ShieldAlert className="w-16 h-16 text-destructive/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Access Denied</h3>
            <p className="text-muted-foreground max-w-md">
              {!user 
                ? 'Please sign in to access admin features.'
                : 'You do not have admin privileges. Contact a site administrator to request access.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-2xl">Auto-Pilot Engine</CardTitle>
              <CardDescription>
                Manage scheduled data refreshes and pending updates
              </CardDescription>
            </div>
          </div>
          <Button onClick={triggerRefresh} disabled={isRefreshing} className="gap-2">
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Trigger Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              Pending Updates
              {pendingCount + reviewCount > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingCount + reviewCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              System Logs
              {errorCount > 0 && (
                <Badge variant="destructive" className="ml-1">{errorCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : pendingUpdates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending updates</p>
                <p className="text-sm mt-1">Trigger a refresh to check for stale flows</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Updates List */}
                <ScrollArea className="h-[500px] rounded-lg border border-border/50 p-4">
                  <div className="space-y-3">
                    {pendingUpdates.map((update) => (
                      <div
                        key={update.id}
                        onClick={() => setSelectedUpdate(update)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedUpdate?.id === update.id
                            ? 'bg-primary/10 border-primary/50'
                            : 'bg-muted/30 border-border/30 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{update.user_flows?.title || 'Unknown Flow'}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {update.change_percent.toFixed(1)}% change
                            </p>
                          </div>
                          {getStatusBadge(update.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(update.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Comparison View */}
                <div className="space-y-4">
                  {selectedUpdate ? (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{selectedUpdate.user_flows?.title}</h3>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(selectedUpdate.id, 'discard')}
                            disabled={processingId === selectedUpdate.id}
                          >
                            {processingId === selectedUpdate.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Discard
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAction(selectedUpdate.id, 'approve')}
                            disabled={processingId === selectedUpdate.id}
                          >
                            {processingId === selectedUpdate.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Approve & Publish
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Current Data</p>
                          <div className="rounded-lg border border-border/50 p-2 bg-muted/20 aspect-video">
                            <FlowThumbnail data={selectedUpdate.old_data} />
                          </div>
                          <p className="text-xs text-muted-foreground text-center">
                            Total: {selectedUpdate.old_total_value.toLocaleString()} {selectedUpdate.old_data.unit || 'units'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">New Data</p>
                          <div className="rounded-lg border border-primary/30 p-2 bg-primary/5 aspect-video">
                            <FlowThumbnail data={selectedUpdate.new_data} />
                          </div>
                          <p className="text-xs text-muted-foreground text-center">
                            Total: {selectedUpdate.new_total_value.toLocaleString()} {selectedUpdate.new_data.unit || 'units'}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                        <div className="flex items-center gap-2">
                          {selectedUpdate.change_percent > 20 ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">
                            <strong>{selectedUpdate.change_percent.toFixed(1)}%</strong> change in total value
                            {selectedUpdate.change_percent > 20 && (
                              <span className="text-amber-400 ml-2">— Flagged for manual review</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      <div className="text-center">
                        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Select an update to compare</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : systemLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No system logs</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px] rounded-lg border border-border/50">
                <div className="divide-y divide-border/30">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getLevelBadge(log.level)}
                            <span className="text-sm font-medium">{log.function_name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{log.message}</p>
                          {log.details && (
                            <pre className="mt-2 text-xs bg-muted/30 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminPendingUpdates;
