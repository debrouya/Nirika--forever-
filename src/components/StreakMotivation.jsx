import { useState, useEffect, useCallback, useMemo } from 'react'
import useStore from '../store/useStore'

const MESSAGES_BY_STREAK = {
  0: [
    "Reprends aujourd'hui 💪",
    "Nouveau départ 🚀",
    "On commence 💥",
  ],
  1: [
    "Premier jour ✅",
    "C'est parti 🔥",
    "Bien joué 👏",
  ],
  2: [
    "Deux jours 🔥",
    "Continue 💪",
    "En forme 🎯",
  ],
  3: [
    "Trois jours d'affilée 🔥",
    "Tu es en feu 🏆",
    "Impressionnant 💪",
  ],
  5: [
    "5 jours ! 🔥🔥",
    "Tu es en feu 🔥",
    "Inarrêtable 💪",
  ],
  7: [
    "Objectif atteint 🎯",
    "Une semaine entière 🏆",
    "Légende 🔥🔥🔥",
  ],
  14: [
    "Deux semaines 💪🏆",
    "Niveau supérieur 🚀",
    "Phénoménal 🎯",
  ],
  21: [
    "Trois semaines ! 🔥",
    "Champion 🏆",
    "Record battu 📈",
  ],
  30: [
    "Un mois complet 🏆🔥",
    "Discipline totale 💪",
    "Habitude acquise 🎯",
  ],
}

function getMotivationMessage(streak) {
  const keys = Object.keys(MESSAGES_BY_STREAK).map(Number).sort((a, b) => b - a)
  const key = keys.find(k => streak >= k) || 0
  const messages = MESSAGES_BY_STREAK[key]
  return messages[Math.floor(Math.random() * messages.length)]
}

function getWeekDays() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + mondayOffset + i)
    d.setHours(0, 0, 0, 0)
    days.push(d)
  }
  return days
}

export default function StreakMotivation() {
  const { workoutHistory, getStreak } = useStore()
  const [toast, setToast] = useState(null)
  const [lastShown, setLastShown] = useState(0)

  const streak = getStreak()

  const weekDays = useMemo(() => {
    const days = getWeekDays()
    const completedDates = new Set(
      workoutHistory.map(w => {
        const d = new Date(w.completedAt)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
      })
    )
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return days.map(d => ({
      date: d,
      completed: completedDates.has(d.getTime()),
      isToday: d.getTime() === today.getTime(),
      isPast: d.getTime() < today.getTime(),
    }))
  }, [workoutHistory])

  const daysCompletedThisWeek = weekDays.filter(d => d.completed).length

  const showToast = useCallback((force = false) => {
    const now = Date.now()
    if (!force && now - lastShown < 30000) return
    if (toast) return

    const msg = getMotivationMessage(streak)
    setToast(msg)
    setLastShown(now)

    setTimeout(() => setToast(null), 2800)
  }, [streak, lastShown, toast])

  useEffect(() => {
    if (streak > 0) {
      const t = setTimeout(() => showToast(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    const handler = () => showToast(true)
    window.addEventListener('streak-session-completed', handler)
    return () => window.removeEventListener('streak-session-completed', handler)
  }, [showToast])

  if (streak === 0 && daysCompletedThisWeek === 0) {
    return (
      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
        <div>
          <p className="text-muted text-xs mb-0.5">Série active</p>
          <p className="text-white font-bold text-lg">Commence aujourd'hui</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Streak Card */}
      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="text-white font-bold text-lg">
              {streak} jour{streak > 1 ? 's' : ''} d'affilée
            </span>
          </div>
          <span className="text-lime text-xs font-medium">
            {daysCompletedThisWeek}/7
          </span>
        </div>

        {/* Week Circles */}
        <div className="flex justify-between items-center px-1">
          {weekDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className={`text-[9px] font-medium ${
                day.isToday ? 'text-lime' : 'text-muted'
              }`}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
              </span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                day.completed
                  ? 'bg-lime shadow-[0_0_8px_rgba(198,255,0,0.4)]'
                  : day.isToday
                    ? 'bg-lime/15 border border-lime/40'
                    : day.isPast
                      ? 'bg-dark-bg border border-dark-border'
                      : 'bg-dark-bg border border-dark-border'
              }`}>
                {day.completed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {day.isToday && !day.completed && (
                  <div className="w-1.5 h-1.5 rounded-full bg-lime/60" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast Message */}
      {toast && (
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            className="px-4 py-2.5 rounded-full border border-lime/30 shadow-[0_4px_20px_rgba(198,255,0,0.15)] backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(198,255,0,0.12) 0%, rgba(198,255,0,0.06) 100%)',
              animation: 'toast-in 0.25s ease-out forwards',
            }}
          >
            <span className="text-white text-sm font-semibold whitespace-nowrap">{toast}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function fireStreakToast() {
  window.dispatchEvent(new Event('streak-session-completed'))
}
