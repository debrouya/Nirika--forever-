export default function HeroSection({ firstName, streak }) {
  return (
    <div style={{marginBottom:4}}>
      <span style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</span>
      <h1 style={{fontSize:32,fontWeight:700,color:'#fff',letterSpacing:'-.8px',lineHeight:1.15,margin:'4px 0'}}>
        Bonjour{firstName ? ` ${firstName}` : ''}
      </h1>
      <div style={{display:'flex',gap:16}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:16}}>🔥</span>
          <span style={{fontSize:13,color:'rgba(255,255,255,.5)'}}>{streak} jours</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'var(--nirika-accent)',opacity:.6}} />
          <span style={{fontSize:13,color:'rgba(255,255,255,.5)'}}>Prêt pour ta séance</span>
        </div>
      </div>
    </div>
  )
}
