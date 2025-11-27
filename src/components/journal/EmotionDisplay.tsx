import { EmotionAnalysis } from '@/types/journal';
import { emotionLabels, emotionEmojis, emotionColors } from '@/data/emotionData';
import { cn } from '@/lib/utils';
import { TrendingUp, AlertTriangle, Heart } from 'lucide-react';

interface EmotionDisplayProps {
  analysis: EmotionAnalysis;
}

export function EmotionDisplay({ analysis }: EmotionDisplayProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-soft animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Duygu Analizi</h3>
      </div>
      
      {/* Primary Emotion */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-4">
        <div className="text-4xl">{emotionEmojis[analysis.primaryEmotion]}</div>
        <div className="flex-1">
          <p className="font-medium text-foreground">
            Ana duygu: {emotionLabels[analysis.primaryEmotion]}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Yoğunluk:</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn('h-full rounded-full transition-all duration-500', emotionColors[analysis.primaryEmotion])}
                style={{ width: `${analysis.intensity * 10}%` }}
              />
            </div>
            <span className="text-sm font-medium text-foreground">{analysis.intensity}/10</span>
          </div>
        </div>
      </div>
      
      {/* Triggers */}
      {analysis.triggers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Tetikleyiciler</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.triggers.map((trigger, i) => (
              <span 
                key={i}
                className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
              >
                {trigger}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
