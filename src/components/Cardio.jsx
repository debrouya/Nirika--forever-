import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Play,
  Pause,
  Square,
  Plus,
  Minus,
  ChevronLeft,
  Flame,
  Clock,
  TrendingUp,
  CheckCircle,
  Zap,
} from 'lucide-react'
import { cardioActivities, calculateCalories } from '../data/cardio'
import useStore from '../store/useStore'
import GlassCard from './GlassCard'

const DIFFICULTY_COLORS = {
  facile: 'bg-green-500/20 text-green-400',
  moyen: 'bg-yellow-500/20 text-yellow-400',
  difficile: 'bg-red-500/20 text-red-400',
}

const DIFFICULTY_MAP = {
  velo: 'facile',
  tapis: 'moyen',
  rameur: 'moyen',
  corde: 'difficile',
  elliptique: 'facile',
  natation: 'moyen',
  marche: 'facile',
  stepper: 'moyen',
  aviron: 'moyen',
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function getMETForLevel(baseMET, levelConfig, currentLevel) {
  if (!levelConfig) return baseMET
  const { min, max } = levelConfig
  const ratio = (currentLevel - min) / (max - min || 1)
  return Math.round((baseMET * (0.6 + ratio * 0.8)) * 10) / 10
}

function getLevelLabel(config, level) {
  if (config.type === 'resistance') return `Résistance ${level}/${config.max}`
  if (config.type === 'speed') return `Vitesse ${level} km/h`
  if (config.type === 'incline') return `Inclinaison ${level}%`
  if (config.type === 'dual') return `Intensité ${level}/${config.max}`
  return `Niveau ${level}`
}

export default function Cardio() {
  const { profile, addWorkout } = useStore()
  const [view, setView] = useState('grid')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(5)
  const [summary, setSummary] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isRunning])

  const selectActivity = useCallback((activity) => {
    setSelectedActivity(activity)
    setCurrentLevel(activity.levelConfig.default)
    setElapsed(0)
    setIsRunning(false)
    setView('timer')
  }, [])

  const handleStart = useCallback(() => setIsRunning(true), [])
  const handlePause = useCallback(() => setIsRunning(false), [])

  const handleStop = useCallback(() => {
    setIsRunning(false)
    if (!selectedActivity || elapsed < 5) {
      setView('grid')
      setSelectedActivity(null)
      setElapsed(0)
      return
    }

    const durationMinutes = elapsed / 60
    const weight = profile.weight || 70
    const dynamicMET = getMETForLevel(selectedActivity.met, selectedActivity.levelConfig, currentLevel)
    const calories = calculateCalories(dynamicMET, weight, durationMinutes)

    const result = {
      activityId: selectedActivity.id,
      activityName: selectedActivity.name,
      duration: elapsed,
      durationMinutes: Math.round(durationMinutes),
      calories,
      met: dynamicMET,
      level: currentLevel,
      levelType: selectedActivity.levelConfig.type,
    }

    addWorkout({
      type: 'cardio',
      ...result,
    })

    setSummary(result)
    setView('summary')
  }, [selectedActivity, elapsed, currentLevel, profile.weight, addWorkout])

  const handleBackToGrid = useCallback(() => {
    setView('grid')
    setSelectedActivity(null)
    setElapsed(0)
    setSummary(null)
  }, [])

  const adjustLevel = useCallback((delta) => {
    if (!selectedActivity) return
    const { min, max, step } = selectedActivity.levelConfig
    setCurrentLevel((prev) => Math.min(max, Math.max(min, prev + delta * step)))
  }, [selectedActivity])

  const weight = profile.weight || 70
  const dynamicMET = selectedActivity
    ? getMETForLevel(selectedActivity.met, selectedActivity.levelConfig, currentLevel)
    : 0
  const currentCalories = selectedActivity
    ? calculateCalories(dynamicMET, weight, elapsed / 60)
    : 0

  if (view === 'summary' && summary) {
    return (
      <div className="space-y-4 p-4">
        <GlassCard className="p-6 text-center space-y-4">
          <CheckCircle size={48} className="text-mint-400 mx-auto" />
          <h2 className="text-white font-bold text-xl">Séance terminée !</h2>
          <p className="text-white/60 text-sm">{summary.activityName}</p>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/5 rounded-xl p-3">
              <Clock size={16} className="text-blue-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{formatTime(summary.duration)}</p>
              <p className="text-white/40 text-xs">Durée</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <Flame size={16} className="text-orange-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{summary.calories}</p>
              <p className="text-white/40 text-xs">Calories</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <Zap size={16} className="text-yellow-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{summary.met}</p>
              <p className="text-white/40 text-xs">MET</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <TrendingUp size={16} className="text-mint-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{summary.level}</p>
              <p className="text-white/40 text-xs">Niveau</p>
            </div>
          </div>

          <button
            onClick={handleBackToGrid}
            className="w-full bg-mint-500 hover:bg-mint-400 text-black font-semibold rounded-xl py-3 text-sm transition-all mt-4"
          >
            Retour
          </button>
        </GlassCard>
      </div>
    )
  }

  if (view === 'timer' && selectedActivity) {
    return (
      <div className="space-y-4 p-4">
        <button
          onClick={handleBackToGrid}
          className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft size={16} /> Retour
        </button>

        <GlassCard className="p-6 text-center space-y-6">
          <div>
            <span className="text-4xl mb-2 block">{selectedActivity.icon}</span>
            <h2 className="text-white font-bold text-lg">{selectedActivity.name}</h2>
          </div>

          <div className="text-6xl font-black text-white font-mono tabular-nums">
            {formatTime(elapsed)}
          </div>

          <div className="flex items-center justify-center gap-3 text-sm">
            <div className="bg-white/5 rounded-lg px-3 py-1.5">
              <span className="text-white/40">MET </span>
              <span className="text-white font-bold">{dynamicMET}</span>
            </div>
            <div className="bg-white/5 rounded-lg px-3 py-1.5">
              <Flame size={12} className="text-orange-400 inline mr-1" />
              <span className="text-white font-bold">{currentCalories}</span>
              <span className="text-white/40"> kcal</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-white/40 text-xs uppercase tracking-wide">
              {getLevelLabel(selectedActivity.levelConfig, currentLevel)}
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => adjustLevel(-1)}
                disabled={currentLevel <= selectedActivity.levelConfig.min}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all"
              >
                <Minus size={16} />
              </button>
              <div className="w-32 relative">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-mint-500 to-mint-400 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentLevel - selectedActivity.levelConfig.min) /
                        (selectedActivity.levelConfig.max - selectedActivity.levelConfig.min)) *
                        100}%`,
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => adjustLevel(1)}
                disabled={currentLevel >= selectedActivity.levelConfig.max}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="w-16 h-16 rounded-full bg-mint-500 hover:bg-mint-400 text-black flex items-center justify-center transition-all shadow-lg shadow-mint-500/30"
              >
                <Play size={28} />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="w-16 h-16 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black flex items-center justify-center transition-all shadow-lg shadow-yellow-500/30"
              >
                <Pause size={28} />
              </button>
            )}
            <button
              onClick={handleStop}
              className="w-16 h-16 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 flex items-center justify-center transition-all"
            >
              <Square size={28} />
            </button>
          </div>
        </GlassCard>

        {isRunning && (
          <GlassCard className="p-3 border border-mint-500/20">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-mint-400 animate-pulse" />
              <span className="text-white/60 text-xs">Session en cours</span>
            </div>
          </GlassCard>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="mb-2">
        <h2 className="text-white font-bold text-lg">Cardio</h2>
        <p className="text-white/50 text-sm">Choisis ton activité</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cardioActivities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => selectActivity(activity)}
            className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-all active:scale-95"
          >
            <span className="text-3xl">{activity.icon}</span>
            <span className="text-white text-xs font-medium text-center leading-tight">
              {activity.name}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                DIFFICULTY_COLORS[DIFFICULTY_MAP[activity.id]] || 'bg-white/10 text-white/50'
              }`}
            >
              {DIFFICULTY_MAP[activity.id] === 'facile' ? 'Facile' : DIFFICULTY_MAP[activity.id] === 'moyen' ? 'Moyen' : 'Difficile'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
