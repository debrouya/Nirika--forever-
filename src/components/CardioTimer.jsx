import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipForward, ArrowLeft, Activity, Flame } from 'lucide-react'
import useStore from '../store/useStore'

function f(s) { const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}` }

export default function CardioTimer({ onComplete }) {
  const store = useStore
  const activeSession = store((s) => s.activeSession)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)
  const wakeLockRef = useRef(null)
  const targetMinutes = 20
  const totalSeconds = targetMinutes * 60

  useEffect(() => {
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(w => { wakeLockRef.current = w }).catch(() => {})
    return () => { if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {}) }
  }, [])

  useEffect(() => {
    if (paused || done) return
    intervalRef.current = setInterval(() => {
      setElapsed((t) => {
        const next = t + 1
        if (next >= totalSeconds) { setDone(true); clearInterval(intervalRef.current); return next }
        return next
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [paused, done])

  const remaining = totalSeconds - elapsed
  const progress = (elapsed / totalSeconds) * 100
  const calories = Math.round(elapsed * 0.15)
  const r = 140; const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference - (Math.min(100, progress) / 100) * circumference

  if (done) return (
    <div className="fixed inset-0 z-50 bg-dark-bg flex flex-col items-center justify-center p-6 space-y-6">
      <div className="w-20 h-20 rounded-full bg-lime/20 flex items-center justify-center"><Activity size={40} className="text-lime" /></div>
      <h1 className="text-white font-bold text-2xl">Cardio terminé !</h1>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-lime font-bold text-xl">{f(elapsed)}</p><p className="text-muted text-[10px]">durée</p></div>
        <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-orange-400 font-bold text-xl">{calories}</p><p className="text-muted text-[10px]">kcal</p></div>
      </div>
      <button onClick={() => { store.getState().endSession(); onComplete() }} className="w-full max-w-xs py-3 rounded-xl bg-lime text-dark-bg font-bold">Terminer</button>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg flex flex-col items-center justify-between p-4">
      <div className="w-full flex items-center justify-between">
        <button onClick={() => { clearInterval(intervalRef.current); store.getState().endSession(); onComplete() }} className="p-2 text-white/50 hover:text-white"><ArrowLeft size={24} /></button>
        <div className="text-center">
          <h1 className="text-white font-bold text-2xl uppercase">{activeSession?.exerciseName || 'Cardio'}</h1>
          <p className="text-white/40 text-sm flex items-center justify-center gap-1"><Flame size={12} />{calories} kcal</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="relative flex items-center justify-center">
        <svg width="320" height="320" className="-rotate-90">
          <circle cx="160" cy="160" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle cx="160" cy="160" r={r} fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 0.5s linear' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-7xl font-black font-mono tabular-nums text-lime">{f(remaining)}</span>
          <span className="text-white/40 text-sm mt-2">restant</span>
        </div>
      </div>

      <div className="w-full px-4">
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <p className="text-white/30 text-xs uppercase tracking-wider">Objectif</p>
          <p className="text-white font-medium">{targetMinutes} minutes</p>
          <p className="text-white/20 text-[10px]">{Math.round(progress)}%</p>
        </div>
      </div>

      <div className="w-full px-4 pb-8 flex gap-4">
        <button onClick={() => setPaused(p => !p)} className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-lg flex items-center justify-center gap-2">
          {paused ? <Play size={24} /> : <Pause size={24} />}
          {paused ? 'Reprendre' : 'Pause'}
        </button>
        <button onClick={() => { setDone(true); clearInterval(intervalRef.current) }} className="flex-1 py-4 rounded-2xl bg-lime/20 hover:bg-lime/30 border border-lime/30 text-lime font-bold text-lg flex items-center justify-center gap-2">
          <SkipForward size={24} />Terminer
        </button>
      </div>
    </div>
  )
}
