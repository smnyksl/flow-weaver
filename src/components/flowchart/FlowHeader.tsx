import { FlowDiagram } from '@/types/flowchart';
import { Button } from '@/components/ui/button';
import { Download, Share2, Workflow } from 'lucide-react';
import { toast } from 'sonner';

interface FlowHeaderProps {
  diagram: FlowDiagram;
}

export function FlowHeader({ diagram }: FlowHeaderProps) {
  const handleExportJSON = () => {
    const json = JSON.stringify(diagram, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagram.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON dışa aktarıldı!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link panoya kopyalandı!');
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flow-gradient flex items-center justify-center">
              <Workflow className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {diagram.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {diagram.nodes.length} düğüm · {diagram.edges.length} bağlantı
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Paylaş
            </Button>
            <Button size="sm" onClick={handleExportJSON}>
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
