import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import useStore from './useStore'

const SessionCtx = createContext(null)

export function SessionProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null)
  const startRef = useRef(null)
  const elapsedRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (activeSession && !activeSession.paused) {
      const tick = () => { elapsedRef.current = Math.floor((Date.now() - startRef.current) / 1000); rafRef.current = requestAnimationFrame(tick) }
      rafRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(rafRef.current)
    }
  }, [activeSession?.paused, !!activeSession])

  const startSession = useCallback((id, name) => {
    useStore.getState().startSession(id, name)
    const now = Date.now()
    startRef.current = now
    elapsedRef.current = 0
    setActiveSession({ exerciseId: id, exerciseName: name, sets: [], paused: false, startedAt: now })
  }, [])

  const pauseSession = useCallback(() => {
    useStore.getState().pauseSession()
    setActiveSession((s) => s ? { ...s, paused: true } : null)
  }, [])

  const resumeSession = useCallback(() => {
    useStore.getState().resumeSession()
    startRef.current = Date.now() - elapsedRef.current * 1000
    setActiveSession((s) => s ? { ...s, paused: false } : null)
  }, [])

  const endSession = useCallback(() => {
    useStore.getState().endSession()
    setActiveSession(null)
    startRef.current = null
    elapsedRef.current = 0
  }, [])

  const getElapsed = useCallback(() => {
    if (!activeSession) return 0
    if (!activeSession.paused) elapsedRef.current = Math.floor((Date.now() - startRef.current) / 1000)
    return elapsedRef.current
  }, [activeSession])

  return (
    <SessionCtx.Provider value={{ activeSession, startSession, pauseSession, resumeSession, endSession, getElapsed }}>
      {children}
    </SessionCtx.Provider>
  )
}

export function useSessionCtx() {
  const ctx = useContext(SessionCtx)
  if (!ctx) return { activeSession: null, startSession: () => {}, pauseSession: () => {}, resumeSession: () => {}, endSession: () => {}, getElapsed: () => 0 }
  return ctx
}
