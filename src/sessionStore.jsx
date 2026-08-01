import { createContext, useContext, useState } from 'react'

const SessionContext = createContext()

export function SessionProvider({ children }) {
  const [session, setSession] = useState({
    active: false,
    currentExercise: null,
    time: 0,
    paused: false,
  })

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used inside SessionProvider')
  return context
}
