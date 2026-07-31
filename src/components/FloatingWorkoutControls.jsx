import { useState, useEffect, useRef } from 'react'
import { Play, Pause, X, Clock, Dumbbell, Timer, SkipForward } from 'lucide-react'
import useStore from '../store/useStore'

export default function FloatingWorkoutControls() {
  const { activeSession, endSession } = useStore()
  const [collapsed, setCollapsed] = useState(false)
  const [timer, setTimer] = useState(0)
  const [paused, setPaused] = useState(false)
  const [restTimer, setRestTimer] = useState(null)
  const [restPaused, setRestPaused] = useState(false)
  const timerRef = useRef(null)
  const restRef = useRef(null)

  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => { if (!paused) setTimer((t) => t + 1) }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [activeSession, paused])

  useEffect(() => { setTimer(0); setPaused(false) }, [activeSession?.exerciseId])

  const startRest = (d) => {
    setRestTimer(d)
    setRestPaused(false)
    if (restRef.current) clearInterval(restRef.current)
    restRef.current = setInterval(() => {
      setRestTimer((t) => { if (t <= 1) { clearInterval(restRef.current); return null } return t - 1 })
    }, 1000)
  }

  const stopRest = () => { if (restRef.current) clearInterval(restRef.current); setRestTimer(null) }

  useEffect(() => () => { if (restRef.current) clearInterval(restRef.current) }, [])

  if (!activeSession) return null

  const f = (s) => { const m = Math.floor(s/60); const sec = s%60; return `${m}:${sec.toString().padStart(2,'0')}` }

  return (
    <div className="fixed bottom-24 left-3 right-3 z-50 max-w-lg mx-auto">
      {restTimer !== null && (
        <div className="mb-2 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-dark-card/95 backdrop-blur-xl border border-lime/30 shadow-2xl shadow-black/30">
            <Timer size={16} className="text-lime animate-pulse" />
            <span className="text-white text-lg font-mono font-bold">{f(restTimer)}</span>
            <button onClick={() => { if(restPaused){setRestPaused(false);restRef.current=setInterval(()=>{setRestTimer(t=>{if(t<=1){clearInterval(restRef.current);return null}return t-1})},1000)}else{setRestPaused(true);clearInterval(restRef.current)}}} className="text-white/40 hover:text-white p-1">{restPaused?<Play size={14}/>:<Pause size={14}/>}</button>
            <button onClick={stopRest} className="text-white/40 hover:text-white p-1"><SkipForward size={14}/></button>
          </div>
        </div>
      )}
      {collapsed ? (
        <button onClick={() => setCollapsed(false)} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-dark-card border border-lime/30 shadow-xl">
          <Dumbbell size={16} className="text-lime" /><span className="text-white text-sm font-medium">{f(timer)}</span>
        </button>
      ) : (
        <div className="bg-dark-card/95 backdrop-blur-xl rounded-2xl p-4 border border-lime/30 shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${paused?'bg-yellow-400':'bg-lime animate-pulse'}`}/><span className="text-white font-bold text-sm">{activeSession.exerciseName}</span></div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPaused(!paused)} className="text-white/40 hover:text-white p-1">{paused?<Play size={14}/>:<Pause size={14}/>}</button>
              <button onClick={() => setCollapsed(true)} className="text-white/40 p-1"><X size={16}/></button>
            </div>
          </div>
          <div className="flex gap-1.5 mb-2">
            {[30,60,90,120].map((d)=><button key={d} onClick={()=>startRest(d)} className="flex-1 py-1.5 rounded-lg text-[10px] font-medium bg-white/5 text-white/50 hover:bg-white/10 border border-transparent">{d}s</button>)}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-dark-border/50">
            <div className="flex items-center gap-2 text-white/70"><Clock size={14}/><span className="text-lg font-mono font-bold text-white">{f(timer)}</span></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">{activeSession.sets?.length||0} séries</span>
              <button onClick={() => useStore.getState().setCurrentView('session')} className="px-3 py-1.5 rounded-lg bg-lime/10 text-lime border border-lime/30 text-xs font-medium">Séance</button>
              <button onClick={() => endSession()} className="px-4 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium">Fin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
