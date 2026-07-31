import { useState, useEffect, useRef } from 'react'
import { Play, Pause, X, Clock, Dumbbell } from 'lucide-react'
import useStore from '../store/useStore'

export default function FloatingWorkoutControls() {
  const { activeSession, endSession } = useStore()
  const [collapsed, setCollapsed] = useState(false)
  const [timer, setTimer] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => { if (!paused) setTimer((t) => t + 1) }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [activeSession, paused])

  useEffect(() => { setTimer(0); setPaused(false) }, [activeSession?.exerciseId])

  if (!activeSession) return null

  const f = (s) => { const m = Math.floor(s/60); const sec = s%60; return `${m}:${sec.toString().padStart(2,'0')}` }

  return (
    <div className="fixed bottom-24 left-3 right-3 z-50 max-w-lg mx-auto">
      {collapsed ? (
        <button onClick={() => setCollapsed(false)} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-dark-card border border-lime/30 shadow-xl">
          <Dumbbell size={16} className="text-lime" /><span className="text-white text-sm font-medium">{f(timer)}</span>
        </button>
      ) : (
        <div className="bg-dark-card/95 backdrop-blur-xl rounded-2xl p-4 border border-lime/30 shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${paused?'bg-yellow-400':'bg-lime animate-pulse'}`} /><span className="text-white font-bold text-sm">{activeSession.exerciseName}</span></div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPaused(!paused)} className="text-white/40 hover:text-white p-1">{paused?<Play size={14}/>:<Pause size={14}/>}</button>
              <button onClick={() => setCollapsed(true)} className="text-white/40 p-1"><X size={16}/></button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/70"><Clock size={14}/><span className="text-lg font-mono font-bold text-white">{f(timer)}</span></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">{activeSession.sets?.length||0} séries</span>
              <button onClick={() => useStore.getState().setCurrentView('session')} className="px-3 py-1.5 rounded-lg bg-lime/10 text-lime border border-lime/30 text-xs font-medium">Séance</button>
              <button onClick={() => endSession()} className="px-4 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium">Fin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
