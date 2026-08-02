import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipForward, ArrowLeft, Flame } from 'lucide-react'
import useStore from '../store/useStore'

function f(s) { const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}` }

export default function CardioTimer({ onComplete }) {
  const store = useStore
  const session = store((s) => s.activeSession)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)
  const wakeLockRef = useRef(null)
  const targetMin = 20; const total = targetMin * 60

  useEffect(() => {
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(w => { wakeLockRef.current = w }).catch(() => {})
    return () => { clearInterval(intervalRef.current); if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {}) }
  }, [])

  useEffect(() => {
    if (paused || done) return
    intervalRef.current = setInterval(() => {
      setElapsed(t => { const n = t + 1; if (n >= total) { setDone(true); clearInterval(intervalRef.current); return n }; return n })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [paused, done])

  const remaining = total - elapsed
  const progress = (elapsed / total) * 100
  const calories = Math.round(elapsed * 0.15)
  const r = 130; const c = 2 * Math.PI * r
  const dash = c - (Math.min(100, progress) / 100) * c

  if (done) return (
    <div className="fixed inset-0 z-40 bg-dark-bg flex flex-col items-center justify-center p-6 space-y-5 pb-24">
      <Flame size={48} className="text-orange-400" />
      <h1 className="text-white font-bold text-2xl">Cardio terminé !</h1>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-lime font-bold text-xl">{f(elapsed)}</p><p className="text-muted text-[10px]">durée</p></div>
        <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-orange-400 font-bold text-xl">{calories}</p><p className="text-muted text-[10px]">kcal</p></div>
      </div>
      <button onClick={() => { store.getState().endSession(); onComplete() }} className="w-full max-w-xs h-12 rounded-xl bg-lime text-dark-bg font-bold">Terminer</button>
    </div>
  )

  return (
    <div className="fixed inset-0 z-40 bg-dark-bg flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => { clearInterval(intervalRef.current); store.getState().endSession(); onComplete() }} className="p-2 text-white/50 hover:text-white"><ArrowLeft size={22} /></button>
        <div className="text-center flex-1">
          <h1 className="text-white font-bold text-xl uppercase">{session?.exerciseName || 'Cardio'}</h1>
          <p className="text-white/40 text-xs"><Flame size={10} className="inline" />{calories} kcal</p>
        </div>
        <div className="w-10" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <svg width="300" height="300" className="-rotate-90">
            <circle cx="150" cy="150" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle cx="150" cy="150" r={r} fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={dash} style={{ transition: 'stroke-dashoffset 0.5s linear', filter: 'drop-shadow(0 0 8px #22c55e)' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-7xl font-black font-mono tabular-nums text-green-400">{f(remaining)}</span>
            <p className="text-white/40 text-xs mt-1">Continue 🔥</p>
          </div>
        </div>
        <div className="w-full max-w-xs"><div className="bg-white/5 rounded-2xl p-3 text-center"><p className="text-white/30 text-[10px] uppercase">Objectif</p><p className="text-white text-sm font-medium">{targetMin} minutes</p></div></div>
      </div>
      <div className="p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] flex gap-3">
        <button onClick={() => setPaused(p => !p)} className="flex-1 h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/10 text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors">
          {paused ? <Play size={24} /> : <Pause size={24} />}{paused ? 'Reprendre' : 'Pause'}
        </button>
        <button onClick={() => { setDone(true); clearInterval(intervalRef.current) }} className="flex-1 h-14 rounded-2xl bg-lime/20 hover:bg-lime/30 active:bg-lime/40 border border-lime/30 text-lime font-bold text-lg flex items-center justify-center gap-2 transition-colors">
          <SkipForward size={24} />Terminer
        </button>
      </div>
    </div>
  )
}
