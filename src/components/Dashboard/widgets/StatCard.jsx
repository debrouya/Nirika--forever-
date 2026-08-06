import GlassCard from '../../../design-system/components/GlassCard'

export default function StatCard({ value, label, icon }) {
  return (
    <GlassCard>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'12px 0'}}>
        {icon && <span style={{fontSize:20}}>{icon}</span>}
        <div style={{fontSize:24,fontWeight:700,color:'#fff'}}>{value}</div>
        <div style={{fontSize:10,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:.5}}>{label}</div>
      </div>
    </GlassCard>
  )
}
