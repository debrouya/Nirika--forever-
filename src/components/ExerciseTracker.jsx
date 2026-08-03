import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Play,
  Square,
  Plus,
  Minus,
  X,
  Clock,
  Flame,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Rocket,
  Trophy,
  SkipForward,
  Zap,
} from 'lucide-react'
import useStore from '../store/useStore'

const COACHING_TIPS = [
  'Ralentis la descente — 2 sec en excentrique',
  'Garde le dos droit, serre les omoplates',
  'Expire à l\'effort, inspire en relâchant',
  'Amplitude complète pour de meilleurs résultats',
  'Contrôle le mouvement, pas de balancement',
  'Respire régulièrement, ne retiens pas ton souffle',
  'Concentre-toi sur le muscle cible',
  'Vise la qualité, pas la quantité',
]

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function getIntensityLabel(sets, avgReps, avgWeight) {
  const volume = sets * avgReps * (avgWeight || 1)
  if (volume > 5000) return 'Très intense'
  if (volume > 3000) return 'Intense'
  if (volume > 1500) return 'Modéré'
  return 'Léger'
}

export default function ExerciseTracker({ exercise, sessionHistory, onComplete }) {
  const { addExerciseRecord, addWorkout } = useStore()
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timer, setTimer] = useState(0)
  const [sets, setSets] = useState([])
  const prevSessions = (sessionHistory || []).filter((s) => s.exerciseId === exercise.id)
  const lastSession = prevSessions[prevSessions.length - 1]
  const suggestedReps = lastSession?.sets?.[lastSession.sets.length - 1]?.reps || lastSession?.reps || ''
  const suggestedWeight = lastSession?.sets?.[lastSession.sets.length - 1]?.weight || ''
  const [repsInput, setRepsInput] = useState(suggestedReps ? Math.max(1, suggestedReps + 1).toString() : '')
  const [weightInput, setWeightInput] = useState(suggestedWeight ? suggestedWeight.toString() : '')
  const [showSummary, setShowSummary] = useState(false)
  const [coachingTip, setCoachingTip] = useState(COACHING_TIPS[0])
  const [restActive, setRestActive] = useState(false)
  const [restTime, setRestTime] = useState(0)
  const [restDuration, setRestDuration] = useState(0)
  const timerRef = useRef(null)
  const tipIntervalRef = useRef(null)
  const restTimerRef = useRef(null)

  const getRestDuration = useCallback(() => {
    if (exercise.muscleGroup === 'Cardio') return 30
    if (exercise.equipment === 'none') return 60
    return 90
  }, [exercise])

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isActive, isPaused])

  useEffect(() => {
    if (isActive) {
      tipIntervalRef.current = setInterval(() => {
        setCoachingTip(COACHING_TIPS[Math.floor(Math.random() * COACHING_TIPS.length)])
      }, 8000)
    }
    return () => clearInterval(tipIntervalRef.current)
  }, [isActive])

  useEffect(() => {
    if (restActive && restTime > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTime((t) => {
          if (t <= 1) {
            clearInterval(restTimerRef.current)
            setRestActive(false)
            navigator.vibrate?.([200, 100, 200])
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(restTimerRef.current)
  }, [restActive, restTime])

  const startSession = () => {
    setIsActive(true)
    setIsPaused(false)
    setTimer(0)
    setSets([])
    setRepsInput('')
    setWeightInput('')
    setShowSummary(false)
  }

  const pauseSession = () => setIsPaused(!isPaused)

  const addSet = () => {
    const reps = parseInt(repsInput, 10)
    if (!reps || reps <= 0) return
    setSets((prev) => [
      ...prev,
      {
        reps,
        weight: parseFloat(weightInput) || 0,
        volume: reps * (parseFloat(weightInput) || 0),
        timestamp: new Date().toISOString(),
      },
    ])
    setRepsInput('')
    setWeightInput('')
    const dur = getRestDuration()
    setRestDuration(dur)
    setRestTime(dur)
    setRestActive(true)
  }

  const removeSet = (index) => {
    setSets((prev) => prev.filter((_, i) => i !== index))
  }

  const endSession = () => {
    const totalReps = sets.reduce((sum, s) => sum + s.reps, 0)
    const totalVolume = sets.reduce((sum, s) => sum + s.volume, 0)
    const avgWeight = sets.length ? sets.reduce((sum, s) => sum + s.weight, 0) / sets.length : 0
    const calories = Math.round(timer * 0.15)

    addExerciseRecord(exercise.id, {
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      duration: Math.floor(timer / 60),
      sets,
      totalReps,
      totalVolume,
      calories,
    })

    addWorkout({
      type: 'exercise',
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: sets.length,
      totalReps,
      totalVolume,
      duration: Math.floor(timer / 60),
      calories,
    })

    setIsActive(false)
    setShowSummary(true)
    setRestActive(false)
    setRestTime(0)
    clearInterval(tipIntervalRef.current)
    clearInterval(restTimerRef.current)
  }

  const totalReps = sets.reduce((sum, s) => sum + s.reps, 0)
  const totalVolume = sets.reduce((sum, s) => sum + s.volume, 0)
  const avgWeight = sets.length ? sets.reduce((sum, s) => sum + s.weight, 0) / sets.length : 0

  const comparison = lastSession ? {
    volumeChange: totalVolume - (lastSession.totalVolume || 0),
    repsChange: totalReps - (lastSession.totalReps || 0),
    setsChange: sets.length - (lastSession.sets?.length || 0),
  } : null

  if (showSummary) {
    return (
      <div className="space-y-4 p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={24} className="text-lime" />
          <h2 className="text-white font-bold text-xl">Résumé</h2>
        </div>

        <div className="bg-dark-card rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3">{exercise.name}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-bg rounded-xl p-3">
              <Clock size={16} className="text-lime mb-1" />
              <p className="text-white text-lg font-bold">{formatDuration(timer)}</p>
              <p className="text-muted text-[10px]">Durée</p>
            </div>
            <div className="bg-dark-bg rounded-xl p-3">
              <Flame size={16} className="text-lime mb-1" />
              <p className="text-white text-lg font-bold">{sets.length}</p>
              <p className="text-muted text-[10px]">Séries</p>
            </div>
            <div className="bg-dark-bg rounded-xl p-3">
              <TrendingUp size={16} className="text-lime mb-1" />
              <p className="text-white text-lg font-bold">{totalReps}</p>
              <p className="text-muted text-[10px]">Reps totales</p>
            </div>
            <div className="bg-dark-bg rounded-xl p-3">
              <Flame size={16} className="text-lime mb-1" />
              <p className="text-white text-lg font-bold">{totalVolume > 0 ? `${totalVolume}kg` : '—'}</p>
              <p className="text-muted text-[10px]">Volume total</p>
            </div>
          </div>
        </div>

        {/* Intensity */}
        <div className="bg-dark-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-lime" />
            <span className="text-white font-semibold text-sm">Intensité estimée</span>
          </div>
          <span className="text-lime text-lg font-bold">{getIntensityLabel(sets.length, totalReps / Math.max(sets.length, 1), avgWeight)}</span>
        </div>

        {/* Comparison */}
        {comparison && (
          <div className="bg-dark-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-lime" />
              <span className="text-white font-semibold text-sm">vs. Session précédente</span>
            </div>
            <div className="space-y-2">
              {comparison.volumeChange !== 0 && (
                <div className="flex items-center gap-2">
                  {comparison.volumeChange > 0 ? (
                    <CheckCircle2 size={14} className="text-lime" />
                  ) : (
                    <AlertTriangle size={14} className="text-yellow-400" />
                  )}
                  <span className="text-white/70 text-xs">
                    Volume {comparison.volumeChange > 0 ? '+' : ''}{comparison.volumeChange}kg
                  </span>
                </div>
              )}
              {comparison.repsChange !== 0 && (
                <div className="flex items-center gap-2">
                  {comparison.repsChange > 0 ? (
                    <CheckCircle2 size={14} className="text-lime" />
                  ) : (
                    <AlertTriangle size={14} className="text-yellow-400" />
                  )}
                  <span className="text-white/70 text-xs">
                    Reps {comparison.repsChange > 0 ? '+' : ''}{comparison.repsChange}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="bg-dark-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-lime" />
            <span className="text-white font-semibold text-sm">Feedback</span>
          </div>
          <div className="space-y-2">
            {avgWeight > 0 && (
              <p className="text-white/70 text-xs">
                {comparison?.volumeChange > 0
                  ? 'Progression ! Envisage d\'augmenter le poids de 2.5-5kg'
                  : 'Maintiens ou augmente légèrement le poids la prochaine fois'}
              </p>
            )}
            <p className="text-white/70 text-xs">
              Repos recommandé : {sets.length > 5 ? '2-3 min' : '60-90 sec'} entre les séries
            </p>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() => onComplete?.()}
          className="w-full py-4 rounded-2xl bg-lime text-dark-bg font-bold text-base"
        >
          Continuer
        </button>
      </div>
    )
  }

  if (!isActive) {
    let settings = {}
  try { settings = JSON.parse(localStorage.getItem('nirika_admin_settings') || '{}') } catch {}
    const isQuickMode = settings.quickMode

    if (isQuickMode) {
      return (
        <div className="p-4">
          <button
            onClick={startSession}
            className="bg-dark-card rounded-2xl p-4 border border-dark-border w-full text-left active:scale-[0.98] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-sm">{exercise.name}</h3>
                <p className="text-muted text-[10px]">{exercise.muscleGroup}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-lime/20 flex items-center justify-center">
                <Play size={20} className="text-lime ml-0.5" fill="currentColor" />
              </div>
            </div>
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-4 p-4">
        <div className="bg-dark-card rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-lime/20 flex items-center justify-center">
              <Play size={24} className="text-lime ml-0.5" fill="currentColor" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{exercise.name}</h3>
              <p className="text-muted text-xs">{exercise.muscleGroup} · {exercise.equipment}</p>
            </div>
          </div>
          <p className="text-white/60 text-xs mb-4">{exercise.description}</p>

          {exercise.youtubeId && (
            <div className="aspect-video rounded-xl overflow-hidden bg-dark-bg mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${exercise.youtubeId}?rel=0`}
                title={exercise.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <button
            onClick={startSession}
            className="w-full py-4 rounded-2xl bg-lime text-dark-bg font-bold text-base flex items-center justify-center gap-2"
          >
            <Play size={20} fill="currentColor" />
            Commencer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {/* Rest Timer */}
      {restActive && (
        <div className="bg-dark-card rounded-2xl p-6 border border-lime/20 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-lime/10 flex items-center justify-center mx-auto mb-3">
            <Clock size={32} className="text-lime" />
          </div>
          <p className="text-muted text-xs uppercase mb-1">Repos</p>
          <p className="text-white text-5xl font-mono font-bold mb-1">
            {Math.floor(restTime / 60)}:{String(restTime % 60).padStart(2, '0')}
          </p>
          <p className="text-lime text-xs font-medium mb-4">
            {restTime === restDuration ? 'Bon repos 💪' : restTime < 5 ? 'Prêt ! 🔥' : 'Continue à respirer'}
          </p>
          <div className="w-full h-1.5 rounded-full bg-dark-bg mb-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-lime transition-all duration-1000"
              style={{ width: `${(restTime / restDuration) * 100}%` }}
            />
          </div>
          <button
            onClick={() => { setRestActive(false); setRestTime(0) }}
            className="px-6 py-2 rounded-xl bg-dark-bg border border-dark-border text-muted text-xs font-medium hover:text-white transition-colors flex items-center gap-2 mx-auto"
          >
            <SkipForward size={14} /> Passer
          </button>
        </div>
      )}

      {/* Live Header */}
      <div className="bg-dark-card rounded-2xl p-4 border border-lime/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span className="text-white font-bold text-sm">{exercise.name}</span>
          </div>
          <span className="text-lime text-xs font-medium">En cours</span>
        </div>

        {/* Timer + Stats */}
        <div className="flex items-center justify-around mb-4">
          <div className="text-center">
            <Clock size={20} className="text-lime mx-auto mb-1" />
            <p className="text-white text-3xl font-mono font-bold">{formatDuration(timer)}</p>
            <p className="text-muted text-[10px]">Durée</p>
          </div>
          <div className="text-center">
            <Flame size={20} className="text-lime mx-auto mb-1" />
            <p className="text-white text-3xl font-bold">{sets.length}</p>
            <p className="text-muted text-[10px]">Séries</p>
          </div>
          <div className="text-center">
            <TrendingUp size={20} className="text-lime mx-auto mb-1" />
            <p className="text-white text-3xl font-bold">{totalReps}</p>
            <p className="text-muted text-[10px]">Reps</p>
          </div>
        </div>

        {/* Coaching Tip */}
        <div className="bg-dark-bg rounded-xl p-3 flex items-start gap-2">
          <Lightbulb size={14} className="text-lime mt-0.5 flex-shrink-0" />
          <p className="text-white/80 text-xs leading-relaxed">{coachingTip}</p>
        </div>
      </div>

      {/* Set Input */}
      <div className="bg-dark-card rounded-2xl p-4">
        <p className="text-white font-semibold text-sm mb-3">Ajouter une série</p>
        {suggestedReps > 0 && (
          <p className="text-lime/60 text-[10px] mb-2">Dernière fois : {suggestedReps} reps {suggestedWeight ? `× ${suggestedWeight}kg` : ''} → essaie {repsInput || suggestedReps + 1} reps</p>
        )}
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            value={repsInput}
            onChange={(e) => setRepsInput(e.target.value)}
            placeholder="Reps"
            className="flex-1 bg-dark-bg border border-dark-border rounded-xl py-3 px-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-lime/50 text-center"
            onKeyDown={(e) => e.key === 'Enter' && addSet()}
          />
          <input
            type="number"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="Poids (kg)"
            className="flex-1 bg-dark-bg border border-dark-border rounded-xl py-3 px-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-lime/50 text-center"
            onKeyDown={(e) => e.key === 'Enter' && addSet()}
          />
          <button
            onClick={addSet}
            className="bg-lime hover:bg-lime-light text-dark-bg rounded-xl px-4 font-bold text-sm transition-all"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Sets List */}
        {sets.length > 0 && (
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {sets.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-dark-bg rounded-xl px-3 py-2">
                <span className="text-muted text-xs">Série {i + 1}</span>
                <span className="text-white text-sm font-medium">
                  {s.reps} reps {s.weight ? `× ${s.weight}kg` : ''}
                </span>
                <button onClick={() => removeSet(i)} className="text-red-400/60 hover:text-red-400">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={pauseSession}
          className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-all ${
            isPaused
              ? 'bg-lime text-dark-bg'
              : 'bg-dark-card border border-dark-border text-white'
          }`}
        >
          {isPaused ? 'Reprendre' : 'Pause'}
        </button>
        <button
          onClick={endSession}
          className="flex-1 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-sm transition-all flex items-center justify-center gap-2"
        >
          <Square size={14} /> Terminer
        </button>
      </div>
    </div>
  )
}
