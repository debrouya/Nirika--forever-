import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Heart,
  Flame,
  Clock,
  Calendar as CalendarIcon,
} from 'lucide-react'
import useStore from '../store/useStore'
import GlassCard from './GlassCard'
import YearHeatmap from './YearHeatmap'

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

export default function Calendar() {
  const { sessionHistory, workoutHistory, calisthenie30 } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const allSessions = useMemo(() => {
    const combined = []
    ;(sessionHistory || []).forEach((s) => {
      combined.push({
        ...s,
        _type: 'exercise',
        date: s.date || s.startedAt || s.completedAt,
      })
    })
    ;(workoutHistory || []).forEach((w) => {
      combined.push({
        ...w,
        _type: w.type === 'cardio' ? 'cardio' : 'exercise',
        date: w.completedAt || w.date,
      })
    })
    return combined
  }, [sessionHistory, workoutHistory])

  const sessionsByDay = useMemo(() => {
    const map = {}
    allSessions.forEach((s) => {
      const d = new Date(s.date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        if (!map[day]) map[day] = []
        map[day].push(s)
      }
    })
    return map
  }, [allSessions, year, month])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const calendarDays = useMemo(() => {
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [firstDay, daysInMonth])

  const monthStats = useMemo(() => {
    let totalSessions = 0
    let totalDuration = 0
    let totalCalories = 0
    Object.values(sessionsByDay).forEach((daySessions) => {
      totalSessions += daySessions.length
      daySessions.forEach((s) => {
        totalDuration += s.duration || s.durationMinutes || 0
        totalCalories += s.calories || 0
      })
    })
    return { totalSessions, totalDuration, totalCalories }
  }, [sessionsByDay])

  const selectedSessions = useMemo(() => {
    if (!selectedDay) return []
    return sessionsByDay[selectedDay] || []
  }, [sessionsByDay, selectedDay])

  const recentSessions = useMemo(() => {
    return allSessions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
  }, [allSessions])

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  return (
    <div className="space-y-4 p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={goToPrevMonth} className="text-white/40 hover:text-white transition-colors p-2">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-white font-bold text-base">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button onClick={goToNextMonth} className="text-white/40 hover:text-white transition-colors p-2">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-3 gap-2">
        <GlassCard className="p-2 text-center">
          <Dumbbell size={12} className="text-mint-400 mx-auto mb-1" />
          <p className="text-white font-bold text-sm">{monthStats.totalSessions}</p>
          <p className="text-white/30 text-[9px]">Séances</p>
        </GlassCard>
        <GlassCard className="p-2 text-center">
          <Clock size={12} className="text-blue-400 mx-auto mb-1" />
          <p className="text-white font-bold text-sm">{monthStats.totalDuration}</p>
          <p className="text-white/30 text-[9px]">Minutes</p>
        </GlassCard>
        <GlassCard className="p-2 text-center">
          <Flame size={12} className="text-orange-400 mx-auto mb-1" />
          <p className="text-white font-bold text-sm">{monthStats.totalCalories}</p>
          <p className="text-white/30 text-[9px]">Calories</p>
        </GlassCard>
      </div>

      {/* Calendar Grid */}
      <GlassCard className="p-3">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-white/30 text-[10px] font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) return <div key={`empty-${index}`} />

            const daySessions = sessionsByDay[day] || []
            const hasExercise = daySessions.some((s) => s._type === 'exercise')
            const hasCardio = daySessions.some((s) => s._type === 'cardio')
            const isSelected = selectedDay === day
            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === day

            // 30-Day Calisthenics tracking
            const isCalisthenieDay = (() => {
              if (!calisthenie30.startDate) return false
              const start = new Date(calisthenie30.startDate)
              const current = new Date(year, month, day)
              const diff = Math.floor((current - start) / 86400000) + 1
              return diff >= 1 && diff <= 30
            })()

            const calisthenieDay = (() => {
              if (!calisthenie30.startDate) return 0
              const start = new Date(calisthenie30.startDate)
              const current = new Date(year, month, day)
              return Math.floor((current - start) / 86400000) + 1
            })()

            const isCalisthenieCompleted = calisthenie30.completedDays?.[calisthenieDay] || calisthenie30.completedDays?.[String(calisthenieDay)]

            const calistheniePhase = calisthenieDay <= 10 ? 1 : calisthenieDay <= 20 ? 2 : 3
            const phaseColor = calistheniePhase === 1 ? 'bg-green-400' : calistheniePhase === 2 ? 'bg-yellow-400' : 'bg-red-400'

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                  isSelected
                    ? 'bg-mint-500/30 border border-mint-500/50'
                    : isCalisthenieCompleted
                      ? `${phaseColor}/20 border border-${phaseColor}/50`
                      : isToday
                        ? 'bg-white/10 border border-white/20'
                        : isCalisthenieDay
                          ? 'bg-dark-bg/50 border border-dark-border'
                          : 'hover:bg-white/5'
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    isToday ? 'text-mint-400' : isSelected ? 'text-white' : isCalisthenieCompleted ? 'text-white' : 'text-white/60'
                  }`}
                >
                  {day}
                </span>
                {isCalisthenieCompleted && (
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-lime" />
                )}
                {!isCalisthenieCompleted && daySessions.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {hasExercise && (
                      <div className="w-1.5 h-1.5 rounded-full bg-mint-400" />
                    )}
                    {hasCardio && (
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </GlassCard>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-mint-400" />
          <span className="text-white/40 text-[10px]">Exercice</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-pink-400" />
          <span className="text-white/40 text-[10px]">Cardio</span>
        </div>
        {calisthenie30.startDate && (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white/40 text-[10px]">Phase 1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-white/40 text-[10px]">Phase 2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-white/40 text-[10px]">Phase 3</span>
            </div>
          </>
        )}
      </div>

      {/* Selected day sessions */}
      {selectedDay && (
        <GlassCard className="p-4 space-y-3">
          <p className="text-white/50 text-[10px] uppercase tracking-wide">
            {selectedDay} {MONTH_NAMES[month]}
          </p>
          {selectedSessions.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-3">Aucune séance ce jour</p>
          ) : (
            <div className="space-y-2">
              {selectedSessions.map((s, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      s._type === 'cardio' ? 'bg-pink-500/20' : 'bg-mint-500/20'
                    }`}
                  >
                    {s._type === 'cardio' ? (
                      <Heart size={14} className="text-pink-400" />
                    ) : (
                      <Dumbbell size={14} className="text-mint-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs font-medium">
                      {s.exerciseName || s.activityName || 'Séance'}
                    </p>
                    <p className="text-white/30 text-[10px]">
                      {s.duration || s.durationMinutes || 0} min · {s.calories || 0} kcal
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Year Heatmap */}
      <YearHeatmap />

      {/* Recent sessions */}
      <GlassCard className="p-4">
        <p className="text-white/50 text-[10px] uppercase tracking-wide mb-3">Sessions récentes</p>
        <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
          {recentSessions.length === 0 && (
            <p className="text-white/30 text-xs text-center py-4">Aucune session</p>
          )}
          {recentSessions.map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  s._type === 'cardio' ? 'bg-pink-500/20' : 'bg-mint-500/20'
                }`}
              >
                {s._type === 'cardio' ? (
                  <Heart size={14} className="text-pink-400" />
                ) : (
                  <Dumbbell size={14} className="text-mint-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {s.exerciseName || s.activityName || 'Séance'}
                </p>
                <p className="text-white/30 text-[10px]">
                  {new Date(s.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-white text-xs font-bold">{s.calories || 0} kcal</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
