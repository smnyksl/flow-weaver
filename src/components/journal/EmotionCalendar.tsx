import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { JournalEntry, Emotion } from '@/types/journal';
import { CalendarDays } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';

interface EmotionCalendarProps {
  entries: JournalEntry[];
}

const emotionEmojis: Record<Emotion, string> = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  angry: '😠',
  neutral: '😐',
  excited: '🤩',
  calm: '😌',
};

export function EmotionCalendar({ entries }: EmotionCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get entry for a specific date
  const getEntryForDate = (date: Date) => {
    return entries.find(entry => isSameDay(new Date(entry.createdAt), date));
  };

  // Custom day renderer
  const renderDay = (day: Date) => {
    const entry = getEntryForDate(day);
    const emoji = entry?.emotion ? emotionEmojis[entry.emotion.primaryEmotion] : null;
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{day.getDate()}</span>
        {emoji && (
          <span className="absolute -bottom-1 text-xs">{emoji}</span>
        )}
      </div>
    );
  };

  // Get entries for selected date
  const selectedEntry = selectedDate ? getEntryForDate(selectedDate) : null;

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Duygu Takvimi</h3>
      </div>
      
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        locale={tr}
        className="rounded-md border-0 pointer-events-auto"
        components={{
          DayContent: ({ date }) => renderDay(date),
        }}
        modifiers={{
          hasEntry: (date) => !!getEntryForDate(date),
        }}
        modifiersStyles={{
          hasEntry: {
            backgroundColor: 'hsl(var(--primary) / 0.1)',
            borderRadius: '0.5rem',
          },
        }}
      />

      {selectedEntry && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">
              {emotionEmojis[selectedEntry.emotion?.primaryEmotion || 'neutral']}
            </span>
            <span className="text-sm font-medium text-foreground">
              {format(new Date(selectedEntry.createdAt), 'd MMMM yyyy', { locale: tr })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {selectedEntry.content}
          </p>
        </div>
      )}
    </div>
  );
}
