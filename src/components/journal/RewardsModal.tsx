import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RewardsPanel } from './RewardsPanel';
import { Achievement, UserStats } from '@/types/rewards';

interface RewardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievements: Achievement[];
  stats: UserStats;
  progress: number;
}

export function RewardsModal({ open, onOpenChange, achievements, stats, progress }: RewardsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🏆 Ödüller ve Başarılar
          </DialogTitle>
        </DialogHeader>
        <RewardsPanel achievements={achievements} stats={stats} progress={progress} />
      </DialogContent>
    </Dialog>
  );
}
