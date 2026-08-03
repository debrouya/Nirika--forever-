import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Play,
  Pause,
  Square,
  Plus,
  Minus,
  Check,
  Timer,
  ChevronRight,
  Dumbbell,
  Flame,
} from 'lucide-react'
import useStore from '../store/useStore'
import { beep } from '../utils/audio'
import useExercises from '../hooks/useExercises'
import { fireStreakToast } from './StreakMotivation'
import GlassCard from './GlassCard'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function playBeep(freq = 800, duration = 0.15) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = 'sine'
    gain.gain.value = 0.3
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.stop(ctx.currentTime + duration)
  } catch {}
}

function RestTimer({ duration, onDone }) {
  const [remaining, setRemaining] = useState(duration)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (remaining <= 0) {
      playBeep(1200, 0.3)
      setTimeout(() => playBeep(1200, 0.3), 200)
      onDone()
      return
    }
    if (isPaused) return
    const id = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(id)
  }, [remaining, isPaused, onDone])

  useEffect(() => {
    if (remaining === 5) playBeep(600, 0.1)
  }, [remaining])

  const pct = (remaining / duration) * 100

  return (
    <GlassCard className="p-4 border border-blue-500/20 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer size={14} className="text-blue-400" />
          <span className="text-white/60 text-xs">Repos</span>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="text-white/40 hover:text-white text-xs transition-colors"
        >
          {isPaused ? 'Reprendre' : 'Pause'}
        </button>
      </div>
      <div className="text-center">
        <p className="text-4xl font-black text-white font-mono tabular-nums">{formatTime(remaining)}</p>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </GlassCard>
  )
}

export default function WorkoutTracker({ program, onFinish, onCancel }) {
  const { addWorkout, addSessionToHistory, profile, addExerciseRecord } = useStore()
  const exercises = useExercises()
  const EXERCISE_MAP = {}
  exercises.forEach((e) => (EXERCISE_MAP[e.id] = e))
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [sessionSets, setSessionSets] = useState([])
  const [allSessionSets, setAllSessionSets] = useState({})
  const [weightInput, setWeightInput] = useState('')
  const [repsInput, setRepsInput] = useState('')
  const [showRest, setShowRest] = useState(false)
  const [restDuration, setRestDuration] = useState(90)
  const [elapsed, setElapsed] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef(null)

  const dayEntries = useMemo(() => {
    if (!program?.structure) return []
    return Object.entries(program.structure)
  }, [program])

  const currentDay = dayEntries[currentDayIndex]
  const currentDayExercises = currentDay ? currentDay[1] : []
  const currentExerciseConfig = currentDayExercises[currentExerciseIndex]
  const currentExercise = currentExerciseConfig
    ? EXERCISE_MAP[currentExerciseConfig.exerciseId]
    : null

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isPaused])

  const addSet = useCallback(() => {
    const reps = parseInt(repsInput, 10)
    if (!reps || reps <= 0) return
    const weight = parseFloat(weightInput) || 0
    setSessionSets((prev) => [...prev, { reps, weight }])
    setRepsInput('')
    setWeightInput('')
  }, [repsInput, weightInput])

  const confirmSet = useCallback(() => {
    addSet()
    setShowRest(true)
  }, [addSet])

  const handleRestDone = useCallback(() => {
    setShowRest(false)
    if (!currentExerciseConfig) return
    const key = `${currentDayIndex}-${currentExerciseIndex}`
    setAllSessionSets((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), sessionSets[sessionSets.length - 1] || { reps: 0, weight: 0 }],
    }))
  }, [currentDayIndex, currentExerciseIndex, sessionSets, currentExerciseConfig])

  const goToNextExercise = useCallback(() => {
    const key = `${currentDayIndex}-${currentExerciseIndex}`
    setAllSessionSets((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...sessionSets],
    }))
    setSessionSets([])

    if (currentExerciseIndex < currentDayExercises.length - 1) {
      setCurrentExerciseIndex((i) => i + 1)
    } else if (currentDayIndex < dayEntries.length - 1) {
      setCurrentDayIndex((i) => i + 1)
      setCurrentExerciseIndex(0)
    } else {
      handleFinish()
    }
  }, [currentDayIndex, currentExerciseIndex, currentDayExercises, dayEntries, sessionSets])

  const handleFinish = useCallback(() => {
    setIsPaused(false)
    clearInterval(timerRef.current)

    let totalSets = 0
    let totalReps = 0
    Object.values(allSessionSets).forEach((sets) => {
      totalSets += sets.length
      sets.forEach((s) => (totalReps += s.reps || 0))
    })
    if (sessionSets.length > 0) {
      totalSets += sessionSets.length
      sessionSets.forEach((s) => (totalReps += s.reps || 0))
    }

    const workout = {
      type: 'programme',
      programName: program?.name || 'Programme',
      duration: elapsed,
      durationMinutes: Math.round(elapsed / 60),
      totalSets,
      totalReps,
      calories: Math.round(elapsed * 0.12),
      daysCompleted: currentDayIndex + 1,
      exercisesCompleted: currentExerciseIndex + 1,
    }

    addWorkout(workout)
    fireStreakToast()

    // Save individual exercises to exerciseHistory
    Object.entries(allSessionSets).forEach(([exId, exSets]) => {
      if (exSets.length > 0) {
        const totalVolume = exSets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0)
        const totalReps = exSets.reduce((sum, s) => sum + (s.reps || 0), 0)
        addExerciseRecord(exId, {
          exerciseName: exId,
          sets: exSets.length,
          totalReps,
          totalVolume,
          duration: 0,
          calories: 0,
          source: 'programme',
        })
      }
    })
    addSessionToHistory({
      exerciseId: program?.id,
      exerciseName: program?.name || 'Programme',
      muscleGroup: 'Full Body',
      date: new Date().toISOString().slice(0, 10),
      startedAt: new Date().toISOString(),
      duration: Math.round(elapsed / 60),
      sets: Object.values(allSessionSets).flat(),
      calories: workout.calories,
    })

    onFinish()
  }, [allSessionSets, sessionSets, elapsed, program, currentDayIndex, currentExerciseIndex, addWorkout, addSessionToHistory, onFinish])

  const handleCancel = useCallback(() => {
    setIsPaused(false)
    clearInterval(timerRef.current)
    onCancel()
  }, [onCancel])

  const exerciseCompleted = currentExerciseConfig
    ? (allSessionSets[`${currentDayIndex}-${currentExerciseIndex}`] || []).length >= (currentExerciseConfig.sets || 3)
    : false

  return (
    <div className="space-y-4 p-4">
      {/* Timer + Progress */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/50 text-xs">
            Jour {currentDayIndex + 1}/{dayEntries.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="text-white/40 hover:text-white transition-colors"
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
            </button>
            <span className="text-white font-mono font-bold text-lg tabular-nums">{formatTime(elapsed)}</span>
          </div>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-lime to-lime rounded-full transition-all"
            style={{
              width: `${((currentDayIndex * currentDayExercises.length + currentExerciseIndex + 1) /
                Math.max(1, dayEntries.reduce((sum, [, exs]) => sum + exs.length, 0))) *
                100}%`,
            }}
          />
        </div>
      </GlassCard>

      {/* Rest timer */}
      {showRest && (
        <RestTimer duration={restDuration} onDone={handleRestDone} />
      )}

      {/* Current exercise */}
      {!showRest && currentExercise && (
        <GlassCard className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-base">{currentExercise.name}</p>
              <p className="text-white/40 text-xs">{currentExercise.muscleGroup}</p>
            </div>
            <div className="text-right">
              <p className="text-lime font-bold text-sm">
                {currentExerciseConfig.sets}×{currentExerciseConfig.reps}
              </p>
            </div>
          </div>

          {/* Sets logged */}
          {sessionSets.length > 0 && (
            <div className="space-y-1">
              {sessionSets.map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-1.5 text-xs">
                  <span className="text-white/50">Série {i + 1}</span>
                  <span className="text-white">
                    {s.reps} reps {s.weight ? `× ${s.weight}kg` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="number"
              value={repsInput}
              onChange={(e) => setRepsInput(e.target.value)}
              placeholder="Reps"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-lime/50 text-center"
              onKeyDown={(e) => e.key === 'Enter' && confirmSet()}
            />
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="Poids (kg)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-lime/50 text-center"
              onKeyDown={(e) => e.key === 'Enter' && confirmSet()}
            />
            <button
              onClick={confirmSet}
              className="bg-lime hover:brightness-110 text-black rounded-xl px-4 font-bold text-sm transition-all"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Rest duration */}
          <div className="flex items-center gap-2 text-[10px] text-white/30">
            <span>Repos :</span>
            {[60, 90, 120, 180].map((d) => (
              <button
                key={d}
                onClick={() => setRestDuration(d)}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  restDuration === d
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-white/5 text-white/30 hover:text-white/50'
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Next / Finish */}
      <div className="flex gap-2">
        <button
          onClick={handleFinish}
          className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Square size={14} /> Terminer
        </button>
        <button
          onClick={goToNextExercise}
          disabled={exerciseCompleted}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            exerciseCompleted
              ? 'bg-lime hover:brightness-110 text-black'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          {currentExerciseIndex >= currentDayExercises.length - 1 &&
          currentDayIndex >= dayEntries.length - 1
            ? 'Terminer la séance'
            : 'Exercice suivant'}{' '}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
