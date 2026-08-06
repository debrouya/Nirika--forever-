export default function ProgramsSection({ title, action, onAction, children }) {
  return (
    <div>
      {(title || action) && (
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <span style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,.7)'}}>{title}</span>
          <span onClick={onAction} style={{fontSize:11,color:'rgba(255,255,255,.35)',cursor:'pointer'}}>{action}</span>
        </div>
      )}
      {children}
    </div>
  )
}
