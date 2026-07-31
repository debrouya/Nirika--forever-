import { useState, useEffect } from 'react'
import { Bell, BellOff, BellRing } from 'lucide-react'
import { requestNotificationPermission, subscribeToPush, unsubscribeFromPush } from '../services/notifications'

export default function NotificationSettings() {
  const [status, setStatus] = useState('loading')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) {
      setStatus('unsupported')
      return
    }
    setStatus(Notification.permission)
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((reg) =>
        reg.pushManager.getSubscription().then((sub) => setSubscribed(!!sub))
      )
    }
  }, [])

  const handleEnable = async () => {
    const perm = await requestNotificationPermission()
    setStatus(perm)
    if (perm === 'granted') {
      const sub = await subscribeToPush()
      setSubscribed(!!sub)
    }
  }

  const handleDisable = async () => {
    await unsubscribeFromPush()
    setSubscribed(false)
  }

  if (status === 'unsupported') return null

  return (
    <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status === 'granted' ? (
            <BellRing size={20} className="text-lime" />
          ) : status === 'denied' ? (
            <BellOff size={20} className="text-red-400" />
          ) : (
            <Bell size={20} className="text-white/50" />
          )}
          <div>
            <p className="text-white text-sm font-medium">Notifications</p>
            <p className="text-xs text-white/50">
              {status === 'granted'
                ? subscribed
                  ? 'Activées'
                  : 'Notifications activées'
                : status === 'denied'
                ? 'Bloquées — autorise dans les réglages Safari'
                : 'Reçois des alertes entraînement'}
            </p>
          </div>
        </div>
        {status === 'granted' ? (
          <button onClick={handleDisable} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium">
            Désactiver
          </button>
        ) : status !== 'denied' ? (
          <button onClick={handleEnable} className="px-3 py-1.5 rounded-lg bg-lime/20 text-lime text-xs font-medium">
            Activer
          </button>
        ) : null}
      </div>
    </div>
  )
}
