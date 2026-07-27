import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export function useNotifications(userId) {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [subscription, setSubscription] = useState(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const loadSubscription = useCallback(async () => {
    if (!isSupabaseConfigured() || !userId) return
    try {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
      setIsSubscribed(!!data?.length)
    } catch {}
  }, [userId])

  useEffect(() => {
    loadSubscription()
  }, [loadSubscription])

  const requestPermission = async () => {
    if (!('Notification' in window)) return 'denied'
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  const subscribe = async () => {
    if (permission !== 'granted') return false
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false

    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
        ),
      })
      setSubscription(sub)
      setIsSubscribed(true)

      if (isSupabaseConfigured() && userId) {
        const subscriptionJSON = sub.toJSON()
        await supabase.from('push_subscriptions').upsert({
          user_id: userId,
          endpoint: subscriptionJSON.endpoint,
          keys: subscriptionJSON.keys,
        }, { onConflict: 'endpoint' })
      }

      return true
    } catch {
      return false
    }
  }

  const unsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        const endpoint = sub.endpoint
        await sub.unsubscribe()

        if (isSupabaseConfigured() && userId) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
        }
      }
      setSubscription(null)
      setIsSubscribed(false)
    } catch {}
  }

  const scheduleLocal = (title, body, delayMs = 0) => {
    if (permission !== 'granted') return
    setTimeout(() => {
      new Notification(title, {
        body,
        icon: '/logo.svg',
        badge: '/favicon.svg',
        tag: 'nirika-reminder',
      })
    }, delayMs)
  }

  return {
    permission,
    subscription,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    scheduleLocal,
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
