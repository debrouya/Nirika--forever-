export const programs = [
  {
    id: 'push_pull_legs',
    name: 'Push / Pull / Legs',
    description: 'Programme classique en 3 jours séparant les mouvements de poussée, tirage et jambes. Parfait pour un volume modéré avec fréquence 2x/semaine par groupe.',
    level: 'intermediaire',
    durationWeeks: 8,
    daysPerWeek: 6,
    goals: ['masse', 'force', 'definition'],
    structure: {
      'Push': [
        { exerciseId: 'developed_plat', sets: 4, reps: '8-10' },
        { exerciseId: 'developed_incline', sets: 3, reps: '10-12' },
        { exerciseId: 'developpe_machine', sets: 3, reps: '12-15' },
        { exerciseId: 'press_epaules', sets: 4, reps: '8-10' },
        { exerciseId: 'elevations_laterales', sets: 4, reps: '12-15' },
        { exerciseId: 'extension_tricep_cable', sets: 3, reps: '12-15' },
      ],
      'Pull': [
        { exerciseId: 'rowing_barre', sets: 4, reps: '8-10' },
        { exerciseId: 'tirage_vertical', sets: 4, reps: '10-12' },
        { exerciseId: 'rowing_haltere', sets: 3, reps: '10-12' },
        { exerciseId: 'face_pull', sets: 3, reps: '15-20' },
        { exerciseId: 'curl_bicep', sets: 3, reps: '10-12' },
        { exerciseId: 'curl_marteau', sets: 3, reps: '12-15' },
      ],
      'Legs': [
        { exerciseId: 'squat', sets: 4, reps: '6-8' },
        { exerciseId: 'leg_press', sets: 3, reps: '10-12' },
        { exerciseId: 'flexion_jambes', sets: 3, reps: '12-15' },
        { exerciseId: 'extension_jambes', sets: 3, reps: '12-15' },
        { exerciseId: 'fentes', sets: 3, reps: '12/jambe' },
        { exerciseId: 'mollets_debout', sets: 4, reps: '15-20' },
      ],
    },
  },
  {
    id: 'upper_lower',
    name: 'Upper / Lower',
    description: 'Division haut/bas du corps en 4 jours. Chaque groupe musculaire est travaillé 2 fois par semaine.',
    level: 'debutant',
    durationWeeks: 8,
    daysPerWeek: 4,
    goals: ['masse', 'force'],
    structure: {
      'Upper A': [
        { exerciseId: 'developed_plat', sets: 4, reps: '6-8' },
        { exerciseId: 'rowing_barre', sets: 4, reps: '6-8' },
        { exerciseId: 'press_epaules', sets: 3, reps: '8-10' },
        { exerciseId: 'tirage_vertical', sets: 3, reps: '10-12' },
        { exerciseId: 'curl_bicep', sets: 3, reps: '10-12' },
        { exerciseId: 'extension_tricep_cable', sets: 3, reps: '10-12' },
      ],
      'Lower A': [
        { exerciseId: 'squat', sets: 4, reps: '6-8' },
        { exerciseId: 'leg_press', sets: 3, reps: '10-12' },
        { exerciseId: 'flexion_jambes', sets: 3, reps: '10-12' },
        { exerciseId: 'hip_thrust', sets: 3, reps: '10-12' },
        { exerciseId: 'mollets_debout', sets: 4, reps: '12-15' },
        { exerciseId: 'planche', sets: 3, reps: '45-60s' },
      ],
      'Upper B': [
        { exerciseId: 'developed_incline', sets: 4, reps: '8-10' },
        { exerciseId: 'rowing_haltere', sets: 4, reps: '8-10' },
        { exerciseId: 'elevations_laterales', sets: 4, reps: '12-15' },
        { exerciseId: 'tirage_horizontal', sets: 3, reps: '10-12' },
        { exerciseId: 'curl_haltere', sets: 3, reps: '10-12' },
        { exerciseId: 'dips_tricep', sets: 3, reps: '10-15' },
      ],
      'Lower B': [
        { exerciseId: 'squat', sets: 4, reps: '8-10' },
        { exerciseId: 'fentes', sets: 3, reps: '12/jambe' },
        { exerciseId: 'extension_jambes', sets: 3, reps: '12-15' },
        { exerciseId: 'leg_curl', sets: 3, reps: '12-15' },
        { exerciseId: 'mollets_assis', sets: 4, reps: '15-20' },
        { exerciseId: 'crunch', sets: 3, reps: '15-20' },
      ],
    },
  },
  {
    id: 'ppl_6j',
    name: 'PPL 6 Jours',
    description: 'Push/Pull/Legs en 6 jours par semaine. Volume élevé, idéal pour les intermédiaires avancés.',
    level: 'avance',
    durationWeeks: 12,
    daysPerWeek: 6,
    goals: ['masse', 'definition'],
    structure: {
      'Push 1': [
        { exerciseId: 'developed_plat', sets: 5, reps: '5' },
        { exerciseId: 'developed_incline', sets: 4, reps: '8-10' },
        { exerciseId: 'elevations_laterales', sets: 4, reps: '12-15' },
        { exerciseId: 'pec_dec', sets: 3, reps: '12-15' },
        { exerciseId: 'extension_tricep_cable', sets: 4, reps: '12-15' },
      ],
      'Pull 1': [
        { exerciseId: 'rowing_barre', sets: 5, reps: '5' },
        { exerciseId: 'tirage_vertical', sets: 4, reps: '8-10' },
        { exerciseId: 'rowing_cable', sets: 3, reps: '10-12' },
        { exerciseId: 'face_pull', sets: 4, reps: '15-20' },
        { exerciseId: 'curl_bicep', sets: 4, reps: '10-12' },
      ],
      'Legs 1': [
        { exerciseId: 'squat', sets: 5, reps: '5' },
        { exerciseId: 'leg_press', sets: 4, reps: '10-12' },
        { exerciseId: 'flexion_jambes', sets: 4, reps: '10-12' },
        { exerciseId: 'fentes', sets: 3, reps: '12/jambe' },
        { exerciseId: 'mollets_debout', sets: 4, reps: '15-20' },
      ],
      'Push 2': [
        { exerciseId: 'developed_plat', sets: 4, reps: '8-10' },
        { exerciseId: 'incline_dumbbell', sets: 4, reps: '10-12' },
        { exerciseId: 'press_epaules', sets: 4, reps: '8-10' },
        { exerciseId: 'elevations_laterales', sets: 4, reps: '15-20' },
        { exerciseId: 'dips_tricep', sets: 3, reps: '10-15' },
      ],
      'Pull 2': [
        { exerciseId: 'pull_up', sets: 4, reps: '6-8' },
        { exerciseId: 'rowing_haltere', sets: 4, reps: '8-10' },
        { exerciseId: 'tirage_horizontal', sets: 3, reps: '10-12' },
        { exerciseId: 'shrugs', sets: 3, reps: '12-15' },
        { exerciseId: 'curl_marteau', sets: 4, reps: '10-12' },
      ],
      'Legs 2': [
        { exerciseId: 'hack_squat', sets: 4, reps: '8-10' },
        { exerciseId: 'leg_press', sets: 4, reps: '10-12' },
        { exerciseId: 'extension_jambes', sets: 3, reps: '12-15' },
        { exerciseId: 'leg_curl', sets: 4, reps: '10-12' },
        { exerciseId: 'hip_thrust', sets: 3, reps: '10-12' },
      ],
    },
  },
  {
    id: 'phat',
    name: 'PHAT (Power Hypertrophy)',
    description: 'Programme combinant force et hypertrophie. 2 jours puissance, 3 jours hypertrophie.',
    level: 'avance',
    durationWeeks: 12,
    daysPerWeek: 5,
    goals: ['masse', 'force'],
    structure: {
      'Upper Power': [
        { exerciseId: 'developed_plat', sets: 5, reps: '3-5' },
        { exerciseId: 'rowing_barre', sets: 5, reps: '3-5' },
        { exerciseId: 'press_epaules', sets: 4, reps: '5-8' },
        { exerciseId: 'pull_up', sets: 4, reps: '5-8' },
        { exerciseId: 'extension_tricep_cable', sets: 3, reps: '8-10' },
        { exerciseId: 'curl_bicep', sets: 3, reps: '8-10' },
      ],
      'Lower Power': [
        { exerciseId: 'squat', sets: 5, reps: '3-5' },
        { exerciseId: 'leg_press', sets: 4, reps: '8-10' },
        { exerciseId: 'flexion_jambes', sets: 4, reps: '8-10' },
        { exerciseId: 'hip_thrust', sets: 4, reps: '6-8' },
        { exerciseId: 'mollets_debout', sets: 4, reps: '10-12' },
      ],
      'Upper Hypertrophy': [
        { exerciseId: 'incline_dumbbell', sets: 4, reps: '8-12' },
        { exerciseId: 'rowing_haltere', sets: 4, reps: '8-12' },
        { exerciseId: 'elevations_laterales', sets: 4, reps: '12-15' },
        { exerciseId: 'tirage_vertical', sets: 4, reps: '10-12' },
        { exerciseId: 'pec_dec', sets: 3, reps: '12-15' },
        { exerciseId: 'face_pull', sets: 3, reps: '15-20' },
        { exerciseId: 'curl_haltere', sets: 3, reps: '10-12' },
        { exerciseId: 'extension_nuque', sets: 3, reps: '10-12' },
      ],
      'Lower Hypertrophy': [
        { exerciseId: 'hack_squat', sets: 4, reps: '8-12' },
        { exerciseId: 'fentes', sets: 4, reps: '12/jambe' },
        { exerciseId: 'extension_jambes', sets: 3, reps: '12-15' },
        { exerciseId: 'leg_curl', sets: 4, reps: '10-12' },
        { exerciseId: 'hip_thrust', sets: 3, reps: '12-15' },
        { exerciseId: 'mollets_assis', sets: 4, reps: '15-20' },
      ],
      'Upper Hypertrophy 2': [
        { exerciseId: 'developed_plat', sets: 4, reps: '8-12' },
        { exerciseId: 'tirage_vertical', sets: 4, reps: '8-12' },
        { exerciseId: 'press_epaules', sets: 4, reps: '10-12' },
        { exerciseId: 'rowing_cable', sets: 3, reps: '12-15' },
        { exerciseId: 'croisement_cable', sets: 3, reps: '12-15' },
        { exerciseId: 'shrugs', sets: 3, reps: '12-15' },
        { exerciseId: 'curl_marteau', sets: 3, reps: '10-12' },
        { exerciseId: 'dips_tricep', sets: 3, reps: '10-12' },
      ],
    },
  },
  {
    id: 'gvt',
    name: 'German Volume Training',
    description: 'GVT classique : 10 séries de 10 répétitions sur des mouvements composés. Massacre garanti.',
    level: 'avance',
    durationWeeks: 6,
    daysPerWeek: 4,
    goals: ['masse'],
    structure: {
      'Jour 1 (Push)': [
        { exerciseId: 'developed_plat', sets: 10, reps: '10' },
        { exerciseId: 'developed_incline', sets: 3, reps: '10-12' },
        { exerciseId: 'press_epaules', sets: 4, reps: '10-12' },
        { exerciseId: 'extension_tricep_cable', sets: 3, reps: '12-15' },
      ],
      'Jour 2 (Pull)': [
        { exerciseId: 'tirage_vertical', sets: 10, reps: '10' },
        { exerciseId: 'rowing_barre', sets: 3, reps: '10-12' },
        { exerciseId: 'face_pull', sets: 3, reps: '15-20' },
        { exerciseId: 'curl_bicep', sets: 3, reps: '12-15' },
      ],
      'Jour 3 (Repos)': [],
      'Jour 4 (Jambes)': [
        { exerciseId: 'squat', sets: 10, reps: '10' },
        { exerciseId: 'flexion_jambes', sets: 3, reps: '10-12' },
        { exerciseId: 'extension_jambes', sets: 3, reps: '12-15' },
        { exerciseId: 'mollets_debout', sets: 4, reps: '15-20' },
      ],
      'Jour 5 (Full)': [
        { exerciseId: 'developed_plat', sets: 10, reps: '10' },
        { exerciseId: 'tirage_vertical', sets: 10, reps: '10' },
        { exerciseId: 'leg_press', sets: 10, reps: '10' },
        { exerciseId: 'elevations_laterales', sets: 3, reps: '12-15' },
      ],
    },
  },
  {
    id: 'wendler_531',
    name: 'Wendler 5/3/1',
    description: 'Programme de force progressif basé sur des cycles de 4 semaines. Simple et redoutablement efficace.',
    level: 'intermediaire',
    durationWeeks: 16,
    daysPerWeek: 4,
    goals: ['force'],
    structure: {
      'Squat Day': [
        { exerciseId: 'squat', sets: 5, reps: '5/3/1+AMRAP' },
        { exerciseId: 'leg_press', sets: 5, reps: '10' },
        { exerciseId: 'flexion_jambes', sets: 5, reps: '10' },
        { exerciseId: 'crunch', sets: 3, reps: '15-20' },
      ],
      'Bench Day': [
        { exerciseId: 'developed_plat', sets: 5, reps: '5/3/1+AMRAP' },
        { exerciseId: 'rowing_haltere', sets: 5, reps: '10' },
        { exerciseId: 'elevations_laterales', sets: 5, reps: '15' },
        { exerciseId: 'extension_tricep_cable', sets: 3, reps: '12-15' },
      ],
      'Deadlift Day': [
        { exerciseId: 'rowing_barre', sets: 5, reps: '5/3/1+AMRAP' },
        { exerciseId: 'leg_press', sets: 5, reps: '10' },
        { exerciseId: 'leg_curl', sets: 5, reps: '10' },
        { exerciseId: 'planche', sets: 3, reps: '60s' },
      ],
      'OHP Day': [
        { exerciseId: 'press_epaules', sets: 5, reps: '5/3/1+AMRAP' },
        { exerciseId: 'tirage_vertical', sets: 5, reps: '10' },
        { exerciseId: 'face_pull', sets: 5, reps: '15' },
        { exerciseId: 'curl_bicep', sets: 3, reps: '12-15' },
      ],
    },
  },
  {
    id: 'starting_strength',
    name: 'Starting Strength',
    description: 'Programme de base en 3 jours. Mouvements composés uniquement, idéal pour les débutants.',
    level: 'debutant',
    durationWeeks: 12,
    daysPerWeek: 3,
    goals: ['force', 'masse'],
    structure: {
      'Workout A': [
        { exerciseId: 'squat', sets: 3, reps: '5' },
        { exerciseId: 'developed_plat', sets: 3, reps: '5' },
        { exerciseId: 'rowing_barre', sets: 3, reps: '5' },
      ],
      'Workout B': [
        { exerciseId: 'squat', sets: 3, reps: '5' },
        { exerciseId: 'press_epaules', sets: 3, reps: '5' },
        { exerciseId: 'pull_up', sets: 3, reps: 'max' },
      ],
    },
  },
  {
    id: 'stronglifts_5x5',
    name: 'StrongLifts 5×5',
    description: 'Programme simple et efficace en 5×5. Progression linéaire, parfait pour débuter la musculation.',
    level: 'debutant',
    durationWeeks: 12,
    daysPerWeek: 3,
    goals: ['force'],
    structure: {
      'Workout A': [
        { exerciseId: 'squat', sets: 5, reps: '5' },
        { exerciseId: 'developed_plat', sets: 5, reps: '5' },
        { exerciseId: 'rowing_barre', sets: 5, reps: '5' },
      ],
      'Workout B': [
        { exerciseId: 'squat', sets: 5, reps: '5' },
        { exerciseId: 'press_epaules', sets: 5, reps: '5' },
        { exerciseId: 'pull_up', sets: 5, reps: '5' },
      ],
    },
  },
  {
    id: 'smolov_jr',
    name: 'Smolov Jr',
    description: 'Programme d\'intensification de 3 semaines pour un exercice spécifique. Idéal pour briser un plateau.',
    level: 'avance',
    durationWeeks: 3,
    daysPerWeek: 4,
    goals: ['force'],
    structure: {
      'Semaine 1': [
        { exerciseId: 'squat', sets: 6, reps: '6' },
      ],
      'Semaine 2': [
        { exerciseId: 'squat', sets: 7, reps: '5' },
      ],
      'Semaine 3': [
        { exerciseId: 'squat', sets: 8, reps: '4' },
      ],
      'Semaine 4 (Test)': [
        { exerciseId: 'squat', sets: 3, reps: '3/2/1' },
      ],
    },
  },
  {
    id: 'reddit_rr',
    name: 'Reddit Recommended Routine',
    description: 'Routine recommandée par la communauté Reddit r/bodyweight. Progression au poids du corps.',
    level: 'debutant',
    durationWeeks: 12,
    daysPerWeek: 3,
    goals: ['force', 'masse'],
    structure: {
      'Jour 1': [
        { exerciseId: 'pull_up', sets: 3, reps: '5-8' },
        { exerciseId: 'squat', sets: 3, reps: '5-8' },
        { exerciseId: 'push_up', sets: 3, reps: '5-8' },
        { exerciseId: 'hip_thrust', sets: 3, reps: '5-8' },
        { exerciseId: 'planche', sets: 3, reps: '30-60s' },
      ],
      'Jour 2': [
        { exerciseId: 'chin_up', sets: 3, reps: '5-8' },
        { exerciseId: 'fentes', sets: 3, reps: '5-8/jambe' },
        { exerciseId: 'dip_pec', sets: 3, reps: '5-8' },
        { exerciseId: 'releve_jambes', sets: 3, reps: '5-8' },
        { exerciseId: 'dead_bug', sets: 3, reps: '8-10' },
      ],
      'Jour 3': [
        { exerciseId: 'pull_up', sets: 3, reps: '5-8' },
        { exerciseId: 'sissy_squat', sets: 3, reps: '5-8' },
        { exerciseId: 'push_up', sets: 3, reps: '5-8' },
        { exerciseId: 'hip_thrust', sets: 3, reps: '5-8' },
        { exerciseId: 'russian_twist', sets: 3, reps: '10-15' },
      ],
    },
  },
  {
    id: 'freeletics',
    name: 'Freeletics Style',
    description: 'Entraînement HIIT au poids du corps inspiré de Freeletics. Cardio et force combinés.',
    level: 'intermediaire',
    durationWeeks: 8,
    daysPerWeek: 5,
    goals: ['definition', 'endurance'],
    structure: {
      'A (Push)': [
        { exerciseId: 'push_up', sets: 5, reps: '20' },
        { exerciseId: 'dip_pec', sets: 4, reps: '15' },
        { exerciseId: 'mountain_climber', sets: 4, reps: '30s' },
        { exerciseId: 'planche', sets: 3, reps: '60s' },
      ],
      'B (Pull)': [
        { exerciseId: 'pull_up', sets: 5, reps: 'max' },
        { exerciseId: 'chin_up', sets: 4, reps: 'max' },
        { exerciseId: 'dead_bug', sets: 4, reps: '15' },
        { exerciseId: 'russian_twist', sets: 3, reps: '20' },
      ],
      'C (Legs)': [
        { exerciseId: 'squat', sets: 5, reps: '25' },
        { exerciseId: 'fentes', sets: 4, reps: '20/jambe' },
        { exerciseId: 'sissy_squat', sets: 3, reps: '15' },
        { exerciseId: 'mountain_climber', sets: 4, reps: '30s' },
      ],
      'D (Full Body)': [
        { exerciseId: 'push_up', sets: 4, reps: '20' },
        { exerciseId: 'squat', sets: 4, reps: '20' },
        { exerciseId: 'pull_up', sets: 4, reps: 'max' },
        { exerciseId: 'planche', sets: 3, reps: '60s' },
      ],
      'E (Cardio)': [
        { exerciseId: 'corde_a_sauter', sets: 5, reps: '3 min' },
        { exerciseId: 'mountain_climber', sets: 5, reps: '30s' },
        { exerciseId: 'dead_bug', sets: 3, reps: '20' },
      ],
    },
  },
  {
    id: 'barstarzz',
    name: 'Barstarzz',
    description: 'Street workout inspiré de Barstarzz. Calisthénie et mouvements dynamiques.',
    level: 'intermediaire',
    durationWeeks: 8,
    daysPerWeek: 4,
    goals: ['masse', 'definition'],
    structure: {
      'Upper Push': [
        { exerciseId: 'push_up', sets: 4, reps: '20' },
        { exerciseId: 'dip_pec', sets: 4, reps: '15' },
        { exerciseId: 'push_up', sets: 3, reps: 'max' },
      ],
      'Upper Pull': [
        { exerciseId: 'pull_up', sets: 4, reps: '10' },
        { exerciseId: 'chin_up', sets: 4, reps: '10' },
        { exerciseId: 'pull_up', sets: 3, reps: 'max' },
      ],
      'Lower': [
        { exerciseId: 'squat', sets: 4, reps: '25' },
        { exerciseId: 'fentes', sets: 4, reps: '20/jambe' },
        { exerciseId: 'sissy_squat', sets: 3, reps: '15' },
        { exerciseId: 'mollets_debout', sets: 4, reps: '25' },
      ],
      'Full Body': [
        { exerciseId: 'push_up', sets: 3, reps: '20' },
        { exerciseId: 'pull_up', sets: 3, reps: '10' },
        { exerciseId: 'squat', sets: 3, reps: '25' },
        { exerciseId: 'dip_pec', sets: 3, reps: '15' },
        { exerciseId: 'planche', sets: 3, reps: '60s' },
      ],
    },
  },
  {
    id: 'crossfit_wod',
    name: 'CrossFit WOD',
    description: 'Séances CrossFit du jour (WOD). Mélange de musculation, cardio et mouvements olympiques.',
    level: 'intermediaire',
    durationWeeks: 8,
    daysPerWeek: 5,
    goals: ['definition', 'endurance'],
    structure: {
      'WOD 1': [
        { exerciseId: 'velo_stationnaire', sets: 1, reps: '30 cal' },
        { exerciseId: 'push_up', sets: 1, reps: '21-15-9' },
        { exerciseId: 'squat', sets: 1, reps: '21-15-9' },
      ],
      'WOD 2': [
        { exerciseId: 'rameur', sets: 1, reps: '500m' },
        { exerciseId: 'pull_up', sets: 1, reps: '15' },
        { exerciseId: 'squat', sets: 1, reps: '15' },
        { exerciseId: 'rameur', sets: 1, reps: '500m' },
      ],
      'WOD 3': [
        { exerciseId: 'corde_a_sauter', sets: 1, reps: '3 min' },
        { exerciseId: 'fentes', sets: 1, reps: '50' },
        { exerciseId: 'dip_pec', sets: 1, reps: '30' },
      ],
      'WOD 4': [
        { exerciseId: 'velo_stationnaire', sets: 1, reps: '40 cal' },
        { exerciseId: 'tirage_vertical', sets: 1, reps: '30' },
        { exerciseId: 'hip_thrust', sets: 1, reps: '30' },
        { exerciseId: 'mountain_climber', sets: 1, reps: '30' },
      ],
      'WOD 5': [
        { exerciseId: 'rameur', sets: 1, reps: '2000m' },
        { exerciseId: 'squat', sets: 1, reps: '50' },
        { exerciseId: 'pull_up', sets: 1, reps: '25' },
      ],
    },
  },
  {
    id: 'tabata_20',
    name: 'Tabata 20min',
    description: 'Protocole Tabata original : 20s effort / 10s repos, 8 tours. 20 minutes suffisent.',
    level: 'debutant',
    durationWeeks: 4,
    daysPerWeek: 3,
    goals: ['definition', 'endurance'],
    structure: {
      'Tabata A': [
        { exerciseId: 'velo_stationnaire', sets: 8, reps: '20s ON / 10s OFF' },
      ],
      'Tabata B': [
        { exerciseId: 'corde_a_sauter', sets: 8, reps: '20s ON / 10s OFF' },
      ],
      'Tabata C': [
        { exerciseId: 'rameur', sets: 8, reps: '20s ON / 10s OFF' },
      ],
      'Tabata D': [
        { exerciseId: 'tapis_course', sets: 8, reps: '20s ON / 10s OFF' },
      ],
      'Tabata Mix': [
        { exerciseId: 'mountain_climber', sets: 4, reps: '20s ON / 10s OFF' },
        { exerciseId: 'push_up', sets: 4, reps: '20s ON / 10s OFF' },
      ],
    },
  },
  {
    id: 'westside_barbell',
    name: 'Westside Barbell',
    description: 'Méthode Conjugate de Westside Barbell. Max effort et dynamic effort pour la force maximale.',
    level: 'avance',
    durationWeeks: 12,
    daysPerWeek: 4,
    goals: ['force', 'masse'],
    structure: {
      'Max Effort Upper': [
        { exerciseId: 'developed_plat', sets: 5, reps: '3/2/1' },
        { exerciseId: 'incline_dumbbell', sets: 4, reps: '6-8' },
        { exerciseId: 'face_pull', sets: 4, reps: '12-15' },
        { exerciseId: 'curl_bicep', sets: 4, reps: '10-12' },
      ],
      'Max Effort Lower': [
        { exerciseId: 'squat', sets: 5, reps: '3/2/1' },
        { exerciseId: 'leg_press', sets: 4, reps: '8-10' },
        { exerciseId: 'flexion_jambes', sets: 4, reps: '10-12' },
        { exerciseId: 'planche', sets: 3, reps: '60s' },
      ],
      'Dynamic Effort Upper': [
        { exerciseId: 'developed_plat', sets: 8, reps: '3' },
        { exerciseId: 'tirage_vertical', sets: 8, reps: '3' },
        { exerciseId: 'elevations_laterales', sets: 4, reps: '12-15' },
        { exerciseId: 'extension_tricep_cable', sets: 4, reps: '12-15' },
      ],
      'Dynamic Effort Lower': [
        { exerciseId: 'squat', sets: 10, reps: '2' },
        { exerciseId: 'fentes', sets: 4, reps: '8/jambe' },
        { exerciseId: 'leg_curl', sets: 4, reps: '10-12' },
        { exerciseId: 'mollets_debout', sets: 4, reps: '15-20' },
      ],
    },
  },
  {
    id: 'calisthenie_30j',
    name: 'NIRIKA CALISTHENIE 30 JOURS',
    description: 'Programme poids du corps en 30 jours. Circuit training HIIT en 3 phases : Adaptation → Intensité → Performance. 15/30/45 min au choix.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
    level: 'debutant',
    durationWeeks: 4,
    daysPerWeek: 5,
    goals: ['definition', 'endurance', 'masse'],
    structure: {
      'Phase 1 — Jour 1-3': [
        { exerciseId: 'jumping_jacks', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'squat', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'push_up', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'planche', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'mountain_climber', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'crunch', sets: 1, reps: '30s ON / 15s OFF' },
      ],
      'Phase 1 — Jour 4-5': [
        { exerciseId: 'jumping_jacks', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'squat', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'push_up', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'planche', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'mountain_climber', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'releve_jambes', sets: 1, reps: '30s ON / 15s OFF' },
      ],
      'Phase 1 — Jour 6-10': [
        { exerciseId: 'jumping_jacks', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'squat', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'push_up', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'planche', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'mountain_climber', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'crunch', sets: 1, reps: '30s ON / 15s OFF' },
        { exerciseId: 'releve_jambes', sets: 1, reps: '30s ON / 15s OFF' },
      ],
      'Phase 2 — Jour 11-15': [
        { exerciseId: 'high_knees', sets: 1, reps: '40s ON / 20s OFF' },
        { exerciseId: 'jump_squat', sets: 1, reps: '40s ON / 20s OFF' },
        { exerciseId: 'push_up', sets: 1, reps: '40s ON / 20s OFF' },
        { exerciseId: 'gainage_dynamique', sets: 1, reps: '40s ON / 20s OFF' },
        { exerciseId: 'burpees_simples', sets: 1, reps: '40s ON / 20s OFF' },
        { exerciseId: 'releve_jambes', sets: 1, reps: '40s ON / 20s OFF' },
      ],
      'Phase 2 — Jour 16-20': [
        { exerciseId: 'high_knees', sets: 1, reps: '40s ON / 20s OFF' },
        { exerciseId: 'jump_squat', sets: 1, reps: '40s ON / 20s OFF' },
        { exerciseId: 'push_up', sets: 1, reps: '40s ON / 20s OFF' },
        { exerciseId: 'gainage_dynamique', sets: 1, reps: '40s ON / 20s OFF' },
        { exerciseId: 'burpees_simples', sets: 1, reps: '40s ON / 20s OFF' },
        { exerciseId: 'russian_twist', sets: 1, reps: '40s ON / 20s OFF' },
        { exerciseId: 'releve_jambes', sets: 1, reps: '40s ON / 20s OFF' },
      ],
      'Phase 3 — Jour 21-25': [
        { exerciseId: 'burpees', sets: 1, reps: '45s ON / 15s OFF' },
        { exerciseId: 'jump_squat', sets: 1, reps: '45s ON / 15s OFF' },
        { exerciseId: 'pompees_decline', sets: 1, reps: '45s ON / 15s OFF' },
        { exerciseId: 'mountain_climber', sets: 1, reps: '45s ON / 15s OFF' },
        { exerciseId: 'gainage_dynamique', sets: 1, reps: '45s ON / 15s OFF' },
        { exerciseId: 'russian_twist', sets: 1, reps: '45s ON / 15s OFF' },
      ],
      'Phase 3 — Jour 26-30': [
        { exerciseId: 'burpees', sets: 1, reps: '45s ON / 15s OFF' },
        { exerciseId: 'jump_squat', sets: 1, reps: '45s ON / 15s OFF' },
        { exerciseId: 'pompees_decline', sets: 1, reps: '45s ON / 15s OFF' },
        { exerciseId: 'mountain_climber', sets: 1, reps: '45s ON / 15s OFF' },
        { exerciseId: 'gainage_dynamique', sets: 1, reps: '45s ON / 15s OFF' },
        { exerciseId: 'russian_twist', sets: 1, reps: '45s ON / 15s OFF' },
        { exerciseId: 'releve_jambes', sets: 1, reps: '45s ON / 15s OFF' },
      ],
    },
  },
]

export const onboardingQuestions = [
  {
    id: 'goal',
    question: 'Quel est ton objectif principal ?',
    type: 'single',
    options: [
      { value: 'masse', label: 'Prise de masse', icon: '💪' },
      { value: 'force', label: 'Force', icon: '🏋️' },
      { value: 'definition', label: 'Définition', icon: '🔥' },
      { value: 'endurance', label: 'Endurance', icon: '🫁' },
    ],
  },
  {
    id: 'experience',
    question: 'Quel est ton niveau d\'expérience ?',
    type: 'single',
    options: [
      { value: 'debutant', label: 'Débutant', subtitle: '< 6 mois', icon: '🌱' },
      { value: 'intermediaire', label: 'Intermédiaire', subtitle: '6 mois - 2 ans', icon: '🌿' },
      { value: 'avance', label: 'Avancé', subtitle: '2+ ans', icon: '🌳' },
    ],
  },
  {
    id: 'frequency',
    question: 'Combien de jours par semaine peux-t\'entraîner ?',
    type: 'single',
    options: [
      { value: 2, label: '2 jours', icon: '📅' },
      { value: 3, label: '3 jours', icon: '📅📅' },
      { value: 4, label: '4 jours', icon: '📅📅📅' },
      { value: 5, label: '5 jours', icon: '📅📅📅📅' },
      { value: 6, label: '6 jours', icon: '📅📅📅📅📅' },
    ],
  },
  {
    id: 'equipment',
    question: 'Quel équipement as-tu disponible ?',
    type: 'multiple',
    options: [
      { value: 'full_gym', label: 'Salle complète', icon: '🏢' },
      { value: 'basic_gym', label: 'Salle basique', icon: '🏠' },
      { value: 'home_basics', label: 'Home (barre + haltères)', icon: '🏡' },
      { value: 'bodyweight', label: 'Poids du corps uniquement', icon: '🤸' },
    ],
  },
]

export function recommendationEngine(answers) {
  const { goal, experience, frequency, equipment } = answers
  const scores = {}

  programs.forEach((p) => {
    let score = 0

    if (goal && p.goals.includes(goal)) score += 30

    if (experience) {
      if (experience === 'debutant' && p.level === 'debutant') score += 25
      else if (experience === 'intermediaire' && (p.level === 'intermediaire' || p.level === 'debutant')) score += 20
      else if (experience === 'avance') score += 15
    }

    if (frequency) {
      const diff = Math.abs(p.daysPerWeek - frequency)
      if (diff === 0) score += 20
      else if (diff === 1) score += 10
      else score -= 5
    }

    if (equipment) {
      if (equipment === 'bodyweight' && ['reddit_rr', 'barstarzz', 'freeletics', 'calisthenie_30j'].includes(p.id)) score += 15
      else if (equipment === 'full_gym') score += 10
    }

    if (experience === 'debutant' && p.level === 'avance') score -= 30

    scores[p.id] = score
  })

  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id)
}
