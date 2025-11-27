import { FlowNode } from '@/types/flowchart';
import { cn } from '@/lib/utils';
import { X, Info, Tag, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NodeDetailPanelProps {
  node: FlowNode | null;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  start: 'Başlangıç',
  action: 'Aksiyon',
  process: 'İşlem',
  decision: 'Karar',
  end: 'Bitiş',
  parallel: 'Paralel',
};

const typeColors: Record<string, string> = {
  start: 'bg-accent/10 text-accent',
  action: 'bg-primary/10 text-primary',
  process: 'bg-connector-secondary/10 text-connector-secondary',
  decision: 'bg-amber-500/10 text-amber-600',
  end: 'bg-primary/10 text-primary',
  parallel: 'bg-violet-500/10 text-violet-600',
};

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Info className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">
          Detayları görmek için bir düğüme tıklayın
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-foreground leading-tight">
            {node.text}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mt-3 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            typeColors[node.type]
          )}>
            {typeLabels[node.type]}
          </span>
          <span className="text-xs text-muted-foreground">
            ID: {node.id}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {node.description && node.description.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Detaylar</span>
            </div>
            <ul className="space-y-2">
              {node.description.map((desc, i) => (
                <li 
                  key={i}
                  className="flex items-start gap-3 p-2 rounded-md bg-muted/50"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
