import { useMemo, useCallback, useState, useEffect } from 'react'
import useStore from '../../store/useStore'
import GlassBackground from '../../design-system/components/GlassBackground'
import CockpitCore from '../../design-system/components/CockpitCore'
import { useDashboardData } from './hooks/useDashboardData'
import Recommendations from '../Recommendations'
import OnboardingFlow from '../OnboardingFlow'
import { useI18n } from '../../i18n'
import { feedbackSystem, getStreakState, getMilestone } from '../../lib/feedback'
import { getRecoveryScore } from '../../services/aiCoaching'
import { getWorkoutRecommendation, getProgramRecommendation } from '../../lib/recommendations'
import './styles/dashboard.css'

export default function Dashboard() {
  const { setCurrentView } = useStore()
  const userGoal = useStore(s => s.userGoal)
  const onboardingDone = useStore(s => s.onboardingDone)
  const { firstName, activeSession, weeklySessions, totalTime, exerciseHistory } = useDashboardData()
  const activeProgram = useStore(s => s.activeProgram)
  const sessionHistory = useStore(s => s.sessionHistory)
  const workoutHistory = useStore(s => s.workoutHistory)
  const streak = useMemo(() => {
    try { return useStore.getState().getStreak() } catch { return 0 }
  }, [workoutHistory, sessionHistory])
  const { t } = useI18n()

  const recommendation = useMemo(() => getWorkoutRecommendation(userGoal), [userGoal])
  const programRec = useMemo(() => getProgramRecommendation(userGoal), [userGoal])

  const daysSinceLast = useMemo(() => {
    const all = [...workoutHistory, ...sessionHistory]
    if (!all.length) return null
    const last = all.reduce((max, s) => {
      const d = new Date(s.completedAt || s.date || s.endedAt || s.startedAt)
      return isNaN(d) ? max : Math.max(max, d)
    }, 0)
    if (!last) return null
    return Math.floor((Date.now() - last) / 86400000)
  }, [workoutHistory, sessionHistory])

  const lastSession = useMemo(() => {
    const all = [...workoutHistory, ...sessionHistory]
    if (!all.length) return null
    return all.reduce((best, s) => {
      const d = new Date(s.completedAt || s.date || s.endedAt || s.startedAt)
      const bd = new Date(best.completedAt || best.date || best.endedAt || best.startedAt)
      return isNaN(d) ? best : (isNaN(bd) ? s : (d > bd ? s : best))
    }, all[0])
  }, [workoutHistory, sessionHistory])

  const weeklyPRs = useMemo(() => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const all = Object.values(exerciseHistory || {}).flat().filter(Boolean)
    return all.filter(e => e.recordType === 'PR' && new Date(e.date || e.completedAt) >= weekStart).length
  }, [exerciseHistory])

  const recovery = useMemo(() => {
    try { return getRecoveryScore({}, [...workoutHistory, ...sessionHistory]) } catch { return { status: 'ready', score: 50, explanation: '' } }
  }, [workoutHistory, sessionHistory])

  const handleTap = useCallback(() => {
    const { activeProgram, nextProgramExercise } = useStore.getState()
    if (activeProgram) { nextProgramExercise(); return }
    setCurrentView(activeSession ? 'session' : 'calisthenics')
  }, [activeSession, setCurrentView])

  if (!onboardingDone || !userGoal) {
    return <OnboardingFlow onComplete={() => {}} />
  }

  const mode = activeProgram ? 'program'
    : activeSession?.sessionType === 'cardio' ? 'cardio'
    : activeSession ? 'exercise'
    : 'default'

  const streakState = getStreakState(streak)
  const milestone = getMilestone(streak)
  const stateInfo = feedbackSystem.states[streakState] || feedbackSystem.states.adaptation

  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPwaBanner, setShowPwaBanner] = useState(false)

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); const t = JSON.parse(localStorage.getItem('nirika-pwa-dismissed') || '0'); if (Date.now() - t > 7 * 86400000) setShowPwaBanner(true) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const installPwa = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShowPwaBanner(false)
    setDeferredPrompt(null)
  }

  const dismissPwa = () => {
    setShowPwaBanner(false)
    try { localStorage.setItem('nirika-pwa-dismissed', String(Date.now())) } catch {}
  }

  return (
    <GlassBackground>
      <div className="dash">

        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,width:'100%'}}>
          <div style={{width:7,height:7,borderRadius:2,background:'rgba(255,255,255,.2)',transform:'rotate(45deg)'}} />
          <span style={{fontSize:10,fontWeight:600,letterSpacing:2,color:'rgba(255,255,255,.15)',textTransform:'uppercase'}}>NIRIKA</span>
        </div>

        <div style={{marginBottom:28,width:'100%'}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,.25)',marginBottom:2}}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div>
          <h1 style={{fontSize:28,fontWeight:700,color:'#fff',letterSpacing:'-.6px',lineHeight:1.1}}>{t('dashboard.greeting',{name:firstName||''})}</h1>
          {streak > 0 && (<div style={{display:'flex',gap:8,alignItems:'center',marginTop:6}}>
            <span style={{padding:'2px 10px',borderRadius:8,fontSize:10,fontWeight:500,background:`${stateInfo.color}18`,color:stateInfo.color}}>{stateInfo.label} · {stateInfo.message}</span>
            {milestone && <span style={{fontSize:10,color:'rgba(255,255,255,.25)'}}>{milestone}</span>}
          </div>)}
          {daysSinceLast >= 3 && (
            <div style={{marginTop:6,fontSize:11,color:'rgba(255,255,255,.2)',fontStyle:'italic'}}>
              De retour après {daysSinceLast} jours — reprenons doucement.
            </div>
          )}
        </div>

        <div style={{display:'flex',justifyContent:'center',marginBottom:32,width:'100%'}}>
          <CockpitCore mode={mode} streak={streak} activeSession={activeSession} onTap={handleTap} />
        </div>

        {showPwaBanner && (
          <div style={{width:'100%',background:'rgba(96,165,250,.08)',borderRadius:14,padding:12,marginBottom:16,backdropFilter:'blur(20px)',border:'1px solid rgba(96,165,250,.12)',display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:20,flexShrink:0}}>📲</span>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:'#fff'}}>Installer NIRIKA</div><div style={{fontSize:10,color:'rgba(255,255,255,.3)'}}>Accès rapide depuis ton écran d'accueil</div></div>
            <button onClick={installPwa} style={{padding:'6px 14px',borderRadius:10,border:'none',fontSize:11,fontWeight:600,fontFamily:'inherit',cursor:'pointer',background:'#60a5fa',color:'#fff'}}>Installer</button>
            <button onClick={dismissPwa} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontSize:14,cursor:'pointer',padding:4}}>✕</button>
          </div>
        )}

        {recommendation && (
          <div style={{width:'100%',background:'rgba(126,217,87,.04)',borderRadius:16,padding:14,marginBottom:16,backdropFilter:'blur(20px)',border:'1px solid rgba(126,217,87,.06)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:10,fontWeight:600,color:'#7ED957',textTransform:'uppercase',letterSpacing:1}}>Coach</span>
              <span style={{fontSize:12,color:'#fff',fontWeight:500}}>{recommendation.name} · {recommendation.adapted}</span>
            </div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:4,lineHeight:1.4}}>"{recommendation.reason}"</div>
          </div>
        )}

        {daysSinceLast <= 1 && lastSession && (
          <div style={{width:'100%',background:'rgba(126,217,87,.04)',borderRadius:16,padding:14,marginBottom:16,backdropFilter:'blur(20px)',border:'1px solid rgba(126,217,87,.06)'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.25)',textTransform:'uppercase',letterSpacing:1}}>Dernière séance</div>
            <div style={{fontSize:14,color:'#7ED957',fontWeight:600,marginTop:2}}>{lastSession.name || lastSession.sessionType || 'Séance'}</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:2}}>
              {lastSession.exercises?.length || lastSession.sets?.length || lastSession.totalSets || 0} séries
              {lastSession.totalWeight > 0 && ` · ${lastSession.totalWeight}kg`}
              {lastSession.duration > 0 && ` · ${Math.round(lastSession.duration/60)}min`}
            </div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.2)',marginTop:4,fontStyle:'italic'}}>Prochaine : {recommendation?.name || 'repos ou choix libre'}</div>
          </div>
        )}

        {programRec && !activeProgram && (
          <div style={{width:'100%',background:'rgba(96,165,250,.06)',borderRadius:16,padding:14,marginBottom:16,backdropFilter:'blur(20px)',border:'1px solid rgba(96,165,250,.08)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:10,fontWeight:600,color:'#60a5fa',textTransform:'uppercase',letterSpacing:1}}>Programme</span>
              <span style={{fontSize:12,color:'#fff',fontWeight:500}}>{programRec.name}</span>
              <span style={{fontSize:10,color:'rgba(255,255,255,.2)',marginLeft:'auto'}}>{programRec.daysPerWeek}j/sem · {programRec.durationWeeks} sem</span>
            </div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:4,lineHeight:1.4}}>{programRec.description}</div>
            <button onClick={()=>setCurrentView('programme')} style={{marginTop:10,width:'100%',padding:'10px 0',borderRadius:12,border:'none',fontFamily:'inherit',fontSize:13,fontWeight:600,cursor:'pointer',background:'#60a5fa',color:'#141414'}}>Voir le programme</button>
          </div>
        )}

        <div className="cockpit-recovery">
          <span style={{fontSize:10,color:'rgba(255,255,255,.25)',textTransform:'uppercase',letterSpacing:1}}>{t('dashboard.recovery')}</span>
          <div style={{display:'flex',gap:8,alignItems:'center',marginTop:4}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#7ED957'}} />
            <span style={{fontSize:12,fontWeight:500,color:'#fff'}}>{recovery.status === 'ready' ? t('dashboard.ready_status') : recovery.status}</span>
            <span style={{fontSize:10,color:'rgba(255,255,255,.25)'}}>· {t('recovery.score',{score:recovery.score})}</span>
          </div>
          <div className="dash-xp-bar" style={{marginTop:8}}><div className="dash-xp-fill" style={{width:`${recovery.score}%`}} /></div>
        </div>

        <div style={{width:'100%',display:'flex',gap:8,marginBottom:16}}>
          <div style={{flex:1,background:'rgba(255,255,255,.03)',borderRadius:14,padding:'12px 8px',textAlign:'center',backdropFilter:'blur(20px)'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#fff'}}>{weeklySessions}</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.2)',textTransform:'uppercase',letterSpacing:'.5px',marginTop:2}}>cette semaine</div>
          </div>
          <div style={{flex:1,background:'rgba(255,255,255,.03)',borderRadius:14,padding:'12px 8px',textAlign:'center',backdropFilter:'blur(20px)'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#fff'}}>{Math.round(totalTime/60)||0} min</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.2)',textTransform:'uppercase',letterSpacing:".5px",marginTop:2}}>temps</div>
          </div>
          <div style={{flex:1,background:'rgba(255,255,255,.03)',borderRadius:14,padding:'12px 8px',textAlign:'center',backdropFilter:'blur(20px)'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#7ED957'}}>{weeklyPRs}</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.2)',textTransform:'uppercase',letterSpacing:".5px",marginTop:2}}>PR</div>
          </div>
        </div>

        <div className="cockpit-actions">
          <button className="cockpit-btn" onClick={()=>setCurrentView('cardio')}>{t('dashboard.cardio')}</button>
          <button className="cockpit-btn" onClick={()=>setCurrentView('calisthenics')}>{t('dashboard.exercises')}</button>
          <button className="cockpit-btn" onClick={()=>setCurrentView('programme')}>{t('dashboard.program')}</button>
        </div>

        <Recommendations />
        <div style={{height:40}} />
      </div>
    </GlassBackground>
  )
}
