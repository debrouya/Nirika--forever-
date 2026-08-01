import { useState, useEffect, useRef } from 'react'
import { Play, Pause, X, Clock, Dumbbell, Timer } from 'lucide-react'
import useStore from '../store/useStore'

export default function FloatingWorkoutControls() {
  const activeSession = useStore((s) => s.activeSession)
  const setCurrentView = useStore((s) => s.setCurrentView)
  const endSession = useStore((s) => s.endSession)
  const [collapsed, setCollapsed] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [restTime, setRestTime] = useState(null)
  const intervalRef = useRef(null)
  const restRef = useRef(null)

  useEffect(() => {
    if (!activeSession) return
    const id = setInterval(() => setElapsed((t) => t + 1), 1000)
    intervalRef.current = id
    return () => clearInterval(id)
  }, [!!activeSession])

  useEffect(() => {
    setElapsed(0)
    setPaused(false)
    setRestTime(null)
    if (restRef.current) clearInterval(restRef.current)
    return () => { if (restRef.current) clearInterval(restRef.current) }
  }, [activeSession?.exerciseId])

  const f = (s) => { const v = s || 0; const m = Math.floor(v / 60); return `${m}:${String(v % 60).padStart(2, '0')}` }

  const startRest = (d) => {
    if (restRef.current) clearInterval(restRef.current)
    setRestTime(d)
    restRef.current = setInterval(() => {
      setRestTime((t) => {
        if (t == null || t <= 1) { clearInterval(restRef.current); return null }
        return t - 1
      })
    }, 1000)
  }

  if (!activeSession) return null

  return (
    <div className="fixed bottom-24 left-3 right-3 z-50 max-w-lg mx-auto">
      {restTime != null && (
        <div className="mb-2 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-dark-card/95 border border-lime/30 shadow-2xl">
            <Timer size={16} className="text-lime animate-pulse" />
            <span className="text-white text-lg font-mono font-bold">{f(restTime)}</span>
          </div>
        </div>
      )}
      {collapsed ? (
        <button onClick={() => setCollapsed(false)} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-dark-card border border-lime/30 shadow-xl">
          <Dumbbell size={16} className="text-lime" />
          <span className="text-white text-sm font-medium">{f(elapsed)}</span>
        </button>
      ) : (
        <div className="bg-dark-card/95 rounded-2xl p-4 border border-lime/30 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span className="text-white font-bold text-sm">{activeSession.exerciseName}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPaused((p) => !p)} className="text-white/40 hover:text-white p-1">
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button onClick={() => setCollapsed(true)} className="text-white/40 p-1"><X size={16} /></button>
            </div>
          </div>
          <div className="flex gap-1.5 mb-2">
            {[30, 60, 90, 120].map((d) => (
              <button key={d} onClick={() => startRest(d)} className="flex-1 py-1.5 rounded-lg text-[10px] font-medium bg-white/5 text-white/50 hover:bg-white/10">{d}s</button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-dark-border/50">
            <div className="flex items-center gap-3">
              <span className="text-xl font-mono font-bold text-white">{f(elapsed)}</span>
              {activeSession.sets?.length > 0 && <span className="text-white/50 text-[10px]">{activeSession.sets[activeSession.sets.length-1].weight}kg × {activeSession.sets[activeSession.sets.length-1].reps}</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">{activeSession.sets?.length || 0} séries</span>
              <button onClick={() => setCurrentView('session')} className="px-3 py-1.5 rounded-lg bg-lime/10 text-lime border border-lime/30 text-xs font-medium">Séance</button>
              <button onClick={() => endSession()} className="px-4 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium">Fin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
