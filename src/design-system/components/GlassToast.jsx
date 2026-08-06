export default function GlassToast({ message, type = 'info', onDismiss, className = '' }) {
  const colors = { success: 'var(--nirika-accent)', error: '#ef4444', info: 'var(--nirika-text)' }
  return (
    <div className={`nirika-glass animate-nirika-appear ${className}`} style={{padding:'12px 18px',display:'flex',alignItems:'center',gap:10,fontSize:'var(--nirika-text-sm)',color:colors[type],position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',zIndex:200,maxWidth:'380px',width:'90%'}}>
      <span style={{flex:1}}>{message}</span>
      {onDismiss && <button onClick={onDismiss} style={{background:'none',border:'none',color:'inherit',cursor:'pointer',fontSize:16}}>×</button>}
    </div>
  )
}
