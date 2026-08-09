export function getNextExercise(program) {
  const { currentDay, currentStep, days } = program
  if (!days?.length) return null
  const day = days[currentDay]
  if (!day?.exercises) return null

  if (day.exercises[currentStep + 1]) {
    return { type: 'exercise', step: currentStep + 1, exercise: day.exercises[currentStep + 1] }
  }
  if (days[currentDay + 1]) {
    return { type: 'day', day: currentDay + 1, exercise: days[currentDay + 1].exercises[0] }
  }
  return { type: 'end' }
}
