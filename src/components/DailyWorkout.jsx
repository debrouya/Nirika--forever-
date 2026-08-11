import GlassBackground from '../design-system/components/GlassBackground'
import { useState, useEffect } from 'react'
import { Sparkles, Play, RefreshCw, Clock, Flame } from 'lucide-react'
import useStore from '../store/useStore'

export default function DailyWorkout() {
  const { generateDailyWorkout, setCurrentView, setPendingDailyWorkout } = useStore()
  const [workout, setWorkout] = useState(null)

  useEffect(() => {
    const w = generateDailyWorkout()
    setWorkout(w)
  }, [])

  if (!workout || workout.exercises.length === 0) return null

  const handleStart = () => {
    setPendingDailyWorkout(workout)
    setCurrentView('daily-workout')
  }

  return (
    <div className="bg-gradient-to-r from-lime/10 to-lime/5 rounded-2xl p-3.5 border border-lime/20">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={14} className="text-lime" />
        <h3 className="text-lime font-bold text-xs">Suggestion du Jour</h3>
        <button
          onClick={() => { const w = generateDailyWorkout(); setWorkout({ ...w }) }}
          className="ml-auto p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <RefreshCw size={12} className="text-muted" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex gap-1">
          {workout.targetMuscles.map(m => (
            <span key={m} className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white/70 font-medium">
              {m.slice(0, 3)}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-muted text-[10px]">
          <Clock size={10} />
          <span>~{workout.estimatedDuration}min</span>
        </div>
        <div className="flex items-center gap-1 text-muted text-[10px]">
          <Flame size={10} />
          <span>~{workout.estimatedCalories}kcal</span>
        </div>
        <span className="text-white/40 text-[10px] ml-auto">{workout.exercises.length} exos</span>
      </div>

      <div className="flex gap-1.5 mb-2 overflow-x-auto no-scrollbar">
        {workout.exercises.map((ex, i) => (
          <span key={i} className="text-[10px] text-white/60 bg-white/5 rounded-md px-2 py-1 whitespace-nowrap">
            {i + 1}. {ex.name}{ex.lastWeight > 0 && <span style={{color:'rgba(126,217,87,.5)',marginLeft:4}}>↑{ex.lastWeight}kg</span>}
          </span>
        ))}
      </div>

      <button
        onClick={handleStart}
        className="w-full bg-lime text-dark-bg font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
      >
        <Play size={12} fill="currentColor" />
        Commencer
      </button>
    </div>
  )
}
