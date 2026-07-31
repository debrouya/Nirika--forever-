import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  MessageCircle,
  Bot,
  Dumbbell,
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  Target,
  Clock,
  Trophy,
  User,
  Save,
  Heart,
  Activity,
  Moon,
  Apple,
  Settings,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Send,
  CalendarRange,
  Camera,
} from 'lucide-react'
import useStore from '../store/useStore'
import useExercises from '../hooks/useExercises'
import { askCoach } from '../services/supabaseService'
import { generateWeekPlan, findAlternativeExercises } from '../services/aiCoaching'

const INJURY_EXCLUSION_MAP = {
  genou: ['squat', 'fentes', 'leg_press', 'hack_squat', 'sissy_squat'],
  epaule: ['developed_plat', 'developed_incline', 'press_epaules', 'pull_up', 'chin_up', 'dip_pec'],
  dos: ['rowing_barre', 'rowing_haltere', 'squat', 'dead_lift'],
  coude: ['curl_bicep', 'curl_haltere', 'extension_tricep_cable', 'curl_marteau'],
  poignet: ['push_up', 'dips_tricep', 'developed_plat', 'pull_up'],
  lombaires: ['squat', 'rowing_barre', 'hip_thrust', 'hack_squat'],
  anche: ['squat', 'fentes', 'leg_press', 'hip_thrust', 'dead_lift'],
  talon: ['squat', 'fentes', 'leg_press', 'hack_squat', 'mollets_debout'],
}

const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sédentaire', desc: 'Bureau, pas d\'exercice' },
  { value: 1.375, label: 'Légèrement actif', desc: '1-3 séances/semaine' },
  { value: 1.55, label: 'Modérément actif', desc: '3-5 séances/semaine' },
  { value: 1.725, label: 'Très actif', desc: '6-7 séances/semaine' },
  { value: 1.9, label: 'Extrêmement actif', desc: 'Sportif pro / physique intense' },
]

const GOALS = [
  { value: 'perte_poids', label: 'Perte de poids', icon: '🔥' },
  { value: 'prise_muscle', label: 'Prise de muscle', icon: '💪' },
  { value: 'recomposition', label: 'Recomposition', icon: '⚖️' },
  { value: 'endurance', label: 'Endurance cardio', icon: '❤️' },
  { value: 'force', label: 'Augmentation force', icon: '⚡' },
  { value: 'remise_forme', label: 'Remise en forme', icon: '🏃' },
]

const LEVELS = [
  { value: 'debutant', label: 'Débutant', desc: '< 6 mois de sport' },
  { value: 'intermediaire', label: 'Intermédiaire', desc: '6 mois - 2 ans' },
  { value: 'avance', label: 'Avancé', desc: '2-5 ans' },
  { value: 'expert', label: 'Expert', desc: '5+ ans' },
]

const EQUIPMENT = [
  { value: 'salle', label: 'Salle de sport' },
  { value: 'maison', label: 'Maison' },
  { value: 'exterieur', label: 'Extérieur' },
]

const MATERIAL = [
  { value: 'haltères', label: 'Haltères' },
  { value: 'machines', label: 'Machines' },
  { value: 'barre', label: 'Barre de muscu' },
  { value: 'elastiques', label: 'Élastiques' },
  { value: 'tapis', label: 'Tapis de course' },
  { value: 'velo', label: 'Vélo' },
  { value: 'rameur', label: 'Rameur' },
  { value: 'aucun', label: 'Aucun matériel' },
]

const INJURIES_LIST = [
  { value: 'genou', label: 'Genou' },
  { value: 'epaule', label: 'Épaule' },
  { value: 'dos', label: 'Dos' },
  { value: 'coude', label: 'Coude' },
  { value: 'poignet', label: 'Poignet' },
  { value: 'lombaires', label: 'Lombaires' },
  { value: 'anche', label: 'Hanche' },
  { value: 'talon', label: 'Talon / Achille' },
]

const SLEEP_QUALITY = ['Mauvais', 'Moyen', 'Bon', 'Excellent']
const STRESS_LEVEL = ['Faible', 'Modéré', 'Élevé', 'Très élevé']
const FATIGUE_LEVEL = ['Faible', 'Modéré', 'Élevée', 'Très élevée']

const PROFILE_KEY = 'nirika_coach_profile'

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

function computeBMI(weight, heightCm) {
  if (!weight || !heightCm) return null
  const h = heightCm / 100
  return Math.round((weight / (h * h)) * 10) / 10
}

function computeBMR(weight, heightCm, age, sex) {
  if (!weight || !heightCm || !age) return null
  if (sex === 'homme') return Math.round(88.362 + (13.397 * weight) + (4.799 * heightCm) - (5.677 * age))
  return Math.round(447.593 + (9.247 * weight) + (3.098 * heightCm) - (4.330 * age))
}

function computeTDEE(bmr, activityLevel) {
  if (!bmr || !activityLevel) return null
  return Math.round(bmr * activityLevel)
}

function getBMICategory(bmi) {
  if (!bmi) return null
  if (bmi < 18.5) return { label: 'Insuffisant', color: 'text-blue-400' }
  if (bmi < 25) return { label: 'Normal', color: 'text-lime' }
  if (bmi < 30) return { label: 'Surpoids', color: 'text-yellow-400' }
  return { label: 'Obésité', color: 'text-red-400' }
}

function getProgressiveWeight(currentWeight, targetWeight, weeks = 12) {
  if (!currentWeight || !targetWeight) return null
  const diff = targetWeight - currentWeight
  const perWeek = diff / weeks
  return {
    weeklyGoal: Math.abs(Math.round(perWeek * 10) / 10),
    direction: diff > 0 ? 'gain' : 'perte',
    estimatedWeeks: Math.ceil(Math.abs(diff) / 0.5),
  }
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function computeFitnessScore(profile, workoutHistory, sessionHistory) {
  let score = 30
  const totalSessions = (workoutHistory?.length || 0) + (sessionHistory?.length || 0)
  score += Math.min(25, totalSessions * 1.5)
  if (profile.level === 'intermediaire') score += 10
  else if (profile.level === 'avance') score += 15
  else if (profile.level === 'expert') score += 20
  const recentSessions = [...(workoutHistory || []), ...(sessionHistory || [])].slice(-20)
  const uniqueDays = new Set(recentSessions.map((s) => new Date(s.completedAt || s.date || s.startedAt).toISOString().slice(0, 10)))
  score += Math.min(15, uniqueDays.size * 2)
  if (profile.frequency >= 4) score += 10
  else if (profile.frequency >= 3) score += 5
  if (profile.injuries && profile.injuries.length > 0) score -= profile.injuries.length * 3
  return Math.max(0, Math.min(100, Math.round(score)))
}

function getScoreColor(score) {
  if (score >= 80) return '#C6FF00'
  if (score >= 60) return '#3B82F6'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

function getScoreLabel(score) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Bon'
  if (score >= 40) return 'Moyen'
  return 'À améliorer'
}

function getExcludedExerciseIds(injuries) {
  if (!injuries || injuries.length === 0) return []
  const excluded = new Set()
  const injuryStr = Array.isArray(injuries) ? injuries.join(' ').toLowerCase() : injuries.toLowerCase()
  Object.entries(INJURY_EXCLUSION_MAP).forEach(([key, ids]) => {
    if (injuryStr.includes(key)) ids.forEach((id) => excluded.add(id))
  })
  return Array.from(excluded)
}

function generateWorkout(profile, excludedIds, exercises) {
  const MUSCLE_GROUPS = {
    Pectoraux: { icon: '🏋️', exercises: [] },
    Dos: { icon: '💪', exercises: [] },
    Epaules: { icon: '🤸', exercises: [] },
    Jambes: { icon: '🦵', exercises: [] },
    Abdominaux: { icon: '🔥', exercises: [] },
    Bras: { icon: '💪', exercises: [] },
  }
  exercises.forEach((ex) => {
    if (MUSCLE_GROUPS[ex.muscleGroup]) MUSCLE_GROUPS[ex.muscleGroup].exercises.push(ex)
  })
  const { level, goals, frequency, location, material } = profile
  const goal = Array.isArray(goals) ? goals[0] : goals
  const availableMuscles = Object.keys(MUSCLE_GROUPS).filter((m) => MUSCLE_GROUPS[m].exercises.length > 0)
  const setsForLevel = level === 'debutant' ? 3 : level === 'intermediaire' ? 4 : 4
  const repsForGoal = goal === 'force' ? '5-8' : goal === 'endurance' ? '15-20' : '8-12'

  const filterByEquipment = (ex) => {
    if (!location) return true
    if (location === 'maison') {
      if (ex.equipment === 'barbell' || ex.equipment === 'machine') return false
      if (material && material.includes('aucun') && (ex.equipment === 'dumbbell' || ex.equipment === 'cable')) return false
    }
    if (location === 'exterieur') {
      if (ex.equipment === 'machine' || ex.equipment === 'cable' || ex.equipment === 'barbell') return false
    }
    return true
  }

  const split = []
  const days = Math.min(frequency || 3, 6)
  const musclesPerDay = Math.ceil(availableMuscles.length / Math.max(1, Math.floor(days / 2)))

  for (let dayIndex = 0; dayIndex < days; dayIndex++) {
    const dayMuscles = []
    const startIdx = (dayIndex * musclesPerDay) % availableMuscles.length
    for (let i = 0; i < musclesPerDay && i < availableMuscles.length; i++) {
      dayMuscles.push(availableMuscles[(startIdx + i) % availableMuscles.length])
    }
    const dayExercises = []
    dayMuscles.forEach((muscle) => {
      const pool = MUSCLE_GROUPS[muscle].exercises.filter(
        (e) => !excludedIds.includes(e.id) && filterByEquipment(e)
      )
      const selected = pool.slice(0, muscle === 'Jambes' ? 3 : 2)
      selected.forEach((ex) => {
        dayExercises.push({
          ...ex,
          sets: setsForLevel,
          reps: repsForGoal,
          targetReps: parseInt(repsForGoal.split('-')[1] || repsForGoal.split('-')[0]) || 10,
        })
      })
    })
    const dayNames = ['Push', 'Pull', 'Legs', 'Full Body', 'Upper', 'Lower', 'Cardio']
    split.push({
      day: dayIndex + 1,
      name: dayNames[dayIndex % dayNames.length],
      exercises: dayExercises,
      totalSets: dayExercises.reduce((sum, e) => sum + e.sets, 0),
    })
  }
  return split
}

function ScoreRing({ score, size = 120 }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-[10px] text-muted uppercase">{getScoreLabel(score)}</span>
      </div>
    </div>
  )
}

function FormSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-lime" />
          <span className="text-white font-semibold text-sm">{title}</span>
        </div>
        {open ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-dark-border pt-3">{children}</div>}
    </div>
  )
}

function FormInput({ label, value, onChange, placeholder, type = 'text', suffix }) {
  return (
    <div className="space-y-1">
      <label className="text-muted text-[10px] uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-dark-bg border border-dark-border rounded-xl py-2 px-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-lime/50 transition-all"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs">{suffix}</span>}
      </div>
    </div>
  )
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <label className="text-muted text-[10px] uppercase tracking-wide">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-dark-bg border border-dark-border rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-lime/50 transition-all appearance-none"
      >
        <option value="" className="bg-dark-card">Choisir...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-dark-card text-white">{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function MultiSelect({ label, value = [], onChange, options }) {
  const toggle = (val) => {
    const arr = value.includes(val) ? value.filter((v) => v !== val) : [...value, val]
    onChange(arr)
  }
  return (
    <div className="space-y-2">
      <label className="text-muted text-[10px] uppercase tracking-wide">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              value.includes(opt.value)
                ? 'bg-lime text-dark-bg'
                : 'bg-dark-bg text-muted border border-dark-border'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function SliderInput({ label, value, onChange, min = 0, max = 10, step = 1 }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-muted text-[10px] uppercase tracking-wide">{label}</label>
        <span className="text-white text-xs font-bold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value || min}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-dark-bg rounded-full appearance-none cursor-pointer accent-lime"
      />
    </div>
  )
}

export default function AICoach({ isPremium = false, onShowPaywall }) {
  const { profile: storeProfile, workoutHistory, sessionHistory } = useStore()
  const exercises = useExercises()
  const [view, setView] = useState('main')
  const [generatedSplit, setGeneratedSplit] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [coachProfile, setCoachProfile] = useState(() => {
    const saved = loadProfile()
    if (saved) return saved
    return {
      firstName: storeProfile?.name || '',
      age: storeProfile?.age?.toString() || '',
      sex: storeProfile?.sex === 'Femme' ? 'femme' : storeProfile?.sex === 'Homme' ? 'homme' : 'homme',
      height: storeProfile?.height?.toString() || '',
      weight: storeProfile?.weight?.toString() || '',
      targetWeight: storeProfile?.weight?.toString() || '',
      goals: storeProfile?.goals || [],
      level: storeProfile?.level || '',
      frequency: storeProfile?.frequency || 3,
      sessionsPerWeekActual: storeProfile?.frequency?.toString() || '',
      sleepQuality: '',
      stressLevel: '',
      fatigueLevel: '',
      injuries: storeProfile?.injuries || [],
      workType: 'sedentaire',
      hoursSitting: '',
      sleepHours: '',
      preferredTime: 'matin',
      location: storeProfile?.location || 'salle',
      material: [],
      favoriteExercises: '',
      hatedExercises: '',
      mealsPerDay: '',
      waterIntake: '',
      alcoholConsumption: '',
      healthIssues: '',
      dietType: '',
    }
  })
  const [saved, setSaved] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [altExerciseId, setAltExerciseId] = useState(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendMessage = useCallback(async () => {
    const msg = chatInput.trim()
    if (!msg || chatLoading) return
    setChatInput('')

    const userMessage = { role: 'user', content: msg }
    setChatMessages((prev) => [...prev, userMessage])
    setChatLoading(true)

    try {
      const result = await askCoach(msg, coachProfile, chatMessages)
      if (result.reply) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: result.reply }])
      } else if (result.error) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: `❌ ${result.error}` }])
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: '❌ Erreur de connexion' }])
    }
    setChatLoading(false)
  }, [chatInput, chatLoading, coachProfile, chatMessages])

  const fitnessScore = useMemo(
    () => computeFitnessScore(storeProfile, workoutHistory, sessionHistory),
    [storeProfile, workoutHistory, sessionHistory]
  )

  const excludedIds = useMemo(() => getExcludedExerciseIds(coachProfile.injuries), [coachProfile.injuries])
  const hasInjuries = excludedIds.length > 0
  const totalSessions = (workoutHistory?.length || 0) + (sessionHistory?.length || 0)

  const bmi = useMemo(() => computeBMI(parseFloat(coachProfile.weight), parseFloat(coachProfile.height)), [coachProfile.weight, coachProfile.height])
  const bmr = useMemo(() => computeBMR(parseFloat(coachProfile.weight), parseFloat(coachProfile.height), parseInt(coachProfile.age), coachProfile.sex), [coachProfile.weight, coachProfile.height, coachProfile.age, coachProfile.sex])
  const activityLevel = ACTIVITY_LEVELS.find((l) => l.value === (coachProfile.frequency <= 2 ? 1.2 : coachProfile.frequency <= 3 ? 1.375 : coachProfile.frequency <= 5 ? 1.55 : 1.725))
  const tdee = useMemo(() => computeTDEE(bmr, activityLevel?.value || 1.375), [bmr, activityLevel])
  const bmiCategory = getBMICategory(bmi)
  const weightProgress = useMemo(() => getProgressiveWeight(parseFloat(coachProfile.weight), parseFloat(coachProfile.targetWeight)), [coachProfile.weight, coachProfile.targetWeight])

  const handleSave = useCallback(() => {
    saveProfile(coachProfile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [coachProfile])

  const updateField = useCallback((field, value) => {
    setCoachProfile((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleGenerate = useCallback(() => {
    const split = generateWorkout(coachProfile, excludedIds, exercises)
    setGeneratedSplit(split)
    setView('workout')
  }, [coachProfile, excludedIds, exercises])

  const handleDaySelect = useCallback((dayIndex) => {
    setSelectedDay(dayIndex)
    setView('dayDetail')
  }, [])

  const handleBack = useCallback(() => {
    if (view === 'dayDetail') { setView('workout'); setAltExerciseId(null) }
    else if (view === 'workout') setView('main')
    else if (view === 'bilan') setView('main')
    else if (view === 'profile') setView('main')
    else if (view === 'chat') setView('main')
  }, [view])

  const handlePlanSemaine = useCallback(() => {
    const storeState = useStore.getState()
    const prompt = generateWeekPlan(coachProfile, storeState.exerciseHistory, coachProfile.goals)
    setChatMessages([{ role: 'user', content: prompt }])
    setChatLoading(true)
    setView('chat')
    askCoach(prompt, coachProfile, [])
      .then(result => {
        if (result.reply) setChatMessages(prev => [...prev, { role: 'assistant', content: result.reply }])
        else if (result.error) setChatMessages(prev => [...prev, { role: 'assistant', content: `❌ ${result.error}` }])
      })
      .catch(() => setChatMessages(prev => [...prev, { role: 'assistant', content: '❌ Erreur de connexion' }]))
      .finally(() => setChatLoading(false))
  }, [coachProfile])

  // ==================== DAY DETAIL VIEW ====================
  if (view === 'dayDetail' && generatedSplit && selectedDay !== null) {
    const day = generatedSplit[selectedDay]
    return (
      <div className="space-y-4 p-4">
        <button onClick={handleBack} className="flex items-center gap-1 text-muted hover:text-white text-sm transition-colors">
          <ChevronLeft size={16} /> Retour
        </button>
        <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
          <h3 className="text-white font-bold text-lg mb-1">Jour {day.day} — {day.name}</h3>
          <p className="text-muted text-xs mb-4">{day.exercises.length} exercices · {day.totalSets} séries</p>
          <div className="space-y-3">
            {day.exercises.map((ex, i) => {
              const isAltOpen = altExerciseId === ex.id || altExerciseId === ex.name
              const alternatives = isAltOpen ? findAlternativeExercises(ex.name || ex.id, exercises) : []
              return (
                <div key={i} className="bg-dark-bg rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{ex.name}</span>
                    <span className="text-lime text-xs font-bold">{ex.sets}×{ex.reps}</span>
                  </div>
                  <p className="text-muted text-xs">{ex.muscleGroup} · {ex.equipment}</p>
                  {ex.description && <p className="text-white/30 text-xs mt-1 line-clamp-2">{ex.description}</p>}
                  <button onClick={() => setAltExerciseId(isAltOpen ? null : (ex.id || ex.name))} className="mt-2 text-[10px] text-lime/70 hover:text-lime">{isAltOpen ? 'Fermer' : 'Alternatives'}</button>
                  {isAltOpen && alternatives.length > 0 && <div className="mt-2 space-y-1.5 pl-2 border-l border-lime/20">{alternatives.map((alt, j) => (<div key={j} className="flex items-center justify-between"><span className="text-white/70 text-[10px]">{alt.name}</span><span className="text-muted text-[9px]">{alt.equipment}</span></div>))}</div>}
                  {isAltOpen && alternatives.length === 0 && <p className="mt-2 text-muted text-[10px] pl-2 border-l border-lime/20">Aucune alternative trouvée</p>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ==================== WORKOUT VIEW ====================
  if (view === 'workout' && generatedSplit) {
    return (
      <div className="space-y-4 p-4">
        <button onClick={handleBack} className="flex items-center gap-1 text-muted hover:text-white text-sm transition-colors">
          <ChevronLeft size={16} /> Retour
        </button>
        <div className="bg-dark-card rounded-2xl p-4 border border-dark-border text-center space-y-3">
          <Dumbbell size={32} className="text-lime mx-auto" />
          <h2 className="text-white font-bold text-lg">Ton Programme Généré</h2>
          <p className="text-muted text-xs">{generatedSplit.length} jours · {coachProfile.level || 'intermédiaire'}</p>
        </div>
        {hasInjuries && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-400 shrink-0" />
              <span className="text-orange-300 text-xs">Exercices adaptés à tes blessures ({excludedIds.length} exclus)</span>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {generatedSplit.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDaySelect(index)}
              className="w-full text-left bg-dark-card rounded-2xl p-4 border border-dark-border hover:border-lime/20 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-white font-bold text-sm">Jour {day.day}</span>
                  <span className="text-muted text-sm ml-2">— {day.name}</span>
                </div>
                <span className="text-lime text-xs font-medium">{day.exercises.length} exos</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {day.exercises.map((ex, i) => (
                  <span key={i} className="bg-dark-bg rounded-full px-2 py-0.5 text-[10px] text-muted">{ex.name}</span>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2 text-muted text-[10px]">
                <span className="flex items-center gap-1"><Dumbbell size={10} /> {day.totalSets} séries</span>
                <span className="flex items-center gap-1"><Clock size={10} /> ~{Math.round(day.exercises.length * 4.5)} min</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ==================== PROFILE VIEW ====================
  if (view === 'profile') {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-1 text-muted hover:text-white text-sm transition-colors">
            <ChevronLeft size={16} /> Retour
          </button>
          <h1 className="text-white font-bold text-lg">Mon Profil Coach</h1>
          <div className="w-16" />
        </div>

        {/* Calculs auto */}
        {(bmi || bmr || tdee) && (
          <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-lime" />
              <span className="text-muted text-[10px] uppercase">Calculs automatiques</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {bmi && (
                <div className="bg-dark-bg rounded-xl p-2 text-center">
                  <p className={`text-lg font-bold ${bmiCategory?.color || 'text-white'}`}>{bmi}</p>
                  <p className="text-muted text-[9px]">IMC</p>
                  <p className={`text-[9px] ${bmiCategory?.color || 'text-muted'}`}>{bmiCategory?.label}</p>
                </div>
              )}
              {bmr && (
                <div className="bg-dark-bg rounded-xl p-2 text-center">
                  <p className="text-white text-lg font-bold">{bmr}</p>
                  <p className="text-muted text-[9px]">BMR kcal/j</p>
                </div>
              )}
              {tdee && (
                <div className="bg-dark-bg rounded-xl p-2 text-center">
                  <p className="text-lime text-lg font-bold">{tdee}</p>
                  <p className="text-muted text-[9px]">TDEE kcal/j</p>
                </div>
              )}
            </div>
            {weightProgress && (
              <div className="mt-3 bg-dark-bg rounded-xl p-2 text-center">
                <p className="text-muted text-[9px] mb-1">Progression estimée</p>
                <p className="text-white text-xs font-medium">
                  {weightProgress.direction === 'perte' ? '↓' : '↑'} {weightProgress.weeklyGoal}kg/semaine · ~{weightProgress.estimatedWeeks} semaines
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sections */}
        <FormSection title="Informations générales" icon={User} defaultOpen={true}>
          <FormInput label="Prénom / Pseudo" value={coachProfile.firstName} onChange={(v) => updateField('firstName', v)} placeholder="Ton prénom" />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Âge" value={coachProfile.age} onChange={(v) => updateField('age', v)} type="number" placeholder="25" suffix="ans" />
            <FormSelect label="Sexe" value={coachProfile.sex} onChange={(v) => updateField('sex', v)} options={[{ value: 'homme', label: 'Homme' }, { value: 'femme', label: 'Femme' }]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Taille" value={coachProfile.height} onChange={(v) => updateField('height', v)} type="number" placeholder="175" suffix="cm" />
            <FormInput label="Poids actuel" value={coachProfile.weight} onChange={(v) => updateField('weight', v)} type="number" placeholder="75" suffix="kg" />
          </div>
          <FormInput label="Poids objectif" value={coachProfile.targetWeight} onChange={(v) => updateField('targetWeight', v)} type="number" placeholder="70" suffix="kg" />
        </FormSection>

        <FormSection title="Objectif principal" icon={Target}>
          <MultiSelect label="Ton objectif" value={coachProfile.goals} onChange={(v) => updateField('goals', v)} options={GOALS} />
        </FormSection>

        <FormSection title="Niveau sportif" icon={Trophy}>
          <div className="space-y-2">
            {LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => updateField('level', lvl.value)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  coachProfile.level === lvl.value ? 'border-lime bg-lime/10' : 'border-dark-border bg-dark-bg'
                }`}
              >
                <div className="text-left">
                  <p className={`text-sm font-medium ${coachProfile.level === lvl.value ? 'text-lime' : 'text-white'}`}>{lvl.label}</p>
                  <p className="text-muted text-[10px]">{lvl.desc}</p>
                </div>
                {coachProfile.level === lvl.value && <CheckCircle2 size={16} className="text-lime" />}
              </button>
            ))}
          </div>
          <SliderInput label="Fréquence d'entraînement" value={coachProfile.frequency} onChange={(v) => updateField('frequency', v)} min={1} max={7} />
        </FormSection>

        <FormSection title="Condition physique" icon={Heart}>
          <SliderInput label="Niveau d'énergie (1-10)" value={coachProfile.fatigueLevel || 5} onChange={(v) => updateField('fatigueLevel', v)} min={1} max={10} />
          <div className="space-y-1">
            <label className="text-muted text-[10px] uppercase tracking-wide">Qualité du sommeil</label>
            <div className="flex gap-1.5">
              {SLEEP_QUALITY.map((q) => (
                <button
                  key={q}
                  onClick={() => updateField('sleepQuality', q)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-medium transition-all ${
                    coachProfile.sleepQuality === q ? 'bg-lime text-dark-bg' : 'bg-dark-bg text-muted border border-dark-border'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-muted text-[10px] uppercase tracking-wide">Niveau de stress</label>
            <div className="flex gap-1.5">
              {STRESS_LEVEL.map((s) => (
                <button
                  key={s}
                  onClick={() => updateField('stressLevel', s)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-medium transition-all ${
                    coachProfile.stressLevel === s ? 'bg-lime text-dark-bg' : 'bg-dark-bg text-muted border border-dark-border'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </FormSection>

        <FormSection title="Blessures & limitations" icon={AlertTriangle}>
          <MultiSelect label="Zones touchées" value={coachProfile.injuries} onChange={(v) => updateField('injuries', v)} options={INJURIES_LIST} />
          <FormInput label="Autres problèmes" value={coachProfile.healthIssues} onChange={(v) => updateField('healthIssues', v)} placeholder="Douleur chronique, opération..." />
        </FormSection>

        <FormSection title="Mode de vie" icon={Moon}>
          <div className="space-y-1">
            <label className="text-muted text-[10px] uppercase tracking-wide">Type de métier</label>
            <div className="flex gap-1.5">
              {[{ value: 'sedentaire', label: 'Sédentaire' }, { value: 'actif', label: 'Actif' }, { value: 'physique', label: 'Physique' }].map((t) => (
                <button
                  key={t.value}
                  onClick={() => updateField('workType', t.value)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-medium transition-all ${
                    coachProfile.workType === t.value ? 'bg-lime text-dark-bg' : 'bg-dark-bg text-muted border border-dark-border'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <FormInput label="Heures de sommeil" value={coachProfile.sleepHours} onChange={(v) => updateField('sleepHours', v)} type="number" placeholder="7" suffix="h/nuit" />
          <div className="space-y-1">
            <label className="text-muted text-[10px] uppercase tracking-wide">Moment préféré pour le sport</label>
            <div className="flex gap-1.5">
              {[{ value: 'matin', label: 'Matin' }, { value: 'aprem', label: 'Après-midi' }, { value: 'soir', label: 'Soir' }].map((t) => (
                <button
                  key={t.value}
                  onClick={() => updateField('preferredTime', t.value)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-medium transition-all ${
                    coachProfile.preferredTime === t.value ? 'bg-lime text-dark-bg' : 'bg-dark-bg text-muted border border-dark-border'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </FormSection>

        <FormSection title="Préférences sportives" icon={Settings}>
          <div className="space-y-1">
            <label className="text-muted text-[10px] uppercase tracking-wide">Où t'entraînes-tu ?</label>
            <div className="flex gap-1.5">
              {EQUIPMENT.map((e) => (
                <button
                  key={e.value}
                  onClick={() => updateField('location', e.value)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-medium transition-all ${
                    coachProfile.location === e.value ? 'bg-lime text-dark-bg' : 'bg-dark-bg text-muted border border-dark-border'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <MultiSelect label="Matériel disponible" value={coachProfile.material} onChange={(v) => updateField('material', v)} options={MATERIAL} />
          <FormInput label="Exercices préférés" value={coachProfile.favoriteExercises} onChange={(v) => updateField('favoriteExercises', v)} placeholder="Développé, tractions..." />
          <FormInput label="Exercices détestés" value={coachProfile.hatedExercises} onChange={(v) => updateField('hatedExercises', v)} placeholder="Burpees, gainage..." />
        </FormSection>

        <FormSection title="Nutrition" icon={Apple}>
          <FormInput label="Repas par jour" value={coachProfile.mealsPerDay} onChange={(v) => updateField('mealsPerDay', v)} type="number" placeholder="3" />
          <FormInput label="Eau quotidienne" value={coachProfile.waterIntake} onChange={(v) => updateField('waterIntake', v)} placeholder="1.5L, 2L..." />
          <FormInput label="Alcool" value={coachProfile.alcoholConsumption} onChange={(v) => updateField('alcoholConsumption', v)} placeholder="Jamais, occasionnel..." />
        </FormSection>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            saved ? 'bg-lime/20 text-lime' : 'bg-lime text-dark-bg hover:bg-lime/90'
          }`}
        >
          {saved ? <><CheckCircle2 size={16} /> Profil enregistré !</> : <><Save size={16} /> Enregistrer le profil</>}
        </button>
      </div>
    )
  }

  // ==================== BILAN VIEW ====================
  if (view === 'bilan') {
    return (
      <div className="space-y-4 p-4">
        <button onClick={handleBack} className="flex items-center gap-1 text-muted hover:text-white text-sm transition-colors">
          <ChevronLeft size={16} /> Retour
        </button>
        <div className="bg-dark-card rounded-2xl p-4 border border-dark-border space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-lime" />
            <h3 className="text-white font-bold text-sm">Bilan Complet</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-bg rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-white">{totalSessions}</p>
              <p className="text-muted text-xs">Séances totales</p>
            </div>
            <div className="bg-dark-bg rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-lime">{fitnessScore}</p>
              <p className="text-muted text-xs">Score fitness</p>
            </div>
            <div className="bg-dark-bg rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-white">{coachProfile.frequency || 3}</p>
              <p className="text-muted text-xs">Jours / semaine</p>
            </div>
            <div className="bg-dark-bg rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-white">{excludedIds.length}</p>
              <p className="text-muted text-xs">Exercices exclus</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-muted text-[10px] uppercase tracking-wide">Recommandation</p>
            <div className="bg-dark-bg rounded-xl p-3 text-xs text-white/70 leading-relaxed">
              {fitnessScore >= 80
                ? 'Ton niveau est excellent. Entraîne-toi avec des programmes avancés et varie les stimuli.'
                : fitnessScore >= 60
                ? 'Bon niveau. Augmente progressivement le volume et l\'intensité pour progresser.'
                : fitnessScore >= 40
                ? 'Niveau moyen. Concentre-toi sur la constance et les mouvements composés.'
                : 'Commence avec une routine simple 3x/semaine. La régularité est la clé.'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==================== CHAT VIEW ====================
  if (view === 'chat') {
    if (!isPremium) {
      return (
        <div className="space-y-4 p-4">
          <button onClick={handleBack} className="flex items-center gap-1 text-muted hover:text-white text-sm transition-colors">
            <ChevronLeft size={16} /> Retour
          </button>
          <div className="bg-dark-card rounded-2xl p-8 border border-dark-border text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto">
              <Crown size={32} className="text-white" />
            </div>
            <h2 className="text-white font-bold text-lg">Fonctionnalité Premium</h2>
            <p className="text-muted text-sm">Le Chat avec NIRIKA est réservé aux abonnés Premium.</p>
            <button
              onClick={onShowPaywall}
              className="px-6 py-3 rounded-xl bg-lime text-dark-bg font-bold text-sm hover:bg-lime/90 transition-all"
            >
              Passer à Premium
            </button>
          </div>
        </div>
      )
    }

    const suggestedQuestions = [
      'Combien de séances par semaine ?',
      'Quels exercices pour mon objectif ?',
      'Comment améliorer ma récupération ?',
      'Que manger avant l\'entraînement ?',
    ]
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} className="flex items-center gap-1 text-muted hover:text-white text-sm transition-colors">
            <ChevronLeft size={16} /> Retour
          </button>
          <h1 className="text-white font-bold text-sm">Coach NIRIKA</h1>
          <div className="w-16" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
          {chatMessages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-lime/20 flex items-center justify-center mx-auto">
                <MessageCircle size={32} className="text-lime" />
              </div>
              <p className="text-white font-bold text-sm">Pose ta question à NIRIKA</p>
              <p className="text-muted text-xs">Conseils personnalisés selon ton profil</p>
              <div className="space-y-2 max-w-xs mx-auto">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setChatInput(q)
                    }}
                    className="w-full text-left bg-dark-card rounded-xl px-3 py-2 text-xs text-white/70 hover:text-white hover:border-lime/30 border border-dark-border transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-lime text-dark-bg font-medium'
                  : 'bg-dark-card border border-dark-border text-white/90'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 rounded-lg bg-lime/20 flex items-center justify-center">
                      <MessageCircle size={12} className="text-lime" />
                    </div>
                    <span className="text-[10px] font-bold text-lime uppercase">NIRIKA</span>
                  </div>
                )}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-dark-card border border-dark-border rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-lime/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-lime/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-lime animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="flex items-center gap-2 bg-dark-card rounded-2xl border border-dark-border p-1.5">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Pose ta question..."
            className="flex-1 bg-transparent border-none text-white text-sm px-3 py-2 placeholder-white/30 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || chatLoading}
            className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center disabled:opacity-40 transition-all active:scale-90"
          >
            <Send size={16} className="text-dark-bg" />
          </button>
        </div>
      </div>
    )
  }

  // ==================== MAIN VIEW ====================
  return (
    <div data-onboard="coach" className="space-y-4 p-4">
      {/* Score Ring */}
      <div className="bg-dark-card rounded-2xl p-6 border border-dark-border flex flex-col items-center gap-3">
        <ScoreRing score={fitnessScore} />
        <div className="text-center">
          <p className="text-muted text-xs uppercase tracking-wide">Niveau Fitness</p>
          <p className="text-white font-bold text-sm">{getScoreLabel(fitnessScore)}</p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-card rounded-2xl p-3 border border-dark-border">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={14} className="text-yellow-400" />
            <span className="text-muted text-[10px] uppercase">Séances totales</span>
          </div>
          <p className="text-white text-xl font-bold">{totalSessions}</p>
        </div>
        <div className="bg-dark-card rounded-2xl p-3 border border-dark-border">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-lime" />
            <span className="text-muted text-[10px] uppercase">Fréquence</span>
          </div>
          <p className="text-white text-xl font-bold">{coachProfile.frequency || 3}x / sem</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={() => isPremium ? setView('chat') : onShowPaywall?.()}
          className="w-full bg-dark-card rounded-2xl p-4 flex items-center gap-3 hover:bg-dark-border transition-all active:scale-[0.98] border border-dark-border relative"
        >
          <div className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center">
            <MessageCircle size={20} className="text-dark-bg" />
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-bold text-sm">Chat avec NIRIKA</p>
            <p className="text-muted text-xs">Pose tes questions, reçois des conseils personnalisés</p>
          </div>
          {!isPremium && <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500 text-[9px] text-white font-bold rounded-full">Premium</span>}
        </button>

        <button
          onClick={() => setView('profile')}
          className="w-full bg-dark-card rounded-2xl p-4 flex items-center gap-3 hover:bg-dark-border transition-all active:scale-[0.98] border border-dark-border"
        >
          <div className="w-10 h-10 rounded-xl bg-lime/20 flex items-center justify-center">
            <User size={20} className="text-lime" />
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-bold text-sm">Mon Profil</p>
            <p className="text-muted text-xs">{coachProfile.firstName ? `${coachProfile.firstName} — ${coachProfile.level || 'Non défini'}` : 'Configure ton profil pour un coaching adapté'}</p>
          </div>
          <ChevronRight size={16} className="text-muted" />
        </button>

        <button
          onClick={handleGenerate}
          className="w-full bg-dark-card rounded-2xl p-4 flex items-center gap-3 hover:bg-dark-border transition-all active:scale-[0.98] border border-dark-border"
        >
          <div className="w-10 h-10 rounded-xl bg-lime/20 flex items-center justify-center">
            <Dumbbell size={20} className="text-lime" />
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-bold text-sm">Générer un programme</p>
            <p className="text-muted text-xs">Basé sur ton profil et tes objectifs</p>
          </div>
        </button>

        <button
          onClick={() => isPremium ? handlePlanSemaine() : onShowPaywall?.()}
          className="w-full bg-dark-card rounded-2xl p-4 flex items-center gap-3 hover:bg-dark-border transition-all active:scale-[0.98] border border-dark-border relative"
        >
          <div className="w-10 h-10 rounded-xl bg-lime/20 flex items-center justify-center">
            <CalendarRange size={20} className="text-lime" />
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-bold text-sm">Plan semaine</p>
            <p className="text-muted text-xs">Programme IA personnalisé selon ton niveau</p>
          </div>
          {!isPremium && <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500 text-[9px] text-white font-bold rounded-full">Premium</span>}
        </button>

        <button
          onClick={() => setView('bilan')}
          className="w-full bg-dark-card rounded-2xl p-4 flex items-center gap-3 hover:bg-dark-border transition-all active:scale-[0.98] border border-dark-border"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <BarChart3 size={20} className="text-blue-400" />
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-bold text-sm">Bilan & Statistiques</p>
            <p className="text-muted text-xs">Analyse de tes performances</p>
          </div>
        </button>
      </div>

      {/* Generated Plan */}
      {generatedSplit && generatedSplit.length > 0 && (
        <div className="bg-dark-card rounded-2xl p-4 border border-lime/30 space-y-3">
          <div className="flex items-center gap-2"><Bot size={14} className="text-lime" /><span className="text-white font-bold text-sm">Programme généré</span></div>
          {generatedSplit.map((day, i) => (
            <div key={i} className="bg-dark-bg rounded-xl p-3">
              <div className="flex items-center justify-between mb-2"><span className="text-white font-medium text-sm">Jour {day.day} — {day.name}</span><span className="text-lime text-[10px] font-bold">{day.exercises.length} exos · {day.totalSets} séries</span></div>
              <div className="space-y-1">{day.exercises.slice(0, 4).map((ex, j) => (<div key={j} className="flex items-center justify-between text-[10px]"><span className="text-white/70">{ex.name}</span><span className="text-white/40">{ex.sets}×{ex.reps}</span></div>))}{day.exercises.length > 4 && <p className="text-muted text-[10px]">+{day.exercises.length - 4} exercices...</p>}</div>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={() => { const today = new Date(); const sessions = generatedSplit.map((d, i) => { const date = new Date(today); date.setDate(date.getDate() + i); return { date: date.toISOString().slice(0, 10), day: d.name, exercises: d.exercises, name: d.name, source: 'ai' } }); useStore.getState().addPlannedWeek(sessions); setGeneratedSplit(null); alert('Ajouté au calendrier !') }} className="flex-1 py-2.5 rounded-xl bg-lime text-dark-bg font-bold text-xs">Valider → Calendrier</button>
            <button onClick={() => { useStore.getState().addWorkoutTemplate({ name: 'Programme IA', exercises: generatedSplit.flatMap(d => d.exercises) }); setGeneratedSplit(null); alert('Template enregistré !') }} className="flex-1 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white font-bold text-xs">Template</button>
          </div>
        </div>
      )}

      {/* Avertissement blessures */}
      {hasInjuries && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-300 text-xs font-medium">Blessures détectées</p>
              <p className="text-orange-300/60 text-xs mt-0.5">{excludedIds.length} exercice{excludedIds.length > 1 ? 's' : ''} exclu{excludedIds.length > 1 ? 's' : ''} du programme</p>
            </div>
          </div>
        </div>
      )}

      {/* Résumé profil */}
      {coachProfile.firstName && (
        <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
          <div className="flex items-center gap-2 mb-3">
            <User size={14} className="text-lime" />
            <span className="text-muted text-[10px] uppercase">Résumé profil</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {coachProfile.age && <p className="text-white"><span className="text-muted">Âge : </span>{coachProfile.age} ans</p>}
            {coachProfile.height && <p className="text-white"><span className="text-muted">Taille : </span>{coachProfile.height}cm</p>}
            {coachProfile.weight && <p className="text-white"><span className="text-muted">Poids : </span>{coachProfile.weight}kg</p>}
            {bmi && <p className="text-white"><span className="text-muted">IMC : </span><span className={bmiCategory?.color}>{bmi}</span></p>}
            {coachProfile.level && <p className="text-white"><span className="text-muted">Niveau : </span>{LEVELS.find(l => l.value === coachProfile.level)?.label}</p>}
            {coachProfile.goals?.length > 0 && <p className="text-white"><span className="text-muted">Objectif : </span>{GOALS.find(g => g.value === coachProfile.goals[0])?.label}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
