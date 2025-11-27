import { Achievement, UserStats } from '@/types/rewards';
import { getLevelTitle, getPointsForNextLevel } from '@/data/achievementsData';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Flame, Star, Target, Lock } from 'lucide-react';

interface RewardsPanelProps {
  achievements: Achievement[];
  stats: UserStats;
  progress: number;
}

export function RewardsPanel({ achievements, stats, progress }: RewardsPanelProps) {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  
  const nextLevelPoints = getPointsForNextLevel(stats.level);
  const currentLevelPoints = stats.level > 1 ? getPointsForNextLevel(stats.level - 1) : 0;
  const pointsToNext = nextLevelPoints - stats.points;

  return (
    <div className="space-y-6">
      {/* Level Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{stats.level}</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{getLevelTitle(stats.level)}</h3>
                <p className="text-sm text-muted-foreground">{stats.points} puan</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              Seviye {stats.level}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sonraki seviye</span>
              <span className="font-medium">{pointsToNext > 0 ? `${pointsToNext} puan kaldı` : 'Maksimum!'}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Günlük Seri</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.longestStreak}</p>
                <p className="text-xs text-muted-foreground">En Uzun Seri</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{unlockedAchievements.length}</p>
                <p className="text-xs text-muted-foreground">Başarı</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalEntries}</p>
                <p className="text-xs text-muted-foreground">Toplam Giriş</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Tabs defaultValue="unlocked" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unlocked">
            Açılan ({unlockedAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="locked">
            Kilitli ({lockedAchievements.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unlocked" className="mt-4">
          {unlockedAchievements.length === 0 ? (
            <Card className="bg-card/50">
              <CardContent className="pt-6 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">Henüz başarı açılmadı</p>
                <p className="text-sm text-muted-foreground">Yazmaya devam et!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-2">
              {unlockedAchievements.map(achievement => (
                <Card key={achievement.id} className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">✓</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="locked" className="mt-4">
          <div className="grid gap-2">
            {lockedAchievements.map(achievement => (
              <Card key={achievement.id} className="bg-card/30 opacity-60">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl grayscale">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
