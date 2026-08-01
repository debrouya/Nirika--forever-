import { createContext, useContext, useState, useCallback } from 'react'
import useStore from './useStore'

const STORAGE_KEY = 'lv_session'
const SessionCtx = createContext(null)

function persist(data) {
  try {
    if (!data) { localStorage.removeItem(STORAGE_KEY); return }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: data.id, exerciseId: data.exerciseId, exerciseName: data.exerciseName, sets: data.sets, startedAt: data.startedAt, status: data.status, pausedAt: data.pausedAt, totalPausedMs: data.totalPausedMs }))
  } catch {}
}

function restore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const d = JSON.parse(raw)
    if (!d.id || Date.now() - d.startedAt > 4 * 3600 * 1000) { localStorage.removeItem(STORAGE_KEY); return null }
    return { ...d, status: 'paused' }
  } catch { return null }
}

function elapsed(session) {
  if (!session) return 0
  let extra = 0
  if (session.status === 'paused' && session.pausedAt) extra = Date.now() - session.pausedAt
  return Math.max(0, Math.floor((Date.now() - session.startedAt - (session.totalPausedMs || 0) - extra) / 1000))
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(restore)

  const startSession = useCallback((id, name, type = 'exercise') => {
    const s = { id: Date.now().toString(), exerciseId: id, exerciseName: name, sets: [], startedAt: Date.now(), status: 'running', pausedAt: null, totalPausedMs: 0, sessionType: type }
    setSession(s)
    persist(s)
    useStore.getState().startSession(id, name)
  }, [])

  const pauseSession = useCallback(() => {
    setSession((prev) => { if (!prev || prev.status !== 'running') return prev; const s = { ...prev, status: 'paused', pausedAt: Date.now() }; persist(s); return s })
  }, [])

  const resumeSession = useCallback(() => {
    setSession((prev) => { if (!prev || prev.status !== 'paused') return prev; const s = { ...prev, status: 'running', totalPausedMs: (prev.totalPausedMs || 0) + (prev.pausedAt ? Date.now() - prev.pausedAt : 0), pausedAt: null }; persist(s); return s })
  }, [])

  const endSession = useCallback(() => {
    setSession(null)
    persist(null)
    useStore.getState().endSession()
  }, [])

  const addSet = useCallback((setData) => {
    setSession((prev) => { if (!prev) return prev; const s = { ...prev, sets: [...prev.sets, setData] }; persist(s); useStore.getState().addSetToSession(setData); return s })
  }, [])

  const getElapsed = useCallback(() => elapsed(session), [session])

  return (
    <SessionCtx.Provider value={{ session, startSession, pauseSession, resumeSession, endSession, addSet }}>
      {children}
    </SessionCtx.Provider>
  )
}

export function useSessionCtx() {
  return useContext(SessionCtx) || { session: null }
}
