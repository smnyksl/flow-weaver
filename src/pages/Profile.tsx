import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Music, Gamepad2, Moon, Dumbbell, Brain, Target, Loader2, TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { usePreferences } from '@/hooks/usePreferences';
import { ONBOARDING_STEPS } from '@/types/preferences';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Emotion } from '@/types/journal';

const sectionIcons: Record<string, React.ReactNode> = {
  music: <Music className="w-5 h-5" />,
  hobbies: <Gamepad2 className="w-5 h-5" />,
  sleep: <Moon className="w-5 h-5" />,
  exercise: <Dumbbell className="w-5 h-5" />,
  personality: <Brain className="w-5 h-5" />,
  goals: <Target className="w-5 h-5" />,
};

const emotionLabels: Record<string, { label: string; emoji: string; color: string }> = {
  happy: { label: 'Mutlu', emoji: '😊', color: 'text-yellow-500' },
  sad: { label: 'Üzgün', emoji: '😢', color: 'text-blue-500' },
  anxious: { label: 'Kaygılı', emoji: '😰', color: 'text-purple-500' },
  angry: { label: 'Öfkeli', emoji: '😠', color: 'text-red-500' },
  neutral: { label: 'Nötr', emoji: '😐', color: 'text-gray-500' },
  excited: { label: 'Heyecanlı', emoji: '🤩', color: 'text-orange-500' },
  calm: { label: 'Sakin', emoji: '😌', color: 'text-teal-500' },
};

interface JournalEntry {
  id: string;
  primary_emotion: string;
  intensity: number;
  triggers: string[];
  created_at: string;
}

interface EmotionStats {
  emotion: string;
  count: number;
  percentage: number;
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
  topTriggers: string[];
  weeklyComparison: number;
  trend: 'up' | 'down' | 'stable';
  trendMessage: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { preferences, loading: prefLoading } = usePreferences(user?.id);
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [reportsLoading, setReportsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch reports data
  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;
    setReportsLoading(true);

    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch all entries for the last month
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', oneMonthAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedEntries = entries as JournalEntry[];

      // Weekly entries
      const weeklyEntries = typedEntries.filter(e => new Date(e.created_at) >= oneWeekAgo);
      const previousWeekEntries = typedEntries.filter(
        e => new Date(e.created_at) >= twoWeeksAgo && new Date(e.created_at) < oneWeekAgo
      );

      // Calculate weekly report
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

      // Calculate monthly report
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
          .map(([trigger]) => trigger);

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
        });
      } else {
        setMonthlyReport(null);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setReportsLoading(false);
    }
  };

  const calculateEmotionBreakdown = (entries: JournalEntry[]): EmotionStats[] => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      counts[e.primary_emotion] = (counts[e.primary_emotion] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: (count / entries.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const calculateEmotionScore = (entries: JournalEntry[]): number => {
    if (entries.length === 0) return 0;
    const scores: Record<string, number> = {
      happy: 2, excited: 2, calm: 1, neutral: 0, sad: -1, anxious: -1, angry: -2,
    };
    return entries.reduce((sum, e) => sum + (scores[e.primary_emotion] || 0), 0) / entries.length;
  };

  useEffect(() => {
    if (preferences) {
      setFormData({
        music_genres: preferences.music_genres || [],
        hobbies: preferences.hobbies || [],
        sleep_pattern: preferences.sleep_pattern || '',
        exercise_frequency: preferences.exercise_frequency || '',
        personality_type: preferences.personality_type || '',
        stress_coping: preferences.stress_coping || [],
        meditation_experience: preferences.meditation_experience || '',
        emotional_goals: preferences.emotional_goals || [],
      });
    }
  }, [preferences]);

  const handleOptionToggle = (field: string, value: string, isMulti: boolean) => {
    setHasChanges(true);
    
    if (isMulti) {
      const currentValues = (formData[field] as string[]) || [];
      if (currentValues.includes(value)) {
        setFormData({ ...formData, [field]: currentValues.filter(v => v !== value) });
      } else {
        setFormData({ ...formData, [field]: [...currentValues, value] });
      }
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const isSelected = (field: string, value: string, isMulti: boolean): boolean => {
    if (isMulti) {
      return ((formData[field] as string[]) || []).includes(value);
    }
    return formData[field] === value;
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({
          music_genres: formData.music_genres as string[],
          hobbies: formData.hobbies as string[],
          sleep_pattern: formData.sleep_pattern as string || null,
          exercise_frequency: formData.exercise_frequency as string || null,
          personality_type: formData.personality_type as string || null,
          stress_coping: formData.stress_coping as string[],
          meditation_experience: formData.meditation_experience as string || null,
          emotional_goals: formData.emotional_goals as string[],
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Tercihler güncellendi!');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Tercihler kaydedilirken hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || prefLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Profil</h1>
                  <p className="text-xs text-muted-foreground">Tercihlerini düzenle</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Kaydet
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Raporlar
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <User className="w-4 h-4" />
              Tercihler
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {reportsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Weekly Report */}
                <Card className="overflow-hidden border-2 border-primary/20">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="block text-lg">Haftalık Rapor</span>
                        <span className="text-sm font-normal text-muted-foreground">Son 7 gün</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {weeklyReport ? (
                      <div className="space-y-6">
                        {/* Trend message */}
                        <div className={cn(
                          'flex items-center gap-3 p-4 rounded-xl',
                          weeklyReport.trend === 'up' ? 'bg-green-500/10' : weeklyReport.trend === 'down' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                        )}>
                          {weeklyReport.trend === 'up' ? (
                            <TrendingUp className="w-6 h-6 text-green-600" />
                          ) : weeklyReport.trend === 'down' ? (
                            <TrendingDown className="w-6 h-6 text-orange-600" />
                          ) : (
                            <Minus className="w-6 h-6 text-blue-600" />
                          )}
                          <p className="text-sm font-medium">{weeklyReport.trendMessage}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted/50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-primary">{weeklyReport.totalEntries}</p>
                            <p className="text-sm text-muted-foreground">Günlük Girişi</p>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-accent">{weeklyReport.avgIntensity.toFixed(1)}</p>
                            <p className="text-sm text-muted-foreground">Ort. Yoğunluk</p>
                          </div>
                        </div>

                        {/* Dominant emotion */}
                        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                          <span className="text-4xl">{emotionLabels[weeklyReport.dominantEmotion]?.emoji || '😐'}</span>
                          <div>
                            <p className="text-sm text-muted-foreground">En çok hissedilen duygu</p>
                            <p className="font-semibold text-lg">{emotionLabels[weeklyReport.dominantEmotion]?.label || 'Nötr'}</p>
                          </div>
                        </div>

                        {/* Emotion breakdown */}
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">Duygu Dağılımı</p>
                          {weeklyReport.emotionBreakdown.map((stat) => (
                            <div key={stat.emotion} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span>{emotionLabels[stat.emotion]?.emoji || '😐'}</span>
                                  <span>{emotionLabels[stat.emotion]?.label || stat.emotion}</span>
                                </span>
                                <span className="text-muted-foreground">{stat.count} ({stat.percentage.toFixed(0)}%)</span>
                              </div>
                              <Progress value={stat.percentage} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Bu hafta henüz günlük girişi yok</p>
                        <p className="text-sm text-muted-foreground mt-1">Duygularını yazmaya başla!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Report */}
                <Card className="overflow-hidden border-2 border-accent/20">
                  <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="block text-lg">Aylık Rapor</span>
                        <span className="text-sm font-normal text-muted-foreground">Son 30 gün</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {monthlyReport ? (
                      <div className="space-y-6">
                        {/* Trend message */}
                        <div className={cn(
                          'flex items-center gap-3 p-4 rounded-xl',
                          monthlyReport.trend === 'up' ? 'bg-green-500/10' : monthlyReport.trend === 'down' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                        )}>
                          {monthlyReport.trend === 'up' ? (
                            <TrendingUp className="w-6 h-6 text-green-600" />
                          ) : monthlyReport.trend === 'down' ? (
                            <TrendingDown className="w-6 h-6 text-orange-600" />
                          ) : (
                            <Minus className="w-6 h-6 text-blue-600" />
                          )}
                          <p className="text-sm font-medium">{monthlyReport.trendMessage}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-muted/50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-primary">{monthlyReport.totalEntries}</p>
                            <p className="text-xs text-muted-foreground">Toplam Giriş</p>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-accent">{monthlyReport.avgIntensity.toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground">Ort. Yoğunluk</p>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-3 text-center">
                            <p className={cn(
                              'text-2xl font-bold',
                              monthlyReport.weeklyComparison > 0 ? 'text-green-600' : monthlyReport.weeklyComparison < 0 ? 'text-orange-600' : 'text-muted-foreground'
                            )}>
                              {monthlyReport.weeklyComparison > 0 ? '+' : ''}{monthlyReport.weeklyComparison}
                            </p>
                            <p className="text-xs text-muted-foreground">Haftalık Fark</p>
                          </div>
                        </div>

                        {/* Top triggers */}
                        {monthlyReport.topTriggers.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">En Sık Tetikleyiciler</p>
                            <div className="flex flex-wrap gap-2">
                              {monthlyReport.topTriggers.map((trigger, i) => (
                                <span 
                                  key={i} 
                                  className="px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium"
                                >
                                  {trigger}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Emotion breakdown */}
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">Duygu Dağılımı</p>
                          {monthlyReport.emotionBreakdown.slice(0, 5).map((stat) => (
                            <div key={stat.emotion} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span>{emotionLabels[stat.emotion]?.emoji || '😐'}</span>
                                  <span>{emotionLabels[stat.emotion]?.label || stat.emotion}</span>
                                </span>
                                <span className="text-muted-foreground">{stat.count} ({stat.percentage.toFixed(0)}%)</span>
                              </div>
                              <Progress value={stat.percentage} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Bu ay henüz günlük girişi yok</p>
                        <p className="text-sm text-muted-foreground mt-1">Duygularını yazmaya başla!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            {ONBOARDING_STEPS.map((step) => (
              <Card key={step.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary">
                      {sectionIcons[step.id]}
                    </div>
                    <div>
                      <span className="block">{step.title}</span>
                      <span className="text-sm font-normal text-muted-foreground">{step.subtitle}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {step.options.map((option) => {
                      const selected = isSelected(step.field, option.value, step.type === 'multi');
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleOptionToggle(step.field, option.value, step.type === 'multi')}
                          className={cn(
                            'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200',
                            'hover:scale-105 active:scale-95',
                            selected
                              ? 'bg-primary/10 border-primary text-primary shadow-md'
                              : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
                          )}
                        >
                          <span className="text-lg">{option.icon}</span>
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Email info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block">Hesap Bilgileri</span>
                    <span className="text-sm font-normal text-muted-foreground">E-posta adresin</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-muted/50 px-4 py-3 rounded-lg">
                  {user?.email}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
}
