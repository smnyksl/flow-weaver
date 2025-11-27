import { JournalEntry, Emotion } from '@/types/journal';
import { emotionLabels, emotionEmojis, emotionColors } from '@/data/emotionData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BarChart3, TrendingUp, Calendar, Heart } from 'lucide-react';

interface StatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: JournalEntry[];
}

export function StatsModal({ open, onOpenChange, entries }: StatsModalProps) {
  // Calculate emotion counts
  const emotionCounts: Record<Emotion, number> = {
    happy: 0,
    sad: 0,
    anxious: 0,
    angry: 0,
    neutral: 0,
    excited: 0,
    calm: 0,
  };

  entries.forEach(entry => {
    if (entry.emotion) {
      emotionCounts[entry.emotion.primaryEmotion]++;
    }
  });

  // Find most common emotion
  const sortedEmotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);

  const mostCommon = sortedEmotions[0];
  const totalEntries = entries.length;

  // Calculate average intensity
  const avgIntensity = entries.length > 0
    ? entries.reduce((sum, e) => sum + (e.emotion?.intensity || 0), 0) / entries.length
    : 0;

  // Get all triggers
  const allTriggers: Record<string, number> = {};
  entries.forEach(entry => {
    entry.emotion?.triggers.forEach(trigger => {
      allTriggers[trigger] = (allTriggers[trigger] || 0) + 1;
    });
  });
  const topTriggers = Object.entries(allTriggers)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Duygu İstatistikleri
          </DialogTitle>
        </DialogHeader>

        {totalEntries === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Henüz yeterli veri yok. Günlük yazmaya devam et!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Toplam Giriş</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{totalEntries}</p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Ort. Yoğunluk</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{avgIntensity.toFixed(1)}/10</p>
              </div>
            </div>

            {/* Most Common Emotion */}
            {mostCommon && (
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">En Sık Hissedilen Duygu</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{emotionEmojis[mostCommon[0] as Emotion]}</span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {emotionLabels[mostCommon[0] as Emotion]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {mostCommon[1]} kez ({Math.round((mostCommon[1] / totalEntries) * 100)}%)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Emotion Distribution */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Duygu Dağılımı</p>
              <div className="space-y-2">
                {sortedEmotions.map(([emotion, count]) => (
                  <div key={emotion} className="flex items-center gap-3">
                    <span className="text-lg w-6">{emotionEmojis[emotion as Emotion]}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground">
                          {emotionLabels[emotion as Emotion]}
                        </span>
                        <span className="text-xs text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${emotionColors[emotion as Emotion]}`}
                          style={{ width: `${(count / totalEntries) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Triggers */}
            {topTriggers.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Sık Tetikleyiciler</p>
                <div className="flex flex-wrap gap-2">
                  {topTriggers.map(([trigger, count]) => (
                    <span
                      key={trigger}
                      className="px-3 py-1 text-sm bg-accent/10 text-accent rounded-full"
                    >
                      {trigger} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
