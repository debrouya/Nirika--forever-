import { useState, useMemo } from 'react'
import {
  Flame,
  Trophy,
  Target,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Play,
  Zap,
  Calendar,
  TrendingUp,
  Video,
  BarChart3,
} from 'lucide-react'
import useStore from '../store/useStore'
import useExercises from '../hooks/useExercises'
import WorkoutScreen from './WorkoutScreen'
import CalisthenicsBilan from './CalisthenicsBilan'
import ExerciseTutorial from './ExerciseTutorial'

const PHASES = [
  { id: 1, name: 'Adaptation', color: 'text-green-400', bg: 'bg-green-400', emoji: '🟢', days: 'Jour 1-10', timing: '30s / 15s' },
  { id: 2, name: 'Intensité', color: 'text-yellow-400', bg: 'bg-yellow-400', emoji: '🟡', days: 'Jour 11-20', timing: '40s / 20s' },
  { id: 3, name: 'Performance', color: 'text-red-400', bg: 'bg-red-400', emoji: '🔴', days: 'Jour 21-30', timing: '45s / 15s' },
]

const DAILY_MOTIVATION = [
  { day: 1, msg: "C'est parti ! 🔥", sub: "Premier pas vers le changement" },
  { day: 2, msg: "Encore un jour 💪", sub: "La régularité est la clé" },
  { day: 3, msg: "Tu tiens le coup 🎯", sub: "3 jours, c'est déjà un début" },
  { day: 5, msg: "Une semaine bientôt ! 🔥", sub: "Continue comme ça" },
  { day: 7, msg: "Première semaine完成ie 🏆", sub: "Tu es sur la bonne voie" },
  { day: 10, msg: "Phase 1 terminée ! 🟢", sub: "Adaptation réussie" },
  { day: 11, msg: "Nouveau défi 🟡", sub: "Phase 2 : Intensité" },
  { day: 14, msg: "2 semaines ! 💪", sub: "À mi-chemin" },
  { day: 15, msg: "Milieu du parcours 🎯", sub: "50% atteint" },
  { day: 20, msg: "Phase 2 terminée ! 🟡", sub: "Prêt pour la suite ?" },
  { day: 21, msg: "Dernière ligne droite 🔴", sub: "Phase 3 : Performance" },
  { day: 25, msg: "Plus que 5 jours ! 🔥", sub: "La fin est proche" },
  { day: 28, msg: "Presque fini ! 🏆", sub: "Tu peux le faire" },
  { day: 30, msg: "TERMINÉ ! 🎉🏆🔥", sub: "Tu es une légende" },
]

const PHASE_1_EXERCISES = [
  { id: 'jump_squat', name: 'Squat sauté', sets: 3, reps: '10', rest: '30s', desc: 'Descends en position de squat, explose vers le haut en sautant.', tips: 'Garde le dos droit, réception souple.' },
  { id: 'push_up', name: 'Pompes classiques', sets: 3, reps: '10', rest: '30s', desc: 'Mains largeur épaules, corps droit, descends jusqu\'à 90°.' },
  { id: 'mountain_climber', name: 'Mountain climbers', sets: 3, duration: '30s', rest: '20s', desc: 'Position de pompe, ramène un genou vers la poitrine en alternance rapide.' },
  { id: 'crunch', name: 'Crunchs', sets: 3, reps: '15', rest: '30s', desc: 'Allongé, genoux fléchis, soulève les épaules du sol en contractant les abdos.' },
  { id: 'jumping_jacks', name: 'Jumping jacks', sets: 3, duration: '30s', rest: '20s', desc: 'Debout, saute en écartant jambes et bras simultanément.' },
  { id: 'planche', name: 'Planche', sets: 3, duration: '20s', rest: '30s', desc: 'Position de pompe basse, corps droit, contracte les abdos.' },
]

const PHASE_2_EXERCISES = [
  { id: 'jump_squat', name: 'Squat sauté', sets: 3, reps: '15', rest: '25s', desc: 'Plus de puissance. Descends bas, explose haut.', tips: 'Garde les talons au sol en position basse.' },
  { id: 'push_up', name: 'Pompes déclinées', sets: 3, reps: '12', rest: '25s', desc: 'Pieds surélevés. Plus intense que les pompes classiques.', tips: 'Garde les coudes près du corps.' },
  { id: 'mountain_climber', name: 'Mountain climbers', sets: 3, duration: '40s', rest: '20s', desc: 'Plus rapide, plus longtemps. Un genou vers le coude opposé.', tips: 'Garde les hanches basses.' },
  { id: 'gainage_dynamique', name: 'Planche dynamique', sets: 3, duration: '30s', rest: '25s', desc: 'En planche, touche l\'épaule opposée en alternance.', tips: 'Ne balance pas les hanches.' },
  { id: 'burpees', name: 'Burpees', sets: 3, reps: '10', rest: '30s', desc: 'Squat → pompe → squat sauté → saut vertical.', tips: 'Garde le rythme, ne t\'arrête pas.' },
  { id: 'releve_jambes', name: 'Relevés de jambes', sets: 3, reps: '12', rest: '25s', desc: 'Allongé, jambes tendues, monte les jambes à 90° et redescends lentement.', tips: 'Ne balance pas, contrôle le mouvement.' },
]

const PHASE_3_EXERCISES = [
  { id: 'burpees', name: 'Burpees complets', sets: 3, reps: '15', rest: '25s', desc: 'Burpee complet avec pompe et saut vertical max.', tips: 'Donne tout. C\'est la dernière phase.' },
  { id: 'jump_squat', name: 'Squats sautés', sets: 4, reps: '15', rest: '25s', desc: 'Squat profond, explosion maximale, réception contrôlée.' },
  { id: 'pompees_decline', name: 'Pompes déclinées', sets: 3, reps: '15', rest: '25s', desc: 'Pieds très surélevés, descente lente, montée explosive.', tips: 'Garde les abdos contractés.' },
  { id: 'mountain_climber', name: 'Mountain climbers', sets: 3, duration: '45s', rest: '15s', desc: 'Vitesse max. Un genou vers le coude, sans pause.' },
  { id: 'gainage_dynamique', name: 'Planche dynamique', sets: 3, duration: '45s', rest: '15s', desc: 'Touche épaule + extension jambe en alternance.' },
  { id: 'russian_twist', name: 'Russian twist', sets: 3, reps: '20', rest: '20s', desc: 'Assis, jambes levées, rotation du buste droite-gauche.', tips: 'Garde le dos droit, contracte les abdos.' },
]

function getDayPhase(day) {
  if (day <= 10) return 1
  if (day <= 20) return 2
  return 3
}

function getMotivation(day) {
  const match = [...DAILY_MOTIVATION].reverse().find(m => day >= m.day)
  return match || DAILY_MOTIVATION[0]
}

export default function CalisthenicsTracker({ onStartExercise }) {
  const { calisthenie30, startCalisthenie30, completeCalisthenie30Day, uncompleteCalisthenie30Day, resetCalisthenie30 } = useStore()
  const exercises = useExercises()
  const exerciseMap = Object.fromEntries(exercises.map(e => [e.id, e]))
  const [selectedDay, setSelectedDay] = useState(null)
  const [tutorialExercise, setTutorialExercise] = useState(null)
  const [showBilan, setShowBilan] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [launchExercise, setLaunchExercise] = useState(null)

  const stats = useMemo(() => {
    const completed = Object.keys(calisthenie30.completedDays || {}).length
    const totalDays = 30
    const percent = Math.round((completed / totalDays) * 100)

    const streak = (() => {
      let s = 0
      const today = new Date()
      for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        if (calisthenie30.completedDays?.[key]) s++
        else break
      }
      return s
    })()

    const weekDays = Object.keys(calisthenie30.completedDays || {}).filter(d => {
      const date = new Date(d)
      return date >= new Date(Date.now() - 7 * 86400000)
    }).length

    return { completed, totalDays, percent, streak, weekDays }
  }, [calisthenie30])

  if (launchExercise) {
    const ex = exerciseMap[launchExercise.id]
    const realEx = ex || { id: launchExercise.id, name: launchExercise.name, muscleGroup: 'Autre', equipment: 'none' }
    return <WorkoutScreen exercise={realEx} onComplete={() => { useStore.getState().endSession(); setLaunchExercise(null) }} />
  }

  if (selectedExercise) {
    const ex = selectedExercise
    return (
      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedExercise(null)} className="text-white/50 text-sm">← Retour</button>
          <span className="text-white/30 text-xs">Programme 30 jours</span>
        </div>
        <div>
          <h2 className="text-white font-bold text-xl">{ex.name}</h2>
          <p className="text-muted text-sm mt-1">{ex.sets} séries{ex.reps && ` × ${ex.reps}`}{ex.duration && ` (${ex.duration})`} · Repos {ex.rest}</p>
        </div>
        <div className="bg-dark-bg rounded-xl p-3">
          <p className="text-white/80 text-sm">{ex.desc}</p>
          {ex.tips && <p className="text-lime/80 text-xs mt-2">Conseil : {ex.tips}</p>}
        </div>
        <button onClick={() => { useStore.getState().startSession(ex.id, ex.name); setSelectedExercise(null); setTimeout(() => setLaunchExercise(ex), 50) }} className="w-full py-3 rounded-xl bg-lime text-dark-bg font-bold text-sm">
          Demarrer l'exercice
        </button>
        <button onClick={() => { const realEx = exerciseMap[ex.id]; if (realEx) { setSelectedExercise(null); setTutorialExercise(realEx) } }} className="w-full py-3 rounded-xl bg-dark-card border border-dark-border text-white font-bold text-sm">
          Voir le tutoriel video
        </button>
      </div>
    )
  }

  if (!calisthenie30.startDate) {
    return (
      <div className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border">
        {/* Image Header */}
        <div className="relative h-36">
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop"
            alt="Calisthénie"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-bold text-lg">NIRIKA CALISTHENIE 30 JOURS</h3>
            <p className="text-white/60 text-xs">Poids du corps · Circuit HIIT · 3 phases</p>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>🟢</span><span>Phase 1 : Adaptation (Jour 1-10)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>🟡</span><span>Phase 2 : Intensité (Jour 11-20)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>🔴</span><span>Phase 3 : Performance (Jour 21-30)</span>
            </div>
          </div>

          <button
            onClick={startCalisthenie30}
            className="w-full py-3 rounded-xl bg-lime text-dark-bg font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Play size={16} fill="currentColor" />
            Commencer le Challenge
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-lime" />
            <h3 className="text-white font-bold text-sm">NIRIKA CALISTHENIE 30 JOURS</h3>
          </div>
          <button onClick={resetCalisthenie30} className="text-muted hover:text-white p-1">
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Progress Ring */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" stroke="#2A2A2A" strokeWidth="6" fill="none" />
              <circle
                cx="32" cy="32" r="28"
                stroke="#C6FF00"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${stats.percent * 1.76} ${176 - stats.percent * 1.76}`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{stats.completed}/30</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={12} className="text-lime" />
              <span className="text-white font-bold text-lg">{stats.percent}%</span>
            </div>
            <p className="text-muted text-[10px]">{stats.completed} jours complétés</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-orange-400">🔥 {stats.streak}j streak</span>
              <span className="text-[10px] text-blue-400">📅 {stats.weekDays} cette semaine</span>
            </div>
          </div>
        </div>

        {/* Phase Progress */}
        <div className="space-y-2">
          {PHASES.map((phase) => {
            const phaseDays = phase.id === 1 ? 10 : phase.id === 2 ? 10 : 10
            const phaseCompleted = Object.keys(calisthenie30.completedDays || {}).filter(d => {
              const day = parseInt(d.split('-')[2])
              return getDayPhase(day) === phase.id
            }).length
            const phasePercent = Math.round((phaseCompleted / phaseDays) * 100)
            const isCurrent = calisthenie30.currentPhase === phase.id

            return (
              <div key={phase.id} className={`flex items-center gap-2 ${isCurrent ? 'opacity-100' : 'opacity-50'}`}>
                <span className="text-xs w-4">{phase.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-white font-medium">{phase.name}</span>
                    <span className="text-[9px] text-muted">{phaseCompleted}/{phaseDays} · {phase.timing}</span>
                  </div>
                  <div className="h-1.5 bg-dark-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${phase.bg}`}
                      style={{ width: `${phasePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily Motivation */}
      {stats.completed > 0 && stats.completed < 30 && (
        <div className="bg-gradient-to-r from-lime/10 to-lime/5 rounded-2xl p-4 border border-lime/20">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-lime" />
            <span className="text-white font-bold text-xs">Aujourd'hui</span>
          </div>
          <p className="text-white font-semibold text-sm">{getMotivation(stats.completed + 1).msg}</p>
          <p className="text-muted text-[10px] mt-0.5">{getMotivation(stats.completed + 1).sub}</p>
        </div>
      )}

      {/* 30-Day Grid */}
      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} className="text-lime" />
          <span className="text-white font-semibold text-xs">Planning 30 Jours</span>
        </div>

        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 30 }, (_, i) => {
            const day = i + 1
            const isCompleted = calisthenie30.completedDays?.[day] || calisthenie30.completedDays?.[String(day)]
            const phase = getDayPhase(day)
            const phaseColor = phase === 1 ? 'bg-green-400' : phase === 2 ? 'bg-yellow-400' : 'bg-red-400'
            const isToday = (() => {
              if (!calisthenie30.startDate) return false
              const start = new Date(calisthenie30.startDate)
              const today = new Date()
              const diff = Math.floor((today - start) / 86400000) + 1
              return diff === day
            })()

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                className={`aspect-square rounded-lg flex items-center justify-center text-[9px] font-bold transition-all relative ${
                  isCompleted
                    ? `${phaseColor} text-dark-bg`
                    : isToday
                      ? 'bg-lime/20 border border-lime/50 text-lime'
                      : 'bg-dark-bg border border-dark-border text-muted hover:border-lime/30'
                }`}
              >
                {isCompleted ? (
                  <span>✓</span>
                ) : (
                  <span>{day}</span>
                )}
                {isToday && !isCompleted && (
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-lime" />
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-green-400" />
            <span className="text-[9px] text-muted">Phase 1</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-yellow-400" />
            <span className="text-[9px] text-muted">Phase 2</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-red-400" />
            <span className="text-[9px] text-muted">Phase 3</span>
          </div>
        </div>
      </div>

      {/* Bilan Toggle */}
      {stats.completed > 0 && (
        <button
          onClick={() => setShowBilan(!showBilan)}
          className="w-full bg-dark-card rounded-2xl p-3 border border-dark-border flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-lime" />
            <span className="text-white text-xs font-medium">Voir le bilan détaillé</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-muted transition-transform ${showBilan ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {/* Bilan */}
      {showBilan && <CalisthenicsBilan />}

      {/* Day Detail Popup */}
      {selectedDay && (
        <div className="bg-dark-card rounded-2xl p-4 border border-dark-border animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-white font-bold text-sm">Jour {selectedDay}</span>
              <span className="text-muted text-xs ml-2">Phase {getDayPhase(selectedDay)}</span>
            </div>
            <button
              onClick={() => {
                const isCompleted = calisthenie30.completedDays?.[selectedDay] || calisthenie30.completedDays?.[String(selectedDay)]
                if (isCompleted) {
                  uncompleteCalisthenie30Day(selectedDay)
                } else {
                  const phase = getDayPhase(selectedDay)
                  const exercises = phase === 1 ? PHASE_1_EXERCISES : phase === 2 ? PHASE_2_EXERCISES : PHASE_3_EXERCISES
                  completeCalisthenie30Day(selectedDay, exercises)
                }
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                (calisthenie30.completedDays?.[selectedDay] || calisthenie30.completedDays?.[String(selectedDay)])
                  ? 'bg-dark-bg text-muted border border-dark-border'
                  : 'bg-lime text-dark-bg'
              }`}
            >
              {(calisthenie30.completedDays?.[selectedDay] || calisthenie30.completedDays?.[String(selectedDay)]) ? 'Annuler' : 'Marquer fait ✓'}
            </button>
          </div>

          <div className="space-y-1.5">
            {selectedDay <= 10 && PHASE_1_EXERCISES.map((ex) => (
              <div key={ex.id} className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedExercise(ex)}
                  className="flex-1 flex items-center gap-2 text-xs text-white/70 hover:bg-dark-bg rounded-lg px-2 py-1.5 transition-all group"
                >
                  <span className="text-lime">🟢</span>
                  <span className="flex-1 text-left">{ex.name} · {ex.sets&&`${ex.sets}s`}{ex.reps&&` × ${ex.reps}`}{ex.duration&&` ${ex.duration}`}</span>
                  <Play size={12} className="text-muted group-hover:text-lime transition-colors" />
                </button>
                <button
                  onClick={() => { const r = exerciseMap[ex.id]; if (r) setTutorialExercise(r) }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-500/10 transition-colors"
                >
                  <Video size={14} className="text-blue-400" />
                </button>
              </div>
            ))}
            {selectedDay >= 11 && selectedDay <= 20 && PHASE_2_EXERCISES.map((ex) => (
              <div key={ex.id} className="flex items-center gap-1">
                <button onClick={() => setSelectedExercise(ex)} className="flex-1 flex items-center gap-2 text-xs text-white/70 hover:bg-dark-bg rounded-lg px-2 py-1.5 transition-all group">
                  <span className="text-yellow-400">🟡</span>
                  <span className="flex-1 text-left">{ex.name} · {ex.sets&&`${ex.sets}s`}{ex.reps&&` × ${ex.reps}`}{ex.duration&&` ${ex.duration}`}</span>
                  <Play size={12} className="text-muted group-hover:text-lime transition-colors" />
                </button>
                <button onClick={() => { const r = exerciseMap[ex.id]; if (r) setTutorialExercise(r) }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-500/10 transition-colors">
                  <Video size={14} className="text-blue-400" />
                </button>
              </div>
            ))}
            {selectedDay >= 21 && PHASE_3_EXERCISES.map((ex) => (
              <div key={ex.id} className="flex items-center gap-1">
                <button onClick={() => setSelectedExercise(ex)} className="flex-1 flex items-center gap-2 text-xs text-white/70 hover:bg-dark-bg rounded-lg px-2 py-1.5 transition-all group">
                  <span className="text-red-400">🔴</span>
                  <span className="flex-1 text-left">{ex.name} · {ex.sets&&`${ex.sets}s`}{ex.reps&&` × ${ex.reps}`}{ex.duration&&` ${ex.duration}`}</span>
                  <Play size={12} className="text-muted group-hover:text-lime transition-colors" />
                </button>
                <button onClick={() => { const r = exerciseMap[ex.id]; if (r) setTutorialExercise(r) }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-500/10 transition-colors">
                  <Video size={14} className="text-blue-400" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-dark-border">
            <p className="text-[10px] text-muted">
              {getMotivation(selectedDay).msg} — {getMotivation(selectedDay).sub}
            </p>
          </div>
        </div>
      )}

      {/* Exercise Tutorial Modal */}
      {tutorialExercise && (
        <ExerciseTutorial
          exercise={tutorialExercise}
          onClose={() => setTutorialExercise(null)}
        />
      )}

      {/* Completion Banner */}
      {stats.completed === 30 && (
        <div className="bg-gradient-to-r from-lime/20 to-lime/10 rounded-2xl p-5 border border-lime/30 text-center">
          <span className="text-4xl block mb-2">🏆</span>
          <h3 className="text-white font-bold text-lg mb-1">DÉFI TERMINÉ !</h3>
          <p className="text-lime text-sm font-medium">30 jours complétés</p>
          <p className="text-muted text-xs mt-1">Tu es une légende. Continue comme ça !</p>
        </div>
      )}
    </div>
  )
}
