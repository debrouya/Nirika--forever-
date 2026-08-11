import { useState, useEffect, useRef, useMemo } from 'react'
import { Play, Pause, SkipForward, ArrowLeft, Flame } from 'lucide-react'
import useStore from '../store/useStore'
import { useBackgroundHandler } from '../hooks/useBackgroundHandler'
import { feedback } from '../services/feedback'

function f(s) { const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}` }

const R = 120; const CIRC = 2 * Math.PI * R
const COLOR = '#f97316'

export default function CardioTimer({ onComplete }) {
  const store = useStore
  const session = store((s) => s.activeSession)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const intervalRef = useRef(null)
  const wakeLockRef = useRef(null)
  const targetMin = 20; const total = targetMin * 60

  useBackgroundHandler(() => setPaused(true), () => setPaused(false))

  useEffect(() => {
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(w => { wakeLockRef.current = w }).catch(() => {})
    return () => { clearInterval(intervalRef.current); if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {}) }
  }, [])

  useEffect(() => {
    if (paused || done) return
    intervalRef.current = setInterval(() => setElapsed(t => { const n = t + 1; if (n >= total) { feedback(); setDone(true); clearInterval(intervalRef.current); return n }; return n }), 1000)
    return () => clearInterval(intervalRef.current)
  }, [paused, done])

  const remaining = total - elapsed
  const progress = (elapsed / total) * 100
  const calories = Math.round(elapsed * 0.15)
  const progressOffset = useMemo(() => CIRC - (Math.min(100, progress) / 100) * CIRC, [progress])

  const end = () => { setConfirmQuit(false); clearInterval(intervalRef.current); if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {}); setTimeout(() => onComplete(), 50) }

  if (done) return (
    <div style={{position:'fixed',inset:0,zIndex:40,background:'#0C0C10',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,paddingBottom:'calc(env(safe-area-inset-bottom,20px)+90px)'}}>
      <Flame size={40} style={{color:'#f97316',marginBottom:16}} />
      <div style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:8}}>Cardio terminé</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,width:'100%',maxWidth:280,marginBottom:24}}>
        <div style={{background:'rgba(255,255,255,.06)',borderRadius:18,padding:'16px 8px',textAlign:'center',backdropFilter:'blur(20px)'}}><div style={{fontSize:24,fontWeight:700,color:'#fff'}}>{f(elapsed)}</div><div style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>durée</div></div>
        <div style={{background:'rgba(255,255,255,.06)',borderRadius:18,padding:'16px 8px',textAlign:'center',backdropFilter:'blur(20px)'}}><div style={{fontSize:24,fontWeight:700,color:'#f97316'}}>{calories}</div><div style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>kcal</div></div>
      </div>
      <div style={{width:'100%',maxWidth:280,background:'rgba(249,115,22,.05)',borderRadius:14,padding:12,marginBottom:20,textAlign:'center',border:'1px solid rgba(249,115,22,.08)'}}>
        <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginBottom:4}}>Prochaine étape</div>
        <div style={{fontSize:13,color:'#fff',fontWeight:500}}>Récupère · Prochaine séance dans 48h</div>
      </div>
      <button onClick={end} style={{width:'100%',maxWidth:280,height:48,borderRadius:16,border:'none',background:'#f97316',color:'#0C0C10',fontSize:14,fontWeight:600,fontFamily:'inherit',cursor:'pointer'}}>Terminer</button>
    </div>
  )

  return (
    <div style={{position:'fixed',inset:0,zIndex:40,background:'#0C0C10'}}>
      <div style={{padding:'52px 20px 120px',maxWidth:430,margin:'0 auto',display:'flex',flexDirection:'column',alignItems:'center',minHeight:'100dvh'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',marginBottom:32}}>
          <button onClick={()=>setConfirmQuit(true)} style={{background:'rgba(255,255,255,.06)',border:'none',borderRadius:14,width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',backdropFilter:'blur(20px)'}}>
            <ArrowLeft size={20} style={{color:'rgba(255,255,255,.5)'}} />
          </button>
          <div style={{width:40}} />
        </div>

        {/* COCKPIT CIRCLE */}
        <div style={{position:'relative',width:280,height:280,marginBottom:28}}>
          <svg viewBox="0 0 280 280" width="280" height="280" style={{transform:'rotate(-90deg)',position:'absolute'}}>
            <circle cx="140" cy="140" r={R} fill="none" stroke="rgb(255,255,255)" strokeOpacity="0.03" strokeWidth="2" />
            <circle cx="140" cy="140" r={R} fill="none" stroke={COLOR} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={progressOffset}
              style={{filter:'drop-shadow(0 0 12px rgba(249,115,22,.25))',transition:'stroke-dashoffset .5s linear'}} />
          </svg>

          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
            <span style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:1}}>{session?.exerciseName||'Cardio'}</span>
            <div style={{fontSize:52,fontWeight:700,color:'#fff',letterSpacing:'-2px',fontVariantNumeric:'tabular-nums'}}>{f(remaining)}</div>
            <div style={{fontSize:13,color:COLOR,fontWeight:500,textTransform:'uppercase',letterSpacing:1}}>restant</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.3)',marginTop:4}}>{calories} kcal</div>
          </div>
        </div>

        {/* Goal indicator */}
        <div style={{width:'100%',maxWidth:280,marginBottom:20}}>
          <div style={{background:'rgba(255,255,255,.04)',borderRadius:12,padding:'8px',textAlign:'center'}}>
            <span style={{fontSize:11,color:'rgba(255,255,255,.2)'}}>Objectif : {targetMin} minutes</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{display:'flex',gap:12,width:'100%'}}>
          <button onClick={()=>setPaused(p=>!p)}
            style={{flex:1,height:52,borderRadius:16,border:'none',fontFamily:'inherit',fontSize:14,fontWeight:500,cursor:'pointer',
              background:'rgba(255,255,255,.08)',color:'#fff',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            {paused?<Play size={18}/>:<Pause size={18}/>}{paused?'Reprendre':'Pause'}
          </button>
          <button onClick={()=>{setDone(true);clearInterval(intervalRef.current)}}
            style={{flex:1,height:52,borderRadius:16,border:'none',fontFamily:'inherit',fontSize:14,fontWeight:600,cursor:'pointer',
              background:'rgba(249,115,22,.15)',color:COLOR,backdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <SkipForward size={18}/>Terminer
          </button>
        </div>

        {/* Confirm quit modal */}
        {confirmQuit && (
          <div style={{position:'fixed',inset:0,zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.6)',backdropFilter:'blur(8px)'}}>
            <div style={{background:'rgba(255,255,255,.08)',backdropFilter:'blur(30px)',borderRadius:24,padding:24,maxWidth:300,width:'90%',textAlign:'center'}}>
              <div style={{fontSize:17,fontWeight:600,color:'#fff',marginBottom:8}}>Quitter la séance ?</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:20}}>Ta progression sera sauvegardée</div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setConfirmQuit(false)} style={{flex:1,height:48,borderRadius:14,border:'none',fontFamily:'inherit',fontSize:14,fontWeight:500,cursor:'pointer',background:'rgba(255,255,255,.06)',color:'#fff'}}>Annuler</button>
                <button onClick={end} style={{flex:1,height:48,borderRadius:14,border:'none',fontFamily:'inherit',fontSize:14,fontWeight:600,cursor:'pointer',background:COLOR,color:'#0C0C10'}}>Quitter</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
