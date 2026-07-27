export const cardioActivities = [
  {
    id: 'velo',
    name: 'Vélo Stationnaire',
    icon: '🚴',
    met: 8.0,
    color: '#10B981',
    levelConfig: {
      type: 'resistance',
      min: 1,
      max: 10,
      step: 1,
      default: 5,
    },
  },
  {
    id: 'tapis',
    name: 'Course à Pied',
    icon: '🏃',
    met: 9.8,
    color: '#3B82F6',
    levelConfig: {
      type: 'speed',
      min: 5,
      max: 20,
      step: 0.5,
      default: 8,
    },
  },
  {
    id: 'rameur',
    name: 'Rameur',
    icon: '🚣',
    met: 7.0,
    color: '#8B5CF6',
    levelConfig: {
      type: 'resistance',
      min: 1,
      max: 10,
      step: 1,
      default: 5,
    },
  },
  {
    id: 'corde',
    name: 'Corde à Sauter',
    icon: '⚡',
    met: 12.3,
    color: '#F59E0B',
    levelConfig: {
      type: 'speed',
      min: 1,
      max: 10,
      step: 1,
      default: 5,
    },
  },
  {
    id: 'elliptique',
    name: 'Elliptique',
    icon: '🔄',
    met: 5.0,
    color: '#EC4899',
    levelConfig: {
      type: 'dual',
      min: 1,
      max: 10,
      step: 1,
      default: 5,
    },
  },
  {
    id: 'natation',
    name: 'Natation',
    icon: '🏊',
    met: 8.0,
    color: '#06B6D4',
    levelConfig: {
      type: 'speed',
      min: 1,
      max: 10,
      step: 1,
      default: 5,
    },
  },
  {
    id: 'marche',
    name: 'Marche Rapide',
    icon: '🚶',
    met: 4.3,
    color: '#84CC16',
    levelConfig: {
      type: 'incline',
      min: 0,
      max: 15,
      step: 0.5,
      default: 0,
    },
  },
  {
    id: 'stepper',
    name: 'Stepper',
    icon: '🪜',
    met: 9.0,
    color: '#F97316',
    levelConfig: {
      type: 'resistance',
      min: 1,
      max: 10,
      step: 1,
      default: 5,
    },
  },
  {
    id: 'aviron',
    name: 'Aviron',
    icon: '⛵',
    met: 7.0,
    color: '#6366F1',
    levelConfig: {
      type: 'resistance',
      min: 1,
      max: 10,
      step: 1,
      default: 5,
    },
  },
]

export function calculateCalories(met, weightKg, durationMinutes) {
  return Math.round((met * weightKg * durationMinutes) / 60)
}

export function getCaloriesPerMinute(met, weightKg) {
  return (met * weightKg) / 60
}
