import { useState, useCallback, useEffect } from 'react';
import { Achievement, UserStats } from '@/types/rewards';
import { JournalEntry } from '@/types/journal';
import { achievementTemplates, getLevelFromPoints, getPointsForNextLevel } from '@/data/achievementsData';
import { toast } from 'sonner';

const POINTS_PER_ENTRY = 10;
const POINTS_PER_STREAK_DAY = 5;
const POINTS_PER_ACHIEVEMENT = 25;

export function useRewards(entries: JournalEntry[]) {
  const [achievements, setAchievements] = useState<Achievement[]>(() => 
    achievementTemplates.map(a => ({ ...a, unlocked: false }))
  );
  const [stats, setStats] = useState<UserStats>({
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
    uniqueEmotions: 0,
    totalTriggers: 0,
    points: 0,
    level: 1
  });

  const calculateStreak = useCallback((entries: JournalEntry[]): { current: number; longest: number } => {
    if (entries.length === 0) return { current: 0, longest: 0 };
    
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const uniqueDays = new Set(
      sortedEntries.map(e => new Date(e.createdAt).toDateString())
    );
    const daysArray = Array.from(uniqueDays).map(d => new Date(d));
    daysArray.sort((a, b) => b.getTime() - a.getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (daysArray.length > 0) {
      const lastEntryDay = new Date(daysArray[0]);
      lastEntryDay.setHours(0, 0, 0, 0);
      
      if (lastEntryDay.getTime() === today.getTime() || lastEntryDay.getTime() === yesterday.getTime()) {
        currentStreak = 1;
        for (let i = 1; i < daysArray.length; i++) {
          const diff = (daysArray[i - 1].getTime() - daysArray[i].getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }
    
    for (let i = 1; i < daysArray.length; i++) {
      const diff = (daysArray[i - 1].getTime() - daysArray[i].getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    
    return { current: currentStreak, longest: longestStreak };
  }, []);

  const checkAchievements = useCallback((newStats: UserStats, currentAchievements: Achievement[]) => {
    const updatedAchievements = currentAchievements.map(achievement => {
      if (achievement.unlocked) return achievement;
      
      let value = 0;
      switch (achievement.type) {
        case 'entries':
          value = newStats.totalEntries;
          break;
        case 'streak':
          value = Math.max(newStats.currentStreak, newStats.longestStreak);
          break;
        case 'emotions':
          value = newStats.uniqueEmotions;
          break;
        case 'triggers':
          value = newStats.totalTriggers;
          break;
      }
      
      if (value >= achievement.requirement) {
        toast.success(`🎉 Başarı Açıldı: ${achievement.title}`, {
          description: achievement.description,
          duration: 5000
        });
        return { ...achievement, unlocked: true, unlockedAt: new Date() };
      }
      
      return achievement;
    });
    
    return updatedAchievements;
  }, []);

  useEffect(() => {
    const { current, longest } = calculateStreak(entries);
    
    const uniqueEmotions = new Set(
      entries.map(e => e.emotion?.primaryEmotion).filter(Boolean)
    ).size;
    
    const allTriggers = entries.flatMap(e => e.emotion?.triggers || []);
    const uniqueTriggers = new Set(allTriggers).size;
    
    const basePoints = entries.length * POINTS_PER_ENTRY;
    const streakBonus = current * POINTS_PER_STREAK_DAY;
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const achievementPoints = unlockedCount * POINTS_PER_ACHIEVEMENT;
    const totalPoints = basePoints + streakBonus + achievementPoints;
    
    const newStats: UserStats = {
      totalEntries: entries.length,
      currentStreak: current,
      longestStreak: longest,
      uniqueEmotions,
      totalTriggers: uniqueTriggers,
      points: totalPoints,
      level: getLevelFromPoints(totalPoints)
    };
    
    setStats(newStats);
    
    const updatedAchievements = checkAchievements(newStats, achievements);
    if (JSON.stringify(updatedAchievements) !== JSON.stringify(achievements)) {
      setAchievements(updatedAchievements);
    }
  }, [entries, calculateStreak, checkAchievements]);

  const getProgress = useCallback(() => {
    const currentLevelPoints = stats.level > 1 ? getPointsForNextLevel(stats.level - 1) : 0;
    const nextLevelPoints = getPointsForNextLevel(stats.level);
    const progressPoints = stats.points - currentLevelPoints;
    const neededPoints = nextLevelPoints - currentLevelPoints;
    return Math.min((progressPoints / neededPoints) * 100, 100);
  }, [stats]);

  return {
    achievements,
    stats,
    getProgress
  };
}
