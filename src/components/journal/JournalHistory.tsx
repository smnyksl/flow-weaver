import { JournalEntry } from '@/types/journal';
import { EntryCard } from './EntryCard';
import { History, BookOpen } from 'lucide-react';

interface JournalHistoryProps {
  entries: JournalEntry[];
  onEntryClick?: (entry: JournalEntry) => void;
}

export function JournalHistory({ entries, onEntryClick }: JournalHistoryProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">
          Henüz günlük girişin yok. İlk girişini yazarak başla!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Geçmiş Girişler</h3>
        <span className="ml-auto text-sm text-muted-foreground">
          {entries.length} giriş
        </span>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {entries.map((entry) => (
          <EntryCard 
            key={entry.id} 
            entry={entry} 
            onClick={() => onEntryClick?.(entry)}
          />
        ))}
      </div>
    </div>
  );
}
