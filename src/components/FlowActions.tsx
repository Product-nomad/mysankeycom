import { useState } from 'react';
import { Save, Share2, Download, Copy, Image, FileCode, Check, Loader2, LogIn } from 'lucide-react';
import ShareDropdown from '@/components/ShareDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { SankeyData, ChartSettings } from '@/types/sankey';
import { useNavigate } from 'react-router-dom';

interface FlowActionsProps {
  data: SankeyData | null;
  currentQuery: string;
  breadcrumbs: string[];
  settings: ChartSettings;
  chartRef: React.RefObject<any>;
}

const FlowActions = ({ data, currentQuery, breadcrumbs, settings, chartRef }: FlowActionsProps) => {
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const handleSave = async () => {
    if (!user || !data) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from('user_flows').insert([{
        user_id: user.id,
        title: title || currentQuery,
        description,
        query: currentQuery,
        data: JSON.parse(JSON.stringify(data)),
        breadcrumbs: JSON.parse(JSON.stringify(breadcrumbs)),
        settings: JSON.parse(JSON.stringify(settings)),
        is_public: false,
      }]);

      if (error) throw error;

      toast({
        title: 'Flow saved!',
        description: 'Your diagram has been saved to your account.',
      });
      setIsSaveOpen(false);
      setTitle('');
      setDescription('');
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!user || !data) return;

    setIsSharing(true);
    try {
      const slug = generateSlug();
      const { error } = await supabase.from('user_flows').insert([{
        user_id: user.id,
        title: title || currentQuery,
        description,
        query: currentQuery,
        data: JSON.parse(JSON.stringify(data)),
        breadcrumbs: JSON.parse(JSON.stringify(breadcrumbs)),
        settings: JSON.parse(JSON.stringify(settings)),
        is_public: true,
        share_slug: slug,
      }]);

      if (error) throw error;

      const url = `${window.location.origin}/flow/${slug}`;
      setShareUrl(url);

      toast({
        title: 'Share link created!',
        description: 'Anyone with the link can view this diagram.',
      });
    } catch (error: any) {
      toast({
        title: 'Share failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportPNG = () => {
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    const url = chart.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff',
    });

    const link = document.createElement('a');
    link.download = `${currentQuery || 'sankey'}.png`;
    link.href = url;
    link.click();

    toast({ title: 'Exported as PNG' });
  };

  const exportSVG = () => {
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    const url = chart.getDataURL({
      type: 'svg',
    });

    const link = document.createElement('a');
    link.download = `${currentQuery || 'sankey'}.svg`;
    link.href = url;
    link.click();

    toast({ title: 'Exported as SVG' });
  };

  const copyJSON = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast({ title: 'JSON copied to clipboard' });
  };

  if (!data) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Save Button */}
      {user ? (
        <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Flow</DialogTitle>
              <DialogDescription>
                Save this diagram to your account for later access.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={currentQuery}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSaveOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
          <LogIn className="w-4 h-4 mr-2" />
          Sign in to Save
        </Button>
      )}

      {/* Share Button */}
      {user ? (
        <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Flow</DialogTitle>
              <DialogDescription>
                Generate a public link that anyone can view.
              </DialogDescription>
            </DialogHeader>
            {!shareUrl ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="share-title">Title</Label>
                    <Input
                      id="share-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={currentQuery}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsShareOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleShare} disabled={isSharing}>
                    {isSharing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                    Create Link
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input value={shareUrl} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(shareUrl)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setIsShareOpen(false);
                    setShareUrl('');
                    setTitle('');
                  }}
                >
                  Done
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      ) : null}

      {/* Social Share Dropdown */}
      <ShareDropdown title={`Sankey Diagram: ${currentQuery}`} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={exportPNG}>
            <Image className="w-4 h-4 mr-2" />
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportSVG}>
            <FileCode className="w-4 h-4 mr-2" />
            Export as SVG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyJSON}>
            <Copy className="w-4 h-4 mr-2" />
            Copy JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FlowActions;
