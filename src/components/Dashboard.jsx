import { useState, useMemo } from 'react'
import {
  Search,
  ChevronRight,
  Dumbbell,
  Apple,
  Zap,
  Activity,
  TrendingUp,
  Layout,
  LayoutDashboard,
  Play,
  FileText,
  User,
} from 'lucide-react'
import useStore from '../store/useStore'
import { programs } from '../data/programs'
import Recommendations from './Recommendations'
import StreakMotivation from './StreakMotivation'
import DailyWorkout from './DailyWorkout'

const PROFILE_KEY = 'nirika_coach_profile'
const USER_PROFILE_KEY = 'nirika-profile'

const PLAN_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop',
]

const QUICK_ACTIONS = [
  { id: 'nutrition', label: 'Nutrition', icon: Apple, color: 'from-lime/20 to-lime/5', iconColor: 'text-lime' },
  { id: 'cardio', label: 'Cardio', icon: Activity, color: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400' },
  { id: 'calisthenics', label: 'Exercices', icon: Zap, color: 'from-orange-500/20 to-orange-500/5', iconColor: 'text-orange-400' },
]

export default function Dashboard() {
  const { profile, setCurrentView, workoutHistory, sessionHistory, exerciseHistory } = useStore()
  const activeSession = useStore((s) => s.activeSession)
  const profileName = profile?.name || profile?.full_name
  const [searchQuery, setSearchQuery] = useState('')
  const [simpleMode, setSimpleMode] = useState(() => {
    try { return localStorage.getItem('nirika_dashboard_mode') === 'simple' } catch { return false }
  })

  const firstName = useMemo(() => {
    if (profile?.full_name) return profile.full_name.split(' ')[0]
    if (profile?.name) return profile.name.split(' ')[0]
    try {
      const saved = localStorage.getItem(USER_PROFILE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.name) return parsed.name.split(' ')[0]
      }
    } catch {}
    try {
      const saved = localStorage.getItem(PROFILE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.name) return parsed.name.split(' ')[0]
      }
    } catch {}
    return ''
  }, [profile])

  const filteredPrograms = useMemo(() => {
    if (!searchQuery) return programs.slice(0, 4)
    return programs.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="space-y-10 p-6">
      {/* Hero Greeting */}
      <div data-onboard="hero" className="relative rounded-2xl overflow-hidden p-5 bg-gradient-to-br from-dark-card via-dark-bg to-dark-card border border-dark-border future-glass future-glow">
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime/5 rounded-full blur-[60px] animate-hero-bg" />
        <div className="relative z-10">
          <p className="text-muted text-xs font-medium uppercase tracking-wider mb-1">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-white font-bold text-2xl mb-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center border border-lime/30"><User size={20} className="text-lime" /></div>
            Bonjour{firstName ? ` ${firstName}` : ''}
          </h1>
          <p className="text-lime text-sm font-semibold">Prêt pour ta séance ?</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-end -mt-2 mb-2">
        <button onClick={() => { const next = !simpleMode; setSimpleMode(next); try { localStorage.setItem('nirika_dashboard_mode', next ? 'simple' : 'full') } catch {} }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-card border border-dark-border text-muted hover:text-white transition-colors text-[10px] future-glass">
          {simpleMode ? <LayoutDashboard size={12} /> : <Layout size={12} />}
          {simpleMode ? 'Complet' : 'Simplifié'}
        </button>
      </div>

      {/* Quick Actions */}
      <div data-onboard="quick-actions" className="grid grid-cols-3 gap-2">
        {QUICK_ACTIONS.map((action, i) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={() => setCurrentView(action.id)}
              className={`animate-fade-in bg-gradient-to-br ${action.color} rounded-2xl p-3 flex flex-col items-center gap-2 border border-dark-border hover:scale-105 active:scale-95 transition-all`}
              style={{ animationDelay: `${i * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <Icon size={20} className={action.iconColor} />
              <span className="text-white text-[10px] font-medium">{action.label}</span>
            </button>
          )
        })}
      </div>

      {/* CTA: Reprendre ou Démarrer */}
      <div className="animate-fade-in" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        {activeSession ? (
          <button onClick={() => setCurrentView('session')} className="w-full future-cta p-4 flex items-center gap-3 hover:brightness-110 transition-all active:scale-[0.98]">
            <div className="w-12 h-12 rounded-xl bg-dark-bg/30 flex items-center justify-center"><Play size={24} className="text-dark-bg" fill="currentColor" /></div>
            <div className="text-left flex-1"><p className="text-dark-bg font-bold text-sm">Reprendre ma seance</p><p className="text-dark-bg/60 text-xs">{activeSession.exerciseName}</p></div>
          </button>
        ) : (
          <button onClick={() => setCurrentView('calisthenics')} className="w-full future-cta p-4 flex items-center gap-3 hover:brightness-110 transition-all active:scale-[0.98]">
            <div className="w-12 h-12 rounded-xl bg-dark-bg/30 flex items-center justify-center"><Play size={24} className="text-dark-bg" fill="currentColor" /></div>
            <div className="text-left flex-1"><p className="text-dark-bg font-bold text-sm">Demarrer une seance</p><p className="text-dark-bg/60 text-xs">Choisis ton exercice</p></div>
          </button>
        )}
      </div>

      {/* Profile prompt */}
      {!profileName && (
        <button onClick={() => setCurrentView('profile')} className="w-full bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-3 flex items-center gap-3 hover:bg-yellow-400/20 transition-all future-glass">
          <span className="text-lg">👋</span>
          <div className="text-left flex-1"><p className="text-yellow-400 text-sm font-medium">Configure ton profil</p><p className="text-yellow-400/60 text-[10px]">Pour des programmes et recommandations personnalises</p></div>
        </button>
      )}

      {/* Templates quick */}
      <button onClick={() => setCurrentView('templates')} className="w-full bg-dark-card rounded-xl p-3 flex items-center gap-3 border border-dark-border hover:border-lime/30 transition-all mb-4 future-glass">
        <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center"><FileText size={18} className="text-lime" /></div>
        <div className="text-left flex-1"><p className="text-white text-sm font-medium">Templates</p><p className="text-muted text-[10px]">Lance une seance pre-enregistree</p></div>
        <ChevronRight size={16} className="text-muted" />
      </button>

      {/* Streak */}
      <StreakMotivation />

      {/* Daily Workout */}
      <div data-onboard="daily-workout">
        <DailyWorkout />
      </div>

      {/* Smart Recommendations */}
      <Recommendations />

      {/* Search Bar */}
      <div className="animate-fade-in delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Rechercher un programme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-card text-white pl-10 pr-4 py-3 rounded-xl text-sm outline-none border border-dark-border placeholder:text-muted focus:border-lime/30 transition-colors future-glass"
          />
        </div>
      </div>

      {/* Your Plan */}
      <div className="animate-fade-in delay-300" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-lg">Ton Programme</h2>
          <button
            onClick={() => setCurrentView('programme')}
            className="text-lime text-sm font-medium flex items-center gap-1"
          >
            Voir tout <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filteredPrograms.slice(0, 2).map((program, i) => (
            <button
              key={program.id}
              onClick={() => setCurrentView('programme')}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] text-left group"
            >
              <img
                src={program.image || PLAN_IMAGES[i % PLAN_IMAGES.length]}
                alt={program.name}
                className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-3 right-3 bg-lime/90 px-2 py-0.5 rounded-full">
                <span className="text-dark-bg text-[10px] font-bold">{program.daysPerWeek}x/sem</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-white font-bold text-sm leading-tight block">{program.name}</span>
                <span className="text-white/50 text-[10px]">{program.durationWeeks} semaines</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="animate-fade-in delay-400" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <h2 className="text-white font-semibold text-lg mb-3">Explorer</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['Musculation', 'Calisthenics', 'Cardio', 'Débutant', 'Force', 'Endurance'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSearchQuery(tag)
                setCurrentView('programme')
              }}
              className="px-4 py-2 rounded-full bg-dark-card border border-dark-border text-white text-sm font-medium whitespace-nowrap hover:border-lime/50 hover:bg-lime/5 transition-all active:scale-95 future-glass"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
