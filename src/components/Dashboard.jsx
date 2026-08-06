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

  const streak = useMemo(() => {
    const all = [...workoutHistory, ...sessionHistory]
    const dates = new Set(all.map(s => new Date(s.completedAt || s.date || s.endedAt || s.startedAt).toISOString().slice(0,10)).filter(Boolean))
    let s = 0; const today = new Date()
    for (let i=0;i<365;i++){ const d=new Date(today);d.setDate(d.getDate()-i);if(dates.has(d.toISOString().slice(0,10)))s++;else break }
    return s
  }, [workoutHistory, sessionHistory])

  return (
    <GlassBackground>
      <div style={{padding:'48px 16px 120px',maxWidth:430,margin:'0 auto',display:'flex',flexDirection:'column',gap:16,minHeight:'100dvh'}}>

        {/* Header bar */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:8,height:8,borderRadius:3,background:'rgba(255,255,255,.25)',transform:'rotate(45deg)'}} />
            <span style={{fontSize:11,fontWeight:600,letterSpacing:2,color:'rgba(255,255,255,.3)',textTransform:'uppercase'}}>NIRIKA</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button onClick={() => setCurrentView('playground')} style={{fontSize:10,fontWeight:500,padding:'4px 10px',borderRadius:8,border:'none',background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.4)',cursor:'pointer',fontFamily:'inherit'}}>DS</button>
            <GlassAvatar size={36} />
          </div>
        </div>

        {/* HERO */}
        <div style={{marginBottom:8}}>
          <span style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</span>
          <h1 style={{fontSize:32,fontWeight:700,color:'#fff',letterSpacing:'-.8px',lineHeight:1.15,margin:'4px 0'}}>
            Bonjour{firstName ? ` ${firstName}` : ''}
          </h1>
          <div style={{display:'flex',gap:16,marginTop:8}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:18}}>🔥</span>
              <span style={{fontSize:13,color:'rgba(255,255,255,.5)'}}>{streak}j</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'var(--nirika-accent)',opacity:.6}} />
              <span style={{fontSize:13,color:'rgba(255,255,255,.5)'}}>Prêt pour ta séance</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <GlassCard variant="strong" onClick={() => setCurrentView(activeSession ? 'session' : 'calisthenics')}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:48,height:48,borderRadius:16,background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Play size={24} style={{color:'#fff',fill:'#fff'}} />
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:600,color:'#fff'}}>{activeSession ? 'Reprendre' : 'Démarrer une séance'}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.35)'}}>{activeSession ? activeSession.exerciseName : 'Choisis ton exercice'}</div>
            </div>
            <div style={{width:32,height:32,borderRadius:10,background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <ChevronRight size={16} style={{color:'rgba(255,255,255,.4)'}} />
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions + Profile prompt */}
        <div style={{display:'grid',gridTemplateColumns:!profileName?'1fr 1fr 1fr':undefined,gap:8}}>
          {[{icon:Apple,id:'nutrition',label:'Nutrition'},{icon:Activity,id:'cardio',label:'Cardio'},{icon:Zap,id:'calisthenics',label:'Exercices'}].map(a => (
            <GlassCard key={a.id} onClick={() => setCurrentView(a.id)}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'16px 0',flexDirection:'column',gap:6}}>
                <a.icon size={18} style={{color:'rgba(255,255,255,.45)'}} />
                <span style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,.7)'}}>{a.label}</span>
              </div>
            </GlassCard>
          ))}
          {!profileName && (
            <GlassCard onClick={() => setCurrentView('profile')}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'16px 0',flexDirection:'column',gap:6}}>
                <span style={{fontSize:20}}>👋</span>
                <span style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,.7)'}}>Profil</span>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Templates */}
        <GlassCard onClick={() => setCurrentView('templates')}>
          <div style={{display:'flex',alignItems:'center',gap:12,padding:4}}>
            <FileText size={18} style={{color:'rgba(255,255,255,.35)'}} />
            <div style={{flex:1,fontSize:13,fontWeight:500,color:'rgba(255,255,255,.7)'}}>Templates</div>
            <span style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>Séances pré-enregistrées</span>
          </div>
        </GlassCard>

        {/* AI Suggestion (Recommendations compact) */}
        <Recommendations />

        {/* Ton Programme */}
        {!simpleMode && filteredPrograms.length > 0 && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,.7)'}}>Ton Programme</span>
              <span onClick={() => setCurrentView('programme')} style={{fontSize:11,color:'rgba(255,255,255,.35)',cursor:'pointer'}}>Voir tout</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {filteredPrograms.slice(0,2).map((prog,i) => (
                <div key={prog.id} onClick={() => setCurrentView('programme')} style={{position:'relative',height:180,borderRadius:20,overflow:'hidden',cursor:'pointer'}}>
                  <img src={prog.image||PLAN_IMAGES[i%PLAN_IMAGES.length]} alt={prog.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(0,0,0,.05) 0%,rgba(0,0,0,.35) 50%,rgba(0,0,0,.75) 100%)'}} />
                  <div style={{position:'absolute',top:10,right:10}}>
                    <span style={{background:'rgba(255,255,255,.15)',backdropFilter:'blur(15px)',padding:'3px 8px',borderRadius:12,fontSize:10,fontWeight:500,color:'rgba(255,255,255,.85)'}}>{prog.daysPerWeek}×/sem</span>
                  </div>
                  <div style={{position:'absolute',bottom:12,left:12,right:12}}>
                    <div style={{fontSize:15,fontWeight:600,color:'#fff',marginBottom:2}}>{prog.name}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.45)',marginBottom:6}}>{prog.durationWeeks} semaines</div>
                    <div style={{height:2,borderRadius:1,background:'rgba(255,255,255,.1)',overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${Math.min(100,Math.round((i+1)*15+25))}%`,borderRadius:1,background:'var(--nirika-accent)',opacity:.5}} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily + Streak */}
        <div data-onboard="daily-workout"><GlassCard><DailyWorkout /></GlassCard></div>
        <GlassCard><StreakMotivation /></GlassCard>

        {/* Search + Explorer */}
        <GlassSearchBar value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher un programme..." />
        <div style={{display:'flex',gap:8,overflowX:'auto'}}>
          {['Musculation','Calisthenics','Cardio','Débutant','Force','Endurance'].map(tag => (
            <button key={tag} onClick={() => { setSearchQuery(tag); setCurrentView('programme') }}
              style={{fontSize:11,fontWeight:500,padding:'6px 16px',borderRadius:14,border:'none',background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.5)',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
              {tag}
            </button>
          ))}
        </div>

      </div>
    </GlassBackground>
  )
}
