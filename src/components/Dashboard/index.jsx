import { useMemo } from 'react'
import { Play } from 'lucide-react'
import useStore from '../../store/useStore'
import GlassBackground from '../../design-system/components/GlassBackground'
import { useDashboardData } from './hooks/useDashboardData'
import Recommendations from '../Recommendations'
import './styles/dashboard.css'

const RADIUS = 130
const CIRC = 2 * Math.PI * RADIUS

export default function Dashboard() {
  const { setCurrentView } = useStore()
  const { firstName, activeSession, streak, weeklySessions, totalTime } = useDashboardData()

  const progressOffset = useMemo(() => {
    const pct = Math.min(100, Math.max(0, (streak / 30) * 100))
    return CIRC - (pct / 100) * CIRC
  }, [streak])

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
            Bonjour{firstName?` ${firstName}`:''}
          </h1>
        </div>

        {/* MAIN COCKPIT CIRCLE */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:32}}>
          <div className="circle-cockpit" style={{width:280,height:280}} onClick={() => setCurrentView(activeSession?'session':'calisthenics')}>

            {/* Outer ring — progression */}
            <svg className="circle-rings" viewBox="0 0 280 280" width="280" height="280">
              <circle cx="140" cy="140" r={RADIUS} fill="none" stroke="rgba(255,255,255,.03)" strokeWidth="1.5" />
              <circle cx="140" cy="140" r={RADIUS} fill="none" stroke="#7ED957" strokeWidth="5"
                strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={progressOffset}
                style={{filter:'drop-shadow(0 0 14px rgba(126,217,87,.3))',transition:'stroke-dashoffset 1.5s ease'}} />

              {/* Inner ring — daily goal */}
              <circle cx="140" cy="140" r="115" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="2" />
              <circle cx="140" cy="140" r="115" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="3"
                strokeLinecap="round" strokeDasharray={2*Math.PI*115} strokeDashoffset={2*Math.PI*115*.4}
                style={{transition:'stroke-dashoffset 1s ease'}} />
            </svg>

            {/* Center content */}
            <div className="circle-center">
              {activeSession ? (
                <>
                  <div className="circle-timer">▶</div>
                  <div className="circle-main">{activeSession.exerciseName}</div>
                  <div className="circle-sub">Reprendre</div>
                </>
              ) : (
                <>
                  <div className="circle-play">▶</div>
                  <div className="circle-main">DÉMARRER</div>
                  <div className="circle-sub">une séance</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* DATA ROW */}
        <div className="cockpit-data">
          <div className="cockpit-stat">
            <span className="cockpit-val">{streak}</span>
            <span className="cockpit-lbl">streak</span>
          </div>
          <div className="cockpit-divider" />
          <div className="cockpit-stat">
            <span className="cockpit-val">{weeklySessions}</span>
            <span className="cockpit-lbl">séances/7j</span>
          </div>
          <div className="cockpit-divider" />
          <div className="cockpit-stat">
            <span className="cockpit-val">{Math.round(totalTime/60)}min</span>
            <span className="cockpit-lbl">temps</span>
          </div>
        </div>

        {/* RECOVERY */}
        <div className="cockpit-recovery">
          <span style={{fontSize:11,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:1}}>Récupération</span>
          <div style={{display:'flex',gap:8,alignItems:'center',marginTop:4}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#7ED957'}} />
            <span style={{fontSize:13,fontWeight:500,color:'#fff'}}>Prêt</span>
            <span style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>· Score 78/100</span>
          </div>
          <div className="dash-xp-bar" style={{marginTop:8}}>
            <div className="dash-xp-fill" style={{width:'78%'}} />
          </div>
        </div>

        {/* Quick access */}
        <div className="cockpit-actions">
          {[
            {label:'Musculation',view:'calisthenics'},
            {label:'Cardio',view:'cardio'},
            {label:'Exercices',view:'calisthenics'},
            {label:'Programme',view:'programme'},
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
