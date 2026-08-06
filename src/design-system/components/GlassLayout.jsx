export default function GlassWidget({ children, className = '' }) {
  return <div className={`nirika-glass ${className}`} style={{padding:'22px'}}>{children}</div>
}

export function GlassHero({ children, className = '' }) {
  return <div className={`nirika-glass nirika-glass-strong ${className}`} style={{padding:'28px',borderRadius:'var(--nirika-radius-lg)'}}>{children}</div>
}

export function GlassSection({ title, action, children, className = '' }) {
  return (
    <div className={className}>
      {(title || action) && (
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'var(--nirika-space-md)'}}>
          {title && <h3 style={{fontSize:'var(--nirika-text-sm)',fontWeight:'var(--nirika-font-semibold)',color:'var(--nirika-text)'}}>{title}</h3>}
          {action && <span style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)',cursor:'pointer'}}>{action}</span>}
        </div>
      )}
      {children}
    </div>
  )
}

export function GlassListItem({ icon, title, subtitle, right, onClick, className = '' }) {
  return (
    <div className={className} style={{display:'flex',alignItems:'center',gap:'var(--nirika-space-md)',padding:16,background:'rgba(255,255,255,.1)',backdropFilter:'blur(35px)',borderRadius:'var(--nirika-radius-sm)',boxShadow:'0 .5px 0 rgba(255,255,255,.35) inset',cursor:onClick?'pointer':'default',transition:'transform .4s ease'}} onClick={onClick}>
      {icon && <div style={{width:48,height:48,borderRadius:'var(--nirika-radius-xs)',background:'rgba(0,0,0,.035)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{icon}</div>}
      <div style={{flex:1,minWidth:0}}>
        {title && <div style={{fontSize:'var(--nirika-text-base)',fontWeight:'var(--nirika-font-medium)',color:'var(--nirika-text)'}}>{title}</div>}
        {subtitle && <div style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)'}}>{subtitle}</div>}
      </div>
      {right}
    </div>
  )
}
