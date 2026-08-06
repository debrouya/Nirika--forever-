import { useState, useMemo } from 'react'
import { Play, ChevronRight, Sparkles, Zap, Flame, Dumbbell, Apple, User } from 'lucide-react'
import useStore from '../../store/useStore'
import { programs } from '../../data/programs'
import Recommendations from '../Recommendations'
import GlassBackground from '../../design-system/components/GlassBackground'
import GlassCard from '../../design-system/components/GlassCard'
import { useDashboardData } from './hooks/useDashboardData'
import StatCard from './widgets/StatCard'
import ProgramCard from './widgets/ProgramCard'
import './styles/dashboard.css'

const PLAN_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee2f50b?w=800&h=500&fit=crop',
]

const EXPLORE = [
  { id:'calisthenics',label:'Musculation',icon:Dumbbell,color:'rgba(255,255,255,.06)' },
  { id:'cardio',label:'Cardio',icon:Flame,color:'rgba(255,255,255,.06)' },
  { id:'programme',label:'Programmes',icon:Zap,color:'rgba(255,255,255,.06)' },
  { id:'nutrition',label:'Nutrition',icon:Apple,color:'rgba(255,255,255,.06)' },
]

export default function Dashboard() {
  const { setCurrentView } = useStore()
  const { firstName, activeSession, streak, weeklySessions, totalTime, profile } = useDashboardData()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPrograms = useMemo(() => {
    if (!searchQuery) return programs.slice(0, 1)
    return programs.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 1)
  }, [searchQuery])

  return (
    <GlassBackground>
      <div className="dash">

        {/* 1. HERO — avec arc lumineux signature NIRIKA */}
        <div className="dash-hero">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginBottom:4}}>
                {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
              </div>
              <h1 style={{fontSize:34,fontWeight:700,color:'#fff',letterSpacing:'-1px',lineHeight:1.1,margin:0}}>
                Bonjour{firstName?` ${firstName}`:''}
              </h1>
            </div>
            <div className="dash-avatar-ring">
              <svg width="56" height="56" viewBox="0 0 56 56" style={{position:'absolute'}}>
                <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="2" />
                <circle cx="28" cy="28" r="26" fill="none" stroke="var(--nirika-accent)" strokeWidth="2"
                  strokeLinecap="round" strokeDasharray="163" strokeDashoffset="65" opacity=".4"
                  style={{filter:'drop-shadow(0 0 6px rgba(126,217,87,.3))',transition:'stroke-dashoffset 1s ease'}} />
              </svg>
              <div style={{width:44,height:44,borderRadius:16,background:'rgba(255,255,255,.1)',backdropFilter:'blur(15px)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>👤</div>
            </div>
          </div>

          <div className="dash-hero-row">
            <div className="dash-hero-pills">
              <span className="dash-pill">🔥 {streak} jours</span>
              <span className="dash-pill">📊 Niveau 12</span>
              <span className="dash-pill">⭐ 850 XP</span>
            </div>
          </div>

          <div className="dash-xp-bar">
            <div className="dash-xp-fill" />
          </div>

          <p style={{fontSize:12,color:'rgba(255,255,255,.22)',fontStyle:'italic',marginTop:8}}>
            La discipline d&apos;aujourd&apos;hui crée la force de demain
          </p>
        </div>

        {/* 2. PRIMARY ACTION */}
        <GlassCard variant="strong" onClick={() => setCurrentView(activeSession?'session':'calisthenics')}>
          <div style={{display:'flex',alignItems:'center',gap:16,height:44}}>
            <div style={{width:48,height:48,borderRadius:18,background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <Play size={24} style={{color:'#fff',fill:'#fff'}} />
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:600,color:'#fff'}}>
                {activeSession?'Reprendre ma séance':'Démarrer une séance'}
              </div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.3)'}}>
                {activeSession?activeSession.exerciseName:'Choisis ton exercice'}
              </div>
            </div>
            <ChevronRight size={20} style={{color:'rgba(255,255,255,.25)'}} />
          </div>
        </GlassCard>

        {/* 3. COACH IA — conversationnel */}
        <GlassCard onClick={() => setCurrentView('ai')}>
          <div style={{display:'flex',gap:14}}>
            <div style={{width:44,height:44,borderRadius:16,background:'rgba(126,217,87,.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 0 16px rgba(126,217,87,.08)'}}>
              <Sparkles size={20} style={{color:'var(--nirika-accent)',opacity:.85}} />
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500,color:'#fff',marginBottom:4}}>
                Aujourd&apos;hui, je te conseille une séance <span style={{color:'var(--nirika-accent)'}}>Haut du corps</span>
              </div>
              <div style={{display:'flex',gap:16,fontSize:11,color:'rgba(255,255,255,.35)',marginBottom:8}}>
                <span>⏱️ 42 min</span>
                <span>💪 Force</span>
                <span>🔥 320 kcal</span>
              </div>
              <div style={{display:'flex',gap:8}}>
                <span style={{fontSize:10,fontWeight:500,padding:'4px 12px',borderRadius:8,background:'rgba(126,217,87,.12)',color:'var(--nirika-accent)',cursor:'pointer'}}>
                  Commencer
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 4. PROGRAMME ACTIF — 1 grande carte */}
        <div>
          <div className="dash-section-head">
            <span>Programme actif</span>
            <span className="dash-link" onClick={() => setCurrentView('programme')}>Tout voir</span>
          </div>
          {filteredPrograms.map((p,i) => (
            <ProgramCard key={p.id} name={p.name} duration={p.durationWeeks} daysPerWeek={p.daysPerWeek}
              image={p.image||PLAN_IMAGES[i%PLAN_IMAGES.length]} progress={0.6}
              onClick={() => setCurrentView('programme')} />
          ))}
          <div onClick={() => setCurrentView('programme')} style={{marginTop:6,textAlign:'center',fontSize:11,color:'rgba(255,255,255,.3)',cursor:'pointer'}}>
            + Découvrir plus de programmes
          </div>
        </div>

        {/* 5. STATS — 4 chiffres */}
        <div>
          <div className="dash-section-head"><span>Cette semaine</span></div>
          <div className="dash-stats">
            <StatCard value={`${Math.round(totalTime/60)}min`} label="Temps" icon="⏱️" />
            <StatCard value={weeklySessions} label="Séances" icon="🏋️" />
            <StatCard value="3 200" label="Calories" icon="🔥" />
            <StatCard value="850" label="XP gagné" icon="⭐" />
          </div>
        </div>

        {/* 6. EXPLORER — visuel */}
        <div>
          <div className="dash-section-head"><span>Explorer</span></div>
          <div className="dash-explore">
            {EXPLORE.map(e => (
              <GlassCard key={e.id} onClick={() => setCurrentView(e.id)}>
                <div style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0'}}>
                  <div style={{width:40,height:40,borderRadius:14,background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <e.icon size={18} style={{color:'rgba(255,255,255,.4)'}} />
                  </div>
                  <span style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,.7)'}}>{e.label}</span>
                  <ChevronRight size={14} style={{color:'rgba(255,255,255,.2)',marginLeft:'auto'}} />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* 7. ACCÈS RAPIDES — ultra compact */}
        <div className="dash-quick">
          {[{id:'calisthenics',label:'Muscu'},{id:'cardio',label:'Cardio'},{id:'nutrition',label:'Nutrition'},{id:'ai',label:'Coach'},{id:'templates',label:'Templates'},{id:'profile',label:'Profil'}].map(a => (
            <button key={a.label} onClick={() => setCurrentView(a.id)}
              style={{background:'rgba(255,255,255,.04)',border:'none',borderRadius:14,padding:'12px 8px',cursor:'pointer',fontFamily:'inherit',color:'rgba(255,255,255,.5)',fontSize:11,fontWeight:500,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .3s'}}>
              {a.label}
            </button>
          ))}
        </div>

        {/* 8. RECOMMENDATIONS */}
        <Recommendations />

        <div style={{height:40}} />
      </div>
    </GlassBackground>
  )
}
