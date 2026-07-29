import { useState, useEffect, useCallback, useRef } from 'react'
import {
  CalendarRange,
  Clock,
  Dumbbell,
  Target,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Zap,
  Flame,
  Play,
  Square,
  CheckCircle2,
  Bell,
  RotateCcw,
  Trophy,
  Timer,
  ArrowRight,
  SkipForward,
  TrendingUp,
} from 'lucide-react'
import { programs } from '../data/programs'
import { getUserProgram, upsertUserProgram, deleteUserProgram } from '../services/supabaseService'
import { useNotifications } from '../hooks/useNotifications'
import useExercises from '../hooks/useExercises'
import ExerciseTracker from './ExerciseTracker'
import CalisthenicsTracker from './CalisthenicsTracker'
import useStore from '../store/useStore'

const levelColors = {
  debutant: 'text-lime bg-lime/10',
  intermediaire: 'text-amber-400 bg-amber-400/10',
  avance: 'text-red-400 bg-red-400/10',
}

const levelLabels = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
}

const PROGRAM_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=250&fit=crop',
]

const PROGRAM_STATE_KEY = 'nirika_active_program'

function saveProgramState(state) {
  try { localStorage.setItem(PROGRAM_STATE_KEY, JSON.stringify(state)) } catch {}
}

function loadProgramState() {
  try {
    const saved = localStorage.getItem(PROGRAM_STATE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function Programme({ user, isPremium }) {
  const { sessionHistory, addExerciseRecord, getExerciseHistory, calisthenie30, addWorkout } = useStore()
  const savedState = useRef(loadProgramState())
  const [view, setView] = useState('list')
  const [expandedId, setExpandedId] = useState(null)
  const [activeProgram, setActiveProgram] = useState(null)
  const [completedDays, setCompletedDays] = useState({})
  const [selectedDay, setSelectedDay] = useState(null)
  const [trackingExercise, setTrackingExercise] = useState(null)
  const [trackingDayKey, setTrackingDayKey] = useState(null)
  const [completedExercises, setCompletedExercises] = useState({})
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(null)
  const { permission, requestPermission } = useNotifications(user?.id)
  const exercises = useExercises()
  const exerciseMap = Object.fromEntries(exercises.map(e => [e.id, e]))

  const loadActiveProgram = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    try {
      const { data } = await getUserProgram(user.id)
      if (data) {
        setActiveProgram(data)
        setCompletedDays(data.completed_days || {})
        setCompletedExercises(data.completed_exercises || {})
        setView('active')
      }
    } catch {}
    setLoading(false)
  }, [user?.id])

  useEffect(() => { loadActiveProgram() }, [loadActiveProgram])

  useEffect(() => {
    if (activeProgram) {
      saveProgramState({ view, activeProgram, completedDays, selectedDay })
    }
  }, [view, activeProgram, completedDays, selectedDay])

  const startProgram = async (program) => {
    if (!user?.id) return
    setStarting(program.id)
    const data = {
      program_id: program.id,
      program_name: program.name,
      current_week: 1,
      current_day: Object.keys(program.structure)[0] || '',
      started_at: new Date().toISOString(),
      completed_days: {},
      completed_exercises: {},
    }
    try {
      await upsertUserProgram(user.id, data)
      setActiveProgram({ ...data, user_id: user.id })
      setCompletedDays({})
      setCompletedExercises({})
      setView('active')
    } catch {}
    setStarting(null)
  }

  const stopProgram = async () => {
    if (!user?.id) return
    try {
      await deleteUserProgram(user.id)
      setActiveProgram(null)
      setCompletedDays({})
      setCompletedExercises({})
      setView('list')
    } catch {}
  }

  const saveProgress = async (newCompleted, newExercises) => {
    if (user?.id && activeProgram) {
      try {
        await upsertUserProgram(user.id, {
          ...activeProgram,
          completed_days: newCompleted,
          completed_exercises: newExercises,
        })
      } catch {}
    }
  }

  const toggleExerciseComplete = (dayKey, exerciseId) => {
    const exKey = `${dayKey}__${exerciseId}`
    const newExercises = { ...completedExercises }
    const isCompleting = !newExercises[exKey]

    if (newExercises[exKey]) {
      delete newExercises[exKey]
    } else {
      newExercises[exKey] = { completedAt: new Date().toISOString() }

      // Save individual exercise to exerciseHistory
      const ex = exercises.find(e => e.id === exerciseId)
      if (ex) {
        addExerciseRecord(exerciseId, {
          exerciseName: ex.name,
          sets: 1,
          reps: 1,
          duration: 0,
          totalVolume: 0,
          source: 'programme',
          day: dayKey,
          programId: activeProgram?.program_id,
        })
      }
    }
    setCompletedExercises(newExercises)

    // Check if all exercises in day are done → auto-complete day
    if (activeProgram) {
      const program = programs.find(p => p.id === activeProgram.program_id)
      if (program) {
        const dayExercises = program.structure[dayKey.replace(`${activeProgram.program_id}_`, '')] || []
        const allDone = dayExercises.every(ex => newExercises[`${dayKey}__${ex.exerciseId}`])
        if (allDone && dayExercises.length > 0) {
          const newCompleted = {
            ...completedDays,
            [dayKey]: {
              completedAt: new Date().toISOString(),
              exercises: dayExercises.map(ex => ex.exerciseId),
            },
          }
          setCompletedDays(newCompleted)
          saveProgress(newCompleted, newExercises)
          return
        }
      }
    }
    saveProgress(completedDays, newExercises)
  }

  const toggleDayComplete = (dayKey) => {
    const newCompleted = { ...completedDays }
    if (newCompleted[dayKey]) {
      delete newCompleted[dayKey]
      // Also un-mark all exercises in this day
      const program = programs.find(p => p.id === activeProgram?.program_id)
      const dayName = dayKey.replace(`${activeProgram?.program_id}_`, '')
      const newExercises = { ...completedExercises }
      program?.structure[dayName]?.forEach(ex => {
        delete newExercises[`${dayKey}__${ex.exerciseId}`]
      })
      setCompletedExercises(newExercises)
      saveProgress(newCompleted, newExercises)
    } else {
      const program = programs.find(p => p.id === activeProgram?.program_id)
      const dayName = dayKey.replace(`${activeProgram?.program_id}_`, '')
      const dayExercises = program?.structure[dayName] || []
      newCompleted[dayKey] = {
        completedAt: new Date().toISOString(),
        exercises: dayExercises.map(ex => ex.exerciseId),
      }
      // Also mark all exercises as done
      const newExercises = { ...completedExercises }
      dayExercises.forEach(ex => {
        newExercises[`${dayKey}__${ex.exerciseId}`] = { completedAt: new Date().toISOString() }
        // Save each exercise to exerciseHistory
        const exData = exercises.find(e => e.id === ex.exerciseId)
        if (exData) {
          addExerciseRecord(ex.exerciseId, {
            exerciseName: exData.name,
            sets: ex.sets || 1,
            reps: 1,
            duration: 0,
            totalVolume: 0,
            source: 'programme',
            day: dayKey,
            programId: activeProgram?.program_id,
          })
        }
      })
      setCompletedExercises(newExercises)

      // Save day to workoutHistory for Stats/Calendar
      addWorkout({
        type: 'programme',
        programId: activeProgram?.program_id,
        programName: program?.name || 'Programme',
        day: dayName,
        exerciseCount: dayExercises.length,
        completedExercises: dayExercises.map(ex => ex.exerciseId),
      })

      saveProgress(newCompleted, newExercises)
      return
    }
    setCompletedDays(newCompleted)
    saveProgress(newCompleted, completedExercises)
  }

  const handleExerciseComplete = (record) => {
    if (trackingExercise && trackingDayKey) {
      toggleExerciseComplete(trackingDayKey, trackingExercise.id)
      addExerciseRecord(trackingExercise.id, {
        ...record,
        exerciseName: trackingExercise.name,
        muscleGroup: trackingExercise.muscleGroup,
      })
    }
    setTrackingExercise(null)
    setTrackingDayKey(null)
  }

  const getProgress = () => {
    if (!activeProgram) return null
    const program = programs.find(p => p.id === activeProgram.program_id)
    if (!program) return null
    const start = new Date(activeProgram.started_at)
    const now = new Date()
    const totalDays = program.durationWeeks * 7
    const elapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24))
    const week = Math.min(Math.floor(elapsed / 7) + 1, program.durationWeeks)
    const progress = Math.min(Math.round((elapsed / totalDays) * 100), 100)
    const totalWorkouts = program.daysPerWeek * program.durationWeeks
    const completedCount = Object.keys(completedDays).length
    const totalExercisesCount = Object.values(program.structure).flat().length
    const completedExercisesCount = Object.keys(completedExercises).length
    return { program, week, progress, totalWeeks: program.durationWeeks, totalWorkouts, completedCount, totalExercisesCount, completedExercisesCount }
  }

  const progress = getProgress()

  // TRACKING VIEW
  if (trackingExercise) {
    const lastRecord = getExerciseHistory(trackingExercise.id).slice(-1)[0]
    return (
      <ExerciseTracker
        exercise={trackingExercise}
        sessionHistory={lastRecord ? [lastRecord] : []}
        onComplete={handleExerciseComplete}
      />
    )
  }

  // ACTIVE PROGRAM VIEW
  if (view === 'active' && activeProgram && progress) {
    const program = progress.program
    const days = Object.keys(program.structure)

    return (
      <div className="space-y-5 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setView('list')} className="p-1">
            <ChevronLeft size={20} className="text-muted" />
          </button>
          <h1 className="text-white font-bold text-lg">Programme actif</h1>
          <div className="w-8" />
        </div>

        {/* Progress Card */}
        <div className="bg-dark-card rounded-2xl p-5 border border-dark-border">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={18} className="text-lime" />
            <span className="text-white font-semibold text-sm">{program.name}</span>
          </div>

          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <p className="text-white text-2xl font-bold">{progress.week}</p>
              <p className="text-muted text-[10px]">Semaine</p>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-bold">{progress.completedCount}</p>
              <p className="text-muted text-[10px]">Jours faits</p>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-bold">{progress.completedExercisesCount}/{progress.totalExercisesCount}</p>
              <p className="text-muted text-[10px]">Exercices</p>
            </div>
            <div className="text-center">
              <p className="text-lime text-2xl font-bold">{progress.progress}%</p>
              <p className="text-muted text-[10px]">Avancement</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="w-full h-2.5 bg-dark-bg rounded-full overflow-hidden">
              <div className="h-full bg-lime rounded-full transition-all duration-500" style={{ width: `${progress.progress}%` }} />
            </div>
            <div className="w-full h-1.5 bg-dark-bg rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${progress.totalExercisesCount > 0 ? (progress.completedExercisesCount / progress.totalExercisesCount) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-muted text-[9px]">Temps {progress.progress}%</span>
            <span className="text-blue-400 text-[9px]">Exercices {progress.totalExercisesCount > 0 ? Math.round((progress.completedExercisesCount / progress.totalExercisesCount) * 100) : 0}%</span>
          </div>
        </div>

        {/* Day Selector */}
        <div>
          <h2 className="text-white font-semibold text-sm mb-3">Jours du programme</h2>
          <div className="space-y-2">
            {days.map((day, i) => {
              const dayKey = `${activeProgram.program_id}_${day}`
              const isCompleted = !!completedDays[dayKey]
              const isToday = i === (new Date().getDay() - 1 + 7) % 7
              const dayExercises = program.structure[day]
              const dayExCompleted = dayExercises?.filter(ex => completedExercises[`${dayKey}__${ex.exerciseId}`])?.length || 0
              const dayExTotal = dayExercises?.length || 0
              const dayProgress = dayExTotal > 0 ? (dayExCompleted / dayExTotal) * 100 : 0

              return (
                <div key={day} className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border">
                  <button
                    onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                    className="w-full p-4 flex items-center gap-3 text-left"
                  >
                    {/* Checkbox */}
                    <div
                      onClick={(e) => { e.stopPropagation(); toggleDayComplete(dayKey) }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isCompleted ? 'bg-lime' : dayExCompleted > 0 ? 'bg-blue-400/20 border border-blue-400/30' : 'bg-dark-bg border border-dark-border'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={18} className="text-dark-bg" />
                      ) : dayExCompleted > 0 ? (
                        <span className="text-blue-400 text-[10px] font-bold">{dayExCompleted}/{dayExTotal}</span>
                      ) : (
                        <span className="text-muted text-xs font-medium">{i + 1}</span>
                      )}
                    </div>

                    {/* Day Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isCompleted ? 'text-lime' : 'text-white'}`}>
                          {day}
                        </span>
                        {isToday && !isCompleted && (
                          <span className="px-1.5 py-0.5 bg-lime/20 text-lime text-[9px] font-medium rounded-full">
                            Aujourd'hui
                          </span>
                        )}
                      </div>
                      <p className="text-muted text-xs">
                        {dayExCompleted}/{dayExTotal} exercices
                      </p>
                      {/* Mini progress bar */}
                      {dayExCompleted > 0 && !isCompleted && (
                        <div className="w-full h-1 bg-dark-bg rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${dayProgress}%` }} />
                        </div>
                      )}
                    </div>

                    <ChevronRight size={16} className={`text-muted transition-transform ${selectedDay === day ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Expanded Day */}
                  {selectedDay === day && (
                    <div className="px-4 pb-4 border-t border-dark-border pt-3 animate-fade-in">
                      <div className="space-y-2">
                        {dayExercises?.map((item, i) => {
                          const exo = exerciseMap[item.exerciseId]
                          const exKey = `${dayKey}__${item.exerciseId}`
                          const isExDone = !!completedExercises[exKey]
                          const lastRec = getExerciseHistory(item.exerciseId).slice(-1)[0]

                          return (
                            <div key={i} className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                              isExDone ? 'bg-lime/5 border border-lime/20' : 'bg-dark-bg border border-dark-border'
                            }`}>
                              {/* Checkbox */}
                              <button
                                onClick={() => toggleExerciseComplete(dayKey, item.exerciseId)}
                                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                  isExDone ? 'bg-lime' : 'border border-dark-border hover:border-lime/30'
                                }`}
                              >
                                {isExDone && <CheckCircle2 size={14} className="text-dark-bg" />}
                              </button>

                              {/* Thumbnail */}
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-border flex-shrink-0">
                                {exo?.youtubeId ? (
                                  <img src={`https://img.youtube.com/vi/${exo.youtubeId}/mqdefault.jpg`} alt={exo.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">🏋️</div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium truncate ${isExDone ? 'text-lime' : 'text-white'}`}>
                                  {exo?.name || item.exerciseId}
                                </p>
                                <p className="text-muted text-[10px]">{item.sets} × {item.reps}</p>
                                {lastRec && (
                                  <p className="text-blue-400 text-[9px]">
                                    Dernier : {lastRec.totalVolume > 0 ? `${lastRec.totalVolume}kg` : `${lastRec.totalReps || 0} reps`}
                                  </p>
                                )}
                              </div>

                              {/* Action */}
                              {!isExDone ? (
                                <button
                                  onClick={() => {
                                    setTrackingExercise(exo || { id: item.exerciseId, name: item.exerciseId, muscleGroup: '—', equipment: '—', description: '' })
                                    setTrackingDayKey(dayKey)
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-lime/10 border border-lime/20 text-lime text-[10px] font-semibold flex items-center gap-1 flex-shrink-0"
                                >
                                  <Play size={10} fill="currentColor" />
                                  Démarrer
                                </button>
                              ) : (
                                <span className="px-2 py-1 rounded-lg bg-lime/10 text-lime text-[10px] font-medium flex-shrink-0">
                                  ✓ Fait
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Stop Button */}
        <button
          onClick={stopProgram}
          className="w-full py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Square size={16} />
          Arrêter ce programme
        </button>
      </div>
    )
  }

  // LIST VIEW
  return (
    <div data-onboard="programmes" className="space-y-5 p-4">
      <h1 className="text-white font-bold text-2xl">Programmes</h1>

      {/* Active Program Banner */}
      {activeProgram && progress && (
        <button
          onClick={() => setView('active')}
          className="w-full bg-dark-card rounded-2xl p-4 border border-lime/20 text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw size={16} className="text-lime" />
            <span className="text-white font-semibold text-sm">Reprendre mon programme</span>
          </div>
          <p className="text-muted text-xs mb-2">{progress.program.name} — Semaine {progress.week}/{progress.totalWeeks}</p>
          <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden">
            <div className="h-full bg-lime rounded-full" style={{ width: `${progress.progress}%` }} />
          </div>
        </button>
      )}

      {/* Notifications */}
      {permission !== 'granted' && (
        <button
          onClick={requestPermission}
          className="w-full bg-dark-card rounded-2xl p-3 flex items-center gap-3 text-left border border-dark-border"
        >
          <div className="w-8 h-8 rounded-lg bg-lime/10 flex items-center justify-center flex-shrink-0">
            <Bell size={14} className="text-lime" />
          </div>
          <div>
            <p className="text-white text-xs font-medium">Active les notifications</p>
            <p className="text-muted text-[10px]">Pour recevoir les rappels de tes programmes</p>
          </div>
        </button>
      )}

      {/* 30-Day Calisthenics Tracker */}
      <CalisthenicsTracker />

      {/* Program Cards */}
      <div className="space-y-4">
        {programs.map((program, i) => {
          const isExpanded = expandedId === program.id
          const days = Object.keys(program.structure)
          const totalExercises = Object.values(program.structure).flat().length
          const isActive = activeProgram?.program_id === program.id

          return (
            <div
              key={program.id}
              className={`bg-dark-card rounded-2xl overflow-hidden ${isActive ? 'border border-lime/30' : 'border border-dark-border'}`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : program.id)}
                className="w-full text-left"
              >
                <div className="relative h-36">
                  <img src={program.image || PROGRAM_IMAGES[i % PROGRAM_IMAGES.length]} alt={program.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${levelColors[program.level]}`}>
                      {levelLabels[program.level]}
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-dark-bg bg-lime">En cours</span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-base">{program.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-white/60 text-[10px] flex items-center gap-1"><Clock size={10} /> {program.durationWeeks} sem</span>
                      <span className="text-white/60 text-[10px] flex items-center gap-1"><CalendarRange size={10} /> {program.daysPerWeek}j/sem</span>
                      <span className="text-white/60 text-[10px] flex items-center gap-1"><Dumbbell size={10} /> {totalExercises} exos</span>
                    </div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 border-t border-dark-border animate-fade-in">
                  <p className="text-white/60 text-xs mb-3 leading-relaxed">{program.description}</p>
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {program.goals.map((goal) => (
                      <span key={goal} className="px-2 py-0.5 bg-dark-bg text-muted text-[10px] rounded-full capitalize">{goal}</span>
                    ))}
                  </div>
                  <div className="space-y-1.5 mb-4">
                    {days.map((day) => (
                      <div key={day} className="flex items-center justify-between bg-dark-bg rounded-xl px-3 py-2">
                        <span className="text-white text-xs font-medium">{day}</span>
                        <span className="text-muted text-[10px]">
                          {program.structure[day].length} exos · {program.structure[day].reduce((s, e) => s + e.sets, 0)} séries
                        </span>
                      </div>
                    ))}
                  </div>
                  {isActive ? (
                    <button onClick={() => setView('active')} className="w-full py-3 rounded-xl bg-lime text-dark-bg font-bold text-sm flex items-center justify-center gap-2">
                      <RotateCcw size={16} /> Reprendre
                    </button>
                  ) : activeProgram ? (
                    <p className="text-center text-muted text-xs py-2">Tu as déjà un programme en cours</p>
                  ) : (
                    <button
                      onClick={() => startProgram(program)}
                      disabled={starting === program.id}
                      className="w-full py-3 rounded-xl bg-lime text-dark-bg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {starting === program.id ? <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" /> : <Play size={16} fill="currentColor" />}
                      Commencer
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
