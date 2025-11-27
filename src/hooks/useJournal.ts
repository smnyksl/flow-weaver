import { useState, useCallback } from 'react';
import { JournalEntry, EmotionAnalysis, Emotion } from '@/types/journal';
import { defaultSuggestions } from '@/data/emotionData';

// Simple keyword-based emotion detection (will be replaced with AI later)
function analyzeEmotion(text: string): EmotionAnalysis {
  const lowerText = text.toLowerCase();
  
  const emotionKeywords: Record<Emotion, string[]> = {
    happy: ['mutlu', 'sevinçli', 'güzel', 'harika', 'muhteşem', 'keyifli', 'neşeli', 'sevindim'],
    sad: ['üzgün', 'kötü', 'mutsuz', 'ağladım', 'hüzünlü', 'kederli', 'berbat'],
    anxious: ['endişeli', 'kaygılı', 'stresli', 'gergin', 'tedirgin', 'panik', 'korku'],
    angry: ['kızgın', 'sinirli', 'öfkeli', 'çıldırdım', 'bıktım', 'nefret'],
    excited: ['heyecanlı', 'sabırsız', 'coşkulu', 'meraklı', 'enerji'],
    calm: ['sakin', 'huzurlu', 'dingin', 'rahat', 'gevşemiş'],
    neutral: ['normal', 'idare', 'fena değil', 'orta'],
  };

  let detectedEmotion: Emotion = 'neutral';
  let maxScore = 0;

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const score = keywords.filter(kw => lowerText.includes(kw)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion as Emotion;
    }
  }

  // Extract potential triggers
  const triggerPatterns = [
    /çünkü\s+(.+?)(?:\.|,|!|$)/gi,
    /nedeni\s+(.+?)(?:\.|,|!|$)/gi,
    /yüzünden\s+(.+?)(?:\.|,|!|$)/gi,
  ];

  const triggers: string[] = [];
  for (const pattern of triggerPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length < 50) {
        triggers.push(match[1].trim());
      }
    }
  }

  // Calculate intensity based on text length and exclamation marks
  const exclamations = (text.match(/!/g) || []).length;
  const baseIntensity = Math.min(maxScore * 2 + 3, 8);
  const intensity = Math.min(baseIntensity + exclamations, 10);

  return {
    primaryEmotion: detectedEmotion,
    intensity: intensity || 5,
    triggers: triggers.slice(0, 3),
  };
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addEntry = useCallback(async (content: string) => {
    setIsAnalyzing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysis = analyzeEmotion(content);
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
