export function getPR(history, exerciseId) {
  const list = history[exerciseId] || []
  return list.reduce((max, x) => Math.max(max, x.weight || 0), 0)
}

export function getTotalVolume(workoutHistory, sessionHistory) {
  return [...workoutHistory, ...sessionHistory].reduce((sum, s) => sum + (s.totalVolume || s.calories || 0), 0)
}

export function getWeeklySessions(workoutHistory, sessionHistory) {
  const weekAgo = new Date(Date.now() - 7 * 86400000)
  return [...workoutHistory, ...sessionHistory].filter(s => {
    try { return new Date(s.completedAt || s.date || s.endedAt || s.startedAt) >= weekAgo } catch { return false }
  }).length
}

export function getTotalDuration(workoutHistory, sessionHistory) {
  return [...workoutHistory, ...sessionHistory].reduce((sum, s) => sum + (s.duration || (s.durationMinutes || 0) * 60 || 0), 0)
}
