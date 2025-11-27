export type Emotion = 'happy' | 'sad' | 'anxious' | 'angry' | 'neutral' | 'excited' | 'calm';

export interface EmotionAnalysis {
  primaryEmotion: Emotion;
  intensity: number; // 1-10
  triggers: string[];
}

export interface Suggestion {
  type: 'breathing' | 'activity' | 'motivation';
  title: string;
  description: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  createdAt: Date;
  emotion?: EmotionAnalysis;
  suggestions?: Suggestion[];
  isLocked?: boolean;
}
