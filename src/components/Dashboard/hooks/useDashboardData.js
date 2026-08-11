import { useMemo } from 'react'
import useStore from '../../../store/useStore'

export function useDashboardData() {
  const { profile, workoutHistory, sessionHistory, exerciseHistory } = useStore()
  const activeSession = useStore((s) => s.activeSession)

  const firstName = useMemo(() => {
    if (profile?.full_name) return profile.full_name.split(' ')[0]
    if (profile?.name) return profile.name.split(' ')[0]
    try { const s = localStorage.getItem('nirika-profile'); if (s) { const p = JSON.parse(s); if (p.name) return p.name.split(' ')[0] } } catch {}
    return ''
  }, [profile])

  const streak = useMemo(() => {
    const all = [...workoutHistory, ...sessionHistory]
    const dates = new Set(all.map(s => { try { return new Date(s.completedAt || s.date || s.endedAt || s.startedAt).toISOString().slice(0,10) } catch { return null } }).filter(Boolean))
    let s = 0; const today = new Date()
    for (let i=0;i<365;i++){ const d=new Date(today);d.setDate(d.getDate()-i);if(dates.has(d.toISOString().slice(0,10)))s++;else break }
    return s
  }, [workoutHistory, sessionHistory])

  const weeklySessions = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7*86400000)
    return [...workoutHistory, ...sessionHistory].filter(s => {
      try { return new Date(s.completedAt || s.date || s.endedAt || s.startedAt) >= weekAgo } catch { return false }
    }).length
  }, [workoutHistory, sessionHistory])

  const totalTime = useMemo(() => {
    return [...workoutHistory, ...sessionHistory].reduce((sum, s) => sum + (s.duration || (s.durationMinutes||0)*60 || 0), 0)
  }, [workoutHistory, sessionHistory])

  return { profile, firstName, activeSession, streak, weeklySessions, totalTime, exerciseHistory }
}
