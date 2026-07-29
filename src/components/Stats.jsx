import { useMemo, useState, useEffect } from 'react'
import {
  Flame,
  Dumbbell,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Rocket,
  Heart,
} from 'lucide-react'
import useStore from '../store/useStore'
import CalisthenicsTracker from './CalisthenicsTracker'
import CalisthenicsBilan from './CalisthenicsBilan'
import Badges from './Badges'
import PersonalRecords from './PersonalRecords'
import WeightTracker from './WeightTracker'
import TrainingReminders from './TrainingReminders'
import ExportCSV from './ExportCSV'

const MOTIVATION_KEY = 'nirika_motivation_phrases'
const DEFAULT_PHRASES = [
  "Chaque grand parcours commence par un premier pas. Lance ta première séance !",
  "La régularité fait la différence. Mieux vaut 30 min chaque jour que 3h une fois par semaine.",
  "Ton corps est capable de bien plus que tu ne l'imagines. Pousse tes limites !",
  "Le seul entraînement que tu regrettes, c'est celui que tu n'as pas fait.",
  "La discipline, c'est choisir entre ce que tu veux maintenant et ce que tu veux le plus.",
  "Chaque répétition te rapproche de la version la plus forte de toi-même.",
  "Ne compare pas ton chapitre 1 à quelqu'un d'autre. Chacun son rythme.",
  "La récupération fait partie de l'entraînement. Écoute ton corps.",
  "Tu n'as pas besoin d'être parfait, tu as besoin de commencer. 💪",
  "Le succès, c'est la somme de petits efforts répétés chaque jour. 🔥",
]

function getStoredPhrases() {
  try {
    const raw = localStorage.getItem(MOTIVATION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return DEFAULT_PHRASES
}

function getTrend(data) {
  if (data.length < 2) return 'stable'
  const recent = data.slice(-3).reduce((a, b) => a + b, 0) / 3
  const older = data.slice(-6, -3).reduce((a, b) => a + b, 0) / 3
  if (!older) return 'stable'
  const diff = ((recent - older) / older) * 100
  if (diff > 10) return 'up'
  if (diff < -10) return 'down'
  return 'stable'
}

function getLevelLabel(level) {
  const labels = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' }
  return labels[level] || level
}

function getGoalLabel(goal) {
  const labels = {
    perte_poids: 'Perte de poids',
    prise_masse: 'Prise de masse',
    force: 'Force',
    endurance: 'Endurance',
    definition: 'Définition',
    sante: 'Santé',
    flexibilite: 'Flexibilité',
    mobilite: 'Mobilité',
    performance: 'Performance sportive',
  }
  return labels[goal] || goal
}

export default function Stats() {
  const { profile, sessionHistory, workoutHistory, getStreak, calisthenie30 } = useStore()
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [phrases, setPhrases] = useState(getStoredPhrases)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [phrases.length])

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === MOTIVATION_KEY) setPhrases(getStoredPhrases())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const allSessions = useMemo(() => {
    const combined = [
      ...(sessionHistory || []).map((s) => ({
        ...s,
        _type: 'exercise',
        date: s.date || s.startedAt || s.completedAt,
      })),
      ...(workoutHistory || []).map((w) => ({
        ...w,
        _type: w.type === 'cardio' ? 'cardio' : 'exercise',
        date: w.completedAt || w.date,
      })),
    ]
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [sessionHistory, workoutHistory])

  const streak = getStreak()
  const totalSessions = allSessions.length
  const totalCalories = allSessions.reduce((sum, s) => sum + (s.calories || 0), 0)
  const totalDuration = allSessions.reduce((sum, s) => sum + (s.duration || s.durationMinutes || 0), 0)
  const avgDuration = totalSessions ? Math.round(totalDuration / totalSessions) : 0

  const weeklySessions = useMemo(() => {
    const now = new Date()
    const weeks = []
    for (let w = 3; w >= 0; w--) {
      const weekEnd = new Date(now)
      weekEnd.setDate(now.getDate() - w * 7)
      const weekStart = new Date(weekEnd)
      weekStart.setDate(weekEnd.getDate() - 6)
      const count = allSessions.filter((s) => {
        const d = new Date(s.date)
        return d >= weekStart && d <= weekEnd
      }).length
      weeks.push(count)
    }
    return weeks
  }, [allSessions])

  const weeklyCalories = useMemo(() => {
    const now = new Date()
    const weeks = []
    for (let w = 3; w >= 0; w--) {
      const weekEnd = new Date(now)
      weekEnd.setDate(now.getDate() - w * 7)
      const weekStart = new Date(weekEnd)
      weekStart.setDate(weekEnd.getDate() - 6)
      const cal = allSessions
        .filter((s) => {
          const d = new Date(s.date)
          return d >= weekStart && d <= weekEnd
        })
        .reduce((sum, s) => sum + (s.calories || 0), 0)
      weeks.push(cal)
    }
    return weeks
  }, [allSessions])

  const sessionTrend = getTrend(weeklySessions)
  const calorieTrend = getTrend(weeklyCalories)

  const targetSessionsPerWeek = profile?.frequency || 3
  const weekSessions = weeklySessions[weeklySessions.length - 1] || 0
  const adherence = Math.min(100, Math.round((weekSessions / targetSessionsPerWeek) * 100))

  const analysis = useMemo(() => {
    const insights = []
    const recommendations = []
    const actions = []

    if (totalSessions === 0) {
      return {
        diagnosis: 'Aucune donnée encore',
        summary: 'Commence ton premier entraînement pour que je puisse analyser tes performances !',
        insights: [{ type: 'info', text: 'Enregistre tes séances pour débloquer l\'analyse NIRIKA' }],
        recommendations: ['Commence avec 3 séances par semaine', 'Choisis un programme adapté à ton niveau'],
        actions: ['Lancer une séance', 'Choisir un programme', 'Définir tes objectifs'],
      }
    }

    if (adherence >= 100) {
      insights.push({ type: 'success', text: `Brille ! Tu respectes ton objectif de ${targetSessionsPerWeek} séances/semaine` })
    } else if (adherence >= 70) {
      insights.push({ type: 'warning', text: `Tu es à ${adherence}% de ton objectif (${weekSessions}/${targetSessionsPerWeek} cette semaine)` })
    } else {
      insights.push({ type: 'danger', text: `Sous-objectif : ${weekSessions}/${targetSessionsPerWeek} séances cette semaine (${adherence}%)` })
    }

    if (sessionTrend === 'up') {
      insights.push({ type: 'success', text: 'Ton volume d\'entraînement est en progression 📈' })
    } else if (sessionTrend === 'down') {
      insights.push({ type: 'warning', text: 'Attention, ton volume est en baisse cette semaine' })
    }

    if (calorieTrend === 'up') {
      insights.push({ type: 'success', text: 'Calories brûlées en hausse — bon signe !' })
    }

    if (streak >= 7) {
      insights.push({ type: 'success', text: `Série de ${streak} jours consécutifs — discipline au top ! 🔥` })
    } else if (streak >= 3) {
      insights.push({ type: 'info', text: `${streak} jours consécutifs — continue comme ça !` })
    }

    if (avgDuration < 30) {
      recommendations.push('Augmente la durée moyenne à 45-60 min pour de meilleurs résultats')
    } else if (avgDuration > 90) {
      recommendations.push('Séances longues : assure-toi de bien récupérer entre les sessions')
    }

    if (profile?.goals?.includes('prise_masse')) {
      recommendations.push('Prise de masse : vise 1.6-2.2g de protéines/kg de poids corporel')
    }
    if (profile?.goals?.includes('perte_poids')) {
      recommendations.push('Perte de poids : maintiens un déficit calorique modéré de 300-500 kcal/jour')
    }

    if (weekSessions < targetSessionsPerWeek) {
      actions.push(`Ajoute ${targetSessionsPerWeek - weekSessions} séance(s) cette semaine`)
    }
    actions.push('Hydrate-toi : 2-3L d\'eau par jour minimum')
    actions.push('Dors 7-9h pour optimiser la récupération musculaire')
    if (totalSessions > 10) {
      actions.push('Envisage d\'augmenter les charges de 5-10%')
    }

    const diagnoses = []
    if (adherence >= 100 && sessionTrend === 'up') diagnoses.push(' excellente forme')
    else if (adherence >= 70) diagnoses.push(' bonne dynamique')
    else if (sessionTrend === 'down') diagnoses.push(' baisse de rythme')
    else diagnoses.push(' progression possible')

    return {
      diagnosis: diagnoses[0] || 'En cours d\'analyse',
      summary: totalSessions > 5
        ? `${totalSessions} séances enregistrées, ${totalCalories.toLocaleString()} kcal brûlées au total. ${avgDuration} min de moyenne par séance.`
        : 'Collecte encore des données pour une analyse précise.',
      insights,
      recommendations: recommendations.length ? recommendations : ['Continue sur ta lancée !'],
      actions: actions.slice(0, 5),
    }
  }, [totalSessions, totalCalories, avgDuration, streak, weekSessions, targetSessionsPerWeek, sessionTrend, calorieTrend, adherence, profile])

  return (
    <div data-onboard="stats" className="space-y-5 p-4">
      {/* Title */}
      <h1 className="text-white font-bold text-2xl">Stats</h1>

      {/* User Profile Summary */}
      <div className="bg-dark-card rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-lime/20 flex items-center justify-center">
            <Dumbbell size={24} className="text-lime" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{profile?.full_name || 'Athlète'}</p>
            <p className="text-muted text-xs">
              {getLevelLabel(profile?.level)} · {profile?.age || '—'} ans · {profile?.weight || '—'} kg
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {profile?.goals?.map((g) => (
            <span key={g} className="px-2.5 py-1 bg-lime/10 text-lime text-[10px] font-medium rounded-full">
              {getGoalLabel(g)}
            </span>
          ))}
          {(!profile?.goals || profile.goals.length === 0) && (
            <span className="px-2.5 py-1 bg-white/5 text-muted text-[10px] rounded-full">
              Objectif non défini
            </span>
          )}
        </div>
      </div>

      {/* 30-Day Calisthenics Tracker */}
      {calisthenie30.startDate && (
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-sm mb-3">NIRIKA CALISTHENIE 30 JOURS</h2>
          <CalisthenicsTracker />
          <CalisthenicsBilan />
        </div>
      )}

      {/* Badges + Records + Weight + Reminders */}
      <div className="space-y-3">
        <div data-onboard="badges">
          <Badges compact />
        </div>
        <PersonalRecords compact />
        <WeightTracker compact />
        <TrainingReminders />
        <ExportCSV />
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-card rounded-2xl p-4">
          <Flame size={20} className="text-lime mb-2" />
          <p className="text-white text-2xl font-bold">{totalSessions}</p>
          <p className="text-muted text-xs">Séances totales</p>
        </div>
        <div className="bg-dark-card rounded-2xl p-4">
          <Zap size={20} className="text-lime mb-2" />
          <p className="text-white text-2xl font-bold">{totalCalories.toLocaleString()}</p>
          <p className="text-muted text-xs">Calories brûlées</p>
        </div>
        <div className="bg-dark-card rounded-2xl p-4">
          <Clock size={20} className="text-lime mb-2" />
          <p className="text-white text-2xl font-bold">{avgDuration} min</p>
          <p className="text-muted text-xs">Durée moyenne</p>
        </div>
        <div className="bg-dark-card rounded-2xl p-4">
          <Target size={20} className="text-lime mb-2" />
          <p className="text-white text-2xl font-bold">{adherence}%</p>
          <p className="text-muted text-xs">Respect objectif</p>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-dark-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-lime flex items-center justify-center">
            <span className="text-dark-bg text-xs font-bold">AI</span>
          </div>
          <span className="text-white font-semibold text-sm">Analyse rapide</span>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            {sessionTrend === 'up' ? (
              <TrendingUp size={16} className="text-lime" />
            ) : sessionTrend === 'down' ? (
              <TrendingDown size={16} className="text-red-400" />
            ) : (
              <Minus size={16} className="text-muted" />
            )}
            <span className="text-white text-sm font-medium">Tendance</span>
          </div>
          <p className="text-muted text-xs pl-6">{analysis.diagnosis}</p>
        </div>

        <p className="text-white/70 text-xs leading-relaxed mb-4">{analysis.summary}</p>

        {/* Insights */}
        <div className="space-y-2">
          {analysis.insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2">
              {insight.type === 'success' ? (
                <CheckCircle2 size={14} className="text-lime mt-0.5 flex-shrink-0" />
              ) : insight.type === 'warning' ? (
                <AlertTriangle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              ) : insight.type === 'danger' ? (
                <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
              ) : (
                <Lightbulb size={14} className="text-muted mt-0.5 flex-shrink-0" />
              )}
              <p className="text-white/80 text-xs leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-dark-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-lime" />
          <span className="text-white font-semibold text-sm">Conseils personnalisés</span>
        </div>
        <div className="space-y-2">
          {analysis.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-lime mt-1.5 flex-shrink-0" />
              <p className="text-white/70 text-xs leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-dark-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Rocket size={16} className="text-lime" />
          <span className="text-white font-semibold text-sm">Plan d'action</span>
        </div>
        <div className="space-y-2">
          {analysis.actions.map((action, i) => (
            <div key={i} className="flex items-center gap-3 bg-dark-bg rounded-xl p-3">
              <div className="w-6 h-6 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lime text-xs font-bold">{i + 1}</span>
              </div>
              <p className="text-white/80 text-xs">{action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Motivation */}
      <div className="bg-gradient-to-r from-lime/10 to-lime/5 rounded-2xl p-4 border border-lime/20">
        <div className="flex items-center gap-2 mb-2">
          <Heart size={16} className="text-lime" />
          <span className="text-lime font-semibold text-sm">Motivation</span>
          <div className="ml-auto flex gap-1">
            {phrases.slice(0, Math.min(phrases.length, 10)).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === phraseIndex % Math.min(phrases.length, 10) ? 'bg-lime w-4' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-white text-sm font-medium leading-relaxed transition-opacity duration-500" key={phraseIndex}>
          {phrases[phraseIndex % phrases.length]}
        </p>
      </div>
    </div>
  )
}
