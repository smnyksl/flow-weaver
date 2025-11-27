import { Suggestion } from '@/types/journal';
import { SuggestionCard } from './SuggestionCard';
import { Lightbulb } from 'lucide-react';

interface SuggestionListProps {
  suggestions: Suggestion[];
}

export function SuggestionList({ suggestions }: SuggestionListProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-soft animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-foreground">Öneriler</h3>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <SuggestionCard key={index} suggestion={suggestion} index={index} />
        ))}
      </div>
    </div>
  );
}
