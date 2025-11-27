import { BookHeart, BarChart3, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  onShowStats?: () => void;
  onShowRewards?: () => void;
}

export function AppHeader({ onShowStats, onShowRewards }: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flow-gradient flex items-center justify-center">
              <BookHeart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Duygu Günlüğü</h1>
              <p className="text-sm text-muted-foreground">Duygularını keşfet</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onShowRewards}>
              <Trophy className="w-4 h-4 mr-2" />
              Ödüller
            </Button>
            <Button variant="outline" size="sm" onClick={onShowStats}>
              <BarChart3 className="w-4 h-4 mr-2" />
              İstatistikler
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
