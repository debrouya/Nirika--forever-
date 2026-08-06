import TagChip from '../widgets/TagChip'

const TAGS = ['Musculation','Calisthenics','Cardio','Débutant','Force','Endurance']

export default function ExploreSection({ onSelect }) {
  return (
    <div>
      <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,.7)',marginBottom:8}}>Explorer</div>
      <div style={{display:'flex',gap:8,overflowX:'auto'}}>
        {TAGS.map(tag => (
          <TagChip key={tag} label={tag} onClick={() => onSelect(tag)} />
        ))}
      </div>
    </div>
  )
}
