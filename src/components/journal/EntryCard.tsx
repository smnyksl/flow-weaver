import { JournalEntry } from '@/types/journal';
import { emotionLabels, emotionEmojis } from '@/data/emotionData';
import { cn } from '@/lib/utils';
import { Lock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface EntryCardProps {
  entry: JournalEntry;
  onClick?: () => void;
}

export function EntryCard({ entry, onClick }: EntryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left bg-card rounded-lg border border-border p-4',
        'shadow-soft hover:shadow-node transition-all duration-200',
        'hover:border-primary/30'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {format(entry.createdAt, "d MMMM yyyy, HH:mm", { locale: tr })}
            </span>
            {entry.isLocked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
          
          <p className="text-sm text-foreground line-clamp-2">
            {entry.content}
          </p>
        </div>
        
        {entry.emotion && (
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <span className="text-2xl">{emotionEmojis[entry.emotion.primaryEmotion]}</span>
            <span className="text-xs text-muted-foreground">
              {emotionLabels[entry.emotion.primaryEmotion]}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
