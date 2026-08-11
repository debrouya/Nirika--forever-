import { feedbackSystem } from './feedback'
import { programs } from '../data/programs'

const WORKOUTS = {
  strength: { name: 'Haut du corps', duration: 45, exercises: 'Développé couché, Rowing, Press épaules', why: 'force' },
  muscle: { name: 'Full body hypertrophie', duration: 50, exercises: 'Squat, Développé, Tractions, Curl', why: 'volume' },
  weight_loss: { name: 'HIIT + Cardio', duration: 35, exercises: 'Burpees, Mountain climbers, Jumping jacks', why: 'calories' },
  cardio: { name: 'Endurance', duration: 40, exercises: 'Course, Vélo, Rameur', why: 'cardio' },
  general: { name: 'Full body équilibré', duration: 40, exercises: 'Squat, Pompes, Planche, Fentes', why: 'global' },
}

const REASONS = {
  force: "Tu progresses en force — continuons avec du lourd.",
  volume: "L'hypertrophie demande du volume — 3 séries de 10-12 reps.",
  calories: "On brûle aujourd'hui — rythme soutenu, peu de repos.",
  cardio: "Travail d'endurance — allure constante, respiration contrôlée.",
  global: "Séance équilibrée pour tout le corps — parfait pour ta progression.",
}

export function getWorkoutRecommendation(userGoal) {
  if (!userGoal) return null
  const workout = WORKOUTS[userGoal.type] || WORKOUTS.general
  return {
    ...workout,
    reason: REASONS[workout.why] || REASONS.global,
    adapted: userGoal.level === 'debutant' ? `${workout.duration - 5} min` : userGoal.level === 'avance' ? `${workout.duration + 10} min` : `${workout.duration} min`,
  }
}

const GOAL_TO_PROGRAM = {
  strength: 'force',
  muscle: 'masse',
  weight_loss: 'perte_poids',
  cardio: 'endurance',
}

export function getProgramRecommendation(userGoal) {
  if (!userGoal) return null
  const programGoal = GOAL_TO_PROGRAM[userGoal.type]
  if (!programGoal) return null

  const candidates = programs.filter(p =>
    p.goals?.includes(programGoal) &&
    (!p.level || p.level === (userGoal.level === 'avance' ? 'avance' : p.level === 'intermediaire' ? 'intermediaire' : 'debutant'))
  )

  if (!candidates.length) {
    const fallback = programs.filter(p => p.goals?.includes(programGoal))
    if (fallback.length) return fallback[0]
    return null
  }

  const exact = candidates.find(p => p.level === userGoal.level)
    || candidates.find(p => !p.level || p.level === 'debutant')
    || candidates[0]

  return exact
}
