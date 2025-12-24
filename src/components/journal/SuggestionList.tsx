import { Suggestion } from '@/types/journal';
import { SuggestionCard } from './SuggestionCard';
import { Sparkles, Stars } from 'lucide-react';

interface SuggestionListProps {
  suggestions: Suggestion[];
}

export function SuggestionList({ suggestions }: SuggestionListProps) {
  return (
    <div className="relative bg-gradient-to-br from-card via-card to-accent/5 rounded-2xl border border-border/50 p-6 shadow-lg animate-fade-in overflow-hidden">
      {/* Decorative background stars */}
      <div className="absolute top-4 right-4 opacity-20">
        <Stars className="w-16 h-16 text-accent" />
      </div>
      
      {/* Header with emoji */}
      <div className="relative flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            Sana Özel Öneriler 
            <span className="text-xl">💫</span>
          </h3>
          <p className="text-xs text-muted-foreground">Duygularına göre hazırlandı</p>
        </div>
      </div>
      
      {/* Suggestion cards */}
      <div className="relative space-y-4">
        {suggestions.map((suggestion, index) => (
          <SuggestionCard key={index} suggestion={suggestion} index={index} />
        ))}
      </div>
    </div>
  );
}
