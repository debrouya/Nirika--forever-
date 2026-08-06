export default function GlassLoader({ size = 32, className = '' }) {
  return (
    <div className={className} style={{width:size,height:size,borderRadius:'50%',border:'3px solid rgba(0,0,0,.06)',borderTopColor:'var(--nirika-accent)',animation:'nirika-spin .8s linear infinite',display:'inline-block'}} />
  )
}

export function GlassSkeleton({ width = '100%', height = 16, className = '' }) {
  return (
    <div className={`animate-nirika-skel ${className}`} style={{width,height,borderRadius:8,background:'rgba(255,255,255,.2)',backdropFilter:'blur(10px)'}} />
  )
}
