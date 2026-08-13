import { useMemo } from 'react'
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Trophy,
  Moon,
  Activity,
  BarChart3,
} from 'lucide-react'
import useStore from '../store/useStore'
import { detectPlateaus, getRecoveryScore, predict1RM } from '../services/aiCoaching'

const TYPE_CONFIG = {
  motivation: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  coverage: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  consistency: { icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  progression: { icon: TrendingUp, color: 'text-lime', bg: 'bg-lime/10', border: 'border-lime/20' },
  regression: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  recovery: { icon: Moon, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
}

export default function Recommendations() {
  const { getRecommendations, workoutHistory, sessionHistory, profile, exerciseHistory } = useStore()
  const recommendations = useMemo(() => getRecommendations(), [workoutHistory, sessionHistory, profile])

  const allSessions = useMemo(() => [...workoutHistory, ...sessionHistory], [workoutHistory, sessionHistory])

  const plateaus = useMemo(() => detectPlateaus(exerciseHistory), [exerciseHistory])
  const recovery = useMemo(() => {
    const fitData = (() => { try { const cp = JSON.parse(localStorage.getItem('nirika_coach_profile') || '{}'); return { sleepQuality: cp.sleepQuality, sleepHours: cp.sleepHours, fatigue: cp.fatigueLevel, waterIntake: cp.waterIntake } } catch { return {} } })()
    return getRecoveryScore(fitData, allSessions)
  }, [allSessions])
  const topPRs = useMemo(() => {
    const entries = Object.entries(exerciseHistory || {})
    if (!entries.length) return []
    return entries.filter(([, records]) => Array.isArray(records) && records.length >= 2).map(([id, records]) => ({ id, name: records[0]?.exerciseName || id, count: records.length, ...predict1RM(exerciseHistory, id) })).filter((pr) => pr.estimatedRM > 0).sort((a, b) => b.estimatedRM - a.estimatedRM).slice(0, 3)
  }, [exerciseHistory])

  if (recommendations.length === 0 && plateaus.length === 0 && topPRs.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Recovery Score */}
      <div className="bg-dark-card rounded-2xl p-3 border border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Activity size={14} className={recovery.status === 'ready' ? 'text-lime' : recovery.status === 'moderate' ? 'text-yellow-400' : 'text-red-400'} /><span className="text-white font-semibold text-xs">Récupération</span></div>
          <span className={`text-xs font-bold ${recovery.status === 'ready' ? 'text-lime' : recovery.status === 'moderate' ? 'text-yellow-400' : 'text-red-400'}`}>{recovery.score}/100</span>
        </div>
        <p className="text-muted text-[10px] mt-1.5 leading-relaxed">{recovery.explanation}</p>
      </div>

      {/* Plateau Alerts */}
      {plateaus.length > 0 && (<div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-3"><div className="flex items-center gap-2 mb-2"><TrendingDown size={14} className="text-yellow-400" /><span className="text-white font-semibold text-xs">Plateau détecté</span></div><div className="space-y-1.5">{plateaus.slice(0, 2).map((p, i) => (<p key={i} className="text-yellow-300/80 text-[10px] leading-relaxed"><span className="text-white font-medium">{p.exerciseName}</span> — stagnation depuis {p.weeks} sem.</p>))}</div></div>)}

      {/* PR Projections */}
      {topPRs.length > 0 && (<div className="bg-lime/5 border border-lime/20 rounded-2xl p-3"><div className="flex items-center gap-2 mb-2"><BarChart3 size={14} className="text-lime" /><span className="text-white font-semibold text-xs">Projections 1RM</span></div><div className="space-y-1.5">{topPRs.map((pr, i) => (<div key={i} className="flex items-center justify-between"><span className="text-white text-[10px] truncate flex-1 mr-2">{pr.name}</span><span className="text-lime text-[10px] font-bold">{pr.estimatedRM}kg</span></div>))}</div></div>)}

      {/* Recommendations List */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-lime" />
          <span className="text-white font-semibold text-sm">Recommandations</span>
        </div>
        <div className="space-y-2">
          {recommendations.map((rec, i) => {
            const config = TYPE_CONFIG[rec.type] || TYPE_CONFIG.motivation
            const Icon = config.icon
            return (
              <div
                key={i}
                className={`${config.bg} border ${config.border} rounded-2xl p-3 flex items-start gap-3`}
              >
                <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className="text-base">{rec.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold">{rec.title}</p>
                  <p className="text-white/60 text-[10px] mt-0.5 leading-relaxed">{rec.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
