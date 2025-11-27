import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { JournalEntry } from '@/types/journal';
import { emotionLabels, emotionEmojis } from '@/data/emotionData';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, Heart } from 'lucide-react';

interface EntryDetailModalProps {
  entry: JournalEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Calculate happiness level based on emotion (same logic as EmotionDisplay)
const calculateHappinessLevel = (emotion: string, intensity: number): number => {
  const positiveEmotions = ['happy', 'excited', 'calm'];
  const negativeEmotions = ['sad', 'anxious', 'angry'];
  
  if (positiveEmotions.includes(emotion)) {
    return intensity;
  } else if (negativeEmotions.includes(emotion)) {
    return Math.max(1, 11 - intensity);
  }
  return 5;
};

export function EntryDetailModal({ entry, open, onOpenChange }: EntryDetailModalProps) {
  if (!entry) return null;

  const happinessLevel = entry.emotion 
    ? calculateHappinessLevel(entry.emotion.primaryEmotion, entry.emotion.intensity)
    : 5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {format(new Date(entry.createdAt), "d MMMM yyyy, HH:mm", { locale: tr })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Emotion Display */}
          {entry.emotion && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{emotionEmojis[entry.emotion.primaryEmotion]}</span>
                <div>
                  <p className="font-medium text-foreground">
                    {emotionLabels[entry.emotion.primaryEmotion]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Yoğunluk: {entry.emotion.intensity}/10
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="font-semibold text-foreground">%{happinessLevel * 10}</span>
              </div>
            </div>
          )}

          {/* Entry Content */}
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {entry.content}
            </p>
          </div>

          {/* Triggers */}
          {entry.emotion?.triggers && entry.emotion.triggers.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Tetikleyiciler:</p>
              <div className="flex flex-wrap gap-2">
                {entry.emotion.triggers.map((trigger, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
