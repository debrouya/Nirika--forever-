export function getPR(history, exerciseId) {
  const list = history[exerciseId] || []
  return list.reduce((max, x) => Math.max(max, x.weight || 0), 0)
}

export function getVolume(sets) {
  return sets.reduce((sum, s) => sum + s.w * s.r, 0)
}

export function getStreakUnified(workoutHistory, sessionHistory) {
  const all = [...workoutHistory, ...sessionHistory]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dates = new Set(all.map(s => { try { const d = new Date(s.completedAt || s.date || s.endedAt || s.startedAt); if (isNaN(d)) return null; d.setHours(0,0,0,0); return d.getTime() } catch { return null } }).filter(Boolean))
  let streak = 0; let check = new Date(today)
  for (let i = 0; i < 365; i++) { if (dates.has(check.getTime())) { streak++; check.setDate(check.getDate()-1) } else break }
  return streak
}
