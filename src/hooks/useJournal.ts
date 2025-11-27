import { useState, useCallback } from 'react';
import { JournalEntry, EmotionAnalysis, Emotion } from '@/types/journal';
import { defaultSuggestions } from '@/data/emotionData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addEntry = useCallback(async (content: string) => {
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

      const suggestions = defaultSuggestions[analysis.primaryEmotion] || [];
      
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        content,
        createdAt: new Date(),
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
      
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        content,
        createdAt: new Date(),
        emotion: fallbackAnalysis,
        suggestions: defaultSuggestions.neutral,
      };
      
      setEntries(prev => [newEntry, ...prev]);
      setCurrentAnalysis(fallbackAnalysis);
      
      return newEntry;
    }
  }, []);

  const clearCurrentAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
  }, []);

  return {
    entries,
    currentAnalysis,
    isAnalyzing,
    addEntry,
    clearCurrentAnalysis,
  };
}
