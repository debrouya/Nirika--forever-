export default function GlassAvatar({ src, size = 46, className = '' }) {
  return (
    <div className={className} style={{width:size,height:size,borderRadius:'var(--nirika-radius-xs)',background:'rgba(255,255,255,.45)',backdropFilter:'blur(25px)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.35,boxShadow:'0 .5px 0 rgba(255,255,255,.5) inset',overflow:'hidden',flexShrink:0}}>
      {src ? <img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : '👤'}
    </div>
  )
}

export function GlassBadge({ children, className = '' }) {
  return (
    <span className={className} style={{background:'rgba(255,255,255,.3)',backdropFilter:'blur(15px)',padding:'3px 10px',borderRadius:20,fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text)',fontWeight:'var(--nirika-font-medium)'}}>
      {children}
    </span>
  )
}
