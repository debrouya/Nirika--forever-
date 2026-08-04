import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipForward, ArrowLeft, Flame } from 'lucide-react'
import useStore from '../store/useStore'
import { useBackgroundHandler } from '../hooks/useBackgroundHandler'
import { feedback } from '../services/feedback'

function f(s) { const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}` }

export default function CardioTimer({ onComplete }) {
  const store = useStore
  const session = store((s) => s.activeSession)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const intervalRef = useRef(null)
  const wakeLockRef = useRef(null)
  const targetMin = 20; const total = targetMin * 60

  useBackgroundHandler(() => setPaused(true), () => setPaused(false))

  useEffect(() => {
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(w => { wakeLockRef.current = w }).catch(() => {})
    return () => { clearInterval(intervalRef.current); if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {}); store.getState().endSession() }
  }, [])

  useEffect(() => {
    if (paused || done) return
    intervalRef.current = setInterval(() => setElapsed(t => { const n = t + 1; if (n >= total) { feedback(); setDone(true); clearInterval(intervalRef.current); return n }; return n }), 1000)
    return () => clearInterval(intervalRef.current)
  }, [paused, done])

  const remaining = total - elapsed; const progress = (elapsed / total) * 100
  const calories = Math.round(elapsed * 0.15)
  const r = 130; const c = 2 * Math.PI * r; const dash = c - (Math.min(100, progress) / 100) * c

  const end = () => { setConfirmQuit(false); clearInterval(intervalRef.current); if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {}); setTimeout(() => { store.getState().endSession(); onComplete() }, 50) }

  if (done) return (
    <div className="fixed inset-0 z-40 bg-dark-bg flex flex-col items-center justify-center p-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 90px)' }}>
      <Flame size={40} className="text-orange-400 mb-4" />
      <h1 className="text-white font-bold text-xl mb-6">Cardio termine</h1>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-4">
        <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-lime font-bold text-lg">{f(elapsed)}</p><p className="text-muted text-[10px]">duree</p></div>
        <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-orange-400 font-bold text-lg">{calories}</p><p className="text-muted text-[10px]">kcal</p></div>
      </div>
      <button onClick={end} className="w-full max-w-xs h-12 rounded-xl bg-lime text-dark-bg font-bold">Terminer</button>
    </div>
  )

  return (
    <div className="fixed inset-0 z-40 bg-dark-bg flex flex-col">
      <div className="flex items-center justify-between px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
        <button onClick={() => setConfirmQuit(true)} className="p-2 text-white/50 hover:text-white"><ArrowLeft size={22} /></button>
        <div className="text-center flex-1">
          <h1 className="text-white font-bold text-lg uppercase tracking-wide">{session?.exerciseName || 'Cardio'}</h1>
          <p className="text-white/50 text-xs">{calories} kcal</p>
        </div>
        <div className="w-10" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <svg width="280" height="280" className="-rotate-90">
            <circle cx="140" cy="140" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle cx="140" cy="140" r={r} fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={dash} style={{ transition: 'stroke-dashoffset 0.5s linear', filter: 'drop-shadow(0 0 6px #22c55e)' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black font-mono tabular-nums text-lime">{f(remaining)}</span>
            <span className="text-white/30 text-xs mt-1">restant</span>
          </div>
        </div>
        <div className="w-full max-w-xs px-4"><div className="bg-white/5 rounded-xl p-2 text-center"><p className="text-white/20 text-[10px]">Objectif : {targetMin} minutes</p></div></div>
      </div>
      <div className="px-4 flex gap-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 80px)' }}>
        <button onClick={() => setPaused(p => !p)} className="flex-1 h-12 rounded-2xl bg-white/10 active:bg-white/20 border border-white/10 text-white font-bold flex items-center justify-center gap-2">
          {paused ? <Play size={20} /> : <Pause size={20} />}{paused ? 'Reprendre' : 'Pause'}
        </button>
        <button onClick={() => { setDone(true); clearInterval(intervalRef.current) }} className="flex-1 h-12 rounded-2xl bg-lime/20 active:bg-lime/30 border border-lime/30 text-lime font-bold flex items-center justify-center gap-2">
          <SkipForward size={20} />Terminer
        </button>
      </div>
      {confirmQuit && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-dark-card rounded-2xl p-6 w-full max-w-xs text-center space-y-4">
            <p className="text-white font-bold text-lg">Quitter la seance ?</p>
            <p className="text-white/50 text-sm">Ta progression sera sauvegardee.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmQuit(false)} className="flex-1 h-12 rounded-xl bg-dark-bg border border-dark-border text-white font-bold">Annuler</button>
              <button onClick={end} className="flex-1 h-12 rounded-xl bg-lime text-dark-bg font-bold">Quitter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
