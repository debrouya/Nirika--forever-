import { useEffect } from 'react'
import useStore from '../store/useStore'

export function useBackgroundHandler(pauseFn, resumeFn) {
  useEffect(() => {
    const handle = () => {
      if (document.hidden) {
        pauseFn?.()
        // Save session to sessionStorage before tab is hidden
        const s = useStore.getState().activeSession
        if (s) try { sessionStorage.setItem('lv_snap', JSON.stringify({ exerciseId: s.exerciseId, exerciseName: s.exerciseName, startedAt: s.startedAt, sets: s.sets, totalPausedMs: s.totalPausedMs })) } catch {}
      } else {
        resumeFn?.()
        if ('wakeLock' in navigator) navigator.wakeLock.request('screen').catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handle)
    // Attempt re-request WakeLock on focus
    const focusHandle = () => { if ('wakeLock' in navigator) navigator.wakeLock.request('screen').catch(() => {}) }
    window.addEventListener('focus', focusHandle)
    return () => {
      document.removeEventListener('visibilitychange', handle)
      window.removeEventListener('focus', focusHandle)
    }
  }, [])
}

// Called once at app start - clear stale snapshots
export function cleanupStaleSessions() {
  try { sessionStorage.removeItem('lv_snap') } catch {}
  const s = useStore.getState().activeSession
  if (s && Date.now() - s.startedAt > 4 * 60 * 60 * 1000) {
    useStore.getState().cancelSession()
  }
}
