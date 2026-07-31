const MUSCLE_GROUP_MAP = {
  Pectoraux: 'Pectoraux',
  Dos: 'Dos',
  Epaules: 'Epaules',
  Jambes: 'Jambes',
  Abdominaux: 'Abdominaux',
  Bras: 'Bras',
  Cardio: 'Cardio',
}

function normalizeExerciseHistory(history, exerciseId) {
  if (Array.isArray(history)) return history
  if (history && typeof history === 'object') return history[exerciseId] || []
  return []
}

function getRecordWeight(record) {
  return record?.weight || 0
}

function getRecordReps(record) {
  return record?.reps || 0
}

function getRecordVolume(record) {
  if (record?.totalVolume > 0) return record.totalVolume
  const weight = getRecordWeight(record)
  const reps = getRecordReps(record)
  const sets = record?.sets || 1
  return Math.round(weight * reps * sets * 10) / 10
}

function daysAgo(dateStr) {
  return (Date.now() - new Date(dateStr).getTime()) / 86400000
}

function sleepScore(quality) {
  const map = { 'Mauvais': 15, 'Moyen': 40, 'Bon': 65, 'Excellent': 85 }
  return map[quality] || 50
}

function moodScore(mood) {
  if (typeof mood === 'number') return Math.min(100, mood * 10)
  const map = { 'Mauvais': 15, 'Moyen': 40, 'Bon': 70, 'Excellent': 90 }
  return map[mood] || 50
}

function sorenessScore(soreness) {
  if (typeof soreness === 'number') return Math.max(0, 100 - soreness * 10)
  const map = { 'Aucune': 90, 'Faible': 70, 'Modérée': 50, 'Élevée': 30, 'Très élevée': 15 }
  return map[soreness] || 70
}

export function predict1RM(history, exerciseId) {
  const records = normalizeExerciseHistory(history, exerciseId)
  if (!records.length) return { estimatedRM: 0, bestSet: null, confidence: 0 }

  const thirtyDaysAgo = Date.now() - 30 * 86400000
  const recent = records.filter((r) => new Date(r.date || r.completedAt).getTime() > thirtyDaysAgo)
  const pool = recent.length >= 2 ? recent : records

  let bestRM = 0
  let bestSet = null

  pool.forEach((r) => {
    const w = getRecordWeight(r)
    const reps = getRecordReps(r)
    if (w <= 0 || reps <= 0) return
    const rm = w * (1 + reps / 30)
    if (rm > bestRM) {
      bestRM = rm
      bestSet = { weight: w, reps, date: r.date || r.completedAt }
    }
  })

  const sampleCount = Math.min(pool.length, 10)
  const recencyBonus = bestSet ? Math.max(0, 30 - daysAgo(bestSet.date)) / 30 : 0
  const confidence = Math.round(Math.min(100, sampleCount * 10 + recencyBonus * 20))

  return {
    estimatedRM: Math.round(bestRM * 10) / 10,
    bestSet,
    confidence,
  }
}

export function getRecoveryScore(fitMatrixData = {}, recentSessions = []) {
  const now = Date.now()
  const weekAgo = now - 7 * 86400000
  const sessions = Array.isArray(recentSessions)
    ? recentSessions.filter((s) => new Date(s.completedAt || s.date || s.startedAt).getTime() > weekAgo)
    : []

  const sessionCount = sessions.length
  const totalVolume = sessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0)

  let score = 50

  const sleepH = fitMatrixData?.sleepHours ? parseFloat(fitMatrixData.sleepHours) : null
  if (sleepH !== null && !isNaN(sleepH)) {
    score += Math.min(25, Math.max(-20, (sleepH - 7) * 10))
  } else if (fitMatrixData?.sleepQuality) {
    score += (sleepScore(fitMatrixData.sleepQuality) - 50) * 0.3
  }

  if (fitMatrixData?.mood !== undefined && fitMatrixData?.mood !== '') {
    score += (moodScore(fitMatrixData.mood) - 50) * 0.2
  }

  if (fitMatrixData?.waterIntake) {
    const waterL = parseFloat(fitMatrixData.waterIntake) || 1.5
    score += Math.min(15, Math.max(-10, (waterL - 1.5) * 15))
  }

  if (fitMatrixData?.soreness !== undefined && fitMatrixData?.soreness !== '') {
    score += (sorenessScore(fitMatrixData.soreness) - 70) * 0.3
  }

  if (fitMatrixData?.fatigue !== undefined && fitMatrixData?.fatigue !== '') {
    const fatigueMap = { 'Faible': 20, 'Modérée': 0, 'Élevée': -15, 'Très élevée': -25 }
    score += fatigueMap[fitMatrixData.fatigue] || 0
  }

  if (sessionCount === 0) {
    score += 10
  } else if (sessionCount <= 2) {
    score += 5
  } else if (sessionCount <= 4) {
    score -= 5
  } else {
    score -= 10
  }

  if (totalVolume > 20000) score -= 8
  else if (totalVolume > 10000) score -= 4
  else if (totalVolume > 5000) score -= 2

  const finalScore = Math.round(Math.max(0, Math.min(100, score)))

  let status
  let explanation

  if (finalScore >= 70) {
    status = 'ready'
    explanation = 'Prêt à t\'entraîner. Récupération optimale, tu peux y aller à fond.'
  } else if (finalScore >= 45) {
    status = 'moderate'
    explanation = 'Récupération modérée. Une séance légère ou modérée est possible.'
  } else {
    status = 'rest'
    explanation = 'Tu as besoin de repos. Priorise sommeil, hydratation et alimentation.'
  }

  if (sessionCount === 0 && finalScore < 50) {
    explanation += ' Même sans entraînement récent, ta fatigue générale est élevée.'
  }

  return { score: finalScore, status, explanation }
}

export function findAlternativeExercises(exerciseName, allExercises = []) {
  if (!exerciseName || !allExercises.length) return []

  const target = allExercises.find(
    (ex) => ex.id === exerciseName || ex.name === exerciseName || ex.name?.toLowerCase() === exerciseName?.toLowerCase()
  )

  if (!target) return []

  const sameMuscle = allExercises.filter(
    (ex) => ex.muscleGroup === target.muscleGroup && ex.id !== target.id && ex.equipment !== target.equipment
  )

  if (sameMuscle.length === 0) {
    const sameMuscleAny = allExercises.filter(
      (ex) => ex.muscleGroup === target.muscleGroup && ex.id !== target.id
    )
    return sameMuscleAny.slice(0, 3)
  }

  sameMuscle.sort((a, b) => {
    const diffA = a.difficulty === target.difficulty ? 0 : 1
    const diffB = b.difficulty === target.difficulty ? 0 : 1
    return diffA - diffB
  })

  return sameMuscle.slice(0, 3)
}

export function detectPlateaus(exerciseHistory = {}) {
  if (!exerciseHistory || typeof exerciseHistory !== 'object') return []

  const plateaus = []

  Object.entries(exerciseHistory).forEach(([exerciseId, records]) => {
    if (!Array.isArray(records) || records.length < 3) return

    const sorted = [...records].sort(
      (a, b) => new Date(a.date || a.completedAt) - new Date(b.date || b.completedAt)
    )

    const now = Date.now()
    const twoWeeksAgo = now - 14 * 86400000
    const recentRecords = sorted.filter(
      (r) => new Date(r.date || r.completedAt).getTime() > twoWeeksAgo
    )

    if (recentRecords.length < 2) return

    const volumes = recentRecords.map((r) => getRecordVolume(r))
    const avgVolume = volumes.reduce((s, v) => s + v, 0) / volumes.length
    if (avgVolume <= 0) return

    const maxDeviation = Math.max(...volumes.map((v) => Math.abs(v - avgVolume)))
    const variationPct = (maxDeviation / avgVolume) * 100

    if (variationPct < 5) {
      const firstDate = new Date(recentRecords[0].date || recentRecords[0].completedAt)
      const lastDate = new Date(recentRecords[recentRecords.length - 1].date || recentRecords[recentRecords.length - 1].completedAt)
      const weeks = Math.round(((lastDate - firstDate) / 86400000 / 7) * 10) / 10

      plateaus.push({
        exerciseId,
        exerciseName: recentRecords[0]?.exerciseName || exerciseId,
        weeks: Math.max(1, weeks),
        volumeChange: Math.round(variationPct * 10) / 10,
        avgVolume: Math.round(avgVolume),
      })
    }
  })

  return plateaus.sort((a, b) => b.weeks - a.weeks)
}

export function estimateRPE(weight, reps, exerciseId, exerciseHistory = {}) {
  if (!exerciseId || !weight || !reps) return { rpe: 5, effort: 'moderate' }

  const records = normalizeExerciseHistory(exerciseHistory, exerciseId)
  if (!records.length) {
    const baseRpe = Math.min(10, Math.round(weight / 10 * 0.5 + reps * 0.3))
    return { rpe: Math.max(1, baseRpe), effort: baseRpe <= 3 ? 'light' : baseRpe <= 6 ? 'moderate' : 'hard' }
  }

  let maxWeight = 0
  records.forEach((r) => {
    if ((r.weight || 0) > maxWeight) maxWeight = r.weight || 0
  })

  if (maxWeight === 0) {
    const baseRpe = Math.min(10, Math.round(weight / 10 * 0.5 + reps * 0.3))
    return { rpe: Math.max(1, baseRpe), effort: baseRpe <= 3 ? 'light' : baseRpe <= 6 ? 'moderate' : 'hard' }
  }

  const weightRatio = weight / maxWeight
  let rpe

  if (weightRatio >= 1.05) {
    rpe = 9 + Math.min(1, (weightRatio - 1.05) * 10)
  } else if (weightRatio >= 0.95) {
    rpe = 8 + (weightRatio - 0.95) * 10
  } else if (weightRatio >= 0.85) {
    rpe = 7 + (weightRatio - 0.85) * 10
  } else if (weightRatio >= 0.70) {
    rpe = 5 + (weightRatio - 0.7) * 6
  } else if (weightRatio >= 0.50) {
    rpe = 3 + (weightRatio - 0.5) * 6
  } else {
    rpe = 1 + (weightRatio / 0.5) * 2
  }

  if (reps >= 12) rpe += 1
  else if (reps >= 20) rpe += 1.5
  if (reps <= 3 && weightRatio > 0.8) rpe += 0.5

  const sortedByDate = [...records].sort((a, b) => new Date(b.date || b.completedAt) - new Date(a.date || a.completedAt))
  if (sortedByDate.length >= 3) {
    const recentVolumes = sortedByDate.slice(0, 3).map((r) => getRecordVolume(r))
    const trend = recentVolumes[0] - (recentVolumes[1] + recentVolumes[2]) / 2
    if (trend < -500) rpe += 0.5
  }

  rpe = Math.round(Math.max(1, Math.min(10, rpe)))

  let effort
  if (rpe <= 2) effort = 'warmup'
  else if (rpe <= 4) effort = 'light'
  else if (rpe <= 6) effort = 'moderate'
  else if (rpe <= 8) effort = 'hard'
  else effort = 'max'

  return { rpe, effort }
}

export function generateWeekPlan(profile = {}, exerciseHistory = {}, goals = []) {
  const p = profile
  const level = p.level || 'debutant'
  const frequency = p.frequency || 3
  const goalList = goals.length ? goals : (p.goals || [])
  const goalStr = goalList.length
    ? goalList.join(', ')
    : 'remise en forme'

  const prs = {}
  Object.entries(exerciseHistory || {}).forEach(([eid, records]) => {
    if (!Array.isArray(records) || !records.length) return
    let maxW = 0
    records.forEach((r) => { if ((r.weight || 0) > maxW) maxW = r.weight })
    if (maxW > 0) prs[eid] = { name: records[0]?.exerciseName || eid, weight: maxW }
  })

  const prLines = Object.values(prs)
    .slice(0, 5)
    .map((pr) => `- ${pr.name}: ${pr.weight}kg`)
    .join('\n')

  const levelLabels = {
    debutant: 'débutant',
    intermediaire: 'intermédiaire',
    avance: 'avancé',
    expert: 'expert',
  }

  const sex = p.sex === 'Femme' || p.sex === 'femme' ? 'femme' : 'homme'
  const age = p.age ? `${p.age} ans` : ''
  const weight = p.weight ? `${p.weight}kg` : ''
  const height = p.height ? `${p.height}cm` : ''

  const injuries = Array.isArray(p.injuries) && p.injuries.length
    ? `\nBlessures/limitations: ${p.injuries.join(', ')}.`
    : ''

  const location = p.location === 'maison' ? 'maison' : p.location === 'exterieur' ? 'extérieur' : 'salle de sport'
  const equipment = Array.isArray(p.material) && p.material.length
    ? `Matériel disponible: ${p.material.join(', ')}.`
    : ''

  return `Crée un programme d'entraînement hebdomadaire détaillé pour un ${sex} ${age} ${weight} ${height}, niveau ${levelLabels[level] || level}, ${frequency} séances par semaine. Objectif: ${goalStr}. Lieu: ${location}. ${equipment}${injuries}

Mes records personnels récents:
${prLines || '(pas encore de records)'}

Structure le programme avec:
- Nombre exact de séances (${frequency} par semaine)
- Pour chaque séance: nom du jour, groupes musculaires ciblés, liste d'exercices détaillée
- Pour chaque exercice: nombre de séries, répétitions, temps de repos
- Progression semaine après semaine
- Conseils de récupération et nutrition adaptés à l'objectif ${goalStr}

Sois précis et personnalisé. Utilise le français.`
}
