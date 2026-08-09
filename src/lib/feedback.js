export const feedbackSystem = {
  states: {
    adaptation: { color: '#7ED957', label: 'Construction', message: 'Tu construis ta base' },
    intensity: { color: '#facc15', label: 'Montée', message: 'Tu montes en puissance' },
    performance: { color: '#f97316', label: 'Dépassement', message: 'Tu dépasses tes limites' },
  },
  milestones: {
    3: "Tu t'es lancé",
    7: 'Discipline enclenchée',
    14: 'Transformation en cours',
    30: 'Nouvelle version de toi',
  },
}

export function getStreakState(streak = 0) {
  if (!streak || streak < 0) return 'adaptation'
  if (streak >= 14) return 'performance'
  if (streak >= 7) return 'intensity'
  return 'adaptation'
}

export function getMilestone(streak) {
  const days = Object.keys(feedbackSystem.milestones).map(Number).sort((a,b) => b-a)
  for (const d of days) {
    if (streak >= d) return feedbackSystem.milestones[d]
  }
  return null
}
