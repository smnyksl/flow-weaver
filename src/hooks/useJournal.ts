import { useState, useCallback, useEffect, useRef } from 'react';
import { JournalEntry, EmotionAnalysis, Emotion, Suggestion } from '@/types/journal';
import { UserPreferences } from '@/types/preferences';
import { getRandomSuggestions } from '@/data/emotionData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { startOfDay, isAfter, subDays } from 'date-fns';

interface AIAnalysisResponse {
  primaryEmotion: Emotion;
  intensity: number;
  triggers: string[];
  suggestions: Suggestion[];
  weeklyInsight?: string;
  monthlyInsight?: string;
}

export function useJournal(userId: string | undefined, userPreferences?: UserPreferences | null, subscriptionLimits?: { dailyEntryLimit: number; historyDays: number }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionAnalysis | null>(null);
  const [currentInsights, setCurrentInsights] = useState<{ weekly?: string; monthly?: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const recentSuggestionsRef = useRef<string[]>([]);

  // Load entries from database when userId changes
  useEffect(() => {
    if (userId) {
      loadEntries();
    } else {
      setEntries([]);
      setIsLoading(false);
    }
  }, [userId]);

  const loadEntries = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const loadedEntries: JournalEntry[] = (data || []).map(entry => ({
        id: entry.id,
        content: entry.content,
        createdAt: new Date(entry.created_at),
        emotion: {
          primaryEmotion: entry.primary_emotion as Emotion,
          intensity: entry.intensity,
          triggers: entry.triggers || []
        },
        suggestions: getRandomSuggestions(entry.primary_emotion as Emotion, 3)
      }));

      setEntries(loadedEntries);
      
      // Track recent suggestions to avoid repetition
      const recent = loadedEntries.slice(0, 10).flatMap(e => 
        e.suggestions?.map(s => s.title) || []
      );
      recentSuggestionsRef.current = recent;
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error('Girişler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const addEntry = useCallback(async (content: string) => {
    if (!userId) {
      toast.error('Giriş yapmanız gerekiyor');
      return null;
    }

    // Check daily entry limit for free users
    if (subscriptionLimits && subscriptionLimits.dailyEntryLimit !== Infinity) {
      const todayStart = startOfDay(new Date());
      const todayEntries = entries.filter(e => isAfter(e.createdAt, todayStart));
      
      if (todayEntries.length >= subscriptionLimits.dailyEntryLimit) {
        toast.error(`Ücretsiz planda günde ${subscriptionLimits.dailyEntryLimit} giriş yapabilirsiniz. Premium'a geçin!`);
        return null;
      }
    }
    
    setIsAnalyzing(true);
    
    try {
      // Get historical entries for context
      const historicalEntries = entries.map(e => ({
        primary_emotion: e.emotion?.primaryEmotion || 'neutral',
        intensity: e.emotion?.intensity || 5,
        triggers: e.emotion?.triggers || [],
        created_at: e.createdAt.toISOString()
      }));

      // Prepare user preferences for AI
      const preferences = userPreferences ? {
        musicGenres: userPreferences.music_genres || [],
        hobbies: userPreferences.hobbies || [],
        sleepPattern: userPreferences.sleep_pattern,
        exerciseFrequency: userPreferences.exercise_frequency,
        personalityType: userPreferences.personality_type,
        stressCoping: userPreferences.stress_coping || [],
        meditationExperience: userPreferences.meditation_experience,
        emotionalGoals: userPreferences.emotional_goals || []
      } : null;

      // Call AI emotion analysis with historical context and preferences
      const { data, error } = await supabase.functions.invoke('analyze-emotion', {
        body: { 
          text: content,
          historicalEntries,
          recentSuggestions: recentSuggestionsRef.current,
          userPreferences: preferences
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message);
      }

      const aiResponse = data as AIAnalysisResponse;
      
      const analysis: EmotionAnalysis = {
        primaryEmotion: aiResponse.primaryEmotion as Emotion,
        intensity: aiResponse.intensity,
        triggers: aiResponse.triggers || []
      };

      // Use AI-generated suggestions
      const suggestions: Suggestion[] = aiResponse.suggestions || getRandomSuggestions(analysis.primaryEmotion, 3);

      // Save to database with user_id
      const { data: savedEntry, error: saveError } = await supabase
        .from('journal_entries')
        .insert({
          content,
          primary_emotion: analysis.primaryEmotion,
          intensity: analysis.intensity,
          triggers: analysis.triggers,
          user_id: userId
        })
        .select()
        .single();

      if (saveError) throw saveError;

      const newEntry: JournalEntry = {
        id: savedEntry.id,
        content,
        createdAt: new Date(savedEntry.created_at),
        emotion: analysis,
        suggestions,
      };
      
      // Update recent suggestions tracking
      const newSuggestionTitles = suggestions.map(s => s.title);
      recentSuggestionsRef.current = [...newSuggestionTitles, ...recentSuggestionsRef.current].slice(0, 30);
      
      setEntries(prev => [newEntry, ...prev]);
      setCurrentAnalysis(analysis);
      
      // Set insights if available
      if (aiResponse.weeklyInsight || aiResponse.monthlyInsight) {
        setCurrentInsights({
          weekly: aiResponse.weeklyInsight,
          monthly: aiResponse.monthlyInsight
        });
      }
      
      setIsAnalyzing(false);
      
      return newEntry;
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      setIsAnalyzing(false);
      
      // Show error toast
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          toast.error('Çok fazla istek. Lütfen biraz bekleyin.');
        } else if (error.message.includes('402')) {
          toast.error('Kredi yetersiz. Lütfen hesabınıza kredi ekleyin.');
        } else {
          toast.error('Analiz sırasında bir hata oluştu. Tekrar deneyin.');
        }
      }
      
      // Fallback to basic analysis
      const fallbackAnalysis: EmotionAnalysis = {
        primaryEmotion: 'neutral',
        intensity: 5,
        triggers: []
      };

      // Save fallback entry to database with user_id
      const { data: savedEntry, error: saveError } = await supabase
        .from('journal_entries')
        .insert({
          content,
          primary_emotion: fallbackAnalysis.primaryEmotion,
          intensity: fallbackAnalysis.intensity,
          triggers: fallbackAnalysis.triggers,
          user_id: userId
        })
        .select()
        .single();

      const newEntry: JournalEntry = {
        id: savedEntry?.id || Date.now().toString(),
        content,
        createdAt: new Date(savedEntry?.created_at || Date.now()),
        emotion: fallbackAnalysis,
        suggestions: getRandomSuggestions('neutral', 3),
      };
      
      setEntries(prev => [newEntry, ...prev]);
      setCurrentAnalysis(fallbackAnalysis);
      
      return newEntry;
    }
  }, [userId, entries, userPreferences, subscriptionLimits]);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== id));
      toast.success('Giriş silindi');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Giriş silinirken hata oluştu');
    }
  }, []);

  const clearCurrentAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
    setCurrentInsights(null);
  }, []);

  // Filter entries based on subscription limits
  const filteredEntries = subscriptionLimits && subscriptionLimits.historyDays !== Infinity
    ? entries.filter(e => isAfter(e.createdAt, subDays(new Date(), subscriptionLimits.historyDays)))
    : entries;

  return {
    entries: filteredEntries,
    allEntries: entries,
    currentAnalysis,
    currentInsights,
    isAnalyzing,
    isLoading,
    addEntry,
    deleteEntry,
    clearCurrentAnalysis,
  };
}
