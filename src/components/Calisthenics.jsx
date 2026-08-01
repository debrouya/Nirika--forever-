import { useState } from 'react'
import {
  Play,
  Settings,
  Dumbbell,
  ChevronRight,
  Search,
} from 'lucide-react'
import useStore from '../store/useStore'
import useExercises from '../hooks/useExercises'
import WorkoutScreen from './WorkoutScreen'
import { useSessionCtx } from '../store/sessionContext'

const MUSCLE_GROUPS = [
  { id: 'all', label: 'Tout' },
  { id: 'Pectoraux', label: 'Pectoraux' },
  { id: 'Dos', label: 'Dos' },
  { id: 'Epaules', label: 'Épaules' },
  { id: 'Jambes', label: 'Jambes' },
  { id: 'Abdominaux', label: 'Abdos' },
  { id: 'Bras', label: 'Bras' },
  { id: 'Cardio', label: 'Cardio' },
]

const EQUIPMENT_ICONS = {
  barbell: '🏋️',
  dumbbell: '💪',
  machine: '⚙️',
  cable: '🔗',
  none: '🤸',
}

export default function Calisthenics({ isPremium, onShowPaywall }) {
  const { exerciseHistory } = useStore()
  const { startSession } = useSessionCtx()
  const [activeGroup, setActiveGroup] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const exercises = useExercises()

  const filtered = exercises.filter((e) => {
    const matchGroup = activeGroup === 'all' || e.muscleGroup === activeGroup
    const matchSearch = !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchGroup && matchSearch
  })

  const FREE_LIMIT = 20
  const visibleExercises = isPremium ? filtered : filtered.slice(0, FREE_LIMIT)
  const lockedCount = isPremium ? 0 : Math.max(0, filtered.length - FREE_LIMIT)

  const handleStartExercise = (ex) => {
    if (!isPremium && filtered.indexOf(ex) >= FREE_LIMIT) { onShowPaywall?.(); return }
    startSession(ex.id, ex.name)
    setSelectedExercise(ex)
  }

  if (selectedExercise) {
    return (
      <WorkoutScreen
        exercise={selectedExercise}
        onComplete={() => setSelectedExercise(null)}
      />
    )
  }

  return (
    <div data-onboard="exercices" className="space-y-4 p-4">
      {/* Title */}
      <h1 className="text-white font-bold text-2xl">Exercices</h1>

      {/* Search */}
      <div data-onboard="tutorials" className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Rechercher"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-dark-card text-white pl-10 pr-4 py-3 rounded-xl text-sm outline-none border border-dark-border placeholder:text-muted"
        />
      </div>

      {/* Muscle Group Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
        {MUSCLE_GROUPS.map((group) => (
          <button
            key={group.id}
            onClick={() => setActiveGroup(group.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeGroup === group.id
                ? 'bg-lime text-dark-bg'
                : 'bg-dark-card border border-dark-border text-muted'
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      {/* Exercise Count */}
      <p className="text-muted text-xs">
        {visibleExercises.length} exercice{visibleExercises.length !== 1 ? 's' : ''}
        {lockedCount > 0 && ` · +${lockedCount} Premium`}
      </p>

      {/* Exercise List */}
      <div className="space-y-3">
        {visibleExercises.map((exercise) => {
          const lastRecord = (exerciseHistory[exercise.id] || []).slice(-1)[0]

          return (
            <button
              key={exercise.id}
              onClick={() => handleStartExercise(exercise)}
              className="w-full bg-dark-card rounded-2xl p-4 text-left hover:bg-dark-card/80 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-dark-bg flex-shrink-0">
                  {exercise.youtubeId ? (
                    <img
                      src={`https://img.youtube.com/vi/${exercise.youtubeId}/mqdefault.jpg`}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      {EQUIPMENT_ICONS[exercise.equipment] || '🏋️'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">{exercise.name}</h3>
                  <p className="text-muted text-xs">
                    {exercise.muscleGroup} · {exercise.equipment}
                  </p>
                  {lastRecord && (
                    <p className="text-lime text-[10px] mt-0.5">
                      Dernière: {lastRecord.totalReps || lastRecord.sets?.length || 0} reps
                      {lastRecord.totalVolume ? ` · ${lastRecord.totalVolume}kg` : ''}
                    </p>
                  )}
                </div>

                {/* Play */}
                <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0">
                  <Play size={16} className="text-lime ml-0.5" fill="currentColor" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Premium Lock */}
      {lockedCount > 0 && (
        <button
          onClick={onShowPaywall}
          className="w-full py-6 rounded-2xl bg-dark-card border border-dashed border-lime/30 flex flex-col items-center gap-2"
        >
          <Dumbbell size={24} className="text-lime/50" />
          <span className="text-muted text-xs">+{lockedCount} exercices verrouillés</span>
          <span className="text-lime text-[10px] font-medium">Débloquer avec Premium</span>
        </button>
      )}
    </div>
  )
}
