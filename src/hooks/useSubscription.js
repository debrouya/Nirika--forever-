import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export function useSubscription(userId) {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) {
      setSubscription({ tier: 'free', status: 'active' })
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error || !data) {
          setSubscription({ tier: 'free', status: 'active' })
        } else {
          setSubscription(data)
        }
      } catch {
        setSubscription({ tier: 'free', status: 'active' })
      }
      setLoading(false)
    }

    fetchSubscription()

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.new) {
            setSubscription(payload.new)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return {
    subscription,
    loading,
    tier: subscription?.tier || 'free',
    isPremium: subscription?.tier === 'premium' && ['active', 'trialing'].includes(subscription?.status),
    isActive: subscription?.status === 'active',
    currentPeriodEnd: subscription?.current_period_end,
  }
}
