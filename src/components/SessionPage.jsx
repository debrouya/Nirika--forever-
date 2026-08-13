import { useMemo } from 'react'
import {
  Play,
  RotateCcw,
  Dumbbell,
  Activity,
  Zap,
  ChevronRight,
  Clock,
  Flame,
  Calendar,
} from 'lucide-react'
import GlassBackground from '../design-system/components/GlassBackground'
import useStore from '../store/useStore'
import SessionNotes from './SessionNotes'
import ExerciseTracker from './ExerciseTracker'
import CardioTimer from './CardioTimer'
import PersonalRecords from './PersonalRecords'

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 60) {
    const h = Math.floor(m / 60)
    return `${h}h${(m % 60).toString().padStart(2, '0')}`
  }
  return `${m}min${s.toString().padStart(2, '0')}`
}

function getTypeIcon(type) {
  switch (type) {
    case 'programme': return Dumbbell
    case 'cardio': return Activity
    case 'exercise': return Zap
    case 'calisthenie30': return Dumbbell
    default: return Dumbbell
  }
}

function getTypeLabel(type) {
  switch (type) {
    case 'programme': return 'Programme'
    case 'cardio': return 'Cardio'
    case 'exercise': return 'Exercice'
    case 'calisthenie30': return 'Calisthenie 30J'
    default: return 'Séance'
  }
}

export default function SessionPage() {
  const { workoutHistory, setCurrentView, getPersonalRecords, activeSession, endSession } = useStore()

  const lastWorkout = useMemo(() => {
    if (workoutHistory.length === 0) return null
    return workoutHistory[workoutHistory.length - 1]
  }, [workoutHistory])

  const hasActiveSession = activeSession && activeSession.startedAt
  const records = useMemo(() => getPersonalRecords(), [getPersonalRecords])
  const hasRecords = Object.keys(records).length > 0

  if (hasActiveSession) {
    if (activeSession.sessionType === 'cardio') {
      return <CardioTimer onComplete={() => { endSession(); setCurrentView('dashboard') }} />
    }
    const ex = useStore.getState().getAllExercises?.()?.find(e => e.id === activeSession.exerciseId)
    const currentExercise = ex || { id: activeSession.exerciseId, name: activeSession.exerciseName, muscleGroup: 'Autre', equipment: 'none' }
    const lastSessionHistory = useStore.getState().getExerciseHistory(currentExercise.id)?.slice(-1) || []
    return (
      <ExerciseTracker
        exercise={currentExercise}
        sessionHistory={lastSessionHistory}
        onComplete={() => { endSession(); setCurrentView('dashboard') }}
      />
    )
  }

  return (
    <GlassBackground>
    <div className="nirika-page space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-white font-bold text-2xl">Ma Séance</h1>
        <p className="text-muted text-sm">Choisis ton prochain mouvement</p>
      </div>

      {/* 1. Séance en cours */}
      {hasActiveSession && (
        <button
          onClick={() => setCurrentView('programme')}
          className="w-full bg-dark-card rounded-2xl p-5 border border-lime/30 text-left active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-lime/15 flex items-center justify-center shrink-0">
              <Play size={24} className="text-lime ml-0.5" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lime text-xs font-bold uppercase tracking-wide mb-0.5">Séance en cours</p>
              <p className="text-white font-semibold text-sm truncate">
                {activeSession.exerciseName || activeSession.programName || 'Séance active'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={12} className="text-muted" />
                <span className="text-muted text-xs">
                  {formatDuration(Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000))}
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-lime shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      )}

      {/* 2. Dernière séance */}
      {lastWorkout && (
        <button
          onClick={() => {
            if (lastWorkout.type === 'programme') setCurrentView('programme')
            else if (lastWorkout.type === 'cardio') setCurrentView('cardio')
            else if (lastWorkout.type === 'calisthenie30') setCurrentView('programme')
            else setCurrentView('calisthenics')
          }}
          className="w-full bg-dark-card rounded-2xl p-5 border border-dark-border text-left active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
              {(() => {
                const TypeIcon = getTypeIcon(lastWorkout.type)
                return <TypeIcon size={24} className="text-muted" />
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-muted text-xs font-bold uppercase tracking-wide mb-0.5">Dernière séance</p>
              <p className="text-white font-semibold text-sm truncate">
                {lastWorkout.programName || lastWorkout.activityName || lastWorkout.exerciseName || getTypeLabel(lastWorkout.type)}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-muted text-xs flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(lastWorkout.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
                {lastWorkout.durationMinutes && (
                  <span className="text-muted text-xs flex items-center gap-1">
                    <Clock size={10} />
                    {lastWorkout.durationMinutes}min
                  </span>
                )}
                {lastWorkout.calories && (
                  <span className="text-muted text-xs flex items-center gap-1">
                    <Flame size={10} />
                    {lastWorkout.calories}kcal
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <RotateCcw size={16} className="text-muted group-hover:text-white transition-colors" />
              <ChevronRight size={20} className="text-muted group-hover:text-white transition-colors group-hover:translate-x-1" />
            </div>
          </div>
        </button>
      )}

      {/* 3. Nouvelle séance */}
      <div>
        <p className="text-white font-semibold text-sm mb-3 mt-2">Nouvelle séance</p>
        <div className="space-y-2">
          <button
            onClick={() => setCurrentView('programme')}
            className="w-full bg-dark-card rounded-2xl p-4 border border-dark-border text-left active:scale-[0.98] transition-all hover:border-lime/30 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center shrink-0">
                <Dumbbell size={22} className="text-lime" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Programme</p>
                <p className="text-muted text-xs">PPL, Upper/Lower, Calisthenie...</p>
              </div>
              <ChevronRight size={18} className="text-muted group-hover:text-lime transition-colors" />
            </div>
          </button>

          <button
            onClick={() => setCurrentView('calisthenics')}
            className="w-full bg-dark-card rounded-2xl p-4 border border-dark-border text-left active:scale-[0.98] transition-all hover:border-lime/30 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Zap size={22} className="text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Exercice rapide</p>
                <p className="text-muted text-xs">81 exercices au choix</p>
              </div>
              <ChevronRight size={18} className="text-muted group-hover:text-orange-400 transition-colors" />
            </div>
          </button>

          <button
            onClick={() => setCurrentView('cardio')}
            className="w-full bg-dark-card rounded-2xl p-4 border border-dark-border text-left active:scale-[0.98] transition-all hover:border-lime/30 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Activity size={22} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Cardio</p>
                <p className="text-muted text-xs">Vélo, course, rameur...</p>
              </div>
              <ChevronRight size={18} className="text-muted group-hover:text-blue-400 transition-colors" />
            </div>
          </button>
        </div>
      </div>
      {hasRecords && <PersonalRecords compact />}
      {/* Session Note (for last workout) */}
      {lastWorkout && (
        <SessionNotes sessionId={lastWorkout.id} />
      )}
    </div>
    </GlassBackground>
  )
}
