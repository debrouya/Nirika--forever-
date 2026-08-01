import { useState, useEffect, useRef } from 'react'
import { Play, Pause, ChevronRight, Square } from 'lucide-react'
import { useSessionCtx } from '../store/sessionContext'
import useStore from '../store/useStore'

export default function SessionBar() {
  const { session, pauseSession, resumeSession, endSession } = useSessionCtx()
  const setCurrentView = useStore((s) => s.setCurrentView)
  const storeSession = useStore((s) => s.activeSession)
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!session || session.status !== 'running') { setDisplay(0); return }
    let running = true
    const startedAt = session.startedAt
    const pausedMs = session.totalPausedMs || 0
    const tick = () => {
      if (!running) return
      const e = Math.floor((Date.now() - startedAt - pausedMs) / 1000)
      setDisplay(Math.max(0, e))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { running = false; if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [session?.status, session?.startedAt, session?.totalPausedMs])

  if (!session) return null

  const f = (s) => { const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}` }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-card/95 backdrop-blur-xl border-t border-lime/30 px-4 py-2.5 flex items-center gap-3 safe-bottom">
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-medium truncate">{session.exerciseName}</p>
        <p className="text-muted text-[10px]">{session.status === 'paused' ? 'En pause' : 'En cours'}
          {storeSession?.sets?.length > 0 && <> · {storeSession.sets.length} série{storeSession.sets.length>1?'s':''}</>}
        </p>
      </div>
      {storeSession?.sets?.length > 0 && (
        <span className="text-white/60 text-[10px]">{storeSession.sets[storeSession.sets.length-1].weight}kg × {storeSession.sets[storeSession.sets.length-1].reps}</span>
      )}
      <span className="text-white font-mono font-bold text-sm tabular-nums">{f(display)}</span>
      <button onClick={() => session.status === 'paused' ? resumeSession() : pauseSession()} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white">
        {session.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}
      </button>
      <button onClick={() => setCurrentView('session')} className="p-1.5 rounded-lg bg-lime/20 hover:bg-lime/30 text-lime">
        <ChevronRight size={16} />
      </button>
      <button onClick={() => endSession()} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400">
        <Square size={14} />
      </button>
    </div>
  )
}
