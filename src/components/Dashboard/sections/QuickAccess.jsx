import { Apple, Activity, Zap } from 'lucide-react'
import GlassCard from '../../../design-system/components/GlassCard'

const ITEMS = [
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'cardio', label: 'Cardio', icon: Activity },
  { id: 'calisthenics', label: 'Exercices', icon: Zap },
]

export default function QuickAccess({ onNavigate, showProfile, onProfile }) {
  return (
    <div style={{display:'grid',gridTemplateColumns:showProfile?'1fr 1fr 1fr 1fr':'1fr 1fr 1fr',gap:8}}>
      {ITEMS.map(a => (
        <GlassCard key={a.id} onClick={() => onNavigate(a.id)}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'14px 0'}}>
            <a.icon size={18} style={{color:'rgba(255,255,255,.45)'}} />
            <span style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,.7)'}}>{a.label}</span>
          </div>
        </GlassCard>
      ))}
      {showProfile && (
        <GlassCard onClick={onProfile}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'14px 0'}}>
            <span style={{fontSize:20}}>👤</span>
            <span style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,.7)'}}>Profil</span>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
