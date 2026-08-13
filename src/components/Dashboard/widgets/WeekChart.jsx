import { useMemo } from 'react'

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function WeekChart({ sessions = [] }) {
  const { bars, activeCount } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dayOfWeek = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - dayOfWeek)

    const dateSet = new Set()
    sessions.forEach((s) => {
      try {
        const d = new Date(s.completedAt || s.date || s.endedAt || s.startedAt)
        if (isNaN(d)) return
        d.setHours(0, 0, 0, 0)
        if (d >= monday) dateSet.add(d.toISOString().slice(0, 10))
      } catch {}
    })

    const bars = []
    let activeCount = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      const active = dateSet.has(key)
      if (active) activeCount++
      bars.push({
        label: DAY_LABELS[i],
        active,
        isToday: d.getTime() === today.getTime(),
        isFuture: d > today,
      })
    }
    return { bars, activeCount }
  }, [sessions])

  return (
    <div style={{
      width: '100%',
      background: 'rgba(255,255,255,.03)',
      borderRadius: 16,
      padding: '14px 16px',
      backdropFilter: 'blur(20px)',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Activité 7 jours
        </span>
        <span style={{ fontSize: 11, color: '#7ED957', fontWeight: 600 }}>
          {activeCount}/7
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 44 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%',
              maxWidth: 18,
              height: b.active ? 36 : 4,
              borderRadius: 6,
              background: b.active
                ? (b.isToday ? '#7ED957' : 'rgba(126,217,87,.35)')
                : 'rgba(255,255,255,.04)',
              opacity: b.isFuture ? 0.3 : 1,
              transition: 'height .5s ease',
            }} />
            <span style={{
              fontSize: 9,
              color: b.isToday ? '#7ED957' : 'rgba(255,255,255,.2)',
              fontWeight: b.isToday ? 600 : 400,
            }}>
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}