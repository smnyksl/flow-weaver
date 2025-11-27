import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';

interface FlowConnectorProps {
  index: number;
  label?: string;
}

export function FlowConnector({ index, label }: FlowConnectorProps) {
  return (
    <div 
      className="flex flex-col items-center py-2 animate-fade-in"
      style={{ animationDelay: `${index * 100 + 50}ms` }}
    >
      <div className="w-0.5 h-6 bg-gradient-to-b from-primary/60 to-connector-secondary/60 rounded-full" />
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
        <ArrowDown className="w-4 h-4 text-primary animate-pulse-flow" />
      </div>
      {label && (
        <span className="mt-1 text-xs text-muted-foreground">{label}</span>
      )}
      <div className="w-0.5 h-6 bg-gradient-to-b from-connector-secondary/60 to-primary/60 rounded-full" />
    </div>
  );
}
