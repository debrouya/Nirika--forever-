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
  const [effortSec, setEffortSec] = useState(45)
  const targetSets = 3; const restSec = Math.round(effortSec / 2)
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
        const n = t + 1; if (phase === 'effort' || phase === 'last3') {
          if (n >= effortSec - 3 && n < effortSec) setPhase('last3')
          if (n >= effortSec) { setPhase('rest'); const s = { w: Number(weight) || 0, r: Number(reps) || 0 }; setSets(p => [...p, s]); try { const st = useStore.getState(); if (st.activeSession) st.addSetToSession(s); store.getState().addExerciseRecord(exercise.id, { exerciseName: exercise.name, muscleGroup: exercise.muscleGroup, weight: s.w, reps: s.r, totalVolume: s.w * s.r }) } catch {}; return 0 }
        }
        if (phase === 'rest' && n >= restSec) { if (currentSet >= targetSets) { setPhase('done'); clearInterval(intervalRef.current); saveW(); return n }; setPhase('effort'); setCurrentSet(c => c + 1); return 0 }
        if (phase === 'last3' && n >= effortSec - 3) { try { navigator.vibrate?.(100) } catch {}; beep(800, 150) }
        return n
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [paused, phase])

  const saveW = () => { const d = Math.round((Date.now() - startRef.current) / 1000); const v = sets.reduce((s, x) => s + x.w * x.r, 0); try { store.getState().addWorkout({ exerciseName: exercise.name, muscleGroup: exercise.muscleGroup, duration: Math.floor(d / 60), durationMinutes: Math.floor(d / 60), calories: Math.round(d * 0.15), totalVolume: v }) } catch {} }

  const handleTerminer = () => { clearInterval(intervalRef.current); if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {}); onComplete() }

  if (phase === 'done') {
    const d = Math.round((Date.now() - startRef.current) / 1000); const v = sets.reduce((s, x) => s + x.w * x.r, 0)
    return (
      <div className="fixed inset-0 z-40 bg-dark-bg flex flex-col items-center justify-center p-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 90px)' }}>
        <CheckCircle size={40} className="text-lime mb-4" />
        <h1 className="text-white font-bold text-xl text-center mb-6">{exercise.name} - Termine</h1>
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-4">
          <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-lime font-bold text-lg">{sets.length}</p><p className="text-muted text-[10px]">series</p></div>
          <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-white font-bold text-lg">{fmt(d)}</p><p className="text-muted text-[10px]">duree</p></div>
          <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-orange-400 font-bold text-lg">{v}</p><p className="text-muted text-[10px]">volume</p></div>
        </div>
        <div className="flex gap-3 w-full max-w-xs mb-3">
          <button onClick={() => { try { store.getState().addWorkoutTemplate({ name: `${exercise.name} (${targetSets}s)`, exercises: [{ ...exercise, sets: targetSets, reps: reps || '10', weight: weight || '0' }] }) } catch {}; handleTerminer() }} className="flex-1 h-12 rounded-xl bg-dark-card border border-dark-border text-white font-bold text-sm flex items-center justify-center gap-2"><Save size={16} />Template</button>
          <button onClick={() => { setPhase('effort'); setCurrentSet(1); setSets([]); setElapsed(0); startRef.current = Date.now() }} className="flex-1 h-12 rounded-xl bg-dark-card border border-dark-border text-white font-bold text-sm flex items-center justify-center gap-2"><Plus size={16} />Refaire</button>
        </div>
        <button onClick={handleTerminer} className="w-full max-w-xs h-12 rounded-xl bg-lime text-dark-bg font-bold">Terminer</button>
      </div>
    )
  }

  const progress = phase === 'rest' ? (elapsed / restSec) * 100 : (elapsed / effortSec) * 100
  const remaining = phase === 'rest' ? restSec - elapsed : effortSec - elapsed
  const ringColor = phase === 'last3' ? '#f97316' : phase === 'rest' ? '#3b82f6' : '#22c55e'
  const bg = phase === 'rest' ? '#0a1628' : '#0f1a1e'
  const r = 130; const c = 2 * Math.PI * r; const dash = c - (Math.min(100, progress) / 100) * c

  return (
    <div className="fixed inset-0 z-40 flex flex-col" style={{ backgroundColor: bg }}>
      <div className="flex items-center justify-between px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
        <button onClick={handleTerminer} className="p-2 text-white/50 hover:text-white"><ArrowLeft size={22} /></button>
        <div className="text-center flex-1">
          <h1 className="text-white font-bold text-lg uppercase tracking-wide">{exercise.name}</h1>
          <p className="text-white/50 text-xs">{phase === 'rest' ? 'Repos' : `Serie ${currentSet}/${targetSets}`}{pr > 0 ? `  PR:${pr}kg` : ''}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            {[30, 45, 60].map(d => (
              <button key={d} onClick={() => { setEffortSec(d); setElapsed(0); startRef.current = Date.now() }} className={`px-2 py-0.5 rounded text-[10px] font-medium ${effortSec === d ? 'bg-lime/20 text-lime' : 'text-white/30 hover:text-white/60'}`}>{d}s</button>
            ))}
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <svg width="280" height="280" className="-rotate-90">
            <circle cx="140" cy="140" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle cx="140" cy="140" r={r} fill="none" stroke={ringColor} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={dash} style={{ transition: 'stroke-dashoffset 0.5s linear', filter: `drop-shadow(0 0 6px ${ringColor})` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-6xl font-black font-mono tabular-nums ${phase === 'last3' ? 'text-orange-500' : phase === 'rest' ? 'text-blue-400' : 'text-lime'}`}>{fmt(remaining)}</span>
            <span className="text-white/30 text-xs mt-1">{phase === 'rest' ? 'repos' : 'effort'}</span>
          </div>
        </div>

        {phase !== 'rest' && (
          <div className="flex gap-4 items-center mt-2">
            <div className="flex flex-col items-center">
              <span className="text-white/30 text-[10px] mb-1">Charge</span>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0" className="w-16 h-10 text-center bg-white/10 border border-white/20 rounded-lg text-white text-lg font-bold placeholder-white/30 focus:outline-none focus:border-lime/50" />
            </div>
            <span className="text-white/20">x</span>
            <div className="flex flex-col items-center">
              <span className="text-white/30 text-[10px] mb-1">Reps</span>
              <input type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder="0" className="w-16 h-10 text-center bg-white/10 border border-white/20 rounded-lg text-white text-lg font-bold placeholder-white/30 focus:outline-none focus:border-lime/50" />
            </div>
          </div>
        )}

        <div className="w-full max-w-xs px-4"><div className="bg-white/5 rounded-xl p-2 text-center"><p className="text-white/20 text-[10px]">Suivant : {phase === 'rest' && currentSet <= targetSets ? `Serie ${currentSet + 1}/${targetSets}` : 'Prochain exo'}</p></div></div>
      </div>

      <div className="px-4 flex gap-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 80px)' }}>
        <button onClick={() => setPaused(p => !p)} className="flex-1 h-12 rounded-2xl bg-white/10 active:bg-white/20 border border-white/10 text-white font-bold flex items-center justify-center gap-2">
          {paused ? <Play size={20} /> : <Pause size={20} />}{paused ? 'Reprendre' : 'Pause'}
        </button>
        <button onClick={() => { if (currentSet >= targetSets) { setPhase('done'); saveW() } else { setPhase('rest'); setCurrentSet(c => c + 1) } }} className="flex-1 h-12 rounded-2xl bg-lime/20 active:bg-lime/30 border border-lime/30 text-lime font-bold flex items-center justify-center gap-2">
          <SkipForward size={20} />Suivant
        </button>
      </div>
    </div>
  )
}
