export default function TagChip({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{fontSize:11,fontWeight:500,padding:'6px 16px',borderRadius:14,border:'none',
        background: active ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.06)',
        color: active ? '#fff' : 'rgba(255,255,255,.45)',
        cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',transition:'all .3s'}}>
      {label}
    </button>
  )
}
