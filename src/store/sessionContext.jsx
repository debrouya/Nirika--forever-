import { createContext, useContext, useState, useCallback } from 'react'
import useStore from './useStore'

const SessionCtx = createContext(null)

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null)

  const startSession = useCallback((id, name, type = 'exercise') => {
    const s = { id: Date.now().toString(), exerciseId: id, exerciseName: name, sets: [], startedAt: Date.now(), status: 'running', sessionType: type }
    setSession(s)
    useStore.getState().startSession(id, name)
  }, [])

  const pauseSession = useCallback(() => {
    setSession((prev) => { if (!prev || prev.status !== 'running') return prev; const s = { ...prev, status: 'paused' }; return s })
  }, [])

  const resumeSession = useCallback(() => {
    setSession((prev) => { if (!prev || prev.status !== 'paused') return prev; const s = { ...prev, status: 'running' }; return s })
  }, [])

  const endSession = useCallback(() => {
    setSession(null)
    useStore.getState().endSession()
  }, [])

  return (
    <SessionCtx.Provider value={{ session, startSession, pauseSession, resumeSession, endSession }}>
      {children}
    </SessionCtx.Provider>
  )
}

export function useSessionCtx() {
  return useContext(SessionCtx) || { session: null }
}
