import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipForward, ArrowLeft, Dumbbell, Trophy, Save, CheckCircle, Plus } from 'lucide-react'
import useStore from '../store/useStore'

function beep(f = 800, d = 150) { try { const a = new AudioContext(); const o = a.createOscillator(); o.type = 'square'; o.frequency.value = f; o.connect(a.destination); o.start(); o.stop(a.currentTime + d / 1000) } catch {} }
function fmt(s) { const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}` }

export default function WorkoutScreen({ exercise, onComplete }) {
  const store = useStore
  const [phase, setPhase] = useState('effort')
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [sets, setSets] = useState([])
  const [currentSet, setCurrentSet] = useState(1)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const targetSets = 3; const effortSec = 45; const restSec = 30
  const intervalRef = useRef(null); const wakeLockRef = useRef(null)
  const startRef = useRef(Date.now()); const mountedRef = useRef(true)

  useEffect(() => {
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(w => { wakeLockRef.current = w }).catch(() => {})
    return () => { mountedRef.current = false; clearInterval(intervalRef.current); if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {}) }
  }, [])

  const pr = (store.getState().exerciseHistory?.[exercise.id] || []).reduce((m, h) => Math.max(m, h.weight || 0), 0)

  useEffect(() => {
    if (paused || phase === 'done') return
    intervalRef.current = setInterval(() => {
      setElapsed(t => {
        const n = t + 1
        if (phase === 'effort' || phase === 'last3') {
          if (n >= effortSec - 3 && n < effortSec) setPhase('last3')
          if (n >= effortSec) {
            setPhase('rest')
            const s = { w: Number(weight) || 0, r: Number(reps) || 0 }
            setSets(p => [...p, s])
            try { const st = useStore.getState(); if (st.activeSession) st.addSetToSession(s); store.getState().addExerciseRecord(exercise.id, { exerciseName: exercise.name, muscleGroup: exercise.muscleGroup, weight: s.w, reps: s.r, totalVolume: s.w * s.r }) } catch {}
            return 0
          }
        }
        if (phase === 'rest' && n >= restSec) {
          if (currentSet >= targetSets) { setPhase('done'); clearInterval(intervalRef.current); saveW(); return n }
          setPhase('effort'); setCurrentSet(c => c + 1); return 0
        }
        if (phase === 'last3' && n >= effortSec - 3) { try { navigator.vibrate?.(100) } catch {}; beep(800, 150) }
        return n
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [paused, phase])

  const saveW = () => {
    const d = Math.round((Date.now() - startRef.current) / 1000)
    const v = sets.reduce((s, x) => s + x.w * x.r, 0)
    try { store.getState().addWorkout({ exerciseName: exercise.name, muscleGroup: exercise.muscleGroup, duration: Math.floor(d / 60), durationMinutes: Math.floor(d / 60), calories: Math.round(d * 0.15), totalVolume: v }) } catch {}
  }

  if (phase === 'done') {
    const d = Math.round((Date.now() - startRef.current) / 1000)
    const v = sets.reduce((s, x) => s + x.w * x.r, 0)
    return (
      <div className="fixed inset-0 z-40 bg-dark-bg flex flex-col items-center justify-center p-6 space-y-5 pb-24">
        <CheckCircle size={48} className="text-lime" />
        <h1 className="text-white font-bold text-2xl text-center">{exercise.name} — Terminé !</h1>
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-lime font-bold text-xl">{sets.length}</p><p className="text-muted text-[10px]">séries</p></div>
          <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-white font-bold text-xl">{fmt(d)}</p><p className="text-muted text-[10px]">durée</p></div>
          <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-orange-400 font-bold text-xl">{v}</p><p className="text-muted text-[10px]">volume</p></div>
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={() => { try { store.getState().addWorkoutTemplate({ name: `${exercise.name} (${targetSets}s)`, exercises: [{ ...exercise, sets: targetSets, reps: reps || '10', weight: weight || '0' }] }); alert('OK') } catch {}; onComplete() }} className="flex-1 h-12 rounded-xl bg-dark-card border border-dark-border text-white font-bold flex items-center justify-center gap-2"><Save size={16} />Template</button>
          <button onClick={() => { setPhase('effort'); setCurrentSet(1); setSets([]); setElapsed(0); startRef.current = Date.now() }} className="flex-1 h-12 rounded-xl bg-dark-card border border-dark-border text-white font-bold flex items-center justify-center gap-2"><Plus size={16} />Refaire</button>
        </div>
        <button onClick={onComplete} className="w-full max-w-xs h-12 rounded-xl bg-lime text-dark-bg font-bold">Terminer</button>
      </div>
    )
  }

  const progress = phase === 'rest' ? (elapsed / restSec) * 100 : (elapsed / effortSec) * 100
  const remaining = phase === 'rest' ? restSec - elapsed : effortSec - elapsed
  const ringColor = phase === 'last3' ? '#f97316' : phase === 'rest' ? '#3b82f6' : '#22c55e'
  const bg = phase === 'rest' ? 'bg-blue-950/30' : 'bg-dark-bg'
  const r = 130; const c = 2 * Math.PI * r
  const dash = c - (Math.min(100, progress) / 100) * c

  return (
    <div className={`fixed inset-0 z-40 flex flex-col ${bg} transition-colors duration-500`}>
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => { store.getState().endSession?.(); onComplete() }} className="p-2 text-white/50 hover:text-white"><ArrowLeft size={22} /></button>
        <div className="text-center flex-1">
          <h1 className="text-white font-bold text-xl uppercase tracking-wider">{exercise.name}</h1>
          <p className="text-white/60 text-xs">{phase === 'rest' ? 'Repos' : `Série ${currentSet}/${targetSets}`}
            {pr > 0 && <span className="text-yellow-400 ml-2">🏆{pr}kg</span>}
          </p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <svg width="300" height="300" className="-rotate-90">
            <circle cx="150" cy="150" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle cx="150" cy="150" r={r} fill="none" stroke={ringColor} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={dash} style={{ transition: 'stroke-dashoffset 0.5s linear', filter: `drop-shadow(0 0 8px ${ringColor})` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-7xl font-black font-mono tabular-nums ${phase === 'last3' ? 'text-orange-500' : phase === 'rest' ? 'text-blue-400' : 'text-green-400'}`}>{fmt(remaining)}</span>
            <p className="text-white/40 text-xs mt-1">{phase === 'rest' ? 'Repos 😮‍💨' : 'Continue 🔥'}</p>
          </div>
        </div>

        {phase !== 'rest' && (
          <div className="flex gap-6 items-center">
            <div className="flex flex-col items-center">
              <p className="text-white/40 text-[10px] mb-1">Charge</p>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0" className="w-16 h-12 text-center bg-white/10 border border-white/20 rounded-xl text-white text-xl font-bold placeholder-white/30 focus:outline-none focus:border-lime/50" />
            </div>
            <Dumbbell size={20} className="text-white/20" />
            <div className="flex flex-col items-center">
              <p className="text-white/40 text-[10px] mb-1">Répétitions</p>
              <input type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder="0" className="w-16 h-12 text-center bg-white/10 border border-white/20 rounded-xl text-white text-xl font-bold placeholder-white/30 focus:outline-none focus:border-lime/50" />
            </div>
          </div>
        )}

        <div className="w-full max-w-xs"><div className="bg-white/5 rounded-2xl p-3 text-center"><p className="text-white/30 text-[10px] uppercase">Suivant</p><p className="text-white text-sm font-medium">{phase === 'rest' && currentSet <= targetSets ? `Série ${currentSet + 1}/${targetSets}` : 'Prochain exercice'}</p></div></div>
      </div>

      <div className="p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] flex gap-3">
        <button onClick={() => setPaused(p => !p)} className="flex-1 h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/10 text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors">
          {paused ? <Play size={24} /> : <Pause size={24} />}{paused ? 'Reprendre' : 'Pause'}
        </button>
        <button onClick={() => { if (currentSet >= targetSets) { setPhase('done'); saveW() } else { setPhase('rest'); setCurrentSet(c => c + 1) } }} className="flex-1 h-14 rounded-2xl bg-lime/20 hover:bg-lime/30 active:bg-lime/40 border border-lime/30 text-lime font-bold text-lg flex items-center justify-center gap-2 transition-colors">
          <SkipForward size={24} />Skip
        </button>
      </div>
    </div>
  )
}
