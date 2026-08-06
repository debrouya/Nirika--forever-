export default function GlassModal({ children, open, onClose, className = '' }) {
  if (!open) return null
  return (
    <div style={{position:'fixed',inset:0,zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.3)',backdropFilter:'blur(4px)'}} onClick={onClose}>
      <div className={`nirika-glass ${className}`} style={{padding:'24px',maxWidth:'320px',width:'90%'}} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function GlassBottomSheet({ children, open, onClose, className = '' }) {
  if (!open) return null
  return (
    <div style={{position:'fixed',inset:0,zIndex:999,display:'flex',alignItems:'flex-end',justifyContent:'center',background:'rgba(0,0,0,.3)',backdropFilter:'blur(4px)'}} onClick={onClose}>
      <div className={`nirika-glass nirika-glass-strong animate-nirika-slide ${className}`} style={{width:'100%',maxWidth:'430px',padding:'28px 22px 44px',borderRadius:'28px 28px 0 0'}} onClick={e => e.stopPropagation()}>
        <div style={{width:32,height:4,borderRadius:2,background:'rgba(0,0,0,.1)',margin:'0 auto 20px'}} />
        {children}
      </div>
    </div>
  )
}
