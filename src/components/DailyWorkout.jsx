import { useState, useEffect } from 'react'
import { Sparkles, Play, RefreshCw, Clock, Flame, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'

export default function DailyWorkout() {
  const { generateDailyWorkout, dailyWorkout, setCurrentView, profile } = useStore()
  const [workout, setWorkout] = useState(null)

  useEffect(() => {
    const w = generateDailyWorkout()
    setWorkout(w)
  }, [])

  if (!workout || workout.exercises.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-lime/10 to-lime/5 rounded-2xl p-4 border border-lime/20">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-lime" />
        <h3 className="text-lime font-bold text-sm">Workout du Jour</h3>
        <button
          onClick={() => { const w = generateDailyWorkout(); setWorkout({ ...w }) }}
          className="ml-auto p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <RefreshCw size={14} className="text-muted" />
        </button>
      </div>

      <p className="text-white/60 text-xs mb-3 capitalize">{workout.name}</p>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            {workout.targetMuscles.map(m => (
              <span key={m} className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white/70 font-medium">
                {m.slice(0, 3)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted text-[10px]">
          <Clock size={10} />
          <span>~{workout.estimatedDuration}min</span>
        </div>
        <div className="flex items-center gap-1 text-muted text-[10px]">
          <Flame size={10} />
          <span>~{workout.estimatedCalories}kcal</span>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {workout.exercises.map((ex, i) => (
          <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
            <div className="w-5 h-5 rounded bg-lime/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lime text-[10px] font-bold">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{ex.name}</p>
              <p className="text-white/40 text-[10px]">{ex.sets}×{ex.reps} · {ex.muscleGroup}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setCurrentView('session')}
        className="w-full bg-lime text-dark-bg font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        <Play size={16} fill="currentColor" />
        Commencer
      </button>
    </div>
  )
}
