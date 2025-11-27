import { useState } from 'react';
import { JournalEntry, Emotion } from '@/types/journal';
import { emotionLabels, emotionEmojis, emotionColors } from '@/data/emotionData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, TrendingUp, Calendar, Heart, Flame, 
  Clock, Target, Sparkles, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth, differenceInDays, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface StatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: JournalEntry[];
}

export function StatsModal({ open, onOpenChange, entries }: StatsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate emotion counts
  const emotionCounts: Record<Emotion, number> = {
    happy: 0, sad: 0, anxious: 0, angry: 0, neutral: 0, excited: 0, calm: 0,
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

  // Time-based filtering
  const todayEntries = entries.filter(e => isToday(e.createdAt));
  const weekEntries = entries.filter(e => isThisWeek(e.createdAt, { weekStartsOn: 1 }));
  const monthEntries = entries.filter(e => isThisMonth(e.createdAt));

  // Calculate streak
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    
    const sortedDates = [...entries]
      .map(e => startOfDay(e.createdAt).getTime())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => b - a);

    if (sortedDates.length === 0) return 0;
    
    const today = startOfDay(new Date()).getTime();
    const yesterday = today - 86400000;
    
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;
    
    let streak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const diff = sortedDates[i] - sortedDates[i + 1];
      if (diff === 86400000) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

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

  // Mood trend (comparing this week vs last week average intensity)
  const thisWeekAvg = weekEntries.length > 0
    ? weekEntries.reduce((sum, e) => sum + (e.emotion?.intensity || 0), 0) / weekEntries.length
    : 0;
  
  const lastWeekEntries = entries.filter(e => {
    const date = e.createdAt;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    return date >= twoWeeksAgo && date < weekAgo;
  });
  
  const lastWeekAvg = lastWeekEntries.length > 0
    ? lastWeekEntries.reduce((sum, e) => sum + (e.emotion?.intensity || 0), 0) / lastWeekEntries.length
    : 0;

  const moodTrend = thisWeekAvg - lastWeekAvg;

  // Positive vs negative emotions
  const positiveEmotions: Emotion[] = ['happy', 'excited', 'calm'];
  const negativeEmotions: Emotion[] = ['sad', 'anxious', 'angry'];
  
  const positiveCount = entries.filter(e => 
    e.emotion && positiveEmotions.includes(e.emotion.primaryEmotion)
  ).length;
  const negativeCount = entries.filter(e => 
    e.emotion && negativeEmotions.includes(e.emotion.primaryEmotion)
  ).length;

  // Last 7 days activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: startOfDay(date),
      count: entries.filter(e => 
        startOfDay(e.createdAt).getTime() === startOfDay(date).getTime()
      ).length
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Genel</TabsTrigger>
              <TabsTrigger value="emotions">Duygular</TabsTrigger>
              <TabsTrigger value="insights">Analizler</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Seri</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{streak} gün</p>
                  <p className="text-xs text-muted-foreground">Günlük yazma serisi</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Toplam</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{totalEntries}</p>
                  <p className="text-xs text-muted-foreground">Günlük girişi</p>
                </div>
              </div>

              {/* Period Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{todayEntries.length}</p>
                  <p className="text-xs text-muted-foreground">Bugün</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{weekEntries.length}</p>
                  <p className="text-xs text-muted-foreground">Bu Hafta</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{monthEntries.length}</p>
                  <p className="text-xs text-muted-foreground">Bu Ay</p>
                </div>
              </div>

              {/* Last 7 Days Activity */}
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-3">Son 7 Gün</p>
                <div className="flex items-end justify-between gap-1 h-16">
                  {last7Days.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className={cn(
                          "w-full rounded-t transition-all",
                          day.count > 0 ? "bg-primary" : "bg-muted"
                        )}
                        style={{ height: `${Math.max(day.count * 20, 4)}px` }}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {format(day.date, 'EEE', { locale: tr }).slice(0, 2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mood Trend */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Haftalık Trend</p>
                    <p className="text-xs text-muted-foreground">Geçen haftaya göre</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                    moodTrend > 0.5 ? "bg-green-500/10 text-green-600" :
                    moodTrend < -0.5 ? "bg-red-500/10 text-red-600" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {moodTrend > 0.5 ? <ArrowUp className="w-4 h-4" /> :
                     moodTrend < -0.5 ? <ArrowDown className="w-4 h-4" /> :
                     <Minus className="w-4 h-4" />}
                    {moodTrend > 0.5 ? "Yükselişte" :
                     moodTrend < -0.5 ? "Düşüşte" : "Stabil"}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Emotions Tab */}
            <TabsContent value="emotions" className="space-y-4">
              {/* Most Common Emotion */}
              {mostCommon && (
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">En Sık Hissedilen</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{emotionEmojis[mostCommon[0] as Emotion]}</span>
                    <div>
                      <p className="font-semibold text-lg text-foreground">
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
                <div className="space-y-3">
                  {sortedEmotions.map(([emotion, count]) => (
                    <div key={emotion} className="flex items-center gap-3">
                      <span className="text-xl w-8">{emotionEmojis[emotion as Emotion]}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-foreground">
                            {emotionLabels[emotion as Emotion]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {count} ({Math.round((count / totalEntries) * 100)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", emotionColors[emotion as Emotion])}
                            style={{ width: `${(count / totalEntries) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Positive vs Negative */}
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-3">Pozitif vs Negatif</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-green-600">Pozitif</span>
                      <span className="text-xs text-muted-foreground">{positiveCount}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${totalEntries > 0 ? (positiveCount / totalEntries) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-red-600">Negatif</span>
                      <span className="text-xs text-muted-foreground">{negativeCount}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${totalEntries > 0 ? (negativeCount / totalEntries) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-4">
              {/* Average Intensity */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Ortalama Yoğunluk</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-bold text-foreground">{avgIntensity.toFixed(1)}</p>
                  <div className="flex-1">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                        style={{ width: `${avgIntensity * 10}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">10 üzerinden</p>
                  </div>
                </div>
              </div>

              {/* Top Triggers */}
              {topTriggers.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-orange-500" />
                    <p className="text-sm font-medium text-foreground">Sık Tetikleyiciler</p>
                  </div>
                  <div className="space-y-2">
                    {topTriggers.map(([trigger, count], i) => (
                      <div key={trigger} className="flex items-center gap-3">
                        <span className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                          i === 0 ? "bg-yellow-500/20 text-yellow-600" :
                          i === 1 ? "bg-gray-300/30 text-gray-600" :
                          i === 2 ? "bg-orange-500/20 text-orange-600" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm text-foreground">{trigger}</span>
                        <span className="text-xs text-muted-foreground">{count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Writing Habit */}
              <div className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <p className="text-sm font-medium text-foreground">Yazma Alışkanlığı</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {streak >= 7 ? "🎉 Harika! 1 haftadan uzun süredir yazıyorsun!" :
                   streak >= 3 ? "👏 Güzel gidiyorsun! Serini korumaya devam et." :
                   streak >= 1 ? "✨ İyi başlangıç! Her gün yazmayı dene." :
                   "💪 Bugün yazmaya başla ve seri oluştur!"}
                </p>
              </div>

              {/* Tip */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>İpucu:</strong> Düzenli günlük yazmak duygusal farkındalığı artırır. 
                  Her gün en az bir giriş yapmayı dene!
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
