import { Play, ChevronRight } from 'lucide-react'
import GlassCard from '../../../design-system/components/GlassCard'

export default function PrimaryAction({ activeSession, onStart, onResume }) {
  const hasSession = !!activeSession
  return (
    <GlassCard variant="strong" onClick={() => hasSession ? onResume?.() : onStart?.()}>
      <div style={{display:'flex',alignItems:'center',gap:16}}>
        <div style={{width:48,height:48,borderRadius:16,background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Play size={24} style={{color:'#fff',fill:'#fff'}} />
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:600,color:'#fff'}}>{hasSession ? 'Reprendre' : 'Démarrer une séance'}</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.35)'}}>{hasSession ? activeSession.exerciseName : 'Choisis ton exercice'}</div>
        </div>
        <ChevronRight size={18} style={{color:'rgba(255,255,255,.3)'}} />
      </div>
    </GlassCard>
  )
}
