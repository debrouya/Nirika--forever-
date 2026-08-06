export default function GlassNavigation({ children, className = '' }) {
  return (
    <nav className={`nirika-glass-nav ${className}`} style={{position:'fixed',bottom:'22px',left:'50%',transform:'translateX(-50%)',width:'calc(100% - 40px)',maxWidth:'390px',height:'var(--nirika-nav-height)',display:'flex',alignItems:'center',justifyContent:'center',gap:'36px',zIndex:50}}>
      {children}
    </nav>
  )
}

export function GlassTab({ icon, active, onClick }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:'pointer',position:'relative'}} onClick={onClick}>
      <span style={{opacity:active?'.6':'.22',color:'var(--nirika-text)',fontSize:20,transition:'opacity .3s'}}>{icon}</span>
      {active && <span style={{width:4,height:4,borderRadius:'50%',background:'var(--nirika-accent)',opacity:.7,position:'absolute',bottom:-7}} />}
    </div>
  )
}
