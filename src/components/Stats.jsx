import { useMemo, useState } from 'react'
import {
  Flame,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import useStore from '../store/useStore'

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export default function Stats({ isPremium, onShowPaywall }) {
  const { sessionHistory, workoutHistory } = useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const allSessions = useMemo(() => {
    const combined = [
      ...(sessionHistory || []).map((s) => ({
        ...s,
        _type: 'exercise',
        date: s.date || s.startedAt || s.completedAt,
      })),
      ...(workoutHistory || []).map((w) => ({
        ...w,
        _type: w.type === 'cardio' ? 'cardio' : 'exercise',
        date: w.completedAt || w.date,
      })),
    ]
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [sessionHistory, workoutHistory])

  const totalCalories = allSessions.reduce((sum, s) => sum + (s.calories || 0), 0)
  const totalDuration = allSessions.reduce((sum, s) => sum + (s.duration || s.durationMinutes || 0), 0)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const calendarDays = useMemo(() => {
    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const count = allSessions.filter((s) => {
        const sd = new Date(s.date)
        return sd.toISOString().slice(0, 10) === dateStr
      }).length
      days.push({
        day: d,
        date: dateStr,
        count,
        isToday: today.getDate() === d && today.getMonth() === month && today.getFullYear() === year,
      })
    }
    return days
  }, [year, month, daysInMonth, firstDay, allSessions])

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  return (
    <div className="space-y-6 p-4">
      {/* Title */}
      <h1 className="text-white font-bold text-2xl">Stats</h1>

      {/* Calendar */}
      <div className="bg-dark-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1">
            <ChevronLeft size={20} className="text-muted" />
          </button>
          <span className="text-white font-semibold text-sm">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1">
            <ChevronRight size={20} className="text-muted" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-muted text-[10px] font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, i) => {
            if (!item.day) return <div key={`empty-${i}`} />
            const isWeekend = new Date(year, month, item.day).getDay() === 0 || new Date(year, month, item.day).getDay() === 6
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                  item.isToday
                    ? 'bg-lime text-dark-bg font-bold'
                    : item.count > 0
                    ? 'bg-lime/20 text-lime'
                    : isWeekend
                    ? 'text-muted/50'
                    : 'text-white/70'
                }`}
              >
                {item.day}
              </div>
            )
          })}
        </div>
      </div>

      {/* Result */}
      <div>
        <h2 className="text-white font-semibold text-lg mb-3">Result</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Calories */}
          <div className="bg-dark-card rounded-2xl p-4">
            <Flame size={28} className="text-lime mb-3" />
            <span className="text-white text-3xl font-bold block">{totalCalories.toLocaleString()}</span>
            <span className="text-muted text-sm">Calories</span>
          </div>

          {/* Duration + Focus */}
          <div className="bg-dark-card rounded-2xl p-4">
            <Dumbbell size={28} className="text-lime mb-3" />
            <span className="text-white text-3xl font-bold block">{totalDuration} min</span>
            <span className="text-muted text-sm">Focus Zone</span>
            <span className="text-white text-sm font-semibold block">Full Body</span>
          </div>
        </div>
      </div>

      {/* Mini Bar Chart */}
      {allSessions.length > 0 && (
        <div className="bg-dark-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-lime" />
            <span className="text-muted text-xs uppercase tracking-wide">Activité récente</span>
          </div>
          <div className="flex items-end gap-1 h-24">
            {allSessions.slice(0, 14).reverse().map((s, i) => {
              const h = Math.min(100, Math.max(8, (s.calories || 50) / 30))
              return (
                <div
                  key={i}
                  className="flex-1 bg-lime/30 rounded-t-sm transition-all"
                  style={{ height: `${h}%` }}
                />
              )
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-muted text-[9px]">Il y a 2 semaines</span>
            <span className="text-muted text-[9px]">Aujourd'hui</span>
          </div>
        </div>
      )}
    </div>
  )
}
