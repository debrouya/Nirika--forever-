export function calculate1RM(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

export function calculateVolume(sets) {
  if (!Array.isArray(sets)) return 0
  return sets.reduce((total, set) => {
    const reps = typeof set.reps === 'string' ? parseInt(set.reps, 10) || 0 : set.reps || 0
    const weight = set.weight || 0
    return total + reps * weight
  }, 0)
}

export function calculateDensity(duration, sets) {
  if (!duration || duration <= 0 || !sets || sets <= 0) return 0
  const minutes = duration / 60
  return minutes > 0 ? Math.round((sets / minutes) * 100) / 100 : 0
}

export function detectPlateau(history) {
  if (!Array.isArray(history) || history.length < 4) return false

  const recent = history.slice(-6)
  const volumes = recent.map((entry) => {
    if (entry.sets) return calculateVolume(entry.sets)
    return entry.volume || 0
  })

  if (volumes.length < 4) return false

  const lastFour = volumes.slice(-4)
  const average = lastFour.reduce((a, b) => a + b, 0) / lastFour.length

  const hasVariation = lastFour.some(
    (v) => Math.abs(v - average) / average > 0.05
  )

  return !hasVariation
}

export function getProgressionData(history) {
  if (!Array.isArray(history) || history.length === 0) return []

  return history.map((entry, index) => {
    const volume = entry.sets ? calculateVolume(entry.sets) : entry.volume || 0
    const sets = entry.sets || []
    const totalReps = sets.reduce((sum, s) => {
      const reps = typeof s.reps === 'string' ? parseInt(s.reps, 10) || 0 : s.reps || 0
      return sum + reps
    }, 0)
    const maxWeight = Math.max(...sets.map((s) => s.weight || 0), 0)
    const estimated1RM =
      maxWeight > 0 && totalReps > 0
        ? calculate1RM(maxWeight, Math.round(totalReps / sets.length))
        : 0

    return {
      index,
      date: entry.completedAt || entry.date || null,
      volume,
      maxWeight,
      estimated1RM,
      sets: sets.length,
      totalReps,
    }
  })
}
