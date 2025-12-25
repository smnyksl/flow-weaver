import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, AlertTriangle, Sparkles, Target, Brain, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { JournalEntry } from '@/types/journal';
import { emotionLabels, emotionEmojis } from '@/data/emotionData';
import { startOfWeek, startOfMonth, isAfter, format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface DetailedInsightsPanelProps {
  entries: JournalEntry[];
  weeklyInsight?: string;
  monthlyInsight?: string;
}

interface EmotionStat {
  emotion: string;
  count: number;
  percentage: number;
  avgIntensity: number;
}

interface TriggerStat {
  trigger: string;
  count: number;
}

export function DetailedInsightsPanel({ entries, weeklyInsight, monthlyInsight }: DetailedInsightsPanelProps) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const weeklyStats = useMemo(() => {
    const weeklyEntries = entries.filter(e => isAfter(new Date(e.createdAt), weekStart));
    return calculateStats(weeklyEntries);
  }, [entries, weekStart]);

  const monthlyStats = useMemo(() => {
    const monthlyEntries = entries.filter(e => isAfter(new Date(e.createdAt), monthStart));
    return calculateStats(monthlyEntries);
  }, [entries, monthStart]);

  function calculateStats(filteredEntries: JournalEntry[]) {
    if (filteredEntries.length === 0) {
      return { emotionStats: [], triggerStats: [], totalEntries: 0, avgIntensity: 0, dominantEmotion: null };
    }

    // Emotion counts
    const emotionCounts: Record<string, { count: number; totalIntensity: number }> = {};
    const triggerCounts: Record<string, number> = {};

    filteredEntries.forEach(entry => {
      if (entry.emotion) {
        const emotion = entry.emotion.primaryEmotion;
        if (!emotionCounts[emotion]) {
          emotionCounts[emotion] = { count: 0, totalIntensity: 0 };
        }
        emotionCounts[emotion].count++;
        emotionCounts[emotion].totalIntensity += entry.emotion.intensity;

        entry.emotion.triggers?.forEach(trigger => {
          triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });
      }
    });

    const totalEntries = filteredEntries.length;
    const emotionStats: EmotionStat[] = Object.entries(emotionCounts)
      .map(([emotion, data]) => ({
        emotion,
        count: data.count,
        percentage: Math.round((data.count / totalEntries) * 100),
        avgIntensity: Math.round(data.totalIntensity / data.count)
      }))
      .sort((a, b) => b.count - a.count);

    const triggerStats: TriggerStat[] = Object.entries(triggerCounts)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const avgIntensity = filteredEntries.reduce((sum, e) => sum + (e.emotion?.intensity || 0), 0) / totalEntries;
    const dominantEmotion = emotionStats[0] || null;

    return { emotionStats, triggerStats, totalEntries, avgIntensity: Math.round(avgIntensity * 10) / 10, dominantEmotion };
  }

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
      excited: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
      calm: 'bg-green-500/20 text-green-600 border-green-500/30',
      neutral: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
      sad: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      anxious: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
      angry: 'bg-red-500/20 text-red-600 border-red-500/30',
    };
    return colors[emotion] || colors.neutral;
  };

  const getProgressColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: 'bg-yellow-500',
      excited: 'bg-orange-500',
      calm: 'bg-green-500',
      neutral: 'bg-gray-500',
      sad: 'bg-blue-500',
      anxious: 'bg-purple-500',
      angry: 'bg-red-500',
    };
    return colors[emotion] || colors.neutral;
  };

  const isWarning = monthlyInsight?.toLowerCase().includes('kötüye') || 
                    monthlyInsight?.toLowerCase().includes('uyarı');

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Henüz içgörü yok</h3>
        <p className="text-sm text-muted-foreground/70">
          Günlük girişleri yaptıkça burada detaylı analizler göreceksin
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* AI Generated Insights */}
      {(weeklyInsight || monthlyInsight) && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Destekli İçgörüler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyInsight && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Bu Hafta</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{weeklyInsight}</p>
                </div>
              </div>
            )}

            {monthlyInsight && (
              <div className={`flex items-start gap-3 p-3 rounded-lg ${isWarning ? 'bg-destructive/10' : 'bg-background/50'}`}>
                <div className={`p-2 rounded-lg shrink-0 ${isWarning ? 'bg-destructive/20' : 'bg-accent/10'}`}>
                  {isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  ) : monthlyInsight.toLowerCase().includes('iyiye') ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h4 className={`text-sm font-medium mb-1 ${isWarning ? 'text-destructive' : 'text-foreground'}`}>
                    Bu Ay {isWarning && '⚠️'}
                  </h4>
                  <p className={`text-sm leading-relaxed ${isWarning ? 'text-destructive/80' : 'text-muted-foreground'}`}>
                    {monthlyInsight}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weekly Statistics */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Haftalık İstatistikler
            </span>
            <Badge variant="secondary" className="text-xs">
              {weeklyStats.totalEntries} giriş
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {weeklyStats.totalEntries === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Bu hafta henüz giriş yapılmadı
            </p>
          ) : (
            <>
              {/* Dominant Emotion */}
              {weeklyStats.dominantEmotion && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Baskın Duygu</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{emotionEmojis[weeklyStats.dominantEmotion.emotion as keyof typeof emotionEmojis]}</span>
                    <span className="font-medium">{emotionLabels[weeklyStats.dominantEmotion.emotion as keyof typeof emotionLabels]}</span>
                    <Badge variant="outline" className={getEmotionColor(weeklyStats.dominantEmotion.emotion)}>
                      %{weeklyStats.dominantEmotion.percentage}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Emotion Distribution */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Duygu Dağılımı</h4>
                {weeklyStats.emotionStats.map(stat => (
                  <div key={stat.emotion} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{emotionEmojis[stat.emotion as keyof typeof emotionEmojis]}</span>
                        <span>{emotionLabels[stat.emotion as keyof typeof emotionLabels]}</span>
                      </span>
                      <span className="text-muted-foreground">{stat.count}x ({stat.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${getProgressColor(stat.emotion)}`}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Average Intensity */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Ortalama Yoğunluk</span>
                <div className="flex items-center gap-2">
                  <Progress value={weeklyStats.avgIntensity * 10} className="w-24 h-2" />
                  <span className="font-medium text-sm">{weeklyStats.avgIntensity}/10</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Monthly Statistics */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              Aylık İstatistikler
            </span>
            <Badge variant="secondary" className="text-xs">
              {monthlyStats.totalEntries} giriş
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {monthlyStats.totalEntries === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Bu ay henüz giriş yapılmadı
            </p>
          ) : (
            <>
              {/* Emotion Distribution Chart */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Duygu Dağılımı</h4>
                <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                  {monthlyStats.emotionStats.map(stat => (
                    <div
                      key={stat.emotion}
                      className={`${getProgressColor(stat.emotion)} flex items-center justify-center transition-all hover:opacity-80`}
                      style={{ width: `${stat.percentage}%` }}
                      title={`${emotionLabels[stat.emotion as keyof typeof emotionLabels]}: ${stat.percentage}%`}
                    >
                      {stat.percentage >= 15 && (
                        <span className="text-white text-xs font-medium">
                          {emotionEmojis[stat.emotion as keyof typeof emotionEmojis]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {monthlyStats.emotionStats.map(stat => (
                    <Badge key={stat.emotion} variant="outline" className={`text-xs ${getEmotionColor(stat.emotion)}`}>
                      {emotionEmojis[stat.emotion as keyof typeof emotionEmojis]} {stat.percentage}%
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Top Triggers */}
              {monthlyStats.triggerStats.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Sık Tetikleyiciler</h4>
                  <div className="flex flex-wrap gap-2">
                    {monthlyStats.triggerStats.map(stat => (
                      <Badge key={stat.trigger} variant="secondary" className="text-xs">
                        {stat.trigger} ({stat.count}x)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-2xl font-bold text-primary">{monthlyStats.totalEntries}</p>
                  <p className="text-xs text-muted-foreground">Toplam Giriş</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-2xl font-bold text-accent">{monthlyStats.avgIntensity}</p>
                  <p className="text-xs text-muted-foreground">Ort. Yoğunluk</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tip Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="text-sm font-medium mb-1">İpucu</h4>
              <p className="text-xs text-muted-foreground">
                Düzenli günlük tutmak, duygusal farkındalığını artırır ve zaman içinde 
                daha net içgörüler elde etmeni sağlar. Her gün kısa bile olsa bir şeyler yaz!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
