import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, SkipForward, ArrowLeft, Dumbbell } from 'lucide-react'
import useStore from '../store/useStore'

function beep(freq = 800, dur = 150) {
  try { const a = new AudioContext(); const o = a.createOscillator(); o.type = 'square'; o.frequency.value = freq; o.connect(a.destination); o.start(); o.stop(a.currentTime + dur / 1000) } catch {}
}

export default function WorkoutScreen({ exercise, onComplete }) {
  const { exerciseHistory, addExerciseRecord, endSession } = useStore()
  const [phase, setPhase] = useState('effort') // effort | last3 | rest
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
  const last3Threshold = totalTime - 3

  const intervalRef = useRef(null)
  const wakeLockRef = useRef(null)

  // Wake Lock
  useEffect(() => {
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(w => { wakeLockRef.current = w }).catch(() => {})
    }
    return () => { if (wakeLockRef.current) { wakeLockRef.current.release().catch(() => {}); wakeLockRef.current = null } }
  }, [])

  // Main timer
  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(() => {
      setElapsed((t) => {
        const next = t + 1
        if (phase === 'effort') {
          if (next >= totalTime - 3 && next < totalTime) setPhase('last3')
          if (next >= totalTime) {
            setPhase('rest')
            // Save set
            const s = { weight: Number(weight) || 0, reps: Number(reps) || 0, timestamp: Date.now() }
            setSets((prev) => [...prev, s])
            const store = useStore.getState()
            if (store.activeSession) {
              store.addSetToSession(s)
              addExerciseRecord(exercise.id, { exerciseName: exercise.name, muscleGroup: exercise.muscleGroup, weight: s.weight, reps: s.reps, sets: currentSet })
            }
            return 0
          }
        }
        if (phase === 'rest' && next >= restDuration) {
          // Next set or done
          if (currentSet >= targetSets) {
            clearInterval(intervalRef.current)
            onComplete()
            return next
          }
          setPhase('effort')
          setCurrentSet((c) => c + 1)
          return 0
        }
        // Beep + vibrate last 3
        if (phase === 'last3' && next >= totalTime - 3 && next < totalTime) {
          try { navigator.vibrate?.(100) } catch {}
          beep(800, 150)
        }
        return next
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [paused, phase, currentSet])

  const progress = phase === 'effort' || phase === 'last3' ? (elapsed / totalTime) * 100 : (elapsed / restDuration) * 100
  const remaining = phase === 'rest' ? restDuration - elapsed : totalTime - elapsed
  const displayTime = phase === 'rest' ? remaining : remaining

  const ringColor = phase === 'last3' ? '#f97316' : phase === 'rest' ? '#3b82f6' : '#22c55e'
  const bgColor = phase === 'rest' ? 'bg-blue-950/30' : 'bg-dark-bg'
  const r = 140; const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-between ${bgColor} transition-colors duration-500`}>
      {/* Header */}
      <div className="w-full p-4 flex items-center justify-between">
        <button onClick={() => { endSession(); onComplete() }} className="p-2 text-white/50 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold text-2xl uppercase tracking-wider">{exercise.name}</h1>
          <p className="text-white/60 text-sm mt-1">
            {phase === 'rest' ? 'Repos' : `Série ${currentSet}/${targetSets}`}
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Timer Ring */}
      <div className="relative flex items-center justify-center">
        <svg width="320" height="320" className="-rotate-90">
          <circle cx="160" cy="160" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle cx="160" cy="160" r={r} fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-7xl font-black font-mono tabular-nums ${phase === 'last3' ? 'text-orange-500' : phase === 'rest' ? 'text-blue-400' : 'text-lime'}`}>
            {String(Math.floor(displayTime / 60)).padStart(1, '0')}:{String(displayTime % 60).padStart(2, '0')}
          </span>
          <span className="text-white/40 text-sm mt-2">{phase === 'rest' ? 'repos' : 'effort'}</span>
        </div>
      </div>

      {/* Weight & Reps Input (during effort phase) */}
      {phase !== 'rest' && (
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-center">
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0" className="w-20 h-12 text-center bg-white/10 border border-white/20 rounded-xl text-white text-xl font-bold placeholder-white/30 focus:outline-none focus:border-lime/50" />
            <span className="text-white/40 text-[10px] mt-1">kg</span>
          </div>
          <Dumbbell size={20} className="text-white/30" />
          <div className="flex flex-col items-center">
            <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="0" className="w-20 h-12 text-center bg-white/10 border border-white/20 rounded-xl text-white text-xl font-bold placeholder-white/30 focus:outline-none focus:border-lime/50" />
            <span className="text-white/40 text-[10px] mt-1">réps</span>
          </div>
        </div>
      )}

      {/* Next exercise preview */}
      <div className="w-full px-4">
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <p className="text-white/30 text-xs uppercase tracking-wider">Suivant</p>
          <p className="text-white font-medium">{phase === 'rest' && currentSet <= targetSets ? `Série ${currentSet + 1}/${targetSets} — ${exercise.name}` : 'Prochain exercice'}</p>
          <p className="text-white/20 text-[10px]">Repos {restDuration}s</p>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full px-4 pb-8 flex gap-4">
        <button onClick={() => setPaused((p) => !p)} className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-lg flex items-center justify-center gap-2">
          {paused ? <Play size={24} /> : <Pause size={24} />}
          {paused ? 'Reprendre' : 'Pause'}
        </button>
        <button onClick={() => { if (currentSet >= targetSets) { onComplete() } else { setPhase('rest'); setCurrentSet((c) => c + 1) } }} className="flex-1 py-4 rounded-2xl bg-lime/20 hover:bg-lime/30 border border-lime/30 text-lime font-bold text-lg flex items-center justify-center gap-2">
          <SkipForward size={24} />
          Skip
        </button>
      </div>
    </div>
  )
}
