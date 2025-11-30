import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/journal/AppHeader';
import { JournalInput } from '@/components/journal/JournalInput';
import { EmotionDisplay } from '@/components/journal/EmotionDisplay';
import { SuggestionList } from '@/components/journal/SuggestionList';
import { JournalHistory } from '@/components/journal/JournalHistory';
import { EmotionCalendar } from '@/components/journal/EmotionCalendar';
import { RewardsPanel } from '@/components/journal/RewardsPanel';
import { EntryDetailModal } from '@/components/journal/EntryDetailModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJournal } from '@/hooks/useJournal';
import { useRewards } from '@/hooks/useRewards';
import { useAuth } from '@/hooks/useAuth';
import { getRandomSuggestions } from '@/data/emotionData';
import { toast } from 'sonner';
import { Suggestion, JournalEntry } from '@/types/journal';
import { BookOpen, History, Calendar, Trophy, Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { entries, currentAnalysis, isAnalyzing, isLoading, addEntry } = useJournal(user?.id);
  const { achievements, stats, getProgress } = useRewards(entries, user?.id);
  const [latestSuggestions, setLatestSuggestions] = useState<Suggestion[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (content: string) => {
    const entry = await addEntry(content);
    if (entry?.emotion) {
      setLatestSuggestions(getRandomSuggestions(entry.emotion.primaryEmotion, 3));
      toast.success('Günlük girişin kaydedildi!');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      
      <Tabs defaultValue="journal" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-4 rounded-none border-b border-border bg-card h-14">
          <TabsTrigger value="journal" className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Günlük</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
            <History className="w-5 h-5" />
            <span className="text-xs">Geçmiş</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Takvim</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Ödüller</span>
          </TabsTrigger>
        </TabsList>

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-4 max-w-lg">
            <TabsContent value="journal" className="mt-0 space-y-4">
              <JournalInput onSubmit={handleSubmit} isAnalyzing={isAnalyzing} />
              {currentAnalysis && (
                <div className="space-y-4">
                  <EmotionDisplay analysis={currentAnalysis} />
                  {latestSuggestions.length > 0 && (
                    <SuggestionList suggestions={latestSuggestions} />
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <JournalHistory entries={entries} onEntryClick={setSelectedEntry} />
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <EmotionCalendar entries={entries} />
            </TabsContent>

            <TabsContent value="rewards" className="mt-0">
              <RewardsPanel 
                achievements={achievements} 
                stats={stats} 
                progress={getProgress()} 
              />
            </TabsContent>
          </div>
        </main>
      </Tabs>
      
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
