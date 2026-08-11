import { useState, useEffect, useCallback } from 'react'

export default function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      try {
        const dismissed = JSON.parse(localStorage.getItem('nirika-pwa-dismissed') || '0')
        if (Date.now() - dismissed > 7 * 86400000) setShowBanner(true)
      } catch {
        setShowBanner(true)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShowBanner(false)
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setShowBanner(false)
    try { localStorage.setItem('nirika-pwa-dismissed', String(Date.now())) } catch {}
  }, [])

  return { showBanner, install, dismiss }
}
