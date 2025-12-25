import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, User, Music, Gamepad2, Moon, Dumbbell, Brain, Target, Loader2, Palette, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { usePreferences } from '@/hooks/usePreferences';
import { useTheme } from '@/hooks/useTheme';
import { ONBOARDING_STEPS, THEME_COLORS, ThemeColor } from '@/types/preferences';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Language = 'tr' | 'en' | 'de';

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const sectionIcons: Record<string, React.ReactNode> = {
  music: <Music className="w-5 h-5" />,
  hobbies: <Gamepad2 className="w-5 h-5" />,
  sleep: <Moon className="w-5 h-5" />,
  exercise: <Dumbbell className="w-5 h-5" />,
  personality: <Brain className="w-5 h-5" />,
  goals: <Target className="w-5 h-5" />,
};

export default function Profile() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { preferences, loading: prefLoading } = usePreferences(user?.id);
  const { themeColor, updateTheme } = useTheme();
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('tr');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Load language from preferences or localStorage
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang) {
      setCurrentLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    if (preferences) {
      setFormData({
        music_genres: preferences.music_genres || [],
        hobbies: preferences.hobbies || [],
        sleep_pattern: preferences.sleep_pattern || '',
        exercise_frequency: preferences.exercise_frequency || '',
        personality_type: preferences.personality_type || '',
        stress_coping: preferences.stress_coping || [],
        meditation_experience: preferences.meditation_experience || '',
        emotional_goals: preferences.emotional_goals || [],
      });
      
      // Set language from preferences if available
      if (preferences.language) {
        setCurrentLanguage(preferences.language as Language);
        i18n.changeLanguage(preferences.language);
      }
    }
  }, [preferences, i18n]);

  const handleOptionToggle = (field: string, value: string, isMulti: boolean) => {
    setHasChanges(true);
    if (isMulti) {
      const currentValues = (formData[field] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setFormData(prev => ({ ...prev, [field]: newValues }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const isSelected = (field: string, value: string, isMulti: boolean): boolean => {
    if (isMulti) {
      return ((formData[field] as string[]) || []).includes(value);
    }
    return formData[field] === value;
  };

  const handleColorChange = (color: ThemeColor) => {
    updateTheme(color);
    toast.success(t('profile.themeChanged'));
  };

  const handleLanguageChange = async (lang: Language) => {
    setCurrentLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('app_language', lang);
    
    if (user) {
      try {
        await supabase
          .from('user_preferences')
          .update({ language: lang })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error saving language:', error);
      }
    }
    
    toast.success(t('profile.languageChanged'));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({
          music_genres: formData.music_genres as string[],
          hobbies: formData.hobbies as string[],
          sleep_pattern: formData.sleep_pattern as string || null,
          exercise_frequency: formData.exercise_frequency as string || null,
          personality_type: formData.personality_type as string || null,
          stress_coping: formData.stress_coping as string[],
          meditation_experience: formData.meditation_experience as string || null,
          emotional_goals: formData.emotional_goals as string[],
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(t('profile.preferencesSaved'));
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(t('common.error'));
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/app')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">{t('profile.title')}</h1>
                  <p className="text-xs text-muted-foreground">{t('profile.subtitle')}</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {t('common.save')}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Language Selector */}
        <Card className="overflow-hidden border-2 border-primary/20">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block">{t('profile.language')}</span>
                <span className="text-sm font-normal text-muted-foreground">{t('profile.languageDesc')}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => handleLanguageChange(lang.value)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200',
                    'hover:scale-105 active:scale-95',
                    currentLanguage === lang.value
                      ? 'bg-primary/10 border-primary shadow-md'
                      : 'bg-card border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={cn(
                    'font-medium',
                    currentLanguage === lang.value ? 'text-primary' : 'text-foreground'
                  )}>
                    {lang.label}
                  </span>
                  {currentLanguage === lang.value && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Theme Color Selector */}
        <Card className="overflow-hidden border-2 border-primary/20">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block">{t('profile.themeColor')}</span>
                <span className="text-sm font-normal text-muted-foreground">{t('profile.themeColorDesc')}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={cn(
                    'relative w-14 h-14 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95',
                    'ring-2 ring-offset-2 ring-offset-background',
                    themeColor === color.value 
                      ? 'ring-foreground shadow-lg' 
                      : 'ring-transparent hover:ring-muted-foreground/50'
                  )}
                  style={{
                    background: `linear-gradient(135deg, hsl(${color.hue} 70% 50%), hsl(${(color.hue + 60) % 360} 60% 50%))`
                  }}
                  title={t(`colors.${color.value}`)}
                >
                  {themeColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {t('colors.' + themeColor)}
            </p>
          </CardContent>
        </Card>

        {ONBOARDING_STEPS.map((step) => (
          <Card key={step.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary">
                  {sectionIcons[step.id]}
                </div>
                <div>
                  <span className="block">{t(`onboarding.${step.id}.title`)}</span>
                  <span className="text-sm font-normal text-muted-foreground">{t(`onboarding.${step.id}.subtitle`)}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {step.options.map((option) => {
                  const selected = isSelected(step.field, option.value, step.type === 'multi');
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionToggle(step.field, option.value, step.type === 'multi')}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200',
                        'hover:scale-105 active:scale-95',
                        selected
                          ? 'bg-primary/10 border-primary text-primary shadow-md'
                          : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
                      )}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Email info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="block">{t('profile.accountInfo')}</span>
                <span className="text-sm font-normal text-muted-foreground">{t('profile.emailAddress')}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground bg-muted/50 px-4 py-3 rounded-lg">
              {user?.email}
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
}
