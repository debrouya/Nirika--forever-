import { useState, useMemo } from 'react'
import useStore from '../../store/useStore'
import { programs } from '../../data/programs'
import Recommendations from '../Recommendations'
import StreakMotivation from '../StreakMotivation'
import DailyWorkout from '../DailyWorkout'
import GlassBackground from '../../design-system/components/GlassBackground'
import GlassCard from '../../design-system/components/GlassCard'
import { useDashboardData } from './hooks/useDashboardData'
import HeaderSection from './sections/HeaderSection'
import HeroSection from './sections/HeroSection'
import PrimaryAction from './sections/PrimaryAction'
import QuickAccess from './sections/QuickAccess'
import ProgramsSection from './sections/ProgramsSection'
import ProgressSection from './sections/ProgressSection'
import ExploreSection from './sections/ExploreSection'
import ProgramCard from './widgets/ProgramCard'
import SearchBar from './widgets/SearchBar'
import './styles/dashboard.css'

const PLAN_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee2f50b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop',
]

export default function Dashboard() {
  const { setCurrentView } = useStore()
  const { firstName, activeSession, streak, weeklySessions, totalTime } = useDashboardData()
  const [searchQuery, setSearchQuery] = useState('')
  const [simpleMode, setSimpleMode] = useState(() => {
    try { return localStorage.getItem('nirika_dashboard_mode') === 'simple' } catch { return false }
  })

  const filteredPrograms = useMemo(() => {
    if (!searchQuery) return programs.slice(0, 4)
    return programs.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery])

  return (
    <GlassBackground>
      <div className="dashboard-grid">

        <HeaderSection />
        <HeroSection firstName={firstName} streak={streak} />

        <div className="dashboard-row">
          <button onClick={() => setCurrentView('playground')} className="dashboard-chip">DS</button>
          <button onClick={() => { const n=!simpleMode;setSimpleMode(n);try{localStorage.setItem('nirika_dashboard_mode',n?'simple':'full')}catch{}}} className="dashboard-chip">
            {simpleMode ? 'Complet' : 'Simple'}
          </button>
        </div>

        <PrimaryAction activeSession={activeSession}
          onStart={() => setCurrentView('calisthenics')}
          onResume={() => setCurrentView('session')} />

        <QuickAccess
          onNavigate={id => setCurrentView(id)}
          onProfile={() => setCurrentView('profile')} />

        <GlassCard onClick={() => setCurrentView('templates')}>
          <div style={{display:'flex',alignItems:'center',gap:12,padding:4,color:'rgba(255,255,255,.7)',fontSize:13,fontWeight:500}}>
            📋 Templates <span style={{marginLeft:'auto',fontSize:11,color:'rgba(255,255,255,.35)'}}>Séances pré-enregistrées</span>
          </div>
        </GlassCard>

        <Recommendations />

        {!simpleMode && (
          <ProgramsSection title="Ton Programme" action="Voir tout" onAction={() => setCurrentView('programme')}>
            <div className="programs-grid">
              {filteredPrograms.slice(0,2).map((p,i) => (
                <ProgramCard key={p.id} name={p.name} duration={p.durationWeeks} daysPerWeek={p.daysPerWeek}
                  image={p.image || PLAN_IMAGES[i%PLAN_IMAGES.length]} progress={.4}
                  onClick={() => setCurrentView('programme')} />
              ))}
            </div>
          </ProgramsSection>
        )}

        <GlassCard><DailyWorkout /></GlassCard>
        <GlassCard><StreakMotivation /></GlassCard>

        <ProgressSection weeklySessions={weeklySessions} totalTime={totalTime} />

        <SearchBar value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

        <ExploreSection onSelect={tag => { setSearchQuery(tag); setCurrentView('programme') }} />

      </div>
    </GlassBackground>
  )
}
