import { useMemo } from 'react'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function WeekChart({ sessions = [] }) {
  const { bars, activeCount, totalSessions } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dayOfWeek = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - dayOfWeek)

    const dayCounts = new Map()
    sessions.forEach((s) => {
      try {
        const d = new Date(s.completedAt || s.date || s.endedAt || s.startedAt)
        if (isNaN(d)) return
        d.setHours(0, 0, 0, 0)
        if (d >= monday) {
          const key = d.toISOString().slice(0, 10)
          dayCounts.set(key, (dayCounts.get(key) || 0) + 1)
        }
      } catch {}
    })

    const bars = []
    let activeCount = 0
    let totalSessions = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      const count = dayCounts.get(key) || 0
      if (count > 0) activeCount++
      totalSessions += count
      bars.push({
        label: DAY_LABELS[i],
        count,
        height: count > 0 ? Math.min(4 + count * 16, 44) : 4,
        isToday: d.getTime() === today.getTime(),
        isFuture: d > today,
      })
    }
    return { bars, activeCount, totalSessions }
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
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
          Activité 7 jours
        </span>
        <span style={{ fontSize: 11, color: '#7ED957', fontWeight: 600 }}>
          {activeCount}/7
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 52 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%',
              maxWidth: 18,
              height: b.height,
              borderRadius: 6,
              background: b.count > 0
                ? (b.isToday ? '#7ED957' : 'rgba(126,217,87,.8)')
                : 'rgba(255,255,255,.08)',
              opacity: b.isFuture ? 0.3 : 1,
              transition: 'height .5s ease',
            }} />
            <span style={{
              fontSize: 9,
              color: b.isToday ? '#7ED957' : 'rgba(255,255,255,.25)',
              fontWeight: b.isToday ? 600 : 400,
            }}>
              {b.label}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,.2)' }}>
        {totalSessions} séance{totalSessions > 1 ? 's' : ''} cette semaine
      </div>
    </div>
  )
}