import { getNextExercise } from '../../domain/program/programEngine'
import { getAISuggestion } from '../../domain/ai/aiEngine'

export function handleCockpitTap(state, actions) {
  const ai = getAISuggestion(state)

  if (ai.action === 'increase_weight') return actions.adjustWeight?.(+2)
  if (ai.action === 'reduce_weight') return actions.adjustWeight?.(-2)
  if (ai.action === 'start') return actions.startSession?.() || actions.setCurrentView?.('calisthenics')

  if (state.activeProgram) {
    const result = getNextExercise(state.activeProgram)
    if (result?.type === 'exercise') return actions.nextProgramExercise?.()
    if (result?.type === 'day') return actions.completeProgramDay?.()
    if (result?.type === 'end') return actions.endProgram?.()
  }

  return actions.startSession?.() || actions.setCurrentView?.('calisthenics')
}
