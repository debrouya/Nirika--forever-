export default function GlassInput({ className = '', ...props }) {
  return <input className={`nirika-glass ${className}`} style={{width:'100%',height:'48px',padding:'0 16px',border:'none',font:'inherit',fontSize:'var(--nirika-text-base)',color:'var(--nirika-text)',borderRadius:'var(--nirika-radius-sm)',background:'rgba(255,255,255,.16)',backdropFilter:'blur(25px)',WebkitBackdropFilter:'blur(25px)',boxShadow:'0 .5px 0 rgba(255,255,255,.35) inset',outline:'none'}} {...props} />
}

export function GlassSearchBar({ className = '', ...props }) {
  return <input className={`nirika-glass ${className}`} style={{width:'100%',height:'48px',padding:'0 18px',border:'none',font:'inherit',fontSize:'var(--nirika-text-base)',color:'var(--nirika-text)',borderRadius:'var(--nirika-radius-md)',background:'rgba(255,255,255,.16)',backdropFilter:'blur(25px)',WebkitBackdropFilter:'blur(25px)',boxShadow:'0 .5px 0 rgba(255,255,255,.35) inset',outline:'none'}} placeholder="Rechercher..." {...props} />
}
