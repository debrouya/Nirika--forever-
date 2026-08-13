import { useMemo, useCallback, useState } from 'react'
import useStore from '../../store/useStore'
import GlassBackground from '../../design-system/components/GlassBackground'
import CockpitCore from '../../design-system/components/CockpitCore'
import { useDashboardData } from './hooks/useDashboardData'
import Recommendations from '../Recommendations'
import OnboardingFlow from '../OnboardingFlow'
import { useI18n } from '../../i18n'
import { feedbackSystem, getStreakState, getMilestone } from '../../lib/feedback'
import { getWorkoutRecommendation, getProgramRecommendation } from '../../lib/recommendations'
import WeekChart from './widgets/WeekChart'
import { Heart, Dumbbell, CalendarRange, ChevronDown, Zap } from 'lucide-react'
import './styles/dashboard.css'

export default function Dashboard() {
  const { setCurrentView } = useStore()
  const userGoal = useStore(s => s.userGoal)
  const onboardingDone = useStore(s => s.onboardingDone)
  const { firstName, activeSession, weeklySessions, totalTime, exerciseHistory } = useDashboardData()
  const activeProgram = useStore(s => s.activeProgram)
  const pendingDailyWorkout = useStore(s => s.pendingDailyWorkout)
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

  const programDayName = useMemo(() => {
    if (!activeProgram) return null
    if (activeProgram.current_day) return activeProgram.current_day
    if (activeProgram.structure && activeProgram.currentDay !== undefined) {
      const days = Object.keys(activeProgram.structure)
      return days[activeProgram.currentDay % days.length] || days[0] || null
    }
    return activeProgram.name || null
  }, [activeProgram])

  const handleTap = useCallback(() => {
    const { activeProgram, pendingDailyWorkout } = useStore.getState()
    if (pendingDailyWorkout) { setCurrentView('daily-workout'); return }
    if (activeSession) { setCurrentView('session'); return }
    if (activeProgram) { setCurrentView('programme'); return }
    setCurrentView('calisthenics')
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

  const [openSection, setOpenSection] = useState(null)
  const toggleSection = (id) => setOpenSection(openSection === id ? null : id)

  return (
    <GlassBackground>
      <div className="dash">

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:7,height:7,borderRadius:2,background:'rgba(255,255,255,.2)',transform:'rotate(45deg)'}} />
            <span style={{fontSize:10,fontWeight:600,letterSpacing:2,color:'rgba(255,255,255,.15)',textTransform:'uppercase'}}>NIRIKA</span>
          </div>
          <div style={{width:36,height:36,borderRadius:'50%',background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>
            {firstName ? firstName[0].toUpperCase() : '👤'}
          </div>
        </div>

        <div style={{width:'100%'}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,.25)',marginBottom:2}}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div>
          <h1 style={{fontSize:26,fontWeight:700,color:'#fff',letterSpacing:'-.6px',lineHeight:1.1}}>{t('dashboard.greeting',{name:firstName||''})}</h1>
          {streak > 0 && (<div style={{display:'flex',gap:8,alignItems:'center',marginTop:4}}>
            <span style={{padding:'2px 10px',borderRadius:8,fontSize:10,fontWeight:500,background:`${stateInfo.color}18`,color:stateInfo.color}}>{stateInfo.label} · {stateInfo.message}</span>
            {milestone && <span style={{fontSize:10,color:'rgba(255,255,255,.25)'}}>{milestone}</span>}
          </div>)}
          {daysSinceLast >= 3 && (
            <div style={{marginTop:4,fontSize:11,color:'rgba(255,255,255,.2)',fontStyle:'italic'}}>
              De retour après {daysSinceLast} jours — reprenons doucement.
            </div>
          )}
        </div>

        <div style={{display:'flex',justifyContent:'center',marginBottom:4,width:'100%'}}>
          <CockpitCore mode={mode} streak={streak} activeSession={activeSession} onTap={handleTap} />
        </div>

        <WeekChart sessions={[...workoutHistory, ...sessionHistory]} />

        <div className="dash-grid dash-grid-2">
          <div className="dash-widget">
            <span className="dash-widget-label">{t('dashboard.todaySession')}</span>
            {pendingDailyWorkout ? (
              <>
                <p className="dash-widget-title">{pendingDailyWorkout.name || 'Séance du jour'}</p>
                <p className="dash-widget-sub">{pendingDailyWorkout.exercises?.length || 0} exercices</p>
                <div className="dash-widget-btn"><button onClick={()=>setCurrentView('daily-workout')} className="dash-widget-action" style={{background:'#7ED957',color:'#141414'}}>{t('dashboard.resumeWorkout')}</button></div>
              </>
            ) : activeSession ? (
              <>
                <p className="dash-widget-title">{activeSession.exerciseName || activeSession.programName || 'Séance active'}</p>
                <div className="dash-widget-btn"><button onClick={()=>setCurrentView('session')} className="dash-widget-action" style={{background:'#7ED957',color:'#141414'}}>{t('dashboard.resumeWorkout')}</button></div>
              </>
            ) : activeProgram ? (
              <>
                <p className="dash-widget-title">{programDayName || 'Programme'}</p>
                {recommendation?.reason && <p className="dash-widget-sub">{recommendation.reason}</p>}
                <div className="dash-widget-btn"><button onClick={()=>setCurrentView('programme')} className="dash-widget-action" style={{background:'#60a5fa',color:'#141414'}}>{t('dashboard.startSession')}</button></div>
              </>
            ) : recommendation ? (
              <>
                <p className="dash-widget-title">{recommendation.name}</p>
                <p className="dash-widget-sub">{recommendation.adapted}</p>
                <div className="dash-widget-btn"><button onClick={()=>setCurrentView('calisthenics')} className="dash-widget-action" style={{background:'#7ED957',color:'#141414'}}>{t('dashboard.startSession')}</button></div>
              </>
            ) : (
              <p className="dash-widget-sub" style={{marginTop:6}}>{t('dashboard.restDay')}</p>
            )}
          </div>

          {daysSinceLast <= 1 && lastSession ? (
            <div className="dash-widget" style={{background:'rgba(126,217,87,.04)',borderColor:'rgba(126,217,87,.06)'}}>
              <span className="dash-widget-label" style={{color:'rgba(126,217,87,.5)'}}>Dernière séance</span>
              <p className="dash-widget-title" style={{color:'#7ED957'}}>{lastSession.name || lastSession.sessionType || 'Séance'}</p>
              <p className="dash-widget-sub">
                {lastSession.exercises?.length || lastSession.sets?.length || lastSession.totalSets || 0} séries
                {lastSession.totalWeight > 0 && ` · ${lastSession.totalWeight}kg`}
                {lastSession.duration > 0 && ` · ${Math.round(lastSession.duration/60)}min`}
              </p>
              <p className="dash-widget-sub" style={{fontStyle:'italic',marginTop:4}}>→ {recommendation?.name || 'repos'}</p>
            </div>
          ) : (
            <div className="dash-widget" style={{alignItems:'center',justifyContent:'center'}}>
              <span className="dash-widget-label">Progression</span>
              <div style={{fontSize:28,fontWeight:700,color:'#fff',marginTop:4}}>{streak}j</div>
              <p className="dash-widget-sub">streak actif</p>
            </div>
          )}
        </div>

        <div className="dash-stats">
          <div className="dash-stat" style={{padding:'12px 4px'}}>
            <div style={{fontSize:18,fontWeight:700,color:'#fff'}}>{weeklySessions}</div>
            <div style={{fontSize:8,color:'rgba(255,255,255,.2)',textTransform:'uppercase',letterSpacing:'.5px'}}>séances</div>
          </div>
          <div className="dash-stat" style={{padding:'12px 4px'}}>
            <div style={{fontSize:18,fontWeight:700,color:'#fff'}}>{Math.round(totalTime/60)||0}m</div>
            <div style={{fontSize:8,color:'rgba(255,255,255,.2)',textTransform:'uppercase',letterSpacing:'.5px'}}>temps</div>
          </div>
          <div className="dash-stat" style={{padding:'12px 4px'}}>
            <div style={{fontSize:18,fontWeight:700,color:'#7ED957'}}>{weeklyPRs}</div>
            <div style={{fontSize:8,color:'rgba(255,255,255,.2)',textTransform:'uppercase',letterSpacing:'.5px'}}>PR</div>
          </div>
          <div className="dash-stat" style={{padding:'12px 4px'}}>
            <div style={{fontSize:18,fontWeight:700,color:'#f97316'}}>{streak}j</div>
            <div style={{fontSize:8,color:'rgba(255,255,255,.2)',textTransform:'uppercase',letterSpacing:'.5px'}}>streak</div>
          </div>
        </div>

        <div className="dash-accordion" onClick={()=>toggleSection('cardio')}>
          <div className="dash-accordion-header">
            <div className="dash-accordion-icon" style={{background:'rgba(249,115,22,.12)'}}><Heart size={16} style={{color:'#f97316'}} /></div>
            <span className="dash-accordion-label">{t('dashboard.cardio')}</span>
            {activeSession?.sessionType === 'cardio' && <span className="dash-accordion-badge" style={{background:'rgba(249,115,22,.12)',color:'#f97316'}}>actif</span>}
            <ChevronDown size={16} className={`dash-accordion-chevron ${openSection === 'cardio' ? 'open' : ''}`} style={{color:'rgba(255,255,255,.2)'}} />
          </div>
          <div className={`dash-accordion-body ${openSection === 'cardio' ? 'open' : ''}`}>
            <p style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:10}}>Course, vélo, rameur, HIIT — choisis ton activité.</p>
            <button onClick={(e)=>{e.stopPropagation();setCurrentView('cardio')}} className="dash-widget-action" style={{background:'#f97316',color:'#141414'}}>{t('dashboard.start')}</button>
          </div>
        </div>

        <div className="dash-accordion" onClick={()=>toggleSection('exercises')}>
          <div className="dash-accordion-header">
            <div className="dash-accordion-icon" style={{background:'rgba(126,217,87,.12)'}}><Dumbbell size={16} style={{color:'#7ED957'}} /></div>
            <span className="dash-accordion-label">{t('dashboard.exercises')}</span>
            <ChevronDown size={16} className={`dash-accordion-chevron ${openSection === 'exercises' ? 'open' : ''}`} style={{color:'rgba(255,255,255,.2)'}} />
          </div>
          <div className={`dash-accordion-body ${openSection === 'exercises' ? 'open' : ''}`}>
            <p style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:10}}>Musculation, calisthenie, templates — choisis ton exercice.</p>
            <button onClick={(e)=>{e.stopPropagation();setCurrentView('calisthenics')}} className="dash-widget-action" style={{background:'#7ED957',color:'#141414'}}>{t('dashboard.start')}</button>
          </div>
        </div>

        <div className="dash-accordion" onClick={()=>toggleSection('programme')}>
          <div className="dash-accordion-header">
            <div className="dash-accordion-icon" style={{background:'rgba(96,165,250,.12)'}}><CalendarRange size={16} style={{color:'#60a5fa'}} /></div>
            <span className="dash-accordion-label">{t('dashboard.program')}</span>
            {activeProgram && <span className="dash-accordion-badge" style={{background:'rgba(96,165,250,.12)',color:'#60a5fa'}}>{programDayName || 'en cours'}</span>}
            {programRec && !activeProgram && <span className="dash-accordion-badge" style={{background:'rgba(255,255,255,.06)',color:'rgba(255,255,255,.3)'}}>{programRec.name}</span>}
            <ChevronDown size={16} className={`dash-accordion-chevron ${openSection === 'programme' ? 'open' : ''}`} style={{color:'rgba(255,255,255,.2)'}} />
          </div>
          <div className={`dash-accordion-body ${openSection === 'programme' ? 'open' : ''}`}>
            {programRec && !activeProgram ? (
              <>
                <p style={{fontSize:11,color:'rgba(255,255,255,.5)',fontWeight:500,marginBottom:4}}>{programRec.name} · {programRec.daysPerWeek}j/sem · {programRec.durationWeeks} sem</p>
                <p style={{fontSize:10,color:'rgba(255,255,255,.3)',lineHeight:1.4,marginBottom:10}}>{programRec.description}</p>
                <button onClick={(e)=>{e.stopPropagation();setCurrentView('programme')}} className="dash-widget-action" style={{background:'#60a5fa',color:'#141414'}}>Voir le programme</button>
              </>
            ) : (
              <>
                <p style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:10}}>{activeProgram ? `Jour en cours : ${programDayName || '...'}` : 'Programmes structurés sur plusieurs semaines.'}</p>
                <button onClick={(e)=>{e.stopPropagation();setCurrentView('programme')}} className="dash-widget-action" style={{background:'#60a5fa',color:'#141414'}}>{activeProgram ? 'Continuer' : 'Explorer'}</button>
              </>
            )}
          </div>
        </div>

        <Recommendations />

        <div className="dash-grid dash-grid-2" style={{marginBottom:0}}>
          <div className="dash-widget" style={{minHeight:120,alignItems:'center',justifyContent:'center',borderStyle:'dashed',borderColor:'rgba(96,165,250,.15)'}}>
            <div style={{width:48,height:48,borderRadius:'50%',background:'rgba(96,165,250,.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
              <Zap size={24} style={{color:'#60a5fa'}} />
            </div>
            <span style={{fontSize:12,fontWeight:600,color:'rgba(96,165,250,.4)'}}>Graphique Budget 3D</span>
            <span style={{fontSize:9,color:'rgba(255,255,255,.15)',marginTop:2}}>Bientôt disponible</span>
          </div>
          <div className="dash-widget" style={{minHeight:120,alignItems:'center',justifyContent:'center',borderStyle:'dashed',borderColor:'rgba(126,217,87,.15)'}}>
            <div style={{width:48,height:48,borderRadius:'50%',background:'rgba(126,217,87,.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
              <span style={{fontSize:22}}>🧑‍🦱</span>
            </div>
            <span style={{fontSize:12,fontWeight:600,color:'rgba(126,217,87,.4)'}}>Avatar Évolutif</span>
            <span style={{fontSize:9,color:'rgba(255,255,255,.15)',marginTop:2}}>Bientôt disponible</span>
          </div>
        </div>

        <div style={{height:40}} />
      </div>
    </GlassBackground>
  )
}
