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
import { useJournal } from '@/hooks/useJournal';
import { useRewards } from '@/hooks/useRewards';
import { getRandomSuggestions } from '@/data/emotionData';
import { toast } from 'sonner';
import { Suggestion, JournalEntry } from '@/types/journal';

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
    <div className="min-h-screen bg-background">
      <AppHeader 
        onShowStats={() => setStatsOpen(true)} 
        onShowRewards={() => setRewardsOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <JournalInput onSubmit={handleSubmit} isAnalyzing={isAnalyzing} />
            
            {currentAnalysis && (
              <div className="grid md:grid-cols-2 gap-6">
                <EmotionDisplay analysis={currentAnalysis} />
                {latestSuggestions.length > 0 && (
                  <SuggestionList suggestions={latestSuggestions} />
                )}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <EmotionCalendar entries={entries} />
            <JournalHistory entries={entries} onEntryClick={setSelectedEntry} />
          </div>
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
