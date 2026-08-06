import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipForward, ArrowLeft, CheckCircle, Plus, Share2, Save, Dumbbell } from 'lucide-react'
import useStore from '../store/useStore'
import html2canvas from 'html2canvas'
import { beep } from '../utils/audio'
import { feedback } from '../services/feedback'
import { useBackgroundHandler } from '../hooks/useBackgroundHandler'
import GlassBackground from '../design-system/components/GlassBackground'

function f(s){const m=Math.floor(s/60);return`${m}:${String(s%60).padStart(2,'0')}`}

const R=130;const CIRC=2*Math.PI*R

export default function WorkoutScreen({exercise,onComplete}){
  const S=useStore
  const [phase,setPhase]=useState('effort')
  const [elapsed,setElapsed]=useState(0)
  const [paused,setPaused]=useState(false)
  const [sets,setSets]=useState([])
  const [curSet,setCurSet]=useState(1)
  const [w,setW]=useState(()=>{const h=S.getState().exerciseHistory;const l=((h?.[exercise.id]||[]).slice(-1)[0]);return String((l?.weight)||'')})
  const [r,setR]=useState(()=>{const h=S.getState().exerciseHistory;const l=((h?.[exercise.id]||[]).slice(-1)[0]);return String((l?.reps)||'')})
  const [dur,setDur]=useState(45)
  const [newPR,setNewPR]=useState(false)
  const [confirmQuit,setConfirmQuit]=useState(false)
  const tgtSets=3;const restSec=Math.round(dur/2)
  const iv=useRef(null);const wl=useRef(null)
  const started=useRef(Date.now());const mtd=useRef(true)

  useBackgroundHandler(()=>setPaused(true),()=>setPaused(false))

  useEffect(()=>{
    if('wakeLock'in navigator)navigator.wakeLock.request('screen').then(x=>{wl.current=x}).catch(()=>{})
    return()=>{mtd.current=false;clearInterval(iv.current);if(wl.current)wl.current.release().catch(()=>{})}
  },[])

  const h=S.getState().exerciseHistory
  const pr=(h?.[exercise.id]||[]).reduce((m,x)=>Math.max(m,x.weight||0),0)

  useEffect(()=>{
    if(paused||phase==='done')return
    iv.current=setInterval(()=>setElapsed(t=>{
      const n=t+1
      if(phase==='effort'||phase==='last3'){
        if(n>=dur-3&&n<dur)setPhase('last3')
        if(n>=dur){feedback();setPhase('rest');const s={w:Number(w)||0,r:Number(r)||0};setSets(p=>[...p,s]);if(s.w>pr)setNewPR(true);try{const st=useStore.getState();if(st.activeSession)st.addSetToSession(s);S.getState().addExerciseRecord(exercise.id,{exerciseName:exercise.name,muscleGroup:exercise.muscleGroup,weight:s.w,reps:s.r,totalVolume:s.w*s.r})}catch{};return 0}
      }
      if(phase==='rest'&&n>=restSec){feedback();if(curSet>=tgtSets){setPhase('done');clearInterval(iv.current);save();return n};setPhase('effort');setCurSet(c=>c+1);return 0}
      if(phase==='last3'&&n>=dur-3){try{navigator.vibrate?.(100)}catch{};beep(800,150)}
      return n
    }),1000)
    return()=>clearInterval(iv.current)
  },[paused,phase])

  const save=()=>{const d=Math.round((Date.now()-started.current)/1000);const v=sets.reduce((s,x)=>s+x.w*x.r,0);try{S.getState().addWorkout({exerciseName:exercise.name,muscleGroup:exercise.muscleGroup,duration:Math.floor(d/60),durationMinutes:Math.floor(d/60),calories:Math.round(d*0.15),totalVolume:v})}catch{}}

  const end=()=>{setConfirmQuit(false);clearInterval(iv.current);if(wl.current)wl.current.release().catch(()=>{});onComplete()}

  const share=async()=>{
    const el=document.getElementById('wo-summary');if(!el)return
    try{const c=await html2canvas(el,{backgroundColor:'#0E0E10',scale:2});c.toBlob(async(blob)=>{const f=new File([blob],`nirika-${exercise.name}.png`,{type:'image/png'});try{await navigator.share({files:[f],title:'NIRIKA'})}catch{const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=`nirika-${exercise.name}.png`;a.click();URL.revokeObjectURL(u)}})}catch(e){const t=`${exercise.name} - ${sets.length} series sur NIRIKA`;try{navigator.clipboard.writeText(t)}catch{}}
  }

  const prog=phase==='rest'?(elapsed/restSec)*100:(elapsed/dur)*100
  const rem=phase==='rest'?restSec-elapsed:dur-elapsed
  const color=phase==='last3'?'#f97316':phase==='rest'?'#3b82f6':'#7ED957'
  const progressOffset=CIRC-(Math.min(100,prog)/100)*CIRC

  if(phase==='done'){
    const durTotal=Math.round((Date.now()-started.current)/1000)
    const vol=sets.reduce((s,x)=>s+x.w*x.r,0)
    return(
      <GlassBackground>
        <div id="wo-summary" style={{padding:'60px 20px 120px',maxWidth:430,margin:'0 auto',display:'flex',flexDirection:'column',alignItems:'center',gap:24,minHeight:'100dvh',textAlign:'center'}}>
          <CheckCircle size={48} style={{color:'#7ED957',filter:'drop-shadow(0 0 12px rgba(126,217,87,.3))'}} />
          <div style={{fontSize:24,fontWeight:700,color:'#fff'}}>Séance terminée</div>
          <div style={{fontSize:15,color:'rgba(255,255,255,.5)'}}>{exercise.name}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,width:'100%'}}>
            <div style={{background:'rgba(255,255,255,.06)',borderRadius:18,padding:'16px 8px',backdropFilter:'blur(20px)'}}><div style={{fontSize:24,fontWeight:700,color:'#7ED957'}}>{sets.length}</div><div style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>séries</div></div>
            <div style={{background:'rgba(255,255,255,.06)',borderRadius:18,padding:'16px 8px',backdropFilter:'blur(20px)'}}><div style={{fontSize:24,fontWeight:700,color:'#fff'}}>{f(durTotal)}</div><div style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>durée</div></div>
            <div style={{background:'rgba(255,255,255,.06)',borderRadius:18,padding:'16px 8px',backdropFilter:'blur(20px)'}}><div style={{fontSize:24,fontWeight:700,color:'#fff'}}>{vol}</div><div style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>volume</div></div>
          </div>
          <div style={{display:'flex',gap:12,width:'100%'}}>
            <button onClick={share} style={{flex:1,background:'rgba(255,255,255,.06)',border:'none',borderRadius:16,height:48,color:'#fff',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'inherit',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><Share2 size={16} /> Partager</button>
            <button onClick={()=>{setPhase('effort');setCurSet(1);setSets([]);setElapsed(0);started.current=Date.now()}} style={{flex:1,background:'rgba(255,255,255,.06)',border:'none',borderRadius:16,height:48,color:'#fff',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'inherit',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><Plus size={16} /> Refaire</button>
            <button onClick={end} style={{flex:1,background:'#7ED957',border:'none',borderRadius:16,height:48,color:'#0E0E10',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><CheckCircle size={16} /> Terminer</button>
          </div>
        </div>
      </GlassBackground>
    )
  }

  return(
    <GlassBackground>
      <div style={{padding:'52px 20px 120px',maxWidth:430,margin:'0 auto',display:'flex',flexDirection:'column',alignItems:'center',minHeight:'100dvh'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',marginBottom:32}}>
          <button onClick={()=>setConfirmQuit(true)} style={{background:'rgba(255,255,255,.06)',border:'none',borderRadius:14,width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',backdropFilter:'blur(20px)'}}>
            <ArrowLeft size={20} style={{color:'rgba(255,255,255,.5)'}} />
          </button>
          <span style={{fontSize:13,fontWeight:600,color:'#fff',textTransform:'uppercase',letterSpacing:2}}>{exercise.name}</span>
          <div style={{width:40}} />
        </div>

        {/* COCKPIT CIRCLE */}
        <div style={{position:'relative',width:280,height:280,marginBottom:28}}>
          <svg viewBox="0 0 280 280" width="280" height="280" style={{transform:'rotate(-90deg)',position:'absolute'}}>
            <circle cx="140" cy="140" r={R} fill="none" stroke="rgba(255,255,255,.03)" strokeWidth="2" />
            <circle cx="140" cy="140" r={R} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={progressOffset}
              style={{filter:`drop-shadow(0 0 12px ${color}44)`,transition:'stroke-dashoffset .5s linear'}} />
          </svg>

          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4}}>
            <div style={{fontSize:56,fontWeight:700,color:'#fff',letterSpacing:'-2px',fontVariantNumeric:'tabular-nums',fontFamily:'Inter,sans-serif'}}>
              {f(rem)}
            </div>
            <div style={{fontSize:13,color:color,fontWeight:500,textTransform:'uppercase',letterSpacing:1}}>
              {phase==='rest'?'repos':'effort'}
            </div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginTop:4}}>
              Série {curSet}/{tgtSets}
            </div>
          </div>
        </div>

        {/* Timer selectors */}
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {[30,45,60].map(d=>(<button key={d} onClick={()=>{setDur(d);setElapsed(0);started.current=Date.now()}}
            style={{padding:'6px 18px',borderRadius:12,border:'none',fontFamily:'inherit',fontSize:12,fontWeight:500,cursor:'pointer',
              background:dur===d?'rgba(255,255,255,.15)':'rgba(255,255,255,.04)',color:dur===d?'#fff':'rgba(255,255,255,.4)'}}>{d}s</button>))}
        </div>

        {/* Inputs */}
        {phase!=='rest'&&(
          <div style={{display:'flex',gap:20,alignItems:'center',marginBottom:24}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <span style={{fontSize:10,color:'rgba(255,255,255,.3)',textTransform:'uppercase'}}>Charge</span>
              <input type="number" min="0" max="999" value={w} onChange={e=>setW(e.target.value)} placeholder="0"
                style={{width:64,height:44,textAlign:'center',background:'rgba(255,255,255,.06)',border:'none',borderRadius:14,fontSize:18,fontWeight:600,color:'#fff',fontFamily:'inherit'}} />
            </div>
            <span style={{color:'rgba(255,255,255,.2)',fontSize:18}}>×</span>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <span style={{fontSize:10,color:'rgba(255,255,255,.3)',textTransform:'uppercase'}}>Reps</span>
              <input type="number" min="0" max="999" value={r} onChange={e=>setR(e.target.value)} placeholder="0"
                style={{width:64,height:44,textAlign:'center',background:'rgba(255,255,255,.06)',border:'none',borderRadius:14,fontSize:18,fontWeight:600,color:'#fff',fontFamily:'inherit'}} />
            </div>
          </div>
        )}

        {/* NEW PR flash */}
        {newPR && <div style={{fontSize:13,fontWeight:700,color:'#f97316',marginBottom:12,animation:'pulse 1s infinite'}}>🏆 NOUVEAU RECORD !</div>}

        {/* Buttons */}
        <div style={{display:'flex',gap:12,width:'100%'}}>
          <button onClick={()=>setPaused(p=>!p)}
            style={{flex:1,height:52,borderRadius:16,border:'none',fontFamily:'inherit',fontSize:14,fontWeight:500,cursor:'pointer',
              background:'rgba(255,255,255,.08)',color:'#fff',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            {paused?<Play size={18} />:<Pause size={18} />}{paused?'Reprendre':'Pause'}
          </button>
          <button onClick={()=>{feedback();if(curSet>=tgtSets){setPhase('done');save()}else{setPhase('rest');setCurSet(c=>c+1)}}}
            style={{flex:1,height:52,borderRadius:16,border:'none',fontFamily:'inherit',fontSize:14,fontWeight:600,cursor:'pointer',
              background:'rgba(126,217,87,.15)',color:'#7ED957',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <SkipForward size={18} />Suivant
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
                <button onClick={end} style={{flex:1,height:48,borderRadius:14,border:'none',fontFamily:'inherit',fontSize:14,fontWeight:600,cursor:'pointer',background:'#7ED957',color:'#0E0E10'}}>Quitter</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassBackground>
  )
}
