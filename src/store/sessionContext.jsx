import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import useStore from './useStore'

const SessionCtx = createContext(null)
const STORAGE_KEY = 'linerverse_session'

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    if (!s || !s.id) return null
    // Only resume if less than 4 hours old
    if (Date.now() - s.startedAt > 4 * 3600 * 1000) { localStorage.removeItem(STORAGE_KEY); return null }
    return { ...s, status: 'paused' }
  } catch { return null }
}

function saveSession(data) {
  try {
    if (!data) { localStorage.removeItem(STORAGE_KEY); return }
    const clean = { id: data.id, startedAt: data.startedAt, exercise: data.exercise, exerciseId: data.exerciseId, sets: data.sets }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
  } catch {}
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => loadSession())
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  // Restore timer if reloading
  useEffect(() => {
    if (session && session.startedAt) {
      startRef.current = session.startedAt
    }
  }, [])

  // Timer tick
  useEffect(() => {
    if (!session || session.status !== 'running') { setElapsed(0); return }
    if (!startRef.current) startRef.current = Date.now()
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [session?.status, !!session])

  const startSession = useCallback((id, name) => {
    const s = { id: Date.now().toString(), startedAt: Date.now(), exercise: name, exerciseId: id, sets: [], status: 'running' }
    setSession(s)
    startRef.current = s.startedAt
    saveSession(s)
    // Sync to Zustand for compatibility
    useStore.getState().startSession(id, name)
  }, [])

  const pauseSession = useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.status !== 'running') return prev
      const s = { ...prev, status: 'paused' }
      saveSession(s)
      return s
    })
  }, [])

  const resumeSession = useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.status !== 'paused') return prev
      const s = { ...prev, status: 'running' }
      startRef.current = Date.now() - elapsed * 1000
      saveSession(s)
      return s
    })
  }, [elapsed])

  const addSet = useCallback((setData) => {
    setSession((prev) => {
      if (!prev) return prev
      const s = { ...prev, sets: [...prev.sets, { ...setData, timestamp: Date.now() }] }
      saveSession(s)
      // Sync to Zustand
      useStore.getState().addSetToSession(setData)
      return s
    })
  }, [])

  const endSession = useCallback(() => {
    setSession(null)
    startRef.current = null
    setElapsed(0)
    localStorage.removeItem(STORAGE_KEY)
    useStore.getState().endSession()
  }, [])

  const ctx = { session, elapsed, startSession, pauseSession, resumeSession, addSet, endSession }

  return (
    <SessionCtx.Provider value={ctx}>
      {children}
    </SessionCtx.Provider>
  )
}

export function useSessionCtx() {
  const ctx = useContext(SessionCtx)
  if (!ctx) return { session: null, elapsed: 0, startSession: () => {}, pauseSession: () => {}, resumeSession: () => {}, addSet: () => {}, endSession: () => {} }
  return ctx
}
