import GlassCard from '../../../design-system/components/GlassCard'
import GlassProgress from '../../../design-system/components/GlassProgress'

export default function ProgramCard({ name, duration, daysPerWeek, image, progress = 0, onClick }) {
  return (
    <div onClick={onClick} style={{position:'relative',height:180,borderRadius:20,overflow:'hidden',cursor:'pointer'}}>
      {image && <img src={image} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}} />}
      <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(0,0,0,.05) 0%,rgba(0,0,0,.4) 50%,rgba(0,0,0,.8) 100%)'}} />
      <div style={{position:'absolute',top:10,right:10}}>
        <span style={{background:'rgba(255,255,255,.15)',backdropFilter:'blur(12px)',padding:'3px 8px',borderRadius:12,fontSize:10,fontWeight:500,color:'#fff'}}>{daysPerWeek}×/sem</span>
      </div>
      <div style={{position:'absolute',bottom:12,left:12,right:12}}>
        <div style={{fontSize:15,fontWeight:600,color:'#fff',marginBottom:2}}>{name}</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.45)',marginBottom:6}}>{duration} semaines</div>
        <GlassProgress value={progress * 100} max={100} />
      </div>
    </div>
  )
}
