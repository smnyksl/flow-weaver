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
  deepAnalysis: {
    emotionalJourney: string;
    triggerAnalysis: string;
    patternInsights: string;
    weeklyNarrative: string;
    wellbeingSummary: string;
  };
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
          .map(([trigger, count]) => ({ trigger, count }));

        // Week by week analysis
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

        // Calculate positive/negative/neutral ratios
        const positiveEmotions = ['happy', 'excited', 'calm'];
        const negativeEmotions = ['sad', 'anxious', 'angry'];
        const positiveCount = typedEntries.filter(e => positiveEmotions.includes(e.primary_emotion)).length;
        const negativeCount = typedEntries.filter(e => negativeEmotions.includes(e.primary_emotion)).length;
        const neutralCount = typedEntries.filter(e => e.primary_emotion === 'neutral').length;

        // Find most active day
        const dayCounts: Record<number, number> = {};
        typedEntries.forEach(e => {
          const day = new Date(e.created_at).getDay();
          dayCounts[day] = (dayCounts[day] || 0) + 1;
        });
        const mostActiveDay = dayLabels[Number(Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0]) || 0];

        // Calculate longest positive streak
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

        // Generate recommendations
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

        // Calculate monthly trend early for use in deep analysis
        const firstHalf = typedEntries.slice(Math.floor(typedEntries.length / 2));
        const secondHalf = typedEntries.slice(0, Math.floor(typedEntries.length / 2));
        const firstScore = calculateEmotionScore(firstHalf);
        const secondScore = calculateEmotionScore(secondHalf);
        const monthlyTrend = secondScore > firstScore + 0.3 ? 'up' : secondScore < firstScore - 0.3 ? 'down' : 'stable';
        const avgEntriesPerWeekCalc = typedEntries.length / 4;

        // Generate deep analysis texts
        const dominantEmotionLabel = emotionLabels[monthlyBreakdown[0]?.emotion]?.label || 'belirsiz';
        const secondEmotionLabel = monthlyBreakdown[1] ? emotionLabels[monthlyBreakdown[1]?.emotion]?.label : null;
        
        // Emotional Journey Analysis
        let emotionalJourney = '';
        if (monthlyTrend === 'up') {
          emotionalJourney = `Bu ay duygusal yolculuğunda belirgin bir iyileşme gözlemliyoruz. Ayın başında yaşadığın bazı zorlukların üstesinden gelmeyi başardın ve şu an çok daha iyi bir noktadasın. ${positiveCount > negativeCount ? `Pozitif duygularının negatif duygulara oranı ${(positiveCount / Math.max(1, negativeCount)).toFixed(1)} kat daha yüksek, bu da duygusal dayanıklılığının güçlendiğini gösteriyor.` : ''} Özellikle ${dominantEmotionLabel} duygusunun baskın olması, kendini genel olarak ${positiveEmotions.includes(monthlyBreakdown[0]?.emotion) ? 'iyi ve dengeli hissettiğini' : 'bazı zorluklarla başa çıkmaya çalıştığını'} gösteriyor. Bu ilerlemeyi sürdürmek için şu anki rutinlerini korumaya devam etmeni öneriyoruz.`;
        } else if (monthlyTrend === 'down') {
          emotionalJourney = `Bu ay duygusal olarak bazı zorluklarla karşılaştığını görüyoruz. ${negativeCount} negatif duygu kaydı ile ${positiveCount} pozitif duygu kaydı arasındaki fark, bu dönemin senin için kolay geçmediğini gösteriyor. Ancak unutma ki duygusal dalgalanmalar hayatın doğal bir parçası ve bu dönemleri fark etmek bile önemli bir adım. ${dominantEmotionLabel} duygusunun sık yaşanması, belki de hayatında değişen bazı koşulların etkisi olabilir. Kendine nazik davranmayı ve gerekirse destek almayı düşünmeni öneriyoruz.`;
        } else {
          emotionalJourney = `Bu ay duygusal açıdan dengeli bir seyir izledin. Ne aşırı iniş ne de aşırı çıkışlar yaşadın, bu da duygusal stabiliteni koruduğunu gösteriyor. ${dominantEmotionLabel} duygusunun ${monthlyBreakdown[0]?.percentage.toFixed(0)}% oranında baskın olması${secondEmotionLabel ? ` ve onu ${secondEmotionLabel} duygusunun takip etmesi` : ''}, genel ruh halinin tutarlı olduğunu ortaya koyuyor. Bu denge, stresle başa çıkma becerilerinin iyi çalıştığının bir göstergesi olabilir.`;
        }

        // Trigger Analysis
        let triggerAnalysis = '';
        if (topTriggers.length > 0) {
          const primaryTrigger = topTriggers[0];
          triggerAnalysis = `Duygusal tetikleyicilerini incelediğimizde, "${primaryTrigger.trigger}" konusunun ${primaryTrigger.count} kez tekrarlandığını görüyoruz. Bu, hayatında bu alanın önemli bir duygusal yük taşıdığını gösteriyor. `;
          
          if (topTriggers.length > 1) {
            triggerAnalysis += `Bunu "${topTriggers[1].trigger}" (${topTriggers[1].count} kez) takip ediyor. `;
          }
          
          if (primaryTrigger.count >= 5) {
            triggerAnalysis += `Bu kadar sık tekrarlanan bir tetikleyici, üzerinde çalışılması gereken önemli bir alan olabilir. Bu konuyu bir terapist veya güvendiğin biriyle konuşmayı düşünebilirsin. Tetikleyicilerin farkında olmak, onlarla başa çıkmanın ilk adımıdır.`;
          } else if (primaryTrigger.count >= 3) {
            triggerAnalysis += `Bu tetikleyici henüz kritik seviyede olmasa da, takip etmeni öneririz. Hangi durumlarda bu tetikleyicinin ortaya çıktığını not etmek, gelecekte daha hazırlıklı olmanı sağlayabilir.`;
          } else {
            triggerAnalysis += `Tetikleyicilerin çeşitli olması, tek bir konuya takılı kalmadığını gösteriyor. Ancak yine de bu alanları gözlemlemeye devam etmeni öneririz.`;
          }
        } else {
          triggerAnalysis = 'Bu ay belirgin bir duygusal tetikleyici tespit edemedik. Bu, ya duygularını tetikleyen durumları kaydetmediğin ya da genel olarak stabil bir dönem geçirdiğin anlamına gelebilir. Tetikleyicileri kaydetmek, duygusal örüntülerini anlamak için çok değerli bir araçtır.';
        }

        // Pattern Insights
        let patternInsights = '';
        patternInsights = `Duygu dağılımına baktığımızda, ${dominantEmotionLabel} duygusunun %${monthlyBreakdown[0]?.percentage.toFixed(0)} ile en yoğun yaşanan duygu olduğunu görüyoruz. `;
        
        if (monthlyBreakdown.length > 2) {
          patternInsights += `Bunu sırasıyla ${emotionLabels[monthlyBreakdown[1]?.emotion]?.label || 'diğer'} (%${monthlyBreakdown[1]?.percentage.toFixed(0)}) ve ${emotionLabels[monthlyBreakdown[2]?.emotion]?.label || 'diğer'} (%${monthlyBreakdown[2]?.percentage.toFixed(0)}) takip ediyor. `;
        }
        
        const emotionalVariety = monthlyBreakdown.length;
        if (emotionalVariety >= 5) {
          patternInsights += `${emotionalVariety} farklı duygu deneyimlemiş olman, zengin bir duygusal yaşantın olduğunu gösteriyor. Bu çeşitlilik, duygusal zekânın gelişmiş olduğunun bir işareti olabilir.`;
        } else if (emotionalVariety >= 3) {
          patternInsights += `${emotionalVariety} farklı duygu deneyimlemiş olman, normal bir duygusal çeşitlilik aralığında olduğunu gösteriyor.`;
        } else {
          patternInsights += `Sadece ${emotionalVariety} farklı duygu kaydetmiş olman, duygularını daha detaylı incelemeye değer olabilir. Belki de daha ince duygu ayrımları yapmayı deneyebilirsin.`;
        }

        // Weekly Narrative
        let weeklyNarrative = '';
        if (weekByWeekData.length >= 2) {
          weeklyNarrative = 'Haftalık değişimlere baktığımızda: ';
          weekByWeekData.forEach((week, index) => {
            const weekEmotion = emotionLabels[week.dominantEmotion]?.label || 'belirsiz';
            if (index === 0) {
              weeklyNarrative += `İlk hafta ${week.entries} giriş ile ${weekEmotion} duygusu baskındı. `;
            } else {
              const prevWeek = weekByWeekData[index - 1];
              const change = week.score - prevWeek.score;
              if (change > 0.5) {
                weeklyNarrative += `${week.weekLabel}da belirgin bir iyileşme görüldü ve ${weekEmotion} duygusu öne çıktı. `;
              } else if (change < -0.5) {
                weeklyNarrative += `${week.weekLabel}da duygusal bir düşüş yaşandı, ${weekEmotion} duygusu baskın hale geldi. `;
              } else {
                weeklyNarrative += `${week.weekLabel}da benzer bir seyir devam etti. `;
              }
            }
          });
          
          if (weekByWeekData.length >= 4) {
            const firstHalfAvg = (weekByWeekData[0].score + weekByWeekData[1].score) / 2;
            const secondHalfAvg = (weekByWeekData[2].score + weekByWeekData[3].score) / 2;
            if (secondHalfAvg > firstHalfAvg + 0.3) {
              weeklyNarrative += 'Ayın ikinci yarısı ilk yarısına göre daha pozitif geçti.';
            } else if (secondHalfAvg < firstHalfAvg - 0.3) {
              weeklyNarrative += 'Ayın ilk yarısı ikinci yarısına göre daha iyi geçti, son haftalarda biraz zorlanmış olabilirsin.';
            } else {
              weeklyNarrative += 'Ay boyunca genel bir tutarlılık gözlemlendi.';
            }
          }
        } else {
          weeklyNarrative = 'Haftalık karşılaştırma yapabilmek için en az 2 haftalık veri gerekiyor. Düzenli günlük tutmaya devam et!';
        }

        // Wellbeing Summary
        let wellbeingSummary = '';
        const wellbeingScore = (positiveCount * 2 + neutralCount * 1 - negativeCount * 1.5) / typedEntries.length;
        
        if (wellbeingScore > 1) {
          wellbeingSummary = `Genel iyilik halin bu ay oldukça yüksek görünüyor! ${longestStreak > 3 ? `${longestStreak} günlük pozitif serinin de bunu destekliyor.` : ''} ${mostActiveDay} günleri en çok giriş yaptığın günler, bu da belki de bu günlerde daha fazla düşünmeye ve kendini ifade etmeye zaman ayırdığını gösteriyor. Haftada ortalama ${avgEntriesPerWeekCalc.toFixed(1)} giriş yapman, duygusal farkındalığına özen gösterdiğinin güzel bir işareti.`;
        } else if (wellbeingScore > 0) {
          wellbeingSummary = `Bu ay genel olarak dengeli bir iyilik hali sergiliyorsun. Pozitif ve negatif deneyimler arasında makul bir denge var. ${mostActiveDay} günleri en aktif olduğun günler. ${avgEntriesPerWeekCalc >= 3 ? 'Düzenli günlük tutma alışkanlığın, duygusal sağlığın için olumlu bir adım.' : 'Daha düzenli giriş yapmak, duygusal farkındalığını artırabilir.'}`;
        } else {
          wellbeingSummary = `Bu ay zorlu bir dönem geçirdiğin görülüyor. Negatif duygular pozitif duygulara göre daha baskın olmuş. Bu tamamen normal ve herkesin zaman zaman böyle dönemleri olur. Önemli olan bu duyguların farkında olman ve gerektiğinde destek aramaktan çekinmemen. ${longestStreak > 0 ? `En azından ${longestStreak} günlük bir pozitif serin olduğunu unutma!` : ''} Kendine karşı nazik ol ve küçük adımlarla ilerle.`;
        }

        const deepAnalysis = {
          emotionalJourney,
          triggerAnalysis,
          patternInsights,
          weeklyNarrative,
          wellbeingSummary,
        };

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
          deepAnalysis,
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

                        {/* Main Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 text-center border border-primary/20">
                            <p className="text-3xl font-bold text-primary">{monthlyReport.totalEntries}</p>
                            <p className="text-xs text-muted-foreground mt-1">Toplam Giriş</p>
                          </div>
                          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-4 text-center border border-accent/20">
                            <p className="text-3xl font-bold text-accent">{monthlyReport.avgIntensity.toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Ort. Yoğunluk</p>
                          </div>
                        </div>

                        {/* Emotion Ratio Bar */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Duygu Oranları</p>
                          <div className="flex h-4 rounded-full overflow-hidden">
                            <div 
                              className="bg-green-500 transition-all" 
                              style={{ width: `${monthlyReport.positiveRatio}%` }}
                              title={`Pozitif: ${monthlyReport.positiveRatio.toFixed(0)}%`}
                            />
                            <div 
                              className="bg-gray-400 transition-all" 
                              style={{ width: `${monthlyReport.neutralRatio}%` }}
                              title={`Nötr: ${monthlyReport.neutralRatio.toFixed(0)}%`}
                            />
                            <div 
                              className="bg-orange-500 transition-all" 
                              style={{ width: `${monthlyReport.negativeRatio}%` }}
                              title={`Negatif: ${monthlyReport.negativeRatio.toFixed(0)}%`}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
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

                        {/* Week by Week Analysis */}
                        {monthlyReport.weekByWeekData.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-muted-foreground">Haftalık Karşılaştırma</p>
                            <div className="space-y-2">
                              {monthlyReport.weekByWeekData.map((week) => (
                                <div 
                                  key={week.weekNumber}
                                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                                >
                                  <div className="w-20 text-sm font-medium">{week.weekLabel}</div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{emotionLabels[week.dominantEmotion]?.emoji || '😐'}</span>
                                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <div 
                                          className={cn(
                                            'h-full rounded-full transition-all',
                                            week.score > 0.5 ? 'bg-green-500' : week.score < -0.5 ? 'bg-orange-500' : 'bg-blue-500'
                                          )}
                                          style={{ width: `${Math.min(100, Math.max(20, (week.score + 2) * 25))}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-muted-foreground w-8">{week.entries}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Additional Stats */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-muted/50 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-foreground">{monthlyReport.mostActiveDay}</p>
                            <p className="text-[10px] text-muted-foreground">En Aktif Gün</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-foreground">{monthlyReport.avgEntriesPerWeek.toFixed(1)}</p>
                            <p className="text-[10px] text-muted-foreground">Haftalık Ort.</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-green-600">{monthlyReport.longestPositiveStreak}</p>
                            <p className="text-[10px] text-muted-foreground">Pozitif Seri</p>
                          </div>
                        </div>

                        {/* Top triggers */}
                        {monthlyReport.topTriggers.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">En Sık Tetikleyiciler</p>
                            <div className="flex flex-wrap gap-2">
                              {monthlyReport.topTriggers.map((item, i) => (
                                <span 
                                  key={i} 
                                  className={cn(
                                    'px-3 py-1.5 rounded-full text-sm font-medium',
                                    i === 0 ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300' : 'bg-accent/10 text-accent'
                                  )}
                                >
                                  {item.trigger} ({item.count})
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

                        {/* Deep Analysis Section */}
                        <div className="space-y-6">
                          <div className="border-t border-border pt-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                              <Brain className="w-5 h-5 text-primary" />
                              Derinlemesine Analiz
                            </h3>
                            
                            {/* Emotional Journey */}
                            <div className="space-y-4 mb-6">
                              <div className="p-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl border border-blue-500/10">
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-blue-500" />
                                  Duygusal Yolculuğun
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {monthlyReport.deepAnalysis.emotionalJourney}
                                </p>
                              </div>
                              
                              {/* Trigger Analysis */}
                              <div className="p-4 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-xl border border-orange-500/10">
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                  <Target className="w-4 h-4 text-orange-500" />
                                  Tetikleyici Analizi
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {monthlyReport.deepAnalysis.triggerAnalysis}
                                </p>
                              </div>
                              
                              {/* Pattern Insights */}
                              <div className="p-4 bg-gradient-to-br from-green-500/5 to-teal-500/5 rounded-xl border border-green-500/10">
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4 text-green-500" />
                                  Duygu Örüntüleri
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {monthlyReport.deepAnalysis.patternInsights}
                                </p>
                              </div>
                              
                              {/* Weekly Narrative */}
                              <div className="p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl border border-purple-500/10">
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-purple-500" />
                                  Haftalık Seyir
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {monthlyReport.deepAnalysis.weeklyNarrative}
                                </p>
                              </div>
                              
                              {/* Wellbeing Summary */}
                              <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                  <User className="w-4 h-4 text-primary" />
                                  Genel İyilik Hali
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {monthlyReport.deepAnalysis.wellbeingSummary}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        {monthlyReport.recommendations.length > 0 && (
                          <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <Target className="w-4 h-4 text-primary" />
                              Öneriler
                            </p>
                            <ul className="space-y-2">
                              {monthlyReport.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <span className="text-primary mt-0.5">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
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
