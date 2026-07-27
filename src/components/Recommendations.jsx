import { useMemo } from 'react'
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Trophy,
  Moon,
  Target,
  Activity,
  Flame,
  ArrowRight,
} from 'lucide-react'
import useStore from '../store/useStore'

const TYPE_CONFIG = {
  motivation: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  coverage: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  consistency: { icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  progression: { icon: TrendingUp, color: 'text-lime', bg: 'bg-lime/10', border: 'border-lime/20' },
  regression: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  recovery: { icon: Moon, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
}

export default function Recommendations() {
  const { getRecommendations, workoutHistory, sessionHistory, getStreak, profile } = useStore()
  const recommendations = useMemo(() => getRecommendations(), [workoutHistory, sessionHistory, profile])

  const allSessions = [...workoutHistory, ...sessionHistory]
  const streak = getStreak()

  const thisWeekSessions = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000)
    return allSessions.filter(s => new Date(s.completedAt || s.date) >= weekAgo)
  }, [allSessions])

  const totalVolume = useMemo(() => {
    return thisWeekSessions.reduce((sum, s) => sum + (s.totalVolume || s.calories || 0), 0)
  }, [thisWeekSessions])

  const totalDuration = useMemo(() => {
    return thisWeekSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
  }, [thisWeekSessions])

  if (recommendations.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-dark-card rounded-xl p-3 border border-dark-border text-center">
          <Flame size={14} className="text-orange-400 mx-auto mb-1" />
          <p className="text-white font-bold text-sm">{thisWeekSessions.length}</p>
          <p className="text-muted text-[9px]">Séances / 7j</p>
        </div>
        <div className="bg-dark-card rounded-xl p-3 border border-dark-border text-center">
          <Activity size={14} className="text-lime mx-auto mb-1" />
          <p className="text-white font-bold text-sm">{Math.round(totalDuration / 60)}min</p>
          <p className="text-muted text-[9px]">Temps total</p>
        </div>
        <div className="bg-dark-card rounded-xl p-3 border border-dark-border text-center">
          <Trophy size={14} className="text-yellow-400 mx-auto mb-1" />
          <p className="text-white font-bold text-sm">{streak}j</p>
          <p className="text-muted text-[9px]">Série</p>
        </div>
      </div>

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
