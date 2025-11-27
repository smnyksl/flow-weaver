import { Achievement } from '@/types/rewards';

export const achievementTemplates: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Entry milestones
  { id: 'first_entry', title: 'İlk Adım', description: 'İlk günlük girişini yaptın!', icon: '🌱', requirement: 1, type: 'entries' },
  { id: 'five_entries', title: 'Düzenli Başlangıç', description: '5 günlük girişi tamamladın!', icon: '📝', requirement: 5, type: 'entries' },
  { id: 'ten_entries', title: 'Kararlı Yazar', description: '10 günlük girişi tamamladın!', icon: '✍️', requirement: 10, type: 'entries' },
  { id: 'twenty_five_entries', title: 'Deneyimli Günlükçü', description: '25 günlük girişi tamamladın!', icon: '📖', requirement: 25, type: 'entries' },
  { id: 'fifty_entries', title: 'Usta Yazar', description: '50 günlük girişi tamamladın!', icon: '🏆', requirement: 50, type: 'entries' },
  { id: 'hundred_entries', title: 'Efsane', description: '100 günlük girişi tamamladın!', icon: '👑', requirement: 100, type: 'entries' },
  
  // Streak achievements
  { id: 'streak_3', title: '3 Gün Serisi', description: '3 gün üst üste yazdın!', icon: '🔥', requirement: 3, type: 'streak' },
  { id: 'streak_7', title: 'Haftalık Seri', description: '7 gün üst üste yazdın!', icon: '⚡', requirement: 7, type: 'streak' },
  { id: 'streak_14', title: '2 Haftalık Seri', description: '14 gün üst üste yazdın!', icon: '💫', requirement: 14, type: 'streak' },
  { id: 'streak_30', title: 'Aylık Seri', description: '30 gün üst üste yazdın!', icon: '🌟', requirement: 30, type: 'streak' },
  
  // Emotion variety
  { id: 'emotions_3', title: 'Duygu Kaşifi', description: '3 farklı duygu deneyimledin', icon: '🎭', requirement: 3, type: 'emotions' },
  { id: 'emotions_5', title: 'Duygu Ustası', description: '5 farklı duygu deneyimledin', icon: '🌈', requirement: 5, type: 'emotions' },
  { id: 'emotions_7', title: 'Tam Spektrum', description: 'Tüm duyguları deneyimledin!', icon: '💎', requirement: 7, type: 'emotions' },
  
  // Trigger awareness
  { id: 'triggers_5', title: 'Farkındalık', description: '5 tetikleyici keşfettin', icon: '🔍', requirement: 5, type: 'triggers' },
  { id: 'triggers_15', title: 'Derin Anlayış', description: '15 tetikleyici keşfettin', icon: '🧠', requirement: 15, type: 'triggers' },
  { id: 'triggers_30', title: 'Kendini Tanıyan', description: '30 tetikleyici keşfettin', icon: '🎯', requirement: 30, type: 'triggers' },
];

export const levelThresholds = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500];

export const getLevelFromPoints = (points: number): number => {
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (points >= levelThresholds[i]) return i + 1;
  }
  return 1;
};

export const getPointsForNextLevel = (level: number): number => {
  if (level >= levelThresholds.length) return levelThresholds[levelThresholds.length - 1];
  return levelThresholds[level];
};

export const getLevelTitle = (level: number): string => {
  const titles = [
    'Başlangıç',
    'Çaylak',
    'Öğrenci',
    'Gezgin',
    'Kaşif',
    'Bilge',
    'Usta',
    'Uzman',
    'Efsane',
    'Grandmaster'
  ];
  return titles[Math.min(level - 1, titles.length - 1)];
};
