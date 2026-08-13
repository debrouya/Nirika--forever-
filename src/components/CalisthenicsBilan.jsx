import { useState, useMemo } from 'react'
import {
  Calendar,
  TrendingUp,
  BarChart3,
  Clock,
  Flame,
  Target,
  ChevronDown,
  Zap,
} from 'lucide-react'
import useStore from '../store/useStore'

const PHASES = [
  { id: 1, name: 'Adaptation', color: 'green-400', emoji: '🟢', timing: '30s/15s' },
  { id: 2, name: 'Intensité', color: 'yellow-400', emoji: '🟡', timing: '40s/20s' },
  { id: 3, name: 'Performance', color: 'red-400', emoji: '🔴', timing: '45s/15s' },
]

function getWeekNumber(date, startDate) {
  const diff = Math.floor((new Date(date) - new Date(startDate)) / (7 * 86400000))
  return diff + 1
}

function getMonthName(date) {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export default function CalisthenicsBilan() {
  const { calisthenie30, workoutHistory } = useStore()
  const [expandedSection, setExpandedSection] = useState('weekly')

  const bilan = useMemo(() => {
    if (!calisthenie30.startDate) return null

    const startDate = new Date(calisthenie30.startDate)
    const completedDays = calisthenie30.completedDays || {}
    const completedEntries = Object.entries(completedDays).map(([day, date]) => ({
      day: parseInt(day),
      date: new Date(date),
    })).sort((a, b) => a.date - b.date)

    // Weekly breakdown
    const weeklyData = {}
    completedEntries.forEach(({ day, date }) => {
      const weekNum = getWeekNumber(date, startDate)
      if (!weeklyData[weekNum]) weeklyData[weekNum] = { days: [], totalDays: 0, phase: 0 }
      weeklyData[weekNum].days.push(day)
      weeklyData[weekNum].totalDays = weeklyData[weekNum].days.length
      weeklyData[weekNum].phase = day <= 10 ? 1 : day <= 20 ? 2 : 3
    })

    // Monthly breakdown
    const monthlyData = {}
    completedEntries.forEach(({ day, date }) => {
      const monthKey = getMonthName(date)
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { days: [], totalDays: 0, calories: 0 }
      monthlyData[monthKey].days.push(day)
      monthlyData[monthKey].totalDays = monthlyData[monthKey].days.length
    })

    // Phase stats
    const phaseStats = [1, 2, 3].map(phase => {
      const phaseDays = completedEntries.filter(({ day }) => {
        const p = day <= 10 ? 1 : day <= 20 ? 2 : 3
        return p === phase
      })
      const totalPossible = 10
      return {
        phase,
        completed: phaseDays.length,
        total: totalPossible,
        percent: Math.round((phaseDays.length / totalPossible) * 100),
        avgPerWeek: phaseDays.length > 0 ? (phaseDays.length / 4).toFixed(1) : 0,
      }
    })

    // Workout history for this program
    const calisthenieWorkouts = workoutHistory.filter(w => w.type === 'calisthenie30')
    const totalCalories = calisthenieWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0)
    const totalDuration = calisthenieWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)

    // Streak analysis
    let maxStreak = 0
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(startDate)
      checkDate.setDate(checkDate.getDate() + i)
      checkDate.setHours(0, 0, 0, 0)
      const dayNum = i + 1
      if (completedDays[dayNum] || completedDays[String(dayNum)]) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }

    // Consistency score
    const daysSinceStart = Math.floor((today - startDate) / 86400000) + 1
    const expectedDays = Math.min(daysSinceStart, 30)
    const consistency = expectedDays > 0 ? Math.round((completedEntries.length / expectedDays) * 100) : 0

    return {
      weeklyData,
      monthlyData,
      phaseStats,
      totalDays: completedEntries.length,
      totalCalories,
      totalDuration,
      maxStreak,
      consistency,
      daysSinceStart: Math.min(daysSinceStart, 30),
      startDate: calisthenie30.startDate,
    }
  }, [calisthenie30, workoutHistory])

  if (!bilan) return null

  return (
    <div className="space-y-3">
      {/* Overall Summary */}
      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-lime" />
          <span className="text-white font-semibold text-xs">Bilan Global</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-dark-bg rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Target size={12} className="text-lime" />
              <span className="text-muted text-[10px]">Progression</span>
            </div>
            <p className="text-white font-bold text-lg">{bilan.totalDays}/30</p>
            <p className="text-lime text-[10px]">{Math.round((bilan.totalDays / 30) * 100)}% complété</p>
          </div>
          <div className="bg-dark-bg rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={12} className="text-orange-400" />
              <span className="text-muted text-[10px]">Régularité</span>
            </div>
            <p className="text-white font-bold text-lg">{bilan.consistency}%</p>
            <p className="text-orange-400 text-[10px]">{bilan.daysSinceStart} jours écoulés</p>
          </div>
          <div className="bg-dark-bg rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame size={12} className="text-red-400" />
              <span className="text-muted text-[10px]">Meilleure série</span>
            </div>
            <p className="text-white font-bold text-lg">{bilan.maxStreak}j</p>
            <p className="text-red-400 text-[10px]">jours d'affilée max</p>
          </div>
          <div className="bg-dark-bg rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={12} className="text-blue-400" />
              <span className="text-muted text-[10px]">Temps total</span>
            </div>
            <p className="text-white font-bold text-lg">{bilan.totalDuration}min</p>
            <p className="text-blue-400 text-[10px]">{bilan.totalCalories} cal brûlées</p>
          </div>
        </div>

        {/* Consistency Bar */}
        <div className="bg-dark-bg rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-muted text-[10px]">Régularité vs objectif</span>
            <span className="text-lime text-[10px] font-medium">{bilan.consistency}%</span>
          </div>
          <div className="h-2 bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-lime transition-all duration-500"
              style={{ width: `${Math.min(bilan.consistency, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phase Comparison */}
      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-lime" />
          <span className="text-white font-semibold text-xs">Comparaison des Phases</span>
        </div>

        <div className="space-y-3">
          {bilan.phaseStats.map((ps) => {
            const phase = PHASES.find(p => p.id === ps.phase)
            return (
              <div key={ps.phase}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{phase.emoji}</span>
                    <span className="text-white text-xs font-medium">{phase.name}</span>
                    <span className="text-muted text-[9px]">({phase.timing})</span>
                  </div>
                  <span className={`text-[10px] font-medium text-${phase.color}`}>
                    {ps.completed}/{ps.total} · {ps.percent}%
                  </span>
                </div>
                <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-${phase.color} transition-all duration-500`}
                    style={{ width: `${ps.percent}%` }}
                  />
                </div>
                {ps.completed > 0 && (
                  <p className="text-muted text-[9px] mt-0.5">
                    ~{ps.avgPerWeek} jours/semaine cette phase
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'weekly' ? null : 'weekly')}
          className="w-full p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-lime" />
            <span className="text-white font-semibold text-xs">Détail Hebdomadaire</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-muted transition-transform ${expandedSection === 'weekly' ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSection === 'weekly' && (
          <div className="px-4 pb-4 space-y-2">
            {Object.entries(bilan.weeklyData).sort(([a], [b]) => a - b).map(([week, data]) => (
              <div key={week} className="bg-dark-bg rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-xs font-medium">Semaine {week}</span>
                  <span className="text-lime text-[10px]">{data.totalDays} jours</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map(day => {
                    const dayInWeek = (parseInt(week) - 1) * 7 + day
                    const isCompleted = completedDays?.[dayInWeek] || completedDays?.[String(dayInWeek)]
                    const phase = dayInWeek <= 10 ? 1 : dayInWeek <= 20 ? 2 : 3
                    const phaseColor = phase === 1 ? 'bg-green-400' : phase === 2 ? 'bg-yellow-400' : 'bg-red-400'

                    return (
                      <div
                        key={day}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-bold ${
                          isCompleted
                            ? `${phaseColor} text-dark-bg`
                            : 'bg-dark-card border border-dark-border text-muted'
                        }`}
                      >
                        {isCompleted ? '✓' : dayInWeek}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {Object.keys(bilan.weeklyData).length === 0 && (
              <p className="text-muted text-xs text-center py-3">Aucune donnée hebdomadaire</p>
            )}
          </div>
        )}
      </div>

      {/* Monthly Summary */}
      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'monthly' ? null : 'monthly')}
          className="w-full p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-lime" />
            <span className="text-white font-semibold text-xs">Résumé Mensuel</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-muted transition-transform ${expandedSection === 'monthly' ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSection === 'monthly' && (
          <div className="px-4 pb-4 space-y-2">
            {Object.entries(bilan.monthlyData).map(([month, data]) => (
              <div key={month} className="bg-dark-bg rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-xs font-medium capitalize">{month}</p>
                  <p className="text-muted text-[10px]">{data.totalDays} jours complétés</p>
                </div>
                <div className="text-right">
                  <p className="text-lime font-bold text-sm">{data.totalDays}</p>
                  <p className="text-muted text-[9px]">jours</p>
                </div>
              </div>
            ))}
            {Object.keys(bilan.monthlyData).length === 0 && (
              <p className="text-muted text-xs text-center py-3">Aucune donnée mensuelle</p>
            )}
          </div>
        )}
      </div>

      {/* Start Date Info */}
      <div className="bg-dark-card rounded-2xl p-3 border border-dark-border">
        <div className="flex items-center justify-between">
          <span className="text-muted text-[10px]">Début du challenge</span>
          <span className="text-white text-[10px] font-medium">
            {new Date(bilan.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  )
}
