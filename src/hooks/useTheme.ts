import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ThemeColor, THEME_COLORS } from '@/types/preferences';

const getThemeCSS = (hue: number) => ({
  // Light mode
  '--primary': `${hue} 70% 50%`,
  '--primary-foreground': '0 0% 100%',
  '--accent': `${(hue + 60) % 360} 60% 50%`,
  '--ring': `${hue} 70% 50%`,
  '--node-shadow': `${hue} 70% 50%`,
  '--connector-color': `${hue} 70% 50%`,
  '--connector-secondary': `${(hue + 60) % 360} 60% 50%`,
});

const getDarkThemeCSS = (hue: number) => ({
  '--primary': `${hue} 70% 55%`,
  '--primary-foreground': '222 47% 11%',
  '--accent': `${(hue + 60) % 360} 60% 45%`,
  '--ring': `${hue} 70% 55%`,
  '--node-shadow': `${hue} 70% 55%`,
  '--connector-color': `${hue} 70% 55%`,
  '--connector-secondary': `${(hue + 60) % 360} 60% 45%`,
});

export function useTheme() {
  const [themeColor, setThemeColor] = useState<ThemeColor>('purple');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    applyTheme(themeColor);
  }, [themeColor]);

  const loadTheme = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Try to load from localStorage for non-authenticated users
        const saved = localStorage.getItem('theme_color');
        if (saved) setThemeColor(saved as ThemeColor);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('theme_color')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data?.theme_color) {
        setThemeColor(data.theme_color as ThemeColor);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = (color: ThemeColor) => {
    const themeConfig = THEME_COLORS.find(t => t.value === color);
    if (!themeConfig) return;

    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const css = isDark ? getDarkThemeCSS(themeConfig.hue) : getThemeCSS(themeConfig.hue);

    Object.entries(css).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Also update gradient
    root.style.setProperty(
      '--gradient-primary',
      `linear-gradient(135deg, hsl(${themeConfig.hue} 70% ${isDark ? '55%' : '50%'}), hsl(${(themeConfig.hue + 60) % 360} 60% ${isDark ? '45%' : '50%'}))`
    );
  };

  const updateTheme = async (color: ThemeColor) => {
    setThemeColor(color);
    localStorage.setItem('theme_color', color);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_preferences')
        .update({ theme_color: color })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return {
    themeColor,
    updateTheme,
    isLoading,
    colors: THEME_COLORS,
  };
}
