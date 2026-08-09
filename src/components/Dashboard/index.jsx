import useStore from '../../store/useStore'
import GlassBackground from '../../design-system/components/GlassBackground'
import CockpitCore from '../../design-system/components/CockpitCore'
import { useDashboardData } from './hooks/useDashboardData'
import Recommendations from '../Recommendations'
import { useI18n } from '../../i18n'
import { feedbackSystem, getStreakState, getMilestone } from '../../lib/feedback'
import { getRecoveryScore } from '../../services/aiCoaching'
import './styles/dashboard.css'

export default function Dashboard() {
  const { setCurrentView } = useStore()
  const { firstName, activeSession, weeklySessions, totalTime, exerciseHistory } = useDashboardData()
  const activeProgram = useStore(s => s.activeProgram)
  const sessionHistory = useStore(s => s.sessionHistory)
  const workoutHistory = useStore(s => s.workoutHistory)
  const streak = useStore.getState().getStreak()
  const { t } = useI18n()

  const recovery = useMemo(() => {
    try {
      const all = [...workoutHistory, ...sessionHistory]
      return getRecoveryScore({}, all)
    } catch { return { status: 'ready', score: 50, explanation: '' } }
  }, [workoutHistory, sessionHistory])

  const mode = activeProgram
    ? 'program'
    : activeSession?.sessionType === 'cardio'
    ? 'cardio'
    : activeSession
    ? 'exercise'
    : 'default'

  const streakState = getStreakState(streak)
  const milestone = getMilestone(streak)
  const stateInfo = feedbackSystem.states[streakState] || feedbackSystem.states.adaptation

  return (
    <GlassBackground>
      <div className="dash">

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
          <div style={{width:7,height:7,borderRadius:2,background:'rgba(255,255,255,.2)',transform:'rotate(45deg)'}} />
          <span style={{fontSize:11,fontWeight:600,letterSpacing:2,color:'rgba(255,255,255,.18)',textTransform:'uppercase'}}>NIRIKA</span>
        </div>

        {/* Hero text */}
        <div style={{marginBottom:36}}>
          <div style={{fontSize:11,color:'rgba(255,255,255,.28)',marginBottom:4}}>
            {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
          </div>
          <h1 style={{fontSize:32,fontWeight:700,color:'#fff',letterSpacing:'-.8px',lineHeight:1.1}}>
            {t('dashboard.greeting',{name:firstName||''})}
          </h1>
          {streak > 0 && (
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:6}}>
              <span style={{padding:'2px 10px',borderRadius:8,fontSize:10,fontWeight:500,background:`${stateInfo.color}18`,color:stateInfo.color}}>
                {stateInfo.label} · {stateInfo.message}
              </span>
              {milestone && <span style={{fontSize:10,color:'rgba(255,255,255,.25)'}}>{milestone}</span>}
            </div>
          )}
        </div>

        {/* MAIN COCKPIT CORE */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:32}}>
          <CockpitCore
            mode={mode}
            streak={streak}
            activeSession={activeSession}
            onTap={() => {
              const { activeProgram, nextProgramExercise } = useStore.getState()
              if (activeProgram) { nextProgramExercise(); return }
              setCurrentView(activeSession ? 'session' : 'calisthenics')
            }}
          />
        </div>

        {/* RECOVERY */}
        <div className="cockpit-recovery">
          <span style={{fontSize:11,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:1}}>{t('dashboard.recovery')}</span>
          <div style={{display:'flex',gap:8,alignItems:'center',marginTop:4}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#7ED957'}} />
            <span style={{fontSize:13,fontWeight:500,color:'#fff'}}>{recovery.status === 'ready' ? t('dashboard.ready_status') : recovery.status}</span>
            <span style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>· {t('recovery.score',{score:recovery.score})}</span>
          </div>
          <div className="dash-xp-bar" style={{marginTop:8}}>
            <div className="dash-xp-fill" style={{width:`${recovery.score}%`}} />
          </div>
        </div>

        {/* Quick access */}
        <div className="cockpit-actions">
          {[
            {label:t('dashboard.cardio'),view:'cardio'},
            {label:t('dashboard.exercises'),view:'calisthenics'},
            {label:t('dashboard.program'),view:'programme'},
          ].map(a => (
            <button key={a.label} className="cockpit-btn" onClick={() => setCurrentView(a.view)}>{a.label}</button>
          ))}
        </div>

        {/* Recommendations */}
        <Recommendations />

        <div style={{height:40}} />
      </div>
    </GlassBackground>
  )
}
