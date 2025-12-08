import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { JournalEntry } from '@/types/journal';
import { Achievement, UserStats } from '@/types/rewards';
import { exportUserData, ExportFormat } from '@/utils/exportData';
import { toast } from 'sonner';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  achievements: Achievement[];
  stats: UserStats;
}

export function ExportDataModal({ isOpen, onClose, entries, achievements, stats }: ExportDataModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      exportUserData(entries, achievements, stats, format);
      toast.success(`Veriler ${format.toUpperCase()} formatında indirildi`);
      onClose();
    } catch (error) {
      toast.error('Dışa aktarma sırasında hata oluştu');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Verileri Dışa Aktar
          </DialogTitle>
          <DialogDescription>
            Tüm günlük girişlerinizi, başarımlarınızı ve istatistiklerinizi indirin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground">
            <p>Toplam {entries.length} günlük girişi</p>
            <p>{achievements.filter(a => a.unlockedAt).length} açılmış başarım</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => handleExport('json')}
              disabled={isExporting}
            >
              <FileJson className="h-8 w-8 text-primary" />
              <span>JSON</span>
              <span className="text-xs text-muted-foreground">Tüm veriler</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => handleExport('csv')}
              disabled={isExporting}
            >
              <FileSpreadsheet className="h-8 w-8 text-green-500" />
              <span>CSV</span>
              <span className="text-xs text-muted-foreground">Sadece girişler</span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            JSON tüm verileri içerir. CSV sadece günlük girişlerini Excel'de açmak için uygundur.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
