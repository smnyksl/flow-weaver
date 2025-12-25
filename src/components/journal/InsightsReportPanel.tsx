import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Sparkles, Brain, Loader2, Trash2, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { JournalEntry } from '@/types/journal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AnalyzingAnimation } from './AnalyzingAnimation';

const emotionLabels: Record<string, { label: string; emoji: string; color: string }> = {
  happy: { label: 'Mutlu', emoji: '😊', color: 'text-yellow-500' },
  sad: { label: 'Üzgün', emoji: '😢', color: 'text-blue-500' },
  anxious: { label: 'Kaygılı', emoji: '😰', color: 'text-purple-500' },
  angry: { label: 'Öfkeli', emoji: '😠', color: 'text-red-500' },
  neutral: { label: 'Nötr', emoji: '😐', color: 'text-gray-500' },
  excited: { label: 'Heyecanlı', emoji: '🤩', color: 'text-orange-500' },
  calm: { label: 'Sakin', emoji: '😌', color: 'text-teal-500' },
};

interface EmotionStats {
  emotion: string;
  count: number;
  percentage: number;
}

interface WeeklyData {
  weekNumber: number;
  weekLabel: string;
  entries: number;
  avgIntensity: number;
  dominantEmotion: string;
  score: number;
}

interface WeeklyReport {
  totalEntries: number;
  avgIntensity: number;
  dominantEmotion: string;
  emotionBreakdown: EmotionStats[];
  trend: 'up' | 'down' | 'stable';
  trendMessage: string;
}

interface MonthlyReport {
  totalEntries: number;
  avgIntensity: number;
  dominantEmotion: string;
  emotionBreakdown: EmotionStats[];
  topTriggers: { trigger: string; count: number }[];
  weeklyComparison: number;
  trend: 'up' | 'down' | 'stable';
  trendMessage: string;
  weekByWeekData: WeeklyData[];
  positiveRatio: number;
  negativeRatio: number;
  neutralRatio: number;
  mostActiveDay: string;
  avgEntriesPerWeek: number;
  longestPositiveStreak: number;
  recommendations: string[];
}

interface SavedAnalysis {
  id: string;
  createdAt: Date;
  deepAnalysis: {
    emotionalJourney: string;
    triggerAnalysis: string;
    patternInsights: string;
    weeklyNarrative: string;
    wellbeingSummary: string;
  };
}

interface DBJournalEntry {
  id: string;
  primary_emotion: string;
  intensity: number;
  triggers: string[];
  created_at: string;
}

interface InsightsReportPanelProps {
  entries: JournalEntry[];
  userId: string;
  weeklyInsight?: string;
  monthlyInsight?: string;
}

export function InsightsReportPanel({ entries, userId, weeklyInsight, monthlyInsight }: InsightsReportPanelProps) {
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);

  const calculateEmotionBreakdown = (dbEntries: DBJournalEntry[]): EmotionStats[] => {
    const counts: Record<string, number> = {};
    dbEntries.forEach(e => {
      counts[e.primary_emotion] = (counts[e.primary_emotion] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: (count / dbEntries.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const calculateEmotionScore = (dbEntries: DBJournalEntry[]): number => {
    if (dbEntries.length === 0) return 0;
    const scores: Record<string, number> = {
      happy: 1, excited: 1, calm: 0.5, neutral: 0, sad: -0.5, anxious: -0.5, angry: -1
    };
    return dbEntries.reduce((sum, e) => sum + (scores[e.primary_emotion] || 0), 0) / dbEntries.length;
  };

  const loadSavedAnalyses = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading analyses:', error);
        return;
      }

      if (data) {
        const analyses: SavedAnalysis[] = data.map(item => ({
          id: item.id,
          createdAt: new Date(item.created_at),
          deepAnalysis: {
            emotionalJourney: item.emotional_journey,
            triggerAnalysis: item.trigger_analysis,
            patternInsights: item.pattern_insights,
            weeklyNarrative: item.weekly_narrative,
            wellbeingSummary: item.wellbeing_summary
          }
        }));
        setSavedAnalyses(analyses);
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  }, [userId]);

  const fetchReports = useCallback(async () => {
    if (!userId) return;
    setReportsLoading(true);

    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { data: dbEntries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', oneMonthAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedEntries = dbEntries as DBJournalEntry[];

      const weeklyEntries = typedEntries.filter(e => new Date(e.created_at) >= oneWeekAgo);
      const previousWeekEntries = typedEntries.filter(
        e => new Date(e.created_at) >= twoWeeksAgo && new Date(e.created_at) < oneWeekAgo
      );

      if (weeklyEntries.length > 0) {
        const weeklyBreakdown = calculateEmotionBreakdown(weeklyEntries);
        const prevWeekScore = calculateEmotionScore(previousWeekEntries);
        const currentWeekScore = calculateEmotionScore(weeklyEntries);
        const weeklyTrend = currentWeekScore > prevWeekScore + 0.3 ? 'up' : currentWeekScore < prevWeekScore - 0.3 ? 'down' : 'stable';

        setWeeklyReport({
          totalEntries: weeklyEntries.length,
          avgIntensity: weeklyEntries.reduce((sum, e) => sum + e.intensity, 0) / weeklyEntries.length,
          dominantEmotion: weeklyBreakdown[0]?.emotion || 'neutral',
          emotionBreakdown: weeklyBreakdown,
          trend: weeklyTrend,
          trendMessage: weeklyTrend === 'up' 
            ? 'Bu hafta geçen haftaya göre daha iyi hissediyorsun! 🎉' 
            : weeklyTrend === 'down' 
            ? 'Bu hafta biraz zorlanmış gibisin, kendine iyi bak 💙' 
            : 'Bu hafta duygusal olarak dengeli bir seyir izliyorsun ⚖️',
        });
      } else {
        setWeeklyReport(null);
      }

      if (typedEntries.length > 0) {
        const monthlyBreakdown = calculateEmotionBreakdown(typedEntries);
        const triggerCounts: Record<string, number> = {};
        typedEntries.forEach(e => {
          (e.triggers || []).forEach(t => {
            triggerCounts[t] = (triggerCounts[t] || 0) + 1;
          });
        });
        const topTriggers = Object.entries(triggerCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([trigger, count]) => ({ trigger, count }));

        const weekByWeekData: WeeklyData[] = [];
        const dayLabels = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        
        for (let i = 0; i < 4; i++) {
          const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
          const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          const weekEntries = typedEntries.filter(e => {
            const d = new Date(e.created_at);
            return d >= weekStart && d < weekEnd;
          });
          
          if (weekEntries.length > 0) {
            const weekBreakdown = calculateEmotionBreakdown(weekEntries);
            weekByWeekData.push({
              weekNumber: 4 - i,
              weekLabel: i === 0 ? 'Bu Hafta' : i === 1 ? 'Geçen Hafta' : `${4 - i}. Hafta`,
              entries: weekEntries.length,
              avgIntensity: weekEntries.reduce((sum, e) => sum + e.intensity, 0) / weekEntries.length,
              dominantEmotion: weekBreakdown[0]?.emotion || 'neutral',
              score: calculateEmotionScore(weekEntries),
            });
          }
        }

        const positiveEmotions = ['happy', 'excited', 'calm'];
        const negativeEmotions = ['sad', 'anxious', 'angry'];
        const positiveCount = typedEntries.filter(e => positiveEmotions.includes(e.primary_emotion)).length;
        const negativeCount = typedEntries.filter(e => negativeEmotions.includes(e.primary_emotion)).length;
        const neutralCount = typedEntries.filter(e => e.primary_emotion === 'neutral').length;

        const dayCounts: Record<number, number> = {};
        typedEntries.forEach(e => {
          const day = new Date(e.created_at).getDay();
          dayCounts[day] = (dayCounts[day] || 0) + 1;
        });
        const mostActiveDay = dayLabels[Number(Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0]) || 0];

        let longestStreak = 0;
        let currentStreak = 0;
        const sortedEntries = [...typedEntries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        sortedEntries.forEach(e => {
          if (positiveEmotions.includes(e.primary_emotion)) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
          } else {
            currentStreak = 0;
          }
        });

        const recommendations: string[] = [];
        if (negativeCount / typedEntries.length > 0.5) {
          recommendations.push('Negatif duygularının oranı yüksek. Profesyonel destek almayı düşünebilirsin.');
        }
        if (topTriggers.length > 0 && topTriggers[0].count >= 3) {
          recommendations.push(`"${topTriggers[0].trigger}" sık tekrarlayan bir tetikleyici. Bu konuyu ele almak faydalı olabilir.`);
        }
        if (weekByWeekData.length >= 2 && weekByWeekData[0].score < weekByWeekData[1].score - 0.5) {
          recommendations.push('Son hafta önceki haftaya göre daha zorlu geçmiş. Kendine ekstra özen göster.');
        }
        if (positiveCount / typedEntries.length > 0.6) {
          recommendations.push('Pozitif duyguların ağırlıkta! Böyle devam et, harika gidiyorsun! 🌟');
        }
        if (typedEntries.length < 7) {
          recommendations.push('Daha fazla günlük girişi yapmak, duygularını daha iyi anlamamıza yardımcı olur.');
        }

        const firstHalf = typedEntries.slice(Math.floor(typedEntries.length / 2));
        const secondHalf = typedEntries.slice(0, Math.floor(typedEntries.length / 2));
        const firstScore = calculateEmotionScore(firstHalf);
        const secondScore = calculateEmotionScore(secondHalf);
        const monthlyTrend = secondScore > firstScore + 0.3 ? 'up' : secondScore < firstScore - 0.3 ? 'down' : 'stable';

        setMonthlyReport({
          totalEntries: typedEntries.length,
          avgIntensity: typedEntries.reduce((sum, e) => sum + e.intensity, 0) / typedEntries.length,
          dominantEmotion: monthlyBreakdown[0]?.emotion || 'neutral',
          emotionBreakdown: monthlyBreakdown,
          topTriggers,
          weeklyComparison: weeklyEntries.length - previousWeekEntries.length,
          trend: monthlyTrend,
          trendMessage: monthlyTrend === 'up' 
            ? 'Son bir ayda duygusal durumun iyiye gidiyor! Harika gidiyorsun! 🌟' 
            : monthlyTrend === 'down' 
            ? 'Son dönemde zorlu bir süreçten geçiyor olabilirsin. Profesyonel destek almayı düşünebilirsin 💜' 
            : 'Aylık duygusal dengen stabil görünüyor 🌊',
          weekByWeekData: weekByWeekData.reverse(),
          positiveRatio: (positiveCount / typedEntries.length) * 100,
          negativeRatio: (negativeCount / typedEntries.length) * 100,
          neutralRatio: (neutralCount / typedEntries.length) * 100,
          mostActiveDay,
          avgEntriesPerWeek: typedEntries.length / 4,
          longestPositiveStreak: longestStreak,
          recommendations,
        });
      } else {
        setMonthlyReport(null);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setReportsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadSavedAnalyses();
      fetchReports();
    }
  }, [userId, loadSavedAnalyses, fetchReports]);

  const generateAiAnalysis = async () => {
    if (!monthlyReport || !userId) return;
    
    setAiAnalysisLoading(true);
    try {
      const reportData = {
        entries: [],
        totalEntries: monthlyReport.totalEntries,
        dominantEmotion: monthlyReport.dominantEmotion,
        emotionBreakdown: monthlyReport.emotionBreakdown,
        topTriggers: monthlyReport.topTriggers,
        positiveRatio: monthlyReport.positiveRatio,
        negativeRatio: monthlyReport.negativeRatio,
        neutralRatio: monthlyReport.neutralRatio,
        trend: monthlyReport.trend,
        longestPositiveStreak: monthlyReport.longestPositiveStreak,
        avgEntriesPerWeek: monthlyReport.avgEntriesPerWeek,
        mostActiveDay: monthlyReport.mostActiveDay,
        weekByWeekData: monthlyReport.weekByWeekData,
      };

      const { data, error } = await supabase.functions.invoke('generate-monthly-report', {
        body: { reportData }
      });

      if (error) {
        console.error('AI analysis error:', error);
        toast.error('AI analizi oluşturulurken hata oluştu. Tekrar deneyin.');
        return;
      }

      if (data?.error) {
        console.error('AI analysis returned error:', data.error);
        toast.error(data.error);
        return;
      }

      if (data?.analysis) {
        const analysis = data.analysis;
        const requiredFields = ['emotionalJourney', 'triggerAnalysis', 'patternInsights', 'weeklyNarrative', 'wellbeingSummary'];
        const missingFields = requiredFields.filter(field => !analysis[field] || analysis[field].trim().length < 20);
        
        if (missingFields.length > 0) {
          console.error('Incomplete AI analysis, missing fields:', missingFields);
          toast.error('AI analizi eksik kaldı. Tekrar deneyin.');
          return;
        }

        const { data: savedData, error: saveError } = await supabase
          .from('ai_analyses')
          .insert({
            user_id: userId,
            emotional_journey: analysis.emotionalJourney,
            trigger_analysis: analysis.triggerAnalysis,
            pattern_insights: analysis.patternInsights,
            weekly_narrative: analysis.weeklyNarrative,
            wellbeing_summary: analysis.wellbeingSummary
          })
          .select()
          .single();

        if (saveError) {
          console.error('Error saving analysis:', saveError);
          toast.error('Analiz kaydedilemedi');
          return;
        }

        const newAnalysis: SavedAnalysis = {
          id: savedData.id,
          createdAt: new Date(savedData.created_at),
          deepAnalysis: analysis
        };
        setSavedAnalyses(prev => [newAnalysis, ...prev]);
        toast.success('AI analizi oluşturuldu ve kaydedildi!');
      } else {
        toast.error('AI yanıtı alınamadı. Tekrar deneyin.');
      }
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      toast.error('Bağlantı hatası. Tekrar deneyin.');
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const deleteAnalysis = async (analysisId: string) => {
    try {
      const { error } = await supabase
        .from('ai_analyses')
        .delete()
        .eq('id', analysisId);

      if (error) throw error;

      setSavedAnalyses(prev => prev.filter(a => a.id !== analysisId));
      toast.success('Analiz silindi');
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error('Silme işlemi başarısız');
    }
  };

  if (reportsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
      {/* AI Insights from Entry Analysis */}
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
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                  <BarChart3 className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Bu Ay</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{monthlyInsight}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weekly Report */}
      <Card className="overflow-hidden border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="block text-base">Haftalık Rapor</span>
              <span className="text-xs font-normal text-muted-foreground">Son 7 gün</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {weeklyReport ? (
            <div className="space-y-4">
              <div className={cn(
                'flex items-center gap-3 p-3 rounded-xl',
                weeklyReport.trend === 'up' ? 'bg-green-500/10' : weeklyReport.trend === 'down' ? 'bg-orange-500/10' : 'bg-blue-500/10'
              )}>
                {weeklyReport.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : weeklyReport.trend === 'down' ? (
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                ) : (
                  <Minus className="w-5 h-5 text-blue-600" />
                )}
                <p className="text-sm font-medium">{weeklyReport.trendMessage}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{weeklyReport.totalEntries}</p>
                  <p className="text-xs text-muted-foreground">Giriş</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-accent">{weeklyReport.avgIntensity.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Ort. Yoğunluk</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <span className="text-3xl">{emotionLabels[weeklyReport.dominantEmotion]?.emoji || '😐'}</span>
                <div>
                  <p className="text-xs text-muted-foreground">En çok hissedilen</p>
                  <p className="font-semibold">{emotionLabels[weeklyReport.dominantEmotion]?.label || 'Nötr'}</p>
                </div>
              </div>

              <div className="space-y-2">
                {weeklyReport.emotionBreakdown.slice(0, 4).map((stat) => (
                  <div key={stat.emotion} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{emotionLabels[stat.emotion]?.emoji || '😐'}</span>
                        <span className="text-xs">{emotionLabels[stat.emotion]?.label || stat.emotion}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{stat.percentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={stat.percentage} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">Bu hafta henüz giriş yok</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Report */}
      <Card className="overflow-hidden border-2 border-accent/20">
        <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="block text-base">Aylık Rapor</span>
              <span className="text-xs font-normal text-muted-foreground">Son 30 gün</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {monthlyReport ? (
            <div className="space-y-4">
              <div className={cn(
                'flex items-center gap-3 p-3 rounded-xl',
                monthlyReport.trend === 'up' ? 'bg-green-500/10' : monthlyReport.trend === 'down' ? 'bg-orange-500/10' : 'bg-blue-500/10'
              )}>
                {monthlyReport.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : monthlyReport.trend === 'down' ? (
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                ) : (
                  <Minus className="w-5 h-5 text-blue-600" />
                )}
                <p className="text-sm font-medium">{monthlyReport.trendMessage}</p>
              </div>

              {/* Emotion Ratio Bar */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Duygu Oranları</p>
                <div className="flex h-3 rounded-full overflow-hidden">
                  <div className="bg-green-500" style={{ width: `${monthlyReport.positiveRatio}%` }} />
                  <div className="bg-gray-400" style={{ width: `${monthlyReport.neutralRatio}%` }} />
                  <div className="bg-orange-500" style={{ width: `${monthlyReport.negativeRatio}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Pozitif {monthlyReport.positiveRatio.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    Nötr {monthlyReport.neutralRatio.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    Negatif {monthlyReport.negativeRatio.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Week by Week */}
              {monthlyReport.weekByWeekData.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Haftalık Karşılaştırma</p>
                  {monthlyReport.weekByWeekData.map((week) => (
                    <div key={week.weekNumber} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                      <span className="w-16 text-xs font-medium">{week.weekLabel}</span>
                      <span className="text-lg">{emotionLabels[week.dominantEmotion]?.emoji || '😐'}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            'h-full rounded-full',
                            week.score > 0.5 ? 'bg-green-500' : week.score < -0.5 ? 'bg-orange-500' : 'bg-blue-500'
                          )}
                          style={{ width: `${Math.min(100, Math.max(20, (week.score + 2) * 25))}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-6">{week.entries}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold">{monthlyReport.mostActiveDay}</p>
                  <p className="text-[10px] text-muted-foreground">En Aktif</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold">{monthlyReport.avgEntriesPerWeek.toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground">Haftalık</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-green-600">{monthlyReport.longestPositiveStreak}</p>
                  <p className="text-[10px] text-muted-foreground">Pozitif Seri</p>
                </div>
              </div>

              {/* Top Triggers */}
              {monthlyReport.topTriggers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Sık Tetikleyiciler</p>
                  <div className="flex flex-wrap gap-1.5">
                    {monthlyReport.topTriggers.map((item, i) => (
                      <Badge key={i} variant={i === 0 ? "destructive" : "secondary"} className="text-xs">
                        {item.trigger} ({item.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {monthlyReport.recommendations.length > 0 && (
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
                  <p className="text-xs font-medium text-primary">Öneriler</p>
                  {monthlyReport.recommendations.slice(0, 2).map((rec, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {rec}</p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">Bu ay henüz giriş yok</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Deep Analysis */}
      <Card className="overflow-hidden border-2 border-primary/30">
        <CardHeader className="bg-gradient-to-r from-primary/20 to-accent/20 pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-base">AI Derinlemesine Analiz</span>
                {savedAnalyses.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">{savedAnalyses.length} kayıtlı analiz</span>
                )}
              </div>
            </div>
            <Button
              onClick={generateAiAnalysis}
              disabled={aiAnalysisLoading || !monthlyReport}
              size="sm"
              className="gap-2"
            >
              {aiAnalysisLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Analiz...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">{savedAnalyses.length > 0 ? 'Yeni' : 'Analiz Et'}</span>
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {aiAnalysisLoading ? (
            <AnalyzingAnimation />
          ) : savedAnalyses.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border">
              <Sparkles className="w-10 h-10 text-primary/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                Kişiselleştirilmiş AI analizi için butona tıklayın
              </p>
              <p className="text-xs text-muted-foreground">
                Verilerinize dayanarak derinlemesine içgörüler oluşturulacak
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {savedAnalyses.map((analysis, index) => (
                <AccordionItem key={analysis.id} value={analysis.id} className="border rounded-xl px-3">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-2 text-left">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {analysis.createdAt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      {index === 0 && <Badge variant="secondary" className="text-[10px]">En Son</Badge>}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-3">
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <h4 className="text-xs font-semibold text-primary mb-1">🌊 Duygusal Yolculuk</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{analysis.deepAnalysis.emotionalJourney}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <h4 className="text-xs font-semibold text-orange-600 mb-1">🔍 Tetikleyici Analizi</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{analysis.deepAnalysis.triggerAnalysis}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <h4 className="text-xs font-semibold text-purple-600 mb-1">🧠 Örüntü İçgörüleri</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{analysis.deepAnalysis.patternInsights}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <h4 className="text-xs font-semibold text-blue-600 mb-1">📅 Haftalık Özet</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{analysis.deepAnalysis.weeklyNarrative}</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <h4 className="text-xs font-semibold text-green-600 mb-1">💚 Genel Değerlendirme</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{analysis.deepAnalysis.wellbeingSummary}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteAnalysis(analysis.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Bu Analizi Sil
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
