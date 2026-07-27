import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Play,
  Square,
  Plus,
  Minus,
  X,
  Settings,
  Dumbbell,
  Clock,
  Flame,
} from 'lucide-react'
import useStore from '../store/useStore'
import GlassCard from './GlassCard'
import MachineSettings from './MachineSettings'

const MUSCLE_GROUPS = [
  { id: 'all', label: 'Tout' },
  { id: 'pecs', label: 'Pectoraux' },
  { id: 'dos', label: 'Dos' },
  { id: 'epaules', label: 'Épaules' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'jambes', label: 'Jambes' },
  { id: 'abdominaux', label: 'Abdos' },
  { id: 'fessiers', label: 'Fessiers' },
]

const DEFAULT_EXERCISES = [
  { id: 'pompes', name: 'Pompes', muscleGroup: 'pecs', difficulty: 'Facile', youtubeId: 'IODxDxX7oi4' },
  { id: 'dips', name: 'Dips', muscleGroup: 'triceps', difficulty: 'Moyen', youtubeId: '2z8JmcrW-As' },
  { id: 'tractions', name: 'Tractions', muscleGroup: 'dos', difficulty: 'Moyen', youtubeId: 'eGo4IYlbE5g' },
  { id: 'pistol-squat', name: 'Pistol Squat', muscleGroup: 'jambes', difficulty: 'Difficile', youtubeId: 'vqMSNcFhKLY' },
  { id: 'handstand', name: 'Handstand Push-up', muscleGroup: 'epaules', difficulty: 'Difficile', youtubeId: 'sFhCYs1mKdI' },
  { id: 'pompes-clap', name: 'Pompes Clap', muscleGroup: 'pecs', difficulty: 'Difficile', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'planche-front', name: 'Front Lever', muscleGroup: 'dos', difficulty: 'Expert', youtubeId: 'rKUMaHUGjT8' },
  { id: 'l-sit', name: 'L-Sit', muscleGroup: 'abdominaux', difficulty: 'Moyen', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'glute-bridge', name: 'Pont fessier', muscleGroup: 'fessiers', difficulty: 'Facile', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'pike-pushup', name: 'Pike Push-up', muscleGroup: 'epaules', difficulty: 'Moyen', youtubeId: 'sFhCYs1mKdI' },
  { id: 'curl-biceps', name: 'Chin-up (Biceps)', muscleGroup: 'biceps', difficulty: 'Moyen', youtubeId: 'eGo4IYlbE5g' },
  { id: 'squats', name: 'Squats', muscleGroup: 'jambes', difficulty: 'Facile', youtubeId: 'vqMSNcFhKLY' },
]

const DIFFICULTY_COLORS = {
  Facile: 'bg-green-500/20 text-green-400',
  Moyen: 'bg-yellow-500/20 text-yellow-400',
  Difficile: 'bg-orange-500/20 text-orange-400',
  Expert: 'bg-red-500/20 text-red-400',
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function Calisthenics({ isPremium, onShowPaywall }) {
  const { sessions, addSession, exercises: storeExercises } = useStore()
  const exercises = storeExercises?.length ? storeExercises : DEFAULT_EXERCISES

  const [activeGroup, setActiveGroup] = useState('all')
  const [videoExercise, setVideoExercise] = useState(null)
  const [settingsExercise, setSettingsExercise] = useState(null)
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionExercise, setSessionExercise] = useState(null)
  const [sessionTimer, setSessionTimer] = useState(0)
  const [sessionSets, setSessionSets] = useState([])
  const [repsInput, setRepsInput] = useState('')
  const [weightInput, setWeightInput] = useState('')
  const timerRef = useRef(null)

  const filtered = activeGroup === 'all'
    ? exercises
    : exercises.filter((e) => e.muscleGroup === activeGroup)

  const FREE_EXERCISE_LIMIT = 20
  const visibleExercises = isPremium ? filtered : filtered.slice(0, FREE_EXERCISE_LIMIT)
  const lockedExercises = isPremium ? [] : filtered.slice(FREE_EXERCISE_LIMIT)

  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => {
        setSessionTimer((t) => t + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [sessionActive])

  const startSession = useCallback((exercise) => {
    setSessionActive(true)
    setSessionExercise(exercise)
    setSessionTimer(0)
    setSessionSets([])
    setRepsInput('')
    setWeightInput('')
  }, [])

  const endSession = useCallback(() => {
    if (sessionExercise) {
      addSession({
        id: Date.now().toString(),
        exerciseId: sessionExercise.id,
        exerciseName: sessionExercise.name,
        muscleGroup: sessionExercise.muscleGroup,
        date: new Date().toISOString().slice(0, 10),
        duration: Math.floor(sessionTimer / 60),
        sets: sessionSets,
        calories: Math.round(sessionTimer * 0.15),
      })
    }
    setSessionActive(false)
    setSessionExercise(null)
    setSessionTimer(0)
    setSessionSets([])
  }, [sessionExercise, sessionTimer, sessionSets, addSession])

  const addSet = () => {
    const reps = parseInt(repsInput, 10)
    if (!reps || reps <= 0) return
    setSessionSets((prev) => [
      ...prev,
      { reps, weight: parseFloat(weightInput) || 0 },
    ])
    setRepsInput('')
    setWeightInput('')
  }

  return (
    <div className="space-y-4 p-4">
      {/* Session active banner */}
      {sessionActive && (
        <GlassCard className="p-4 border border-mint-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-mint-400 animate-pulse" />
              <span className="text-white font-bold text-sm">Session active</span>
            </div>
            <span className="text-white/60 text-xs">{sessionExercise?.name}</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <Clock size={14} className="text-mint-400 mx-auto mb-1" />
              <p className="text-white text-2xl font-mono font-bold">{formatDuration(sessionTimer)}</p>
            </div>
            <div className="text-center">
              <Flame size={14} className="text-orange-400 mx-auto mb-1" />
              <p className="text-white text-2xl font-bold">{sessionSets.length}</p>
              <p className="text-white/40 text-[10px]">séries</p>
            </div>
          </div>

          {/* Set input */}
          <div className="flex gap-2">
            <input
              type="number"
              value={repsInput}
              onChange={(e) => setRepsInput(e.target.value)}
              placeholder="Reps"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-mint-400/50 text-center"
              onKeyDown={(e) => e.key === 'Enter' && addSet()}
            />
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="Poids (kg)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-mint-400/50 text-center"
              onKeyDown={(e) => e.key === 'Enter' && addSet()}
            />
            <button
              onClick={addSet}
              className="bg-mint-500 hover:bg-mint-400 text-black rounded-xl px-4 font-bold text-sm transition-all"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Sets list */}
          {sessionSets.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {sessionSets.map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-1.5 text-xs">
                  <span className="text-white/50">Série {i + 1}</span>
                  <span className="text-white">{s.reps} reps {s.weight ? `× ${s.weight}kg` : ''}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={endSession}
            className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Square size={14} /> Terminer la séance
          </button>
        </GlassCard>
      )}

      {/* Muscle group tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {MUSCLE_GROUPS.map((group) => (
          <button
            key={group.id}
            onClick={() => setActiveGroup(group.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeGroup === group.id
                ? 'bg-mint-500 text-black'
                : 'bg-white/5 text-white/50 border border-white/10'
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="space-y-2">
        {visibleExercises.map((exercise) => (
          <GlassCard key={exercise.id} className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-white font-medium text-sm">{exercise.name}</h3>
                <p className="text-white/40 text-xs">
                  {MUSCLE_GROUPS.find((g) => g.id === exercise.muscleGroup)?.label || exercise.muscleGroup}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${DIFFICULTY_COLORS[exercise.difficulty] || 'bg-white/10 text-white/50'}`}>
                {exercise.difficulty}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setVideoExercise(videoExercise === exercise.id ? null : exercise.id)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-xl py-2 text-xs font-medium transition-all"
              >
                {videoExercise === exercise.id ? 'Fermer vidéo' : 'Voir vidéo'}
              </button>
              <button
                onClick={() => setSettingsExercise(exercise.id)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-xl px-3 py-2 transition-all"
              >
                <Settings size={14} />
              </button>
              {!sessionActive && (
                <button
                  onClick={() => startSession(exercise)}
                  className="bg-mint-500 hover:bg-mint-400 text-black rounded-xl px-4 py-2 transition-all flex items-center gap-1"
                >
                  <Play size={14} /> Start
                </button>
              )}
            </div>

            {/* Video embed */}
            {videoExercise === exercise.id && exercise.youtubeId && (
              <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${exercise.youtubeId}?rel=0`}
                  title={exercise.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      {/* Premium exercises locked */}
      {lockedExercises.length > 0 && (
        <button
          onClick={onShowPaywall}
          className="w-full py-6 rounded-2xl glass border border-dashed border-amber-500/30 flex flex-col items-center gap-2 hover:bg-white/5 transition-colors"
        >
          <Dumbbell size={24} className="text-amber-400/50" />
          <span className="text-xs text-white/40">
            +{lockedExercises.length} exercices verrouillés
          </span>
          <span className="text-[10px] text-amber-400 font-medium">
            Débloquer avec Premium
          </span>
        </button>
      )}

      {/* Machine Settings modal */}
      {settingsExercise && (
        <MachineSettings
          exerciseId={settingsExercise}
          onChange={() => setSettingsExercise(null)}
        />
      )}
    </div>
  )
}
