import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePreferences } from '@/hooks/usePreferences';
import { OnboardingStepComponent } from '@/components/onboarding/OnboardingStep';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { ONBOARDING_STEPS, UserPreferences } from '@/types/preferences';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type PreferenceField = keyof Pick<UserPreferences, 'music_genres' | 'hobbies' | 'sleep_pattern' | 'exercise_frequency' | 'personality_type' | 'stress_coping' | 'meditation_experience' | 'emotional_goals'>;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { preferences, loading: prefLoading, updatePreferences, completeOnboarding } = usePreferences(user?.id);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (preferences?.onboarding_completed) {
      navigate('/');
    }
  }, [preferences, navigate]);

  const handleAnswerChange = (value: string | string[]) => {
    const field = ONBOARDING_STEPS[currentStep].field;
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      // Transform answers to match the database schema
      const updates: Record<string, string | string[] | null> = {};
      
      Object.entries(answers).forEach(([key, value]) => {
        updates[key] = value;
      });

      await updatePreferences(updates as Partial<UserPreferences>);

      await updatePreferences(updates);
      await completeOnboarding();
      
      toast.success('Hoş geldin! Artık sana özel tavsiyeler alabilirsin.');
      navigate('/');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Bir hata oluştu, tekrar dene.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    setIsSaving(true);
    try {
      await completeOnboarding();
      toast.info('Tercihleri daha sonra ayarlardan güncelleyebilirsin.');
      navigate('/');
    } catch (error) {
      toast.error('Bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || prefLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const currentAnswer = answers[currentStepData.field] || (currentStepData.type === 'multi' ? [] : '');
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const canProceed = currentStepData.type === 'multi' 
    ? (currentAnswer as string[]).length > 0 
    : currentAnswer !== '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">Duygu Günlüğü</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSkip}
          disabled={isSaving}
        >
          Atla
        </Button>
      </header>

      {/* Progress */}
      <div className="px-4 py-2">
        <OnboardingProgress 
          currentStep={currentStep} 
          totalSteps={ONBOARDING_STEPS.length} 
        />
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col justify-center px-4 py-8">
        <div className="max-w-md mx-auto w-full">
          <OnboardingStepComponent
            step={currentStepData}
            value={currentAnswer}
            onChange={handleAnswerChange}
          />
        </div>
      </main>

      {/* Navigation */}
      <footer className="p-4 space-y-3">
        <div className="flex gap-3 max-w-md mx-auto">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSaving}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Geri
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed || isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLastStep ? (
              <>
                <Sparkles className="w-4 h-4 mr-1" />
                Başla
              </>
            ) : (
              <>
                Devam
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </footer>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
}
