export function GlassButton({ children, variant = 'glass', className = '', ...props }) {
  const base = variant === 'primary' ? 'nirika-glass-strong' : 'nirika-glass'
  return <button className={`${base} ${className}`} style={{border:'none',font:'inherit',cursor:'pointer',padding:'14px 22px',borderRadius:'var(--nirika-radius-sm)',color:'var(--nirika-text)',fontSize:'var(--nirika-text-sm)',fontWeight:'var(--nirika-font-medium)'}} {...props}>{children}</button>
}

export function GlassIconButton({ children, size = 44, className = '', ...props }) {
  return <button className={`nirika-glass ${className}`} style={{width:size,height:size,borderRadius:'var(--nirika-radius-xs)',display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer',background:'rgba(0,0,0,.04)',boxShadow:'0 .5px 0 rgba(255,255,255,.4) inset'}} {...props}>{children}</button>
}
