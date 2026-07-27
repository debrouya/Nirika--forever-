import { useState, useMemo, useCallback } from 'react'
import {
  Bot,
  Dumbbell,
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  RotateCcw,
  Target,
  Zap,
  Clock,
  Trophy,
  TrendingUp,
  Info,
} from 'lucide-react'
import exercises from '../data/exercises'
import useStore from '../store/useStore'
import GlassCard from './GlassCard'

const MUSCLE_GROUPS = {
  Pectoraux: { icon: '🏋️', exercises: [] },
  Dos: { icon: '💪', exercises: [] },
  Epaules: { icon: '🤸', exercises: [] },
  Jambes: { icon: '🦵', exercises: [] },
  Abdominaux: { icon: '🔥', exercises: [] },
  Bras: { icon: '💪', exercises: [] },
}

exercises.forEach((ex) => {
  if (MUSCLE_GROUPS[ex.muscleGroup]) {
    MUSCLE_GROUPS[ex.muscleGroup].exercises.push(ex)
  }
})

const INJURY_EXCLUSION_MAP = {
  genou: ['squat', 'fentes', 'leg_press', 'hack_squat', 'sissy_squat'],
  epaule: ['developed_plat', 'developed_incline', 'press_epaules', 'pull_up', 'chin_up', 'dip_pec'],
  dos: ['rowing_barre', 'rowing_haltere', 'squat', 'dead_lift'],
  coude: ['curl_bicep', 'curl_haltere', 'extension_tricep_cable', 'curl_marteau'],
  poignet: ['push_up', 'dips_tricep', 'developed_plat', 'pull_up'],
  lombaires: ['squat', 'rowing_barre', 'hip_thrust', 'hack_squat'],
}

function computeFitnessScore(profile, workoutHistory, sessionHistory) {
  let score = 30
  const totalSessions = (workoutHistory?.length || 0) + (sessionHistory?.length || 0)
  score += Math.min(25, totalSessions * 1.5)

  if (profile.level === 'intermediaire') score += 10
  else if (profile.level === 'avance') score += 15

  const recentSessions = [...(workoutHistory || []), ...(sessionHistory || [])].slice(-20)
  const uniqueDays = new Set(
    recentSessions.map((s) => {
      const d = new Date(s.completedAt || s.date || s.startedAt)
      return d.toISOString().slice(0, 10)
    })
  )
  score += Math.min(15, uniqueDays.size * 2)

  if (profile.frequency >= 4) score += 10
  else if (profile.frequency >= 3) score += 5

  if (profile.injuries && profile.injuries.length > 0) score -= profile.injuries.length * 3

  return Math.max(0, Math.min(100, Math.round(score)))
}

function getScoreColor(score) {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#3B82F6'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

function getScoreLabel(score) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Bon'
  if (score >= 40) return 'Moyen'
  return 'À améliorer'
}

function getExcludedExerciseIds(injuries) {
  if (!injuries || injuries.length === 0) return []
  const excluded = new Set()
  const injuryStr = Array.isArray(injuries) ? injuries.join(' ').toLowerCase() : injuries.toLowerCase()

  Object.entries(INJURY_EXCLUSION_MAP).forEach(([key, ids]) => {
    if (injuryStr.includes(key)) {
      ids.forEach((id) => excluded.add(id))
    }
  })

  return Array.from(excluded)
}

function generateWorkout(profile, excludedIds) {
  const { level, goals, frequency, injuries } = profile
  const goal = Array.isArray(goals) ? goals[0] : goals
  const availableMuscles = Object.keys(MUSCLE_GROUPS).filter((m) => MUSCLE_GROUPS[m].exercises.length > 0)

  const setsForLevel = level === 'debutant' ? 3 : level === 'intermediaire' ? 4 : 4
  const repsForGoal = goal === 'force' ? '5-8' : goal === 'endurance' ? '15-20' : '8-12'

  const split = []
  const days = Math.min(frequency || 3, 6)
  const musclesPerDay = Math.ceil(availableMuscles.length / Math.max(1, Math.floor(days / 2)))

  for (let dayIndex = 0; dayIndex < days; dayIndex++) {
    const dayMuscles = []
    const startIdx = (dayIndex * musclesPerDay) % availableMuscles.length
    for (let i = 0; i < musclesPerDay && i < availableMuscles.length; i++) {
      dayMuscles.push(availableMuscles[(startIdx + i) % availableMuscles.length])
    }

    const dayExercises = []
    dayMuscles.forEach((muscle) => {
      const pool = MUSCLE_GROUPS[muscle].exercises.filter((e) => !excludedIds.includes(e.id))
      const selected = pool.slice(0, muscle === 'Jambes' ? 3 : 2)
      selected.forEach((ex) => {
        dayExercises.push({
          ...ex,
          sets: setsForLevel,
          reps: repsForGoal,
          targetReps: parseInt(repsForGoal.split('-')[1] || repsForGoal.split('-')[0]) || 10,
        })
      })
    })

    const dayNames = ['Push', 'Pull', 'Legs', 'Full Body', 'Upper', 'Lower', 'Cardio']
    split.push({
      day: dayIndex + 1,
      name: dayNames[dayIndex % dayNames.length],
      exercises: dayExercises,
      totalSets: dayExercises.reduce((sum, e) => sum + e.sets, 0),
    })
  }

  return split
}

function ScoreRing({ score, size = 120 }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-[10px] text-white/40 uppercase">{getScoreLabel(score)}</span>
      </div>
    </div>
  )
}

export default function AICoach() {
  const { profile, workoutHistory, sessionHistory } = useStore()
  const [view, setView] = useState('main')
  const [generatedSplit, setGeneratedSplit] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  const fitnessScore = useMemo(
    () => computeFitnessScore(profile, workoutHistory, sessionHistory),
    [profile, workoutHistory, sessionHistory]
  )

  const excludedIds = useMemo(() => getExcludedExerciseIds(profile.injuries), [profile.injuries])
  const hasInjuries = excludedIds.length > 0

  const totalSessions = (workoutHistory?.length || 0) + (sessionHistory?.length || 0)

  const muscleWorkCount = useMemo(() => {
    const counts = {}
    ;[...(workoutHistory || []), ...(sessionHistory || [])].forEach((s) => {
      const muscle = s.muscleGroup || 'Autre'
      counts[muscle] = (counts[muscle] || 0) + 1
    })
    return counts
  }, [workoutHistory, sessionHistory])

  const handleGenerate = useCallback(() => {
    const split = generateWorkout(profile, excludedIds)
    setGeneratedSplit(split)
    setView('workout')
  }, [profile, excludedIds])

  const handleDaySelect = useCallback((dayIndex) => {
    setSelectedDay(dayIndex)
    setView('dayDetail')
  }, [])

  const handleBack = useCallback(() => {
    if (view === 'dayDetail') setView('workout')
    else if (view === 'workout') setView('main')
    else if (view === 'bilan') setView('main')
  }, [view])

  if (view === 'dayDetail' && generatedSplit && selectedDay !== null) {
    const day = generatedSplit[selectedDay]
    return (
      <div className="space-y-4 p-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft size={16} /> Retour
        </button>
        <GlassCard className="p-4">
          <h3 className="text-white font-bold text-lg mb-1">Jour {day.day} — {day.name}</h3>
          <p className="text-white/40 text-xs mb-4">{day.exercises.length} exercices · {day.totalSets} séries</p>
          <div className="space-y-3">
            {day.exercises.map((ex, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium text-sm">{ex.name}</span>
                  <span className="text-mint-400 text-xs font-bold">{ex.sets}×{ex.reps}</span>
                </div>
                <p className="text-white/40 text-xs">{ex.muscleGroup} · {ex.equipment}</p>
                {ex.description && (
                  <p className="text-white/30 text-xs mt-1 line-clamp-2">{ex.description}</p>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    )
  }

  if (view === 'workout' && generatedSplit) {
    return (
      <div className="space-y-4 p-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft size={16} /> Retour
        </button>

        <GlassCard className="p-4 text-center space-y-3">
          <Dumbbell size={32} className="text-mint-400 mx-auto" />
          <h2 className="text-white font-bold text-lg">Ton Programme Généré</h2>
          <p className="text-white/50 text-xs">
            {generatedSplit.length} jours · {profile.level || 'intermédiaire'}
          </p>
        </GlassCard>

        {hasInjuries && (
          <GlassCard className="p-3 border border-orange-500/20 bg-orange-500/5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-400 shrink-0" />
              <span className="text-orange-300 text-xs">
                Exercices adaptés à tes blessures ({excludedIds.length} exclus)
              </span>
            </div>
          </GlassCard>
        )}

        <div className="space-y-2">
          {generatedSplit.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDaySelect(index)}
              className="w-full text-left glass rounded-2xl p-4 hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-white font-bold text-sm">Jour {day.day}</span>
                  <span className="text-white/40 text-sm ml-2">— {day.name}</span>
                </div>
                <span className="text-mint-400 text-xs font-medium">{day.exercises.length} exos</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {day.exercises.map((ex, i) => (
                  <span key={i} className="bg-white/5 rounded-full px-2 py-0.5 text-[10px] text-white/50">
                    {ex.name}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2 text-white/30 text-[10px]">
                <span className="flex items-center gap-1"><Dumbbell size={10} /> {day.totalSets} séries</span>
                <span className="flex items-center gap-1"><Clock size={10} /> ~{Math.round(day.exercises.length * 4.5)} min</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {/* Score Ring */}
      <GlassCard className="p-6 flex flex-col items-center gap-3">
        <ScoreRing score={fitnessScore} />
        <div className="text-center">
          <p className="text-white/50 text-xs uppercase tracking-wide">Niveau Fitness</p>
          <p className="text-white font-bold text-sm">{getScoreLabel(fitnessScore)}</p>
        </div>
      </GlassCard>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={14} className="text-yellow-400" />
            <span className="text-white/50 text-[10px] uppercase">Séances totales</span>
          </div>
          <p className="text-white text-xl font-bold">{totalSessions}</p>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-mint-400" />
            <span className="text-white/50 text-[10px] uppercase">Fréquence</span>
          </div>
          <p className="text-white text-xl font-bold">{profile.frequency || 3}x / sem</p>
        </GlassCard>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handleGenerate}
          className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-mint-500/20 flex items-center justify-center">
            <Bot size={20} className="text-mint-400" />
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-bold text-sm">Générer un programme</p>
            <p className="text-white/40 text-xs">Basé sur ton profil et tes objectifs</p>
          </div>
        </button>

        <button
          onClick={() => setView('bilan')}
          className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <BarChart3 size={20} className="text-blue-400" />
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-bold text-sm">Bilan & Statistiques</p>
            <p className="text-white/40 text-xs">Analyse de tes performances</p>
          </div>
        </button>
      </div>

      {/* Avertissement blessures */}
      {hasInjuries && (
        <GlassCard className="p-3 border border-orange-500/20 bg-orange-500/5">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-300 text-xs font-medium">Blessures détectées</p>
              <p className="text-orange-300/60 text-xs mt-0.5">
                {excludedIds.length} exercice{excludedIds.length > 1 ? 's' : ''} exclu{excludedIds.length > 1 ? 's' : ''} du programme
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Répartition musculaire */}
      {Object.keys(muscleWorkCount).length > 0 && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} className="text-white/40" />
            <span className="text-white/50 text-[10px] uppercase tracking-wide">Répartition musculaire</span>
          </div>
          <div className="space-y-2">
            {Object.entries(muscleWorkCount)
              .sort(([, a], [, b]) => b - a)
              .map(([muscle, count]) => {
                const max = Math.max(...Object.values(muscleWorkCount), 1)
                return (
                  <div key={muscle} className="flex items-center gap-3">
                    <span className="text-white/60 text-xs w-20 truncate">{muscle}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-mint-500 to-mint-400 rounded-full transition-all duration-500"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-white/40 text-xs tabular-nums w-6 text-right">{count}</span>
                  </div>
                )
              })}
          </div>
        </GlassCard>
      )}

      {/* Bilan view */}
      {view === 'bilan' && (
        <div className="space-y-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors"
          >
            <ChevronLeft size={16} /> Retour
          </button>

          <GlassCard className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-400" />
              <h3 className="text-white font-bold text-sm">Bilan Complet</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-white">{totalSessions}</p>
                <p className="text-white/40 text-xs">Séances totales</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-white">{fitnessScore}</p>
                <p className="text-white/40 text-xs">Score fitness</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-white">{profile.frequency || 3}</p>
                <p className="text-white/40 text-xs">Jours / semaine</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-white">{excludedIds.length}</p>
                <p className="text-white/40 text-xs">Exercices exclus</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-white/50 text-[10px] uppercase tracking-wide">Recommandation</p>
              <div className="bg-white/5 rounded-xl p-3 text-xs text-white/60 leading-relaxed">
                {fitnessScore >= 80
                  ? 'Ton niveau est excellent. Entraîne-toi avec des programmes avancés et varie les stimuli.'
                  : fitnessScore >= 60
                  ? 'Bon niveau. Augmente progressivement le volume et l\'intensité pour progresser.'
                  : fitnessScore >= 40
                  ? 'Niveau moyen. Concentre-toi sur la constance et les mouvements composés.'
                  : 'Commence avec une routine simple 3x/semaine. La régularité est la clé.'}
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
