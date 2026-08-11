import { useState } from 'react'
import { Search, FileText, Video } from 'lucide-react'
import useStore from '../store/useStore'
import useExercises from '../hooks/useExercises'
import WorkoutScreen from './WorkoutScreen'
import ExerciseTutorial from './ExerciseTutorial'
import GlassBackground from '../design-system/components/GlassBackground'

const MUSCLE_GROUPS = [
  { id: 'all', label: 'Tout' },
  { id: 'Pectoraux', label: 'Pectoraux' },
  { id: 'Dos', label: 'Dos' },
  { id: 'Epaules', label: 'Épaules' },
  { id: 'Jambes', label: 'Jambes' },
  { id: 'Abdominaux', label: 'Abdos' },
  { id: 'Bras', label: 'Bras' },
  { id: 'Cardio', label: 'Cardio' },
]

const EQUIPMENT_ICONS = {
  barbell: '🏋️', dumbbell: '💪', machine: '⚙️',
  cable: '🔌', bodyweight: '🧘', kettlebell: '🔔', none: '🧘',
}

export default function Calisthenics({ isPremium, onShowPaywall }) {
  const { setCurrentView } = useStore()
  const exercises = useExercises()
  const [searchQuery, setSearchQuery] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('all')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [tutorialExercise, setTutorialExercise] = useState(null)

  const filtered = exercises.filter(ex => {
    if (muscleGroup !== 'all' && ex.muscleGroup !== muscleGroup) return false
    if (searchQuery && !ex.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const FREE_LIMIT = 12
  const visibleExercises = isPremium ? filtered : filtered.slice(0, FREE_LIMIT)

  const handleStartExercise = (ex) => {
    if (!isPremium && filtered.indexOf(ex) >= FREE_LIMIT) { onShowPaywall?.(); return }
    useStore.getState().startSession(ex.id, ex.name)
    setSelectedExercise(ex)
  }

  if (selectedExercise) {
    return <WorkoutScreen exercise={selectedExercise}
      onComplete={() => { useStore.getState().endSession(); setSelectedExercise(null) }} />
  }

  return (
    <GlassBackground>
      <div data-onboard="exercices" style={{padding:'52px 22px 120px',maxWidth:430,margin:'0 auto',minHeight:'100dvh'}}>
        <h1 style={{fontSize:28,fontWeight:700,color:'#fff',letterSpacing:'-.7px',marginBottom:20}}>Exercices</h1>

        <div style={{position:'relative',marginBottom:14}}>
          <Search size={18} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,.25)'}} />
          <input type="text" placeholder="Rechercher" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            style={{width:'100%',background:'rgba(255,255,255,.04)',border:'none',borderRadius:16,height:48,padding:'0 16px 0 42px',fontSize:14,fontFamily:'inherit',color:'#fff',outline:'none'}} />
        </div>

        <button onClick={()=>setCurrentView('templates')} style={{width:'100%',background:'rgba(255,255,255,.05)',border:'none',borderRadius:16,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',marginBottom:16,backdropFilter:'blur(20px)'}}>
          <FileText size={18} style={{color:'rgba(255,255,255,.4)'}} />
          <div style={{flex:1,textAlign:'left'}}><div style={{fontSize:13,fontWeight:500,color:'#fff'}}>Templates</div><div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>Séance pré-enregistrée</div></div>
        </button>

        <div style={{display:'flex',gap:8,overflowX:'auto',marginBottom:20,paddingBottom:4}}>
          {MUSCLE_GROUPS.map(g=>(
            <button key={g.id} onClick={()=>setMuscleGroup(g.id)}
              style={{padding:'6px 16px',borderRadius:14,border:'none',fontFamily:'inherit',fontSize:12,fontWeight:500,cursor:'pointer',whiteSpace:'nowrap',
                background:muscleGroup===g.id?'rgba(255,255,255,.12)':'rgba(255,255,255,.04)',color:muscleGroup===g.id?'#fff':'rgba(255,255,255,.4)'}}>{g.label}</button>
          ))}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {visibleExercises.map(ex=>(
            <div key={ex.id} onClick={()=>handleStartExercise(ex)}
              style={{display:'flex',alignItems:'center',gap:14,background:'rgba(255,255,255,.04)',backdropFilter:'blur(25px)',borderRadius:18,padding:14,cursor:'pointer'}}>
              <div style={{width:48,height:48,borderRadius:16,background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{EQUIPMENT_ICONS[ex.equipment]||'🏋️'}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:'#fff'}}>{ex.name}</div><div style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:2}}>{ex.muscleGroup} · {ex.equipment}</div></div>
              <button onClick={e=>{e.stopPropagation();setTutorialExercise(ex)}}
                style={{width:36,height:36,borderRadius:12,border:'none',background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
                <Video size={16} style={{color:'rgba(255,255,255,.4)'}} />
              </button>
            </div>
          ))}
        </div>

        {tutorialExercise && <ExerciseTutorial exercise={tutorialExercise} onClose={()=>setTutorialExercise(null)} />}
      </div>
    </GlassBackground>
  )
}
