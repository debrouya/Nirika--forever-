import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Play,
} from 'lucide-react'
import useStore from '../store/useStore'
import useExercises from '../hooks/useExercises'

const WORKOUT_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop'

const SAMPLE_EXERCISES = [
  { exerciseId: 'developed_plat', sets: 4, reps: '10-12' },
  { exerciseId: 'tirage_vertical', sets: 4, reps: '10-12' },
  { exerciseId: 'squat', sets: 4, reps: '8-10' },
  { exerciseId: 'press_epaules', sets: 3, reps: '10-12' },
  { exerciseId: 'curl_bicep', sets: 3, reps: '12-15' },
  { exerciseId: 'extension_tricep_cable', sets: 3, reps: '12-15' },
]

export default function WorkoutDetail({ workout }) {
  const { setCurrentView } = useStore()
  const exercises = useExercises()
  const [completed, setCompleted] = useState(new Set())

  const workoutExercises = SAMPLE_EXERCISES.map((item) => {
    const ex = exercises.find((e) => e.id === item.exerciseId)
    return { ...item, ...ex }
  })

  const toggleComplete = (id) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header Image */}
      <div className="relative h-64">
        <img
          src={WORKOUT_IMAGE}
          alt="Workout"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/40 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => setCurrentView('dashboard')}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>

        {/* Exercise Badge */}
        <div className="absolute top-4 right-4 bg-lime/20 px-3 py-1 rounded-full">
          <span className="text-lime text-xs font-medium">Exercise</span>
        </div>

        {/* Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-bold text-xl">Full Body Workout</h1>
            <span className="text-lime text-sm font-medium">Exercise</span>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="p-4 space-y-3">
        {workoutExercises.map((ex) => {
          const isDone = completed.has(ex.id)
          return (
            <div
              key={ex.id}
              onClick={() => toggleComplete(ex.id)}
              className={`bg-dark-card rounded-2xl p-3 flex items-center gap-3 transition-all ${
                isDone ? 'opacity-60' : ''
              }`}
            >
              {/* Checkbox */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDone ? 'bg-lime' : 'bg-dark-border'
              }`}>
                {isDone ? (
                  <CheckCircle2 size={20} className="text-dark-bg" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted" />
                )}
              </div>

              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-dark-border flex-shrink-0">
                {ex.youtubeId ? (
                  <img
                    src={`https://img.youtube.com/vi/${ex.youtubeId}/mqdefault.jpg`}
                    alt={ex.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">IMG</div>
                )}
              </div>

              {/* Name + Reps */}
              <div className="flex-1 min-w-0">
                <span className="text-white text-sm font-medium truncate block">{ex.name}</span>
                <span className="text-muted text-xs">Set {ex.sets} · {ex.reps} Reps</span>
              </div>

              {/* Play Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (ex.youtubeId) window.open(`https://www.youtube.com/watch?v=${ex.youtubeId}`, '_blank')
                }}
                className="w-10 h-10 rounded-full border-2 border-lime flex items-center justify-center flex-shrink-0"
              >
                <Play size={16} className="text-lime ml-0.5" fill="currentColor" />
              </button>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="p-4 sticky bottom-20">
        <button
          onClick={() => setCurrentView('calisthenics')}
          className="w-full py-4 rounded-2xl bg-lime text-dark-bg font-bold text-base hover:bg-lime-light transition-colors"
        >
          Start workout
        </button>
      </div>
    </div>
  )
}
