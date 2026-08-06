import { useState, useMemo } from 'react'
import { Play, FileText, ChevronRight, Layout, LayoutDashboard, Search, User, Apple, Zap, Activity, Dumbbell } from 'lucide-react'
import useStore from '../store/useStore'
import { programs } from '../data/programs'
import Recommendations from './Recommendations'
import StreakMotivation from './StreakMotivation'
import DailyWorkout from './DailyWorkout'

import GlassBackground from '../design-system/components/GlassBackground'
import GlassCard from '../design-system/components/GlassCard'
import GlassInput, { GlassSearchBar } from '../design-system/components/GlassInput'
import GlassAvatar, { GlassBadge } from '../design-system/components/GlassAvatar'
import { GlassSection } from '../design-system/components/GlassLayout'

const PROFILE_KEY = 'nirika_coach_profile'
const USER_PROFILE_KEY = 'nirika-profile'

const PLAN_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee2f50b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop',
]

const QUICK_ACTIONS = [
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'cardio', label: 'Cardio', icon: Activity },
  { id: 'calisthenics', label: 'Exercices', icon: Zap },
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
    try { const s = localStorage.getItem(USER_PROFILE_KEY); if (s) { const p = JSON.parse(s); if (p.name) return p.name.split(' ')[0] } } catch {}
    try { const s = localStorage.getItem(PROFILE_KEY); if (s) { const p = JSON.parse(s); if (p.name) return p.name.split(' ')[0] } } catch {}
    return ''
  }, [profile])

  const filteredPrograms = useMemo(() => {
    if (!searchQuery) return programs.slice(0, 4)
    return programs.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery])

  return (
    <GlassBackground>
      <div style={{padding:'52px 22px 130px',maxWidth:430,margin:'0 auto',display:'flex',flexDirection:'column',gap:24,minHeight:'100dvh'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:9,height:9,borderRadius:3,background:'rgba(255,255,255,.85)',opacity:.28,transform:'rotate(45deg)'}} />
            <span style={{fontSize:12,fontWeight:600,letterSpacing:1.8,color:'rgba(255,255,255,.35)',textTransform:'uppercase'}}>NIRIKA</span>
          </div>
          <GlassAvatar size={46} />
        </div>

        {/* Hero */}
        <div>
          <span style={{fontSize:12,color:'rgba(255,255,255,.4)'}}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</span>
          <h1 style={{fontSize:30,fontWeight:670,color:'rgba(255,255,255,.9)',letterSpacing:'-.8px',lineHeight:1.1,marginTop:2}}>
            Bonjour{firstName ? ` ${firstName}` : ''}
          </h1>
          <p style={{fontSize:15,color:'rgba(255,255,255,.5)',marginTop:2}}>Prêt pour ta séance ?</p>
        </div>

        {/* Mode Toggle + DS */}
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:-12}}>
          <button onClick={() => setCurrentView('playground')} style={{fontSize:10,fontWeight:500,padding:'5px 12px',borderRadius:12,border:'none',background:'rgba(255,255,255,.15)',backdropFilter:'blur(15px)',color:'var(--nirika-accent)',cursor:'pointer',fontFamily:'inherit'}}>DS</button>
          <button onClick={() => { const n = !simpleMode; setSimpleMode(n); try { localStorage.setItem('nirika_dashboard_mode',n?'simple':'full') } catch {} }} style={{fontSize:10,fontWeight:500,padding:'5px 12px',borderRadius:12,border:'none',background:'rgba(255,255,255,.15)',backdropFilter:'blur(15px)',color:'rgba(255,255,255,.5)',cursor:'pointer',fontFamily:'inherit'}}>
            {simpleMode ? 'Complet' : 'Simple'}
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
          {QUICK_ACTIONS.map(action => (
            <GlassCard key={action.id} onClick={() => setCurrentView(action.id)}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'14px 0'}}>
                <action.icon size={20} style={{color:'rgba(255,255,255,.5)'}} />
                <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.85)'}}>{action.label}</span>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* CTA */}
        <GlassCard variant="strong" onClick={() => setCurrentView(activeSession ? 'session' : 'calisthenics')}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:54,height:54,borderRadius:18,background:'rgba(0,0,0,.04)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 .5px 0 rgba(255,255,255,.4) inset'}}>
              <Play size={26} style={{color:'rgba(255,255,255,.85)',fill:'rgba(255,255,255,.85)',opacity:.65}} />
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:600,color:'rgba(255,255,255,.85)'}}>{activeSession ? 'Reprendre ma séance' : 'Démarrer une séance'}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.5)'}}>{activeSession ? activeSession.exerciseName : 'Choisis ton exercice'}</div>
            </div>
          </div>
        </GlassCard>

        {/* Profile prompt */}
        {!profileName && (
          <GlassCard onClick={() => setCurrentView('profile')}>
            <div style={{display:'flex',alignItems:'center',gap:14,padding:4}}>
              <span style={{fontSize:22}}>👋</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:'rgba(255,255,255,.85)'}}>Configure ton profil</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>Pour des programmes personnalisés</div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Templates */}
        <GlassCard onClick={() => setCurrentView('templates')}>
          <div style={{display:'flex',alignItems:'center',gap:14,padding:4}}>
            <div style={{width:42,height:42,borderRadius:14,background:'rgba(0,0,0,.03)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <FileText size={20} style={{color:'var(--nirika-accent)',opacity:.6}} />
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:500,color:'rgba(255,255,255,.85)'}}>Templates</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>Lance une séance pré-enregistrée</div>
            </div>
            <ChevronRight size={18} style={{color:'rgba(255,255,255,.5)',opacity:.4}} />
          </div>
        </GlassCard>

        {/* Streak + Daily Workout + Recos */}
        <GlassCard><StreakMotivation /></GlassCard>
        <div data-onboard="daily-workout"><GlassCard><DailyWorkout /></GlassCard></div>
        <GlassCard><Recommendations /></GlassCard>

        {/* Search */}
        <GlassSearchBar value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher un programme..." />

        {/* Ton Programme */}
        {!simpleMode && (
          <GlassSection title="Ton Programme" action="Voir tout →" onAction={() => setCurrentView('programme')}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {filteredPrograms.slice(0,2).map((prog,i) => (
                <div key={prog.id} onClick={() => setCurrentView('programme')} style={{position:'relative',height:160,borderRadius:24,overflow:'hidden',cursor:'pointer'}}>
                  <img src={prog.image||PLAN_IMAGES[i%PLAN_IMAGES.length]} alt={prog.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.6))'}} />
                  <div style={{position:'absolute',top:12,right:12}}><GlassBadge>{prog.daysPerWeek}×/sem</GlassBadge></div>
                  <div style={{position:'absolute',bottom:14,left:14,right:14}}>
                    <div style={{fontSize:14,fontWeight:600,color:'#fff'}}>{prog.name}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>{prog.durationWeeks} semaines</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassSection>
        )}

        {/* Explorer tags */}
        <div>
          <div style={{fontSize:15,fontWeight:600,color:'rgba(255,255,255,.85)',marginBottom:14}}>Explorer</div>
          <div style={{display:'flex',gap:8,overflowX:'auto'}}>
            {['Musculation','Calisthenics','Cardio','Débutant','Force','Endurance'].map(tag => (
              <button key={tag} onClick={() => { setSearchQuery(tag); setCurrentView('programme') }}
                style={{fontSize:12,fontWeight:500,padding:'8px 18px',borderRadius:16,border:'none',background:'rgba(255,255,255,.15)',backdropFilter:'blur(20px)',color:'rgba(255,255,255,.85)',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
                {tag}
              </button>
            ))}
          </div>
        </div>

      </div>
    </GlassBackground>
  )
}
