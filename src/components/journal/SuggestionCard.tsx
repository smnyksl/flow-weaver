import { Suggestion } from '@/types/journal';
import { cn } from '@/lib/utils';
import { Wind, Activity, Sparkles, Heart } from 'lucide-react';

interface SuggestionCardProps {
  suggestion: Suggestion;
  index: number;
}

const typeIcons = {
  breathing: Wind,
  activity: Activity,
  motivation: Sparkles,
};

const typeEmojis = {
  breathing: '🌬️',
  activity: '🎯',
  motivation: '✨',
};

const typeGradients = {
  breathing: 'from-teal-500/20 via-cyan-500/10 to-emerald-500/20',
  activity: 'from-orange-500/20 via-amber-500/10 to-yellow-500/20',
  motivation: 'from-violet-500/20 via-purple-500/10 to-pink-500/20',
};

const typeAccents = {
  breathing: 'bg-gradient-to-br from-teal-500 to-cyan-500',
  activity: 'bg-gradient-to-br from-orange-500 to-amber-500',
  motivation: 'bg-gradient-to-br from-violet-500 to-purple-500',
};

const typeBorders = {
  breathing: 'border-teal-500/30 hover:border-teal-500/50',
  activity: 'border-orange-500/30 hover:border-orange-500/50',
  motivation: 'border-violet-500/30 hover:border-violet-500/50',
};

const typeLabels = {
  breathing: 'Nefes',
  activity: 'Aktivite',
  motivation: 'Motivasyon',
};

const typeLabelColors = {
  breathing: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
  activity: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
  motivation: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
};

export function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  const Icon = typeIcons[suggestion.type];
  
  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-xl border-2 p-5 transition-all duration-300',
        'bg-gradient-to-br hover:scale-[1.02] hover:shadow-lg',
        'animate-fade-in cursor-default',
        typeGradients[suggestion.type],
        typeBorders[suggestion.type]
      )}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Decorative background element */}
      <div className="absolute -right-4 -top-4 opacity-10">
        <Icon className="w-24 h-24" />
      </div>
      
      <div className="relative flex items-start gap-4">
        {/* Icon with gradient background */}
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center shadow-md',
          'transform transition-transform duration-300 hover:rotate-6',
          typeAccents[suggestion.type]
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Type label with emoji */}
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border',
              typeLabelColors[suggestion.type]
            )}>
              <span>{typeEmojis[suggestion.type]}</span>
              {typeLabels[suggestion.type]}
            </span>
          </div>
          
          {/* Title */}
          <h4 className="font-semibold text-foreground text-base leading-snug mb-1.5">
            {suggestion.title}
          </h4>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {suggestion.description}
          </p>
        </div>
        
        {/* Heart icon for extra warmth */}
        <Heart className="w-4 h-4 text-pink-400/50 flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}
