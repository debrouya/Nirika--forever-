import { useMemo, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

export default function YearHeatmap() {
  const { workoutHistory, sessionHistory } = useStore()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const touchStart = useRef(null)

  const allSessions = useMemo(() => {
    const combined = []
    ;(workoutHistory || []).forEach(w => {
      combined.push({ date: w.completedAt || w.date, type: w.type || 'exercise' })
    })
    ;(sessionHistory || []).forEach(s => {
      combined.push({ date: s.date || s.startedAt || s.completedAt, type: 'exercise' })
    })
    return combined
  }, [workoutHistory, sessionHistory])

  const sessionsByDate = useMemo(() => {
    const map = {}
    allSessions.forEach(s => {
      const d = new Date(s.date)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      map[key] = (map[key] || 0) + 1
    })
    return map
  }, [allSessions])

  const days = getDaysInMonth(year, month)
  const startOffset = getFirstDayOfMonth(year, month)

  const monthSessions = useMemo(() => {
    let count = 0
    let activeDays = 0
    for (let d = 1; d <= days; d++) {
      const key = `${year}-${month}-${d}`
      if (sessionsByDate[key]) {
        count += sessionsByDate[key]
        activeDays++
      }
    }
    return { count, activeDays }
  }, [sessionsByDate, year, month, days])

  const maxPerDay = useMemo(() => {
    let max = 1
    for (let d = 1; d <= days; d++) {
      const key = `${year}-${month}-${d}`
      if (sessionsByDate[key] > max) max = sessionsByDate[key]
    }
    return max
  }, [sessionsByDate, year, month, days])

  const goPrev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const goNext = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
    touchStart.current = null
  }

  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear()

  const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  return (
    <div className="bg-dark-card rounded-2xl p-4">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goPrev} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <ChevronLeft size={18} className="text-muted" />
        </button>
        <div className="text-center">
          <p className="text-white font-bold text-base">
            {MONTH_NAMES[month]} {year}
          </p>
          <p className="text-muted text-[10px]">
            {monthSessions.count} séance{monthSessions.count > 1 ? 's' : ''} · {monthSessions.activeDays} jour{monthSessions.activeDays > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={goNext} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <ChevronRight size={18} className="text-muted" />
        </button>
      </div>

      {/* Swipeable heatmap grid */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-[3px] mb-1">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="text-center text-white/30 text-[10px] font-medium py-0.5">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-[3px]">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: days }).map((_, d) => {
            const day = d + 1
            const key = `${year}-${month}-${day}`
            const count = sessionsByDate[key] || 0
            const intensity = count === 0 ? 0 : Math.min(4, Math.ceil((count / maxPerDay) * 4))

            const colors = [
              'bg-white/5',
              'bg-lime/15',
              'bg-lime/30',
              'bg-lime/50',
              'bg-lime/70',
            ]

            const isToday = isCurrentMonth && day === now.getDate()

            return (
              <div
                key={day}
                className={`aspect-square rounded-md ${colors[intensity]} relative transition-colors ${
                  isToday ? 'ring-1 ring-lime/60' : ''
                }`}
                title={`${day} ${MONTH_NAMES[month]}: ${count} séance${count > 1 ? 's' : ''}`}
              >
                {isToday && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-lime">{day}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-white/30 text-[9px]">Moins</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={`w-3 h-3 rounded-sm ${['bg-white/5', 'bg-lime/15', 'bg-lime/30', 'bg-lime/50', 'bg-lime/70'][i]}`} />
        ))}
        <span className="text-white/30 text-[9px]">Plus</span>
      </div>
    </div>
  )
}
