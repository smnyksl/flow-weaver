import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserPreferences } from '@/types/preferences';

export function usePreferences(userId: string | undefined) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      
      // If no preferences exist, create them
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('user_preferences')
          .insert({ user_id: userId })
          .select()
          .single();
        
        if (insertError) throw insertError;
        setPreferences(newData as UserPreferences);
      } else {
        setPreferences(data as UserPreferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!userId) return { error: new Error('No user ID') };

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data as UserPreferences);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { data: null, error };
    }
  };

  const completeOnboarding = async () => {
    return updatePreferences({ onboarding_completed: true });
  };

  return {
    preferences,
    loading,
    updatePreferences,
    completeOnboarding,
    refetch: fetchPreferences,
  };
}
