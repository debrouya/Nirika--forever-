import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipForward, ArrowLeft, Dumbbell, Save, CheckCircle, Plus, Share2 } from 'lucide-react'
import useStore from '../store/useStore'
import html2canvas from 'html2canvas'

function beep(f=800,d=150){try{const a=new AudioContext();const o=a.createOscillator();o.type='square';o.frequency.value=f;o.connect(a.destination);o.start();o.stop(a.currentTime+d/1000)}catch{}}
function f(s){const m=Math.floor(s/60);return`${m}:${String(s%60).padStart(2,'0')}`}

export default function WorkoutScreen({exercise,onComplete}){
  const S=useStore
  const [phase,setPhase]=useState('effort')
  const [elapsed,setElapsed]=useState(0)
  const [paused,setPaused]=useState(false)
  const [sets,setSets]=useState([])
  const [curSet,setCurSet]=useState(1)
  const [w,setW]=useState(String(defW||''))
  const [r,setR]=useState(String(defR||''))
  const [dur,setDur]=useState(45)
  const tgtSets=3;const restSec=Math.round(dur/2)
  const iv=useRef(null);const wl=useRef(null)
  const started=useRef(Date.now());const mtd=useRef(true)

  useEffect(()=>{
    if('wakeLock'in navigator)navigator.wakeLock.request('screen').then(x=>{wl.current=x}).catch(()=>{})
    return()=>{mtd.current=false;clearInterval(iv.current);if(wl.current)wl.current.release().catch(()=>{})}
  },[])

  const h=S.getState().exerciseHistory
  const last=((h?.[exercise.id]||[]).slice(-1)[0])
  const pr=(h?.[exercise.id]||[]).reduce((m,x)=>Math.max(m,x.weight||0),0)
  const defW=last?.weight||''
  const defR=last?.reps||''

  useEffect(()=>{
    if(paused||phase==='done')return
    iv.current=setInterval(()=>setElapsed(t=>{
      const n=t+1
      if(phase==='effort'||phase==='last3'){
        if(n>=dur-3&&n<dur)setPhase('last3')
        if(n>=dur){setPhase('rest');const s={w:Number(w)||0,r:Number(r)||0};setSets(p=>[...p,s]);try{const st=useStore.getState();if(st.activeSession)st.addSetToSession(s);S.getState().addExerciseRecord(exercise.id,{exerciseName:exercise.name,muscleGroup:exercise.muscleGroup,weight:s.w,reps:s.r,totalVolume:s.w*s.r})}catch{};return 0}
      }
      if(phase==='rest'&&n>=restSec){if(curSet>=tgtSets){setPhase('done');clearInterval(iv.current);save();return n};setPhase('effort');setCurSet(c=>c+1);return 0}
      if(phase==='last3'&&n>=dur-3){try{navigator.vibrate?.(100)}catch{};beep(800,150)}
      return n
    }),1000)
    return()=>clearInterval(iv.current)
  },[paused,phase])

  const save=()=>{const d=Math.round((Date.now()-started.current)/1000);const v=sets.reduce((s,x)=>s+x.w*x.r,0);try{S.getState().addWorkout({exerciseName:exercise.name,muscleGroup:exercise.muscleGroup,duration:Math.floor(d/60),durationMinutes:Math.floor(d/60),calories:Math.round(d*0.15),totalVolume:v})}catch{}}

  const end=()=>{clearInterval(iv.current);if(wl.current)wl.current.release().catch(()=>{});onComplete()}

  const share=async()=>{
    const el=document.getElementById('wo-summary');if(!el)return
    try{const c=await html2canvas(el,{backgroundColor:'#0f1a1e',scale:2});c.toBlob(async(blob)=>{const f=new File([blob],`nirika-${exercise.name}.png`,{type:'image/png'});try{await navigator.share({files:[f],title:'NIRIKA FOR EVER'})}catch{const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=`nirika-${exercise.name}.png`;a.click();URL.revokeObjectURL(u)}})}catch(e){const t=`${exercise.name} - ${sets.length} series, ${f(d)} sur NIRIKA FOR EVER`;try{navigator.clipboard.writeText(t)}catch{}}}
  const d=phase==='done'?Math.round((Date.now()-started.current)/1000):0
  const v=phase==='done'?sets.reduce((s,x)=>s+x.w*x.r,0):0

  if(phase==='done'){
    const d=Math.round((Date.now()-started.current)/1000);const v=sets.reduce((s,x)=>s+x.w*x.r,0)
    return(
      <div id="wo-summary" className="fixed inset-0 z-40 bg-dark-bg flex flex-col items-center justify-center p-6" style={{paddingBottom:'calc(env(safe-area-inset-bottom,20px)+90px)'}}>
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="NIRIKA" className="w-40 h-40 rounded-3xl mb-2" />
          <span className="text-white font-black text-xl tracking-tight mb-4">NIRIKA <span className="text-lime">FOR EVER</span></span>
        </div>
        <CheckCircle size={40}className="text-lime mb-4"/>
        <p className="text-lime text-sm mb-2">Seance terminee !</p>
        <p className="text-white/50 text-xs mb-4">{sets.length} series · {f(d)} · {Math.round(d*0.15)} kcal · {v}kg volume</p>
        <h1 className="text-white font-bold text-xl text-center mb-2">{exercise.name}</h1>
        <p className="text-white/30 text-xs mb-4">- Termine -</p>
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-4">
          <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-lime font-bold text-lg">{sets.length}</p><p className="text-muted text-[10px]">series</p></div>
          <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-white font-bold text-lg">{f(d)}</p><p className="text-muted text-[10px]">duree</p></div>
          <div className="bg-dark-card rounded-2xl p-3 text-center"><p className="text-orange-400 font-bold text-lg">{v}</p><p className="text-muted text-[10px]">volume</p></div>
        </div>
        <div className="flex gap-3 w-full max-w-xs mb-3">
          <button onClick={share}className="flex-1 h-12 rounded-xl bg-dark-card border border-dark-border text-white font-bold text-sm flex items-center justify-center gap-2"><Share2 size={16}/>Partager</button>
          <button onClick={()=>{try{S.getState().addWorkoutTemplate({name:`${exercise.name} (${tgtSets}s)`,exercises:[{...exercise,sets:tgtSets,reps:r||'10',weight:w||'0'}]})}catch{};end()}}className="flex-1 h-12 rounded-xl bg-dark-card border border-dark-border text-white font-bold text-sm flex items-center justify-center gap-2"><Save size={16}/>Template</button>
          <button onClick={()=>{setPhase('effort');setCurSet(1);setSets([]);setElapsed(0);started.current=Date.now()}}className="flex-1 h-12 rounded-xl bg-dark-card border border-dark-border text-white font-bold text-sm flex items-center justify-center gap-2"><Plus size={16}/>Refaire</button>
        </div>
        <button onClick={end}className="w-full max-w-xs h-12 rounded-xl bg-lime text-dark-bg font-bold">Terminer</button>
      </div>
    )
  }

  const prog=phase==='rest'?(elapsed/restSec)*100:(elapsed/dur)*100
  const rem=phase==='rest'?restSec-elapsed:dur-elapsed
  const rc=phase==='last3'?'#f97316':phase==='rest'?'#3b82f6':'#22c55e'
  const bg=phase==='rest'?'#0a1628':'#0f1a1e'
  const rad=120;const circ=2*Math.PI*rad;const dash=circ-(Math.min(100,prog)/100)*circ

  return(
    <div className="fixed inset-0 z-40 flex flex-col" style={{backgroundColor:bg}}>
      <div className="flex items-center px-4" style={{paddingTop:'calc(env(safe-area-inset-top,0px)+12px)'}}>
        <button onClick={end}className="p-2 text-white/50 hover:text-white"><ArrowLeft size={22}/></button>
        <div className="w-10"/>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4">
        <h1 className="text-white font-bold text-2xl uppercase tracking-wide text-center">{exercise.name}</h1>
        <p className="text-white/50 text-sm">{phase==='rest'?'Repos':`Serie ${curSet}/${tgtSets}`}{pr>0?` - Record: ${pr}kg`:''}</p>

        <div className="relative my-2">
          <svg width="280"height="280"className="-rotate-90">
            <circle cx="140"cy="140"r={rad}fill="none"stroke="rgba(255,255,255,0.05)"strokeWidth="10"/>
            <circle cx="140"cy="140"r={rad}fill="none"stroke={rc}strokeWidth="10"strokeLinecap="round"strokeDasharray={circ}strokeDashoffset={dash}style={{transition:'stroke-dashoffset 0.5s linear',filter:`drop-shadow(0 0 6px ${rc})`}}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-6xl font-black font-mono ${phase==='last3'?'text-orange-500':phase==='rest'?'text-blue-400':'text-lime'}`}>{f(rem)}</span>
            <span className="text-white/30 text-xs mt-1">{phase==='rest'?'repos':'effort'}</span>
            <div className="flex items-center gap-1 mt-2">
              {[30,45,60].map(d=>(
                <button key={d}onClick={()=>{setDur(d);setElapsed(0);started.current=Date.now()}}className={`px-3 py-1 rounded text-xs font-medium ${dur===d?'bg-lime/20 text-lime border border-lime/30':'text-white/30 hover:text-white/60'}`}>{d}s</button>
              ))}
            </div>
          </div>
        </div>

        {phase!=='rest'&&(
          <div className="flex gap-4 items-center mt-1">
            <div className="flex flex-col items-center"><span className="text-white/30 text-[10px] mb-1">Charge</span><input type="number"value={w}onChange={e=>setW(e.target.value)}placeholder="0"className="w-16 h-10 text-center bg-white/10 border border-white/20 rounded-lg text-white text-lg font-bold placeholder-white/30 focus:outline-none focus:border-lime/50"/></div>
            <span className="text-white/20">x</span>
            <div className="flex flex-col items-center"><span className="text-white/30 text-[10px] mb-1">Reps</span><input type="number"value={r}onChange={e=>setR(e.target.value)}placeholder="0"className="w-16 h-10 text-center bg-white/10 border border-white/20 rounded-lg text-white text-lg font-bold placeholder-white/30 focus:outline-none focus:border-lime/50"/></div>
          </div>
        )}

        <div className="w-full max-w-xs"><div className="bg-white/5 rounded-xl p-2 text-center"><p className="text-white/20 text-[10px]">Suivant: {phase==='rest'&&curSet<=tgtSets?`Serie ${curSet+1}/${tgtSets}`:'Prochain exo'}</p></div></div>
      </div>

      <div className="px-4 flex gap-3 mb-16" style={{paddingBottom:'calc(env(safe-area-inset-bottom, 20px))'}}>
        <button onClick={()=>setPaused(p=>!p)}className="flex-1 h-12 rounded-2xl bg-white/10 active:bg-white/20 border border-white/10 text-white font-bold flex items-center justify-center gap-2">{paused?<Play size={20}/>:<Pause size={20}/>}{paused?'Reprendre':'Pause'}</button>
        <button onClick={()=>{if(curSet>=tgtSets){setPhase('done');save()}else{setPhase('rest');setCurSet(c=>c+1)}}}className="flex-1 h-12 rounded-2xl bg-lime/20 active:bg-lime/30 border border-lime/30 text-lime font-bold flex items-center justify-center gap-2"><SkipForward size={20}/>Suivant</button>
      </div>
    </div>
  )
}
