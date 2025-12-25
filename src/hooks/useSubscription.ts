import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type SubscriptionPlan = 'free' | 'premium';

interface Subscription {
  plan: SubscriptionPlan;
  started_at: string;
  expires_at: string | null;
}

interface SubscriptionLimits {
  dailyEntryLimit: number;
  historyDays: number;
  hasAdvancedAnalysis: boolean;
  hasWeeklyReport: boolean;
  hasMonthlyReport: boolean;
}

const FREE_LIMITS: SubscriptionLimits = {
  dailyEntryLimit: 1,
  historyDays: 7,
  hasAdvancedAnalysis: false,
  hasWeeklyReport: false,
  hasMonthlyReport: false,
};

const PREMIUM_LIMITS: SubscriptionLimits = {
  dailyEntryLimit: Infinity,
  historyDays: Infinity,
  hasAdvancedAnalysis: true,
  hasWeeklyReport: true,
  hasMonthlyReport: true,
};

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('plan, started_at, expires_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSubscription({
            plan: data.plan as SubscriptionPlan,
            started_at: data.started_at,
            expires_at: data.expires_at,
          });
        } else {
          // Create default free subscription if none exists
          const { data: newSub, error: insertError } = await supabase
            .from('user_subscriptions')
            .insert({ user_id: user.id, plan: 'free' })
            .select('plan, started_at, expires_at')
            .single();

          if (!insertError && newSub) {
            setSubscription({
              plan: newSub.plan as SubscriptionPlan,
              started_at: newSub.started_at,
              expires_at: newSub.expires_at,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const isPremium = subscription?.plan === 'premium';
  const limits = isPremium ? PREMIUM_LIMITS : FREE_LIMITS;

  return {
    subscription,
    loading,
    isPremium,
    plan: subscription?.plan || 'free',
    limits,
  };
}
