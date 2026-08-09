export function getCockpitMode({ activeSession, workoutType, isCoach }) {
  if (isCoach) return 'coach'
  if (!activeSession) return 'default'
  if (workoutType === 'cardio') return 'cardio'
  if (workoutType === 'strength') return 'exercise'
  if (workoutType === 'program') return 'program'
  return 'default'
}

export function getIntensity(bpm = 0) {
  if (bpm > 150) return 1
  if (bpm > 100) return 0.7
  if (bpm > 70) return 0.4
  return 0.2
}
