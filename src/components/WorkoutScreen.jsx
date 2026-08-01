import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipForward, ArrowLeft, Dumbbell, Trophy, Flame, Clock, Save, CheckCircle, Plus } from 'lucide-react'
import useStore from '../store/useStore'

function beep(freq = 800, dur = 150) {
  try { const a = new AudioContext(); const o = a.createOscillator(); o.type = 'square'; o.frequency.value = freq; o.connect(a.destination); o.start(); o.stop(a.currentTime + dur / 1000) } catch {}
}

export default function WorkoutScreen({ exercise, onComplete }) {
  const store = useStore
  const [phase, setPhase] = useState('effort')
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [sets, setSets] = useState([])
  const [currentSet, setCurrentSet] = useState(1)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const targetSets = 3
  const effortDuration = 45
  const restDuration = 30
  const totalTime = effortDuration
  const intervalRef = useRef(null)
  const wakeLockRef = useRef(null)
  const startRef = useRef(Date.now())
  const mountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => () => { mountedRef.current = false; clearInterval(intervalRef.current); if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {}) }, [])

  // Wake Lock
  useEffect(() => {
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(w => { wakeLockRef.current = w }).catch(() => {})
    return () => { if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {}) }
  }, [])

  // PR
  const history = store.getState().exerciseHistory?.[exercise.id] || []
  const pr = history.length > 0 ? Math.max(...history.map(h => h.weight || 0)) : 0

  // Timer
  useEffect(() => {
    if (paused || phase === 'done') return
    intervalRef.current = setInterval(() => {
      setElapsed((t) => {
        const next = t + 1
        if (phase === 'effort' || phase === 'last3') {
          if (next >= totalTime - 3 && next < totalTime) setPhase('last3')
          if (next >= totalTime) {
            setPhase('rest')
            const s = { weight: Number(weight) || 0, reps: Number(reps) || 0, timestamp: Date.now() }
            setSets((prev) => [...prev, s])
            if (mountedRef.current) {
              try {
                const st = useStore.getState()
                if (st.activeSession) st.addSetToSession(s)
                store.getState().addExerciseRecord(exercise.id, { exerciseName: exercise.name, muscleGroup: exercise.muscleGroup, weight: s.weight, reps: s.reps, sets: 1, duration: totalTime, totalVolume: s.weight * s.reps })
              } catch {}
            }
            return 0
          }
        }
        if (phase === 'rest' && next >= restDuration) {
          if (currentSet >= targetSets) { setPhase('done'); clearInterval(intervalRef.current); saveWorkout(); return next }
          setPhase('effort'); setCurrentSet(c => c + 1); return 0
        }
        if (phase === 'last3' && next >= totalTime - 3) { try { navigator.vibrate?.(100) } catch {}; beep(800, 150) }
        return next
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [paused, phase])

  const saveWorkout = () => {
    try {
      const duration = Math.round((Date.now() - startRef.current) / 1000)
      const totalVolume = sets.reduce((s, x) => s + (x.weight * x.reps), 0)
      store.getState().addWorkout({ exerciseName: exercise.name, muscleGroup: exercise.muscleGroup, duration: Math.floor(duration / 60), durationMinutes: Math.floor(duration / 60), calories: Math.round(duration * 0.15), type: 'exercise', totalVolume, sets })
    } catch {}
  }

  const saveAsTemplate = () => {
    try {
      const st = useStore.getState()
      if (st.addWorkoutTemplate) st.addWorkoutTemplate({ name: `${exercise.name} (${targetSets} séries)`, exercises: [{ ...exercise, sets: targetSets, reps: reps || '10', weight: weight || '0' }] })
    } catch {}
  }

  // Summary screen
  if (phase === 'done') {
    const duration = Math.round((Date.now() - startRef.current) / 1000)
    const totalVolume = sets.reduce((s, x) => s + (x.weight * x.reps), 0)
    const maxW = sets.length > 0 ? Math.max(...sets.map(s => s.weight)) : 0
    return (
      <div className="fixed inset-0 z-50 bg-dark-bg flex flex-col items-center justify-center p-6 space-y-6">
        <div className="w-20 h-20 rounded-full bg-lime/20 flex items-center justify-center"><CheckCircle size={40} className="text-lime" /></div>
        <h1 className="text-white font-bold text-2xl text-center">{exercise.name} — Terminé !</h1>
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-lime font-bold text-xl">{sets.length}</p><p className="text-muted text-[10px]">séries</p></div>
          <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-white font-bold text-xl">{f(duration)}</p><p className="text-muted text-[10px]">durée</p></div>
          <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-orange-400 font-bold text-xl">{totalVolume}</p><p className="text-muted text-[10px]">volume</p></div>
        </div>
        {maxW > 0 && (<p className="text-lime/80 text-sm">🏆 Record : {maxW}kg</p>)}
        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={() => { saveAsTemplate(); alert('Template enregistré !'); onComplete() }} className="flex-1 py-3 rounded-xl bg-dark-card border border-dark-border text-white font-bold text-sm flex items-center justify-center gap-2"><Save size={16} />Template</button>
          <button onClick={() => { setPhase('effort'); setCurrentSet(1); setSets([]); setElapsed(0); startRef.current = Date.now() }} className="flex-1 py-3 rounded-xl bg-dark-card border border-dark-border text-white font-bold text-sm flex items-center justify-center gap-2"><Plus size={16} />Refaire</button>
        </div>
        <button onClick={onComplete} className="w-full max-w-xs py-3 rounded-xl bg-lime text-dark-bg font-bold">Terminer</button>
      </div>
    )
  }

  const progress = phase === 'last3' ? (elapsed / totalTime) * 100 : phase === 'effort' ? (elapsed / totalTime) * 100 : (elapsed / restDuration) * 100
  const remaining = phase === 'rest' ? restDuration - elapsed : totalTime - elapsed
  const ringColor = phase === 'last3' ? '#f97316' : phase === 'rest' ? '#3b82f6' : '#22c55e'
  const bgColor = phase === 'rest' ? 'bg-blue-950/30' : 'bg-dark-bg'
  const r = 140; const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference - (Math.min(100, progress) / 100) * circumference

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-between ${bgColor} transition-colors duration-500`}>
      <div className="w-full p-4 flex items-center justify-between">
        <button onClick={() => { store.getState().endSession?.(); onComplete() }} className="p-2 text-white/50 hover:text-white"><ArrowLeft size={24} /></button>
        <div className="text-center">
          <h1 className="text-white font-bold text-2xl uppercase tracking-wider">{exercise.name}</h1>
          <p className="text-white/60 text-sm">{phase === 'rest' ? 'Repos' : `Série ${currentSet}/${targetSets}`}</p>
          {pr > 0 && <p className="text-yellow-400 text-xs mt-0.5"><Trophy size={10} className="inline" /> Record : {pr}kg</p>}
        </div>
        <div className="w-10" />
      </div>
      <div className="relative flex items-center justify-center">
        <svg width="320" height="320" className="-rotate-90">
          <circle cx="160" cy="160" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle cx="160" cy="160" r={r} fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 0.5s linear' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-7xl font-black font-mono tabular-nums ${phase === 'last3' ? 'text-orange-500' : phase === 'rest' ? 'text-blue-400' : 'text-lime'}`}>{f(remaining)}</span>
          <span className="text-white/40 text-sm mt-2">{phase === 'rest' ? 'repos' : 'effort'}</span>
        </div>
      </div>
      {phase !== 'rest' && (
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-center"><input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0" className="w-20 h-12 text-center bg-white/10 border border-white/20 rounded-xl text-white text-xl font-bold placeholder-white/30 focus:outline-none focus:border-lime/50" /><span className="text-white/40 text-[10px] mt-1">kg</span></div>
          <Dumbbell size={20} className="text-white/30" />
          <div className="flex flex-col items-center"><input type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder="0" className="w-20 h-12 text-center bg-white/10 border border-white/20 rounded-xl text-white text-xl font-bold placeholder-white/30 focus:outline-none focus:border-lime/50" /><span className="text-white/40 text-[10px] mt-1">réps</span></div>
        </div>
      )}
      <div className="w-full px-4"><div className="bg-white/5 rounded-2xl p-3 text-center"><p className="text-white/30 text-xs uppercase tracking-wider">Suivant</p><p className="text-white font-medium">{phase === 'rest' && currentSet <= targetSets ? `Série ${currentSet + 1}/${targetSets} — ${exercise.name}` : 'Prochain exercice'}</p></div></div>
      <div className="w-full px-4 pb-8 flex gap-4">
        <button onClick={() => setPaused(p => !p)} className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-lg flex items-center justify-center gap-2">{paused ? <Play size={24} /> : <Pause size={24} />}{paused ? 'Reprendre' : 'Pause'}</button>
        <button onClick={() => { if (currentSet >= targetSets) { setPhase('done'); saveWorkout() } else { setPhase('rest'); setCurrentSet(c => c + 1) } }} className="flex-1 py-4 rounded-2xl bg-lime/20 hover:bg-lime/30 border border-lime/30 text-lime font-bold text-lg flex items-center justify-center gap-2"><SkipForward size={24} />Skip</button>
      </div>
    </div>
  )
}

function f(s) { const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}` }
