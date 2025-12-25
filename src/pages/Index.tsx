import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/journal/AppHeader';
import { JournalInput } from '@/components/journal/JournalInput';
import { EmotionDisplay } from '@/components/journal/EmotionDisplay';
import { SuggestionList } from '@/components/journal/SuggestionList';
import { InsightsPanel } from '@/components/journal/InsightsPanel';
import { InsightsReportPanel } from '@/components/journal/InsightsReportPanel';
import { JournalHistory } from '@/components/journal/JournalHistory';
import { EmotionCalendar } from '@/components/journal/EmotionCalendar';
import { RewardsPanel } from '@/components/journal/RewardsPanel';
import { EntryDetailModal } from '@/components/journal/EntryDetailModal';
import { ExportDataModal } from '@/components/journal/ExportDataModal';
import { AnalyzingAnimation } from '@/components/journal/AnalyzingAnimation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJournal } from '@/hooks/useJournal';
import { useRewards } from '@/hooks/useRewards';
import { useAuth } from '@/hooks/useAuth';
import { usePreferences } from '@/hooks/usePreferences';
import { toast } from 'sonner';
import { Suggestion, JournalEntry } from '@/types/journal';
import { BookOpen, History, Calendar, Trophy, Loader2, BarChart3 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { preferences, loading: prefLoading } = usePreferences(user?.id);
  const { entries, currentAnalysis, currentInsights, isAnalyzing, isLoading, addEntry } = useJournal(user?.id, preferences);
  const { achievements, stats, getProgress } = useRewards(entries, user?.id);
  const [latestSuggestions, setLatestSuggestions] = useState<Suggestion[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    // Check if onboarding is completed
    if (!authLoading && !prefLoading && user && preferences && !preferences.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, authLoading, prefLoading, preferences, navigate]);

  const handleSubmit = async (content: string) => {
    const entry = await addEntry(content);
    if (entry) {
      // Use AI-generated suggestions if available
      if (entry.suggestions && entry.suggestions.length > 0) {
        setLatestSuggestions(entry.suggestions);
      }
      toast.success(t('journal.entrySaved'));
    }
  };

  if (authLoading || isLoading || prefLoading) {
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
      <AppHeader onExportClick={() => setShowExportModal(true)} />
      
      <Tabs defaultValue="journal" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-5 rounded-none border-b border-border bg-card h-14">
          <TabsTrigger value="journal" className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">{t('tabs.journal')}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
            <History className="w-5 h-5" />
            <span className="text-xs">{t('journal.history')}</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">{t('reports.title')}</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
            <Calendar className="w-5 h-5" />
            <span className="text-xs">{t('tabs.calendar')}</span>
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
              
              {/* Show analyzing animation while processing */}
              {isAnalyzing && <AnalyzingAnimation />}
              
              {/* Show results after analysis */}
              {!isAnalyzing && currentAnalysis && (
                <div className="space-y-4">
                  <EmotionDisplay analysis={currentAnalysis} />
                  {currentInsights && (
                    <InsightsPanel 
                      weeklyInsight={currentInsights.weekly} 
                      monthlyInsight={currentInsights.monthly} 
                    />
                  )}
                  {latestSuggestions.length > 0 && (
                    <SuggestionList suggestions={latestSuggestions} />
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <JournalHistory entries={entries} onEntryClick={setSelectedEntry} />
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <InsightsReportPanel 
                entries={entries}
                userId={user.id}
                weeklyInsight={currentInsights?.weekly}
                monthlyInsight={currentInsights?.monthly}
              />
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
      
      {/* Export Data Modal */}
      <ExportDataModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        entries={entries}
        achievements={achievements}
        stats={stats}
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
