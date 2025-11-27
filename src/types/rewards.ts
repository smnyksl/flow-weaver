export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'entries' | 'streak' | 'emotions' | 'triggers';
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  uniqueEmotions: number;
  totalTriggers: number;
  points: number;
  level: number;
}
