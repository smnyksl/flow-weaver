import { useState, useCallback, useEffect } from 'react';
import { JournalEntry, EmotionAnalysis, Emotion } from '@/types/journal';
import { getRandomSuggestions } from '@/data/emotionData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useJournal(userId: string | undefined) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    
    setIsAnalyzing(true);
    
    try {
      // Call AI emotion analysis
      const { data, error } = await supabase.functions.invoke('analyze-emotion', {
        body: { text: content }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message);
      }

      const analysis: EmotionAnalysis = {
        primaryEmotion: data.primaryEmotion as Emotion,
        intensity: data.intensity,
        triggers: data.triggers || []
      };

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

      const suggestions = getRandomSuggestions(analysis.primaryEmotion, 3);
      
      const newEntry: JournalEntry = {
        id: savedEntry.id,
        content,
        createdAt: new Date(savedEntry.created_at),
        emotion: analysis,
        suggestions,
      };
      
      setEntries(prev => [newEntry, ...prev]);
      setCurrentAnalysis(analysis);
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
  }, [userId]);

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
  }, []);

  return {
    entries,
    currentAnalysis,
    isAnalyzing,
    isLoading,
    addEntry,
    deleteEntry,
    clearCurrentAnalysis,
  };
}
