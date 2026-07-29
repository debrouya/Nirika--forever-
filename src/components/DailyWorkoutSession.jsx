import { useState, useCallback } from 'react'
import { ChevronLeft, CheckCircle, Sparkles } from 'lucide-react'
import useStore from '../store/useStore'
import ExerciseTracker from './ExerciseTracker'

export default function DailyWorkoutSession() {
  const { pendingDailyWorkout, clearPendingDailyWorkout, exerciseHistory, setCurrentView } = useStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completed, setCompleted] = useState(false)

  const exercises = pendingDailyWorkout?.exercises || []

  const handleComplete = useCallback(() => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setCompleted(true)
    }
  }, [currentIndex, exercises.length])

  if (completed || exercises.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <div className="text-center pt-10 space-y-3">
          <div className="w-16 h-16 rounded-full bg-lime/20 flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-lime" />
          </div>
          <h2 className="text-white font-bold text-lg">Séance terminée !</h2>
          <p className="text-muted text-sm">{exercises.length} exercice{exercises.length > 1 ? 's' : ''} complété{exercises.length > 1 ? 's' : ''}</p>
          <button
            onClick={() => { clearPendingDailyWorkout(); setCurrentView('dashboard') }}
            className="mt-4 px-6 py-2.5 rounded-xl bg-lime text-dark-bg font-bold text-sm"
          >
            Terminer
          </button>
        </div>
      </div>
    )
  }

  const current = exercises[currentIndex]
  const lastRecord = current ? (exerciseHistory[current.id] || []).slice(-1)[0] : null

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-3">
        <button onClick={() => { clearPendingDailyWorkout(); setCurrentView('dashboard') }} className="p-1">
          <ChevronLeft size={20} className="text-muted" />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-sm">Suggestion du Jour</h1>
          <p className="text-muted text-[10px]">{currentIndex + 1}/{exercises.length} · {current?.muscleGroup}</p>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles size={12} className="text-lime" />
          <span className="text-lime text-xs font-medium">{Math.round((currentIndex / exercises.length) * 100)}%</span>
        </div>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-lime rounded-full transition-all" style={{ width: `${(currentIndex / exercises.length) * 100}%` }} />
      </div>
      {current && (
        <ExerciseTracker
          key={current.id + currentIndex}
          exercise={current}
          sessionHistory={lastRecord ? [lastRecord] : []}
          onComplete={handleComplete}
        />
      )}
    </div>
  )
}
