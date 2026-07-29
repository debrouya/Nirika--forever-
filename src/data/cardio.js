export const cardioActivities = [
  {
    id: 'velo',
    name: 'Vélo Stationaire',
    icon: '🚴',
    image: '/images/cardio/velo.jpg',
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
    image: '/images/cardio/tapis.jpg',
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
    image: '/images/cardio/rameur.jpg',
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
    image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=300&fit=crop',
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
    image: '/images/cardio/elliptique.jpg',
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
    image: '/images/cardio/natation.jpg',
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
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=300&fit=crop',
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
    image: '/images/cardio/stepper.jpg',
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
]

export function calculateCalories(met, weightKg, durationMinutes) {
  return Math.round((met * weightKg * durationMinutes) / 60)
}

export function getCaloriesPerMinute(met, weightKg) {
  return (met * weightKg) / 60
}
