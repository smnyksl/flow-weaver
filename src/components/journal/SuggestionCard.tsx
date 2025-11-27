import { Suggestion } from '@/types/journal';
import { cn } from '@/lib/utils';
import { Wind, Activity, Sparkles } from 'lucide-react';

interface SuggestionCardProps {
  suggestion: Suggestion;
  index: number;
}

const typeIcons = {
  breathing: Wind,
  activity: Activity,
  motivation: Sparkles,
};

const typeColors = {
  breathing: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  activity: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  motivation: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
};

const typeLabels = {
  breathing: 'Nefes',
  activity: 'Aktivite',
  motivation: 'Motivasyon',
};

export function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  const Icon = typeIcons[suggestion.type];
  
  return (
    <div 
      className="bg-card rounded-lg border border-border p-4 shadow-soft hover:shadow-node transition-shadow animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center border',
          typeColors[suggestion.type]
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full border',
              typeColors[suggestion.type]
            )}>
              {typeLabels[suggestion.type]}
            </span>
          </div>
          <h4 className="font-medium text-foreground">{suggestion.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
        </div>
      </div>
    </div>
  );
}
