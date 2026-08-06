import { useState, useMemo } from 'react'
import { Play, ChevronRight, Sparkles, FileText } from 'lucide-react'
import useStore from '../../store/useStore'
import { programs } from '../../data/programs'
import Recommendations from '../Recommendations'
import GlassBackground from '../../design-system/components/GlassBackground'
import GlassCard from '../../design-system/components/GlassCard'
import { useDashboardData } from './hooks/useDashboardData'
import StatCard from './widgets/StatCard'
import ProgramCard from './widgets/ProgramCard'
import SearchBar from './widgets/SearchBar'
import TagChip from './widgets/TagChip'
import './styles/dashboard.css'

const S = 8
const PLAN_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee2f50b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop',
]

const QUICK = [
  { id:'calisthenics',label:'Muscu',icon:'🏋️' },
  { id:'cardio',label:'Cardio',icon:'🏃' },
  { id:'nutrition',label:'Nutrition',icon:'🥗' },
  { id:'calisthenics',label:'Calisthenics',icon:'🤸' },
  { id:'ai',label:'Coach IA',icon:'✨' },
  { id:'templates',label:'Templates',icon:'📋' },
]

export default function Dashboard() {
  const { setCurrentView } = useStore()
  const { firstName, activeSession, streak, weeklySessions, totalTime } = useDashboardData()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPrograms = useMemo(() => {
    if (!searchQuery) return programs.slice(0, 2)
    return programs.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 2)
  }, [searchQuery])

  return (
    <GlassBackground>
      <div className="dash">

        {/* 1. HERO */}
        <div className="dash-hero">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginBottom:4}}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div>
              <h1 style={{fontSize:32,fontWeight:700,color:'#fff',letterSpacing:'-.8px',lineHeight:1.1}}>Bonjour{firstName?` ${firstName}`:''}</h1>
            </div>
            <div style={{width:40,height:40,borderRadius:14,background:'rgba(255,255,255,.1)',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>👤</div>
          </div>
          <div className="dash-hero-meta">
            <span className="dash-hero-stat">🔥 {streak} jours</span>
            <span className="dash-hero-stat">● Prêt pour ta séance</span>
            <span style={{fontSize:11,color:'rgba(255,255,255,.25)',fontStyle:'italic'}}>La discipline crée la force</span>
          </div>
        </div>

        {/* 2. PRIMARY ACTION */}
        <GlassCard variant="strong" onClick={() => setCurrentView(activeSession?'session':'calisthenics')}>
          <div style={{display:'flex',alignItems:'center',gap:16,height:40}}>
            <div style={{width:44,height:44,borderRadius:16,background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Play size={22} style={{color:'#fff',fill:'#fff'}} />
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:600,color:'#fff'}}>{activeSession?'Reprendre ma séance':'Démarrer une séance'}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>{activeSession?activeSession.exerciseName:'Choisis ton exercice'}</div>
            </div>
            <ChevronRight size={18} style={{color:'rgba(255,255,255,.25)'}} />
          </div>
        </GlassCard>

        {/* 3. AI SUGGESTION */}
        <GlassCard>
          <div style={{display:'flex',alignItems:'center',gap:12,height:40}}>
            <div style={{width:40,height:40,borderRadius:14,background:'rgba(126,217,87,.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <Sparkles size={18} style={{color:'var(--nirika-accent)',opacity:.8}} />
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500,color:'#fff'}}>Coach IA</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>Aujourd'hui : Haut du corps · 42 min</div>
            </div>
            <div style={{fontSize:10,fontWeight:500,color:'var(--nirika-accent)',cursor:'pointer',padding:'4px 12px',borderRadius:8,background:'rgba(126,217,87,.1)'}} onClick={() => setCurrentView('ai')}>Go →</div>
          </div>
        </GlassCard>

        {/* 4. QUICK ACCESS */}
        <div className="dash-quick">
          {QUICK.map(a => (
            <GlassCard key={a.label} onClick={() => setCurrentView(a.id)}>
              <div className="dash-quick-item">
                <span style={{fontSize:20}}>{a.icon}</span>
                <span className="dash-quick-label">{a.label}</span>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* 5. PROGRAMMES */}
        <div>
          <div className="dash-section-head">
            <span>Ton Programme</span>
            <span className="dash-link" onClick={() => setCurrentView('programme')}>Voir tout</span>
          </div>
          <div className="dash-programs">
            {filteredPrograms.map((p,i) => (
              <ProgramCard key={p.id} name={p.name} duration={p.durationWeeks} daysPerWeek={p.daysPerWeek}
                image={p.image||PLAN_IMAGES[i%PLAN_IMAGES.length]} progress={0.4}
                onClick={() => setCurrentView('programme')} />
            ))}
          </div>
        </div>

        {/* 6. PROGRESSION */}
        <div>
          <div className="dash-section-head"><span>Cette semaine</span></div>
          <div className="dash-stats">
            <StatCard value={`${Math.round(totalTime/60)}min`} label="Temps" icon="⏱️" />
            <StatCard value={weeklySessions} label="Séances" icon="🏋️" />
            <StatCard value="0" label="Calories" icon="🔥" />
            <StatCard value={streak} label="Série" icon="⚡" />
            <StatCard value="12" label="Niveau" icon="📊" />
            <StatCard value="850" label="XP" icon="⭐" />
          </div>
        </div>

        {/* 7. EXPLORER */}
        <div>
          <div className="dash-section-head"><span>Explorer</span></div>
          <div style={{display:'flex',gap:8,overflowX:'auto'}}>
            {['Musculation','Calisthenics','Cardio','Débutant','Force','Endurance'].map(t => (
              <TagChip key={t} label={t} onClick={()=>{setSearchQuery(t);setCurrentView('programme')}} />
            ))}
          </div>
        </div>

        {/* 8. RECOMMENDATIONS */}
        <Recommendations />

        {/* spacing bottom for nav */}
        <div style={{height:32}} />
      </div>
    </GlassBackground>
  )
}
