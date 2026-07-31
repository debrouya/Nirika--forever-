const VAPID_PUBLIC_KEY = 'BHSDTt_nK9vByTf4IU6OCE3fO2a3TFGQPo03-nA2TqF-Axk-GaGXYRmyvTFQKbw2sCQ-hjCjF1Ygg4HyR2HBeU0'

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'denied'
  const result = await Notification.requestPermission()
  return result
}

export function showLocalNotification(title, body, icon = '/logo.png') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, icon, badge: '/favicon.svg', vibrate: [100, 50, 100] })
  } catch (e) {
    // fallback silencieux
  }
}

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
  if (Notification.permission !== 'granted') return null

  try {
    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }

    return JSON.stringify(subscription)
  } catch (e) {
    return null
  }
}

export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) await subscription.unsubscribe()
  } catch (e) {}
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export function notifyWorkoutComplete(exerciseName, duration) {
  showLocalNotification(
    'Séance terminée 💪',
    `${exerciseName} — ${duration} min — Beau travail !`
  )
}

export function notifyBadgeUnlocked(badgeName, icon) {
  showLocalNotification(
    'Badge débloqué !',
    `${icon} ${badgeName}`
  )
}

export function notifyStreak(days) {
  showLocalNotification(
    `${days} jours d'affilée ! 🔥`,
    'Continue comme ça !'
  )
}
