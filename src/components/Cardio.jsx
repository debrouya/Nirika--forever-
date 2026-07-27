import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  Heart,
  Target,
  Activity,
  BarChart3,
  Brain,
  Rocket,
  AlertTriangle,
  Shield,
} from 'lucide-react'
import { cardioActivities, calculateCalories } from '../data/cardio'
import useStore from '../store/useStore'

const OBJECTIVES = [
  { id: 'fat_burn', label: 'Perte de gras', icon: Flame, color: 'text-orange-400', desc: 'Zone 2-3 stable, session longue' },
  { id: 'endurance', label: 'Endurance', icon: Heart, color: 'text-blue-400', desc: 'BPM stabilisé, minimiser fluctuations' },
  { id: 'performance', label: 'Performance', icon: Zap, color: 'text-yellow-400', desc: 'Intervalles HIIT, pics zone 4-5' },
]

const ZONES = [
  { zone: 1, label: 'Échauffement', min: 0, max: 0.5, color: '#94A3B8', bpmRange: '50-60%' },
  { zone: 2, label: 'Fat Burn', min: 0.5, max: 0.65, color: '#22C55E', bpmRange: '60-70%' },
  { zone: 3, label: 'Aérobie', min: 0.65, max: 0.8, color: '#C6FF00', bpmRange: '70-80%' },
  { zone: 4, label: 'Threshold', min: 0.8, max: 0.9, color: '#F59E0B', bpmRange: '80-90%' },
  { zone: 5, label: 'VO2 Max', min: 0.9, max: 1.0, color: '#EF4444', bpmRange: '90-100%' },
]

const COACHING_MESSAGES = {
  fat_burn: {
    zone1: ['Échauffement, prends ton temps 🧘', 'Monte doucement la intensité'],
    zone2: ['Zone fat burn atteinte 🔥', 'Maintiens ce rythme, c\'est parfait 💪', 'Tu brûles du gras, continue !'],
    zone3: ['Intensité un peu haute, ralentis 🧘', 'Reste en zone 2 pour optimiser'],
    zone4: ['Trop intense ! Descends l\'intensité ⚠️', 'Respire, contrôle ta respiration'],
    zone5: ['STOP — Récupère immédiatement 🛑', 'Zone dangereuse pour la perte de gras'],
  },
  endurance: {
    zone1: ['Échauffement progressif 🚀', 'Prépare ton corps'],
    zone2: ['Rythme endurance parfait ❤️', 'Stabilise ton BPM', 'Tu es dans la zone optimale 💪'],
    zone3: ['Bon rythme, maintiens 🎯', 'Ta résistance augmente !'],
    zone4: ['Un peu trop — surveille ton BPM 📊', 'Ralentis légèrement'],
    zone5: ['Trop intense pour l\'endurance ⚠️', 'Descends pour maintenir la durée'],
  },
  performance: {
    zone1: ['Échauffement avant les intervalles ⚡', 'Prépare-toi à pousser'],
    zone2: ['Zone de récupération active 🔄', 'Prépare le prochain sprint'],
    zone3: ['Bonne intensité de travail 🎯', 'Push encore un peu !'],
    zone4: ['Push push push ! 🚀', 'Tu es en zone performance !', 'Encore 30 secondes ! 💪'],
    zone5: ['VO2 MAX — donne tout ! 🔥', 'Pic de performance — tiens bon !'],
  },
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

const DIFFICULTY_COLORS = {
  facile: 'bg-green-500/20 text-green-400',
  moyen: 'bg-yellow-500/20 text-yellow-400',
  difficile: 'bg-red-500/20 text-red-400',
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

function getZone(intensityRatio) {
  for (const z of ZONES) {
    if (intensityRatio >= z.min && intensityRatio < z.max) return z
  }
  return ZONES[ZONES.length - 1]
}

function getCoachingMessage(objective, zone, timeInZone) {
  const msgs = COACHING_MESSAGES[objective]?.[`zone${zone.zone}`] || ['Continue ! 💪']
  const idx = Math.floor(timeInZone / 8) % msgs.length
  return msgs[idx]
}

function simulateBPM(baseLevel, maxLevel, currentLevel, elapsed, objective) {
  const intensityRatio = (currentLevel - baseLevel) / (maxLevel - baseLevel || 1)
  const baseBPM = 60 + intensityRatio * 100
  const noise = Math.sin(elapsed * 0.1) * 3 + Math.sin(elapsed * 0.03) * 2
  const warmup = Math.min(elapsed / 120, 1) * 15
  return Math.round(Math.max(65, Math.min(195, baseBPM + noise + warmup)))
}

function calculateDistance(activityId, elapsed, level) {
  const speedMap = {
    velo: level * 1.2,
    tapis: level * 0.8,
    rameur: level * 0.3,
    corde: level * 0.5,
    elliptique: level * 0.7,
    natation: level * 0.15,
    marche: level * 0.4,
    stepper: level * 0.2,
    aviron: level * 0.25,
  }
  return Math.round((speedMap[activityId] || 0) * (elapsed / 3600) * 100) / 100
}

export default function Cardio() {
  const { profile, addWorkout } = useStore()
  const [view, setView] = useState('grid')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [objective, setObjective] = useState('fat_burn')
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(5)
  const [summary, setSummary] = useState(null)
  const [currentBPM, setCurrentBPM] = useState(0)
  const [currentZone, setCurrentZone] = useState(ZONES[0])
  const [coachingMsg, setCoachingMsg] = useState('')
  const [zoneTime, setZoneTime] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  const [bpmHistory, setBpmHistory] = useState([])
  const [timeInCurrentZone, setTimeInCurrentZone] = useState(0)
  const timerRef = useRef(null)
  const coachingRef = useRef(null)

  const weight = profile?.weight || 70

  useEffect(() => {
    if (!isRunning || !selectedActivity) {
      clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const t = prev + 1
        const bpm = simulateBPM(
          selectedActivity.levelConfig.min,
          selectedActivity.levelConfig.max,
          currentLevel,
          t,
          objective
        )
        setCurrentBPM(bpm)

        const maxBPM = 220 - (profile?.age || 25)
        const intensityRatio = bpm / maxBPM
        const zone = getZone(intensityRatio)
        setCurrentZone(zone)

        setZoneTime((zt) => ({ ...zt, [zone.zone]: (zt[zone.zone] || 0) + 1 }))
        setTimeInCurrentZone((prev) => prev + 1)

        setBpmHistory((prev) => {
          const newHistory = [...prev, bpm]
          return newHistory.length > 300 ? newHistory.slice(-300) : newHistory
        })

        return t
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [isRunning, selectedActivity, currentLevel, objective, profile?.age])

  // Coaching messages
  useEffect(() => {
    if (!isRunning) return
    coachingRef.current = setInterval(() => {
      const msg = getCoachingMessage(objective, currentZone, timeInCurrentZone)
      setCoachingMsg(msg)
      setTimeInCurrentZone(0)
    }, 8000)
    return () => clearInterval(coachingRef.current)
  }, [isRunning, objective, currentZone])

  const selectActivity = useCallback((activity) => {
    setSelectedActivity(activity)
    setCurrentLevel(activity.levelConfig.default)
    setElapsed(0)
    setIsRunning(false)
    setView('objective')
  }, [])

  const handleStart = useCallback(() => {
    setIsRunning(true)
    setZoneTime({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
    setBpmHistory([])
    setTimeInCurrentZone(0)
    const msg = getCoachingMessage(objective, ZONES[0], 0)
    setCoachingMsg(msg)
  }, [objective])

  const handlePause = useCallback(() => setIsRunning(false), [])

  const handleResume = useCallback(() => setIsRunning(true), [])

  const handleStop = useCallback(() => {
    setIsRunning(false)
    if (!selectedActivity || elapsed < 5) {
      setView('grid')
      setSelectedActivity(null)
      setElapsed(0)
      return
    }

    const durationMinutes = elapsed / 60
    const dynamicMET = getMETForLevel(selectedActivity.met, selectedActivity.levelConfig, currentLevel)
    const calories = calculateCalories(dynamicMET, weight, durationMinutes)
    const distance = calculateDistance(selectedActivity.id, elapsed, currentLevel)
    const avgBPM = bpmHistory.length > 0 ? Math.round(bpmHistory.reduce((a, b) => a + b, 0) / bpmHistory.length) : 0

    const totalZoneTime = Object.values(zoneTime).reduce((a, b) => a + b, 0) || 1
    const zoneBreakdown = {
      1: Math.round((zoneTime[1] / totalZoneTime) * 100),
      2: Math.round((zoneTime[2] / totalZoneTime) * 100),
      3: Math.round((zoneTime[3] / totalZoneTime) * 100),
      4: Math.round((zoneTime[4] / totalZoneTime) * 100),
      5: Math.round((zoneTime[5] / totalZoneTime) * 100),
    }

    // Score calculation
    let score = 50
    if (objective === 'fat_burn') {
      score += zoneBreakdown[2] * 0.4 + zoneBreakdown[3] * 0.2 - zoneBreakdown[4] * 0.3 - zoneBreakdown[5] * 0.5
      score += Math.min(durationMinutes / 30, 1) * 20
    } else if (objective === 'endurance') {
      score += (100 - zoneBreakdown[4] - zoneBreakdown[5]) * 0.3
      const bpmVariance = bpmHistory.length > 10
        ? Math.abs(bpmHistory[bpmHistory.length - 1] - bpmHistory[0]) : 0
      score += Math.max(0, 15 - bpmVariance * 0.5)
      score += Math.min(durationMinutes / 40, 1) * 15
    } else if (objective === 'performance') {
      score += zoneBreakdown[4] * 0.3 + zoneBreakdown[5] * 0.2
      score += Math.min(durationMinutes / 20, 1) * 10
    }
    score = Math.max(0, Math.min(100, Math.round(score)))

    const dominantZone = Object.entries(zoneTime).sort(([, a], [, b]) => b - a)[0]
    const dominantZoneNum = parseInt(dominantZone[0])

    const result = {
      activityId: selectedActivity.id,
      activityName: selectedActivity.name,
      objective,
      duration: elapsed,
      durationMinutes: Math.round(durationMinutes),
      calories,
      met: dynamicMET,
      level: currentLevel,
      levelType: selectedActivity.levelConfig.type,
      avgBPM,
      distance,
      zoneBreakdown,
      dominantZone: dominantZoneNum,
      dominantZoneName: ZONES[dominantZoneNum - 1].label,
      score,
      zoneTime,
    }

    addWorkout({ type: 'cardio', ...result })
    setSummary(result)
    setView('summary')
  }, [selectedActivity, elapsed, currentLevel, weight, addWorkout, bpmHistory, zoneTime, objective])

  const handleBackToGrid = useCallback(() => {
    setView('grid')
    setSelectedActivity(null)
    setElapsed(0)
    setSummary(null)
    setBpmHistory([])
    setZoneTime({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  }, [])

  const adjustLevel = useCallback((delta) => {
    if (!selectedActivity) return
    const { min, max, step } = selectedActivity.levelConfig
    setCurrentLevel((prev) => Math.min(max, Math.max(min, prev + delta * step)))
  }, [selectedActivity])

  const dynamicMET = selectedActivity
    ? getMETForLevel(selectedActivity.met, selectedActivity.levelConfig, currentLevel)
    : 0
  const currentCalories = selectedActivity
    ? calculateCalories(dynamicMET, weight, elapsed / 60)
    : 0
  const currentDistance = selectedActivity
    ? calculateDistance(selectedActivity.id, elapsed, currentLevel)
    : 0

  // ==================== SUMMARY VIEW ====================
  if (view === 'summary' && summary) {
    return (
      <div className="space-y-4 p-4">
        <div className="bg-dark-card rounded-2xl p-6 border border-dark-border text-center space-y-4">
          <CheckCircle size={48} className="text-lime mx-auto" />
          <h2 className="text-white font-bold text-xl">Séance terminée !</h2>
          <p className="text-muted text-sm">{summary.activityName} · {OBJECTIVES.find(o => o.id === summary.objective)?.label}</p>

          {/* Score */}
          <div className="bg-dark-bg rounded-2xl p-4 border border-dark-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain size={16} className="text-lime" />
              <span className="text-muted text-xs uppercase">Score cardio</span>
            </div>
            <p className={`text-5xl font-black ${summary.score >= 80 ? 'text-lime' : summary.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {summary.score}<span className="text-2xl text-muted">/100</span>
            </p>
            <p className="text-muted text-xs mt-1">
              {summary.score >= 80 ? 'Excellente séance ! 🔥' : summary.score >= 50 ? 'Bonne séance, continue ! 💪' : 'À améliorer, mais tu as fait le bon pas !'}
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-bg rounded-xl p-3">
              <Clock size={16} className="text-blue-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{formatTime(summary.duration)}</p>
              <p className="text-muted text-xs">Durée</p>
            </div>
            <div className="bg-dark-bg rounded-xl p-3">
              <Flame size={16} className="text-orange-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{summary.calories}</p>
              <p className="text-muted text-xs">Calories</p>
            </div>
            <div className="bg-dark-bg rounded-xl p-3">
              <Heart size={16} className="text-red-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{summary.avgBPM}</p>
              <p className="text-muted text-xs">BPM moyen</p>
            </div>
            <div className="bg-dark-bg rounded-xl p-3">
              <TrendingUp size={16} className="text-lime mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{summary.distance}km</p>
              <p className="text-muted text-xs">Distance</p>
            </div>
          </div>

          {/* Zone Breakdown */}
          <div className="bg-dark-bg rounded-2xl p-4 border border-dark-border text-left">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-lime" />
              <span className="text-muted text-[10px] uppercase">Répartition par zone</span>
            </div>
            <div className="space-y-2">
              {ZONES.map((z) => (
                <div key={z.zone} className="flex items-center gap-2">
                  <span className="text-muted text-[10px] w-16">Zone {z.zone}</span>
                  <div className="flex-1 h-3 bg-dark-card rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${summary.zoneBreakdown[z.zone] || 0}%`, backgroundColor: z.color }}
                    />
                  </div>
                  <span className="text-white text-[10px] w-8 text-right">{summary.zoneBreakdown[z.zone] || 0}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis */}
          <div className="bg-dark-bg rounded-2xl p-4 border border-dark-border text-left space-y-3">
            <div className="flex items-center gap-2">
              <Brain size={14} className="text-lime" />
              <span className="text-muted text-[10px] uppercase">Analyse</span>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-white">
                <span className="text-muted">Zone dominante : </span>
                <span style={{ color: ZONES[summary.dominantZone - 1]?.color }}>{summary.dominantZoneName}</span>
              </p>
              <p className="text-white">
                <span className="text-muted">Intensité moyenne : </span>
                <span className="text-lime">{summary.level}/{summary.levelType === 'resistance' || summary.levelType === 'dual' ? 10 : 20}</span>
              </p>
              <p className="text-white">
                <span className="text-muted">Efficacité : </span>
                <span className={summary.score >= 70 ? 'text-lime' : 'text-yellow-400'}>{summary.score}/100</span>
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-dark-bg rounded-2xl p-4 border border-dark-border text-left space-y-3">
            <div className="flex items-center gap-2">
              <Rocket size={14} className="text-lime" />
              <span className="text-muted text-[10px] uppercase">Recommandations</span>
            </div>
            <div className="space-y-2 text-xs text-white/70">
              {summary.objective === 'fat_burn' && summary.zoneBreakdown[2] < 50 && (
                <p>• Augmente légèrement le temps en zone 2 pour optimiser la perte de gras</p>
              )}
              {summary.objective === 'endurance' && summary.avgBPM > 150 && (
                <p>• Essaie de stabiliser ton BPM plus bas pour améliorer l'endurance</p>
              )}
              {summary.objective === 'performance' && summary.zoneBreakdown[4] + summary.zoneBreakdown[5] < 20 && (
                <p>• Augmente l'intensité pendant les intervalles pour atteindre zone 4-5</p>
              )}
              {summary.duration < 600 && (
                <p>• Pour de meilleurs résultats, vise au moins 15 minutes de séance</p>
              )}
              <p>• Programme ta prochaine séance dans 24-48h pour la récupération</p>
            </div>
          </div>

          <button
            onClick={handleBackToGrid}
            className="w-full bg-lime hover:bg-lime/90 text-dark-bg font-bold rounded-xl py-3 text-sm transition-all"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  // ==================== OBJECTIVE VIEW ====================
  if (view === 'objective' && selectedActivity) {
    return (
      <div className="space-y-4 p-4">
        <button onClick={() => setView('grid')} className="flex items-center gap-1 text-muted hover:text-white text-sm transition-colors">
          <ChevronLeft size={16} /> Retour
        </button>

        <div className="bg-dark-card rounded-2xl p-4 border border-dark-border text-center">
          <span className="text-4xl block mb-2">{selectedActivity.icon}</span>
          <h2 className="text-white font-bold text-lg">{selectedActivity.name}</h2>
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm mb-3">Ton objectif</h3>
          <div className="space-y-2">
            {OBJECTIVES.map((obj) => {
              const Icon = obj.icon
              return (
                <button
                  key={obj.id}
                  onClick={() => {
                    setObjective(obj.id)
                    setView('timer')
                  }}
                  className={`w-full bg-dark-card rounded-2xl p-4 border text-left transition-all ${
                    objective === obj.id ? 'border-lime' : 'border-dark-border hover:border-dark-border/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      obj.id === 'fat_burn' ? 'bg-orange-500/20' : obj.id === 'endurance' ? 'bg-blue-500/20' : 'bg-yellow-500/20'
                    }`}>
                      <Icon size={20} className={obj.color} />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{obj.label}</p>
                      <p className="text-muted text-[10px]">{obj.desc}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ==================== TIMER VIEW ====================
  if (view === 'timer' && selectedActivity) {
    return (
      <div className="space-y-4 p-4">
        <button
          onClick={() => { if (!isRunning) { setView('grid'); setSelectedActivity(null) } }}
          className="flex items-center gap-1 text-muted hover:text-white text-sm transition-colors"
        >
          <ChevronLeft size={16} /> {isRunning ? 'Session en cours' : 'Retour'}
        </button>

        {/* Activity Header */}
        <div className="bg-dark-card rounded-2xl p-4 border border-dark-border text-center">
          <span className="text-3xl block mb-1">{selectedActivity.icon}</span>
          <h2 className="text-white font-bold">{selectedActivity.name}</h2>
          <span className="text-lime text-[10px] font-medium uppercase">{OBJECTIVES.find(o => o.id === objective)?.label}</span>
        </div>

        {/* Timer + BPM */}
        <div className="bg-dark-card rounded-2xl p-6 border border-dark-border text-center">
          <div className="text-5xl font-black text-white font-mono tabular-nums mb-4">
            {formatTime(elapsed)}
          </div>

          {/* BPM Live */}
          {isRunning && (
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Heart size={20} className="text-red-400 animate-pulse" />
                <span className="text-white font-bold text-2xl">{currentBPM}</span>
                <span className="text-muted text-xs">BPM</span>
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-bold text-dark-bg"
                style={{ backgroundColor: currentZone.color }}
              >
                Zone {currentZone.zone}
              </div>
            </div>
          )}

          {/* Zone Bar */}
          {isRunning && (
            <div className="flex gap-1 mb-4">
              {ZONES.map((z) => (
                <div key={z.zone} className="flex-1 h-2 rounded-full overflow-hidden bg-dark-bg">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(zoneTime[z.zone] || 0) / Math.max(elapsed, 1) * 100}%`,
                      backgroundColor: z.color,
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Coaching Message */}
          {isRunning && coachingMsg && (
            <div className="bg-lime/10 border border-lime/20 rounded-xl px-4 py-2 mb-4">
              <p className="text-lime text-sm font-medium">{coachingMsg}</p>
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
            <div className="bg-dark-bg rounded-lg px-3 py-1.5">
              <Flame size={12} className="text-orange-400 inline mr-1" />
              <span className="text-white font-bold">{currentCalories}</span>
              <span className="text-muted"> kcal</span>
            </div>
            <div className="bg-dark-bg rounded-lg px-3 py-1.5">
              <span className="text-muted">MET </span>
              <span className="text-white font-bold">{dynamicMET}</span>
            </div>
            {currentDistance > 0 && (
              <div className="bg-dark-bg rounded-lg px-3 py-1.5">
                <TrendingUp size={12} className="text-lime inline mr-1" />
                <span className="text-white font-bold">{currentDistance}</span>
                <span className="text-muted"> km</span>
              </div>
            )}
          </div>
        </div>

        {/* Level Control */}
        <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
          <p className="text-muted text-[10px] uppercase tracking-wide text-center mb-3">
            {getLevelLabel(selectedActivity.levelConfig, currentLevel)}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => adjustLevel(-1)}
              disabled={currentLevel <= selectedActivity.levelConfig.min}
              className="w-10 h-10 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center text-white/60 hover:bg-dark-border disabled:opacity-30 transition-all"
            >
              <Minus size={16} />
            </button>
            <div className="w-32 relative">
              <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-lime rounded-full transition-all duration-300"
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
              className="w-10 h-10 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center text-white/60 hover:bg-dark-border disabled:opacity-30 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isRunning ? (
            <button
              onClick={elapsed > 0 ? handleResume : handleStart}
              className="w-16 h-16 rounded-full bg-lime hover:bg-lime/90 text-dark-bg flex items-center justify-center transition-all shadow-lg shadow-lime/30"
            >
              <Play size={28} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="w-16 h-16 rounded-full bg-yellow-500 hover:bg-yellow-400 text-dark-bg flex items-center justify-center transition-all shadow-lg shadow-yellow-500/30"
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

        {/* Live indicator */}
        {isRunning && (
          <div className="bg-dark-card rounded-2xl p-3 border border-lime/20">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span className="text-muted text-xs">Session en cours — {OBJECTIVES.find(o => o.id === objective)?.label}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==================== GRID VIEW ====================
  return (
    <div className="space-y-4 p-4">
      <div className="mb-2">
        <h2 className="text-white font-bold text-lg">Cardio</h2>
        <p className="text-muted text-sm">Choisis ton activité</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cardioActivities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => selectActivity(activity)}
            className="bg-dark-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-dark-border transition-all active:scale-95 border border-dark-border"
          >
            <span className="text-3xl">{activity.icon}</span>
            <span className="text-white text-xs font-medium text-center leading-tight">
              {activity.name}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                DIFFICULTY_COLORS[DIFFICULTY_MAP[activity.id]] || 'bg-dark-bg text-muted'
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
