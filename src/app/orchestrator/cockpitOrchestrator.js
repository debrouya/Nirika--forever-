import { getNextExercise } from '../../domain/program/programEngine'

export function handleCockpitTap(state, actions) {
  if (state.activeProgram) {
    return handleProgramFlow(state, actions)
  }
  if (state.activeSession) {
    return actions.resumeSession?.() || actions.setCurrentView?.('session')
  }
  return actions.startSession?.() || actions.setCurrentView?.('calisthenics')
}

function handleProgramFlow(state, actions) {
  const result = getNextExercise(state.activeProgram)
  if (!result) return
  if (result.type === 'exercise') return actions.nextProgramExercise?.()
  if (result.type === 'day') return actions.completeProgramDay?.()
  if (result.type === 'end') return actions.endProgram?.()
}
