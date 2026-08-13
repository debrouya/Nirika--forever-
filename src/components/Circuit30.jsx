import { useState, useCallback } from 'react'
import { ChevronLeft, CheckCircle } from 'lucide-react'
import useStore from '../store/useStore'
import ExerciseTracker from './ExerciseTracker'

export default function Circuit30({ day, exercises, onComplete }) {
  const { completeCalisthenie30Day } = useStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [done, setDone] = useState(false)

  const handleComplete = useCallback(() => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setDone(true)
    }
  }, [currentIndex, exercises.length])

  if (done) {
    return (
      <div className="nirika-page">
        <div className="text-center pt-16 space-y-3">
          <div className="w-16 h-16 rounded-full bg-lime/20 flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-lime" />
          </div>
          <h2 className="text-white font-bold text-lg">Jour {day} terminé !</h2>
          <p className="text-muted text-sm">{exercises.length} exercices complétés</p>
          <button
            onClick={() => { completeCalisthenie30Day(day, exercises); onComplete() }}
            className="mt-4 px-6 py-2.5 rounded-xl bg-lime text-dark-bg font-bold text-sm"
          >
            Terminer
          </button>
        </div>
      </div>
    )
  }

  const current = exercises[currentIndex]
  if (!current) return null

  const realEx = { id: current.id, name: current.name, muscleGroup: 'Autre', equipment: 'bodyweight', ...current }
  const lastRecord = (useStore.getState().getExerciseHistory?.(realEx.id) || []).slice(-1)[0]

  return (
    <div className="nirika-page">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onComplete} className="p-1">
          <ChevronLeft size={20} className="text-muted" />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-sm">Jour {day}</h1>
          <p className="text-muted text-[10px]">{currentIndex + 1}/{exercises.length} · {current.muscleGroup || 'Calisthenie'}</p>
        </div>
        <span className="text-lime text-xs font-medium">
          {Math.round((currentIndex / exercises.length) * 100)}%
        </span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-lime rounded-full transition-all" style={{ width: `${(currentIndex / exercises.length) * 100}%` }} />
      </div>
      <ExerciseTracker
        key={current.id + '-' + currentIndex}
        exercise={realEx}
        sessionHistory={lastRecord ? [lastRecord] : []}
        onComplete={handleComplete}
      />
    </div>
  )
}