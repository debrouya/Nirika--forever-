export default function GlassFAB({ icon, label, onClick, className = '' }) {
  return (
    <button className={`nirika-glass ${className}`} onClick={onClick} style={{position:'fixed',bottom:'var(--nirika-fab-bottom)',right:'var(--nirika-page-px)',width:'var(--nirika-fab-size)',height:'var(--nirika-fab-size)',borderRadius:'var(--nirika-radius-full)',display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer',transition:'transform .5s cubic-bezier(.22,1,.36,1)',zIndex:40}}>
      {icon || '✦'}
      {label && <span style={{position:'absolute',top:-28,left:'50%',transform:'translateX(-50%)',fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)',whiteSpace:'nowrap',opacity:0,transition:'opacity .3s'}} className="fab-label-hover">{label}</span>}
    </button>
  )
}
