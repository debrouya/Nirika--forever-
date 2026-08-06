import GlassAvatar from '../../../design-system/components/GlassAvatar'

export default function HeaderSection({ onSettings }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:0}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:8,height:8,borderRadius:3,background:'rgba(255,255,255,.25)',transform:'rotate(45deg)'}} />
        <span style={{fontSize:11,fontWeight:600,letterSpacing:2,color:'rgba(255,255,255,.3)',textTransform:'uppercase'}}>NIRIKA</span>
      </div>
      <GlassAvatar size={36} />
    </div>
  )
}
