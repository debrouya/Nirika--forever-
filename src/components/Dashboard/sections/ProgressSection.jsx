import StatCard from '../widgets/StatCard'

export default function ProgressSection({ weeklySessions, totalTime }) {
  return (
    <div>
      <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,.7)',marginBottom:8}}>Cette semaine</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
        <StatCard value={weeklySessions} label="Séances" icon="🏋️" />
        <StatCard value={`${Math.round(totalTime/60)}min`} label="Temps" icon="⏱️" />
        <StatCard value="0" label="Records" icon="🏆" />
      </div>
    </div>
  )
}
