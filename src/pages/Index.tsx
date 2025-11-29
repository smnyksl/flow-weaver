import { useState } from 'react';
import { AppHeader } from '@/components/journal/AppHeader';
import { JournalInput } from '@/components/journal/JournalInput';
import { EmotionDisplay } from '@/components/journal/EmotionDisplay';
import { SuggestionList } from '@/components/journal/SuggestionList';
import { JournalHistory } from '@/components/journal/JournalHistory';
import { EmotionCalendar } from '@/components/journal/EmotionCalendar';
import { StatsModal } from '@/components/journal/StatsModal';
import { RewardsModal } from '@/components/journal/RewardsModal';
import { EntryDetailModal } from '@/components/journal/EntryDetailModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJournal } from '@/hooks/useJournal';
import { useRewards } from '@/hooks/useRewards';
import { getRandomSuggestions } from '@/data/emotionData';
import { toast } from 'sonner';
import { Suggestion, JournalEntry } from '@/types/journal';
import { Calendar, History } from 'lucide-react';

const Index = () => {
  const { entries, currentAnalysis, isAnalyzing, isLoading, addEntry } = useJournal();
  const { achievements, stats, getProgress } = useRewards(entries);
  const [latestSuggestions, setLatestSuggestions] = useState<Suggestion[]>([]);
  const [statsOpen, setStatsOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const handleSubmit = async (content: string) => {
    const entry = await addEntry(content);
    if (entry.emotion) {
      setLatestSuggestions(getRandomSuggestions(entry.emotion.primaryEmotion, 3));
      toast.success('Günlük girişin kaydedildi!');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader 
        onShowStats={() => setStatsOpen(true)} 
        onShowRewards={() => setRewardsOpen(true)}
      />
      
      <main className="flex-1 container mx-auto px-4 py-4 pb-20">
        <div className="space-y-4 max-w-lg mx-auto">
          <JournalInput onSubmit={handleSubmit} isAnalyzing={isAnalyzing} />
          
          {currentAnalysis && (
            <div className="space-y-4">
              <EmotionDisplay analysis={currentAnalysis} />
              {latestSuggestions.length > 0 && (
                <SuggestionList suggestions={latestSuggestions} />
              )}
            </div>
          )}
          
          {/* Tab Section */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Geçmiş
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Takvim
              </TabsTrigger>
            </TabsList>
            <TabsContent value="history">
              <JournalHistory entries={entries} onEntryClick={setSelectedEntry} />
            </TabsContent>
            <TabsContent value="calendar">
              <EmotionCalendar entries={entries} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Stats Modal */}
      <StatsModal 
        open={statsOpen} 
        onOpenChange={setStatsOpen} 
        entries={entries} 
      />
      
      {/* Rewards Modal */}
      <RewardsModal
        open={rewardsOpen}
        onOpenChange={setRewardsOpen}
        achievements={achievements}
        stats={stats}
        progress={getProgress()}
      />
      
      {/* Entry Detail Modal */}
      <EntryDetailModal
        entry={selectedEntry}
        open={!!selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      />
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
};

export default Index;
