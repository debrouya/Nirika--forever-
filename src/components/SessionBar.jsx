import { useState, useEffect, useRef } from 'react'
import { Play, Pause, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'

export default function SessionBar() {
  const activeSession = useStore((s) => s.activeSession)
  const setCurrentView = useStore((s) => s.setCurrentView)
  const pauseSession = useStore((s) => s.pauseSession)
  const resumeSession = useStore((s) => s.resumeSession)
  const getElapsed = useStore((s) => s.getElapsed)
  const [displayTime, setDisplayTime] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!activeSession) { setDisplayTime(0); return }
    const tick = () => {
      setDisplayTime(getElapsed())
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [activeSession?.startedAt, activeSession?.paused])

  if (!activeSession) return null

  const f = (s) => { const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}` }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-card/95 backdrop-blur-xl border-t border-lime/30 px-4 py-2.5 flex items-center gap-3 safe-bottom">
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-medium truncate">{activeSession.exerciseName}</p>
        <p className="text-muted text-[10px]">{activeSession.paused ? 'En pause' : 'En cours'} · {activeSession.sets?.length || 0} séries</p>
      </div>
      <span className="text-white font-mono font-bold text-sm tabular-nums">{f(displayTime)}</span>
      <button
        onClick={() => activeSession.paused ? resumeSession() : pauseSession()}
        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
      >
        {activeSession.paused ? <Play size={16} /> : <Pause size={16} />}
      </button>
      <button
        onClick={() => setCurrentView('session')}
        className="p-1.5 rounded-lg bg-lime/20 hover:bg-lime/30 text-lime"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
