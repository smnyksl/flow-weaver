import { FlowNode as FlowNodeType } from '@/types/flowchart';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Settings, 
  Brain, 
  Lightbulb, 
  Save, 
  Bell, 
  Cloud,
  Circle,
  Square,
  Diamond
} from 'lucide-react';

interface FlowNodeProps {
  node: FlowNodeType;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

const nodeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  N1: FileText,
  N2: Settings,
  N3: Brain,
  N4: Lightbulb,
  N5: Save,
  N6: Bell,
  N7: Cloud,
};

const typeStyles = {
  start: 'border-l-4 border-l-accent',
  action: 'border-l-4 border-l-primary',
  process: 'border-l-4 border-l-connector-secondary',
  decision: 'border-l-4 border-l-amber-500',
  end: 'border-l-4 border-l-primary',
  parallel: 'border-l-4 border-l-violet-500',
};

export function FlowNode({ node, index, isSelected, onClick }: FlowNodeProps) {
  const Icon = nodeIcons[node.id] || Circle;
  
  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left transition-all duration-300 ease-out',
          'bg-card rounded-lg p-5',
          'border border-border hover:border-primary/50',
          'shadow-soft hover:shadow-node-hover',
          typeStyles[node.type],
          isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background border-primary'
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
            'bg-gradient-to-br from-primary/10 to-accent/10',
            isSelected && 'from-primary/20 to-accent/20'
          )}>
            <Icon className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight">
              {node.text}
            </h3>
            
            {node.description && node.description.length > 0 && (
              <ul className="mt-2 space-y-1">
                {node.description.map((desc, i) => (
                  <li 
                    key={i} 
                    className="text-xs text-muted-foreground flex items-start gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50 mt-1.5 flex-shrink-0" />
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
            'text-xs font-medium',
            'bg-muted text-muted-foreground'
          )}>
            {index + 1}
          </div>
        </div>
      </button>
    </div>
  );
}
