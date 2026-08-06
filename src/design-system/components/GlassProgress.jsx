export default function GlassProgress({ value = 0, max = 100, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={className} style={{height:3,borderRadius:2,background:'rgba(0,0,0,.06)',overflow:'hidden'}}>
      <div style={{height:'100%',width:`${pct}%`,borderRadius:2,background:'var(--nirika-accent)',opacity:.6,transition:'width .6s ease'}} />
    </div>
  )
}
