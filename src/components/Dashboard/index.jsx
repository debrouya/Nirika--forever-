import { useMemo, useCallback } from 'react'
import useStore from '../../store/useStore'
import GlassBackground from '../../design-system/components/GlassBackground'
import CockpitCore from '../../design-system/components/CockpitCore'
import { useDashboardData } from './hooks/useDashboardData'
import Recommendations from '../Recommendations'
import OnboardingFlow from '../OnboardingFlow'
import { useI18n } from '../../i18n'
import { feedbackSystem, getStreakState, getMilestone } from '../../lib/feedback'
import { getRecoveryScore } from '../../services/aiCoaching'
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
        </div>

        <div style={{display:'flex',justifyContent:'center',marginBottom:32,width:'100%'}}>
          <CockpitCore mode={mode} streak={streak} activeSession={activeSession} onTap={handleTap} />
        </div>

        <div className="cockpit-recovery">
          <span style={{fontSize:10,color:'rgba(255,255,255,.25)',textTransform:'uppercase',letterSpacing:1}}>{t('dashboard.recovery')}</span>
          <div style={{display:'flex',gap:8,alignItems:'center',marginTop:4}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#7ED957'}} />
            <span style={{fontSize:12,fontWeight:500,color:'#fff'}}>{recovery.status === 'ready' ? t('dashboard.ready_status') : recovery.status}</span>
            <span style={{fontSize:10,color:'rgba(255,255,255,.25)'}}>· {t('recovery.score',{score:recovery.score})}</span>
          </div>
          <div className="dash-xp-bar" style={{marginTop:8}}><div className="dash-xp-fill" style={{width:`${recovery.score}%`}} /></div>
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
