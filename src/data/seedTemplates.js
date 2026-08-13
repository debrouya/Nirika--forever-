import exercises from './exercises.js'

const exMap = {}
exercises.forEach((e) => { exMap[e.id] = { name: e.name, muscleGroup: e.muscleGroup, equipment: e.equipment } })

function ex(exerciseId, sets, reps) {
  const info = exMap[exerciseId]
  return {
    id: exerciseId,
    name: info?.name || exerciseId,
    muscleGroup: info?.muscleGroup || 'Autre',
    equipment: info?.equipment || 'bodyweight',
    sets,
    reps,
  }
}

export const seedTemplates = [
  {
    id: 'seed_push',
    name: 'Push (PPL)',
    exercises: [
      ex('developed_plat', 4, '8-10'),
      ex('developed_incline', 3, '10-12'),
      ex('developpe_machine', 3, '12-15'),
      ex('press_epaules', 4, '8-10'),
      ex('elevations_laterales', 4, '12-15'),
      ex('extension_tricep_cable', 3, '12-15'),
    ],
  },
  {
    id: 'seed_pull',
    name: 'Pull (PPL)',
    exercises: [
      ex('rowing_barre', 4, '8-10'),
      ex('tirage_vertical', 4, '10-12'),
      ex('rowing_haltere', 3, '10-12'),
      ex('face_pull', 3, '15-20'),
      ex('curl_bicep', 3, '10-12'),
      ex('curl_marteau', 3, '12-15'),
    ],
  },
  {
    id: 'seed_legs',
    name: 'Legs (PPL)',
    exercises: [
      ex('squat', 4, '6-8'),
      ex('leg_press', 3, '10-12'),
      ex('flexion_jambes', 3, '12-15'),
      ex('extension_jambes', 3, '12-15'),
      ex('fentes', 3, '12/jambe'),
      ex('mollets_debout', 4, '15-20'),
    ],
  },
  {
    id: 'seed_upper',
    name: 'Upper A',
    exercises: [
      ex('developed_plat', 4, '6-8'),
      ex('rowing_barre', 4, '6-8'),
      ex('press_epaules', 3, '8-10'),
      ex('tirage_vertical', 3, '10-12'),
      ex('curl_bicep', 3, '10-12'),
      ex('extension_tricep_cable', 3, '10-12'),
    ],
  },
  {
    id: 'seed_lower',
    name: 'Lower A',
    exercises: [
      ex('squat', 4, '6-8'),
      ex('leg_press', 3, '10-12'),
      ex('flexion_jambes', 3, '10-12'),
      ex('hip_thrust', 3, '10-12'),
      ex('mollets_debout', 4, '12-15'),
      ex('planche', 3, '45-60s'),
    ],
  },
  {
    id: 'seed_full_body',
    name: 'Full Body',
    exercises: [
      ex('squat', 4, '8-10'),
      ex('developed_plat', 4, '8-10'),
      ex('rowing_barre', 3, '10-12'),
      ex('press_epaules', 3, '10-12'),
      ex('curl_bicep', 3, '12-15'),
      ex('planche', 3, '45-60s'),
    ],
  },
]