export function getAISuggestion(state) {
  const { activeSession, activeProgram } = state

  if (activeSession) return analyzeLiveSession(state)
  if (activeProgram) return analyzeProgram(state)
  return getDailySuggestion(state)
}

function analyzeLiveSession(state) {
  const sets = state.sets || state.activeSession?.sets || []
  if (!sets.length) return { type: 'start', message: 'Commence léger', action: 'start' }
  const last = sets[sets.length - 1]
  if (last.r < 6) return { type: 'fatigue', message: 'Réduis la charge', action: 'reduce_weight' }
  if (last.r > 12) return { type: 'easy', message: 'Ajoute du poids', action: 'increase_weight' }
  return { type: 'optimal', message: 'Parfait, continue', action: 'keep' }
}

function analyzeProgram(state) {
  return { type: 'program', message: `Jour ${(state.activeProgram.currentDay || 0) + 1}`, action: 'continue' }
}

function getDailySuggestion(state) {
  if (!state.workoutHistory?.length) return { type: 'start', message: "Commence aujourd'hui", action: 'start' }
  return { type: 'recovery', message: 'Travaille le haut du corps', action: 'suggest_upper' }
}
