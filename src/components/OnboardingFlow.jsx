import { useState } from 'react'
import useStore from '../store/useStore'

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState('')
  const [level, setLevel] = useState('debutant')
  const [frequency, setFrequency] = useState(3)
  const [duration, setDuration] = useState(45)
  const [equipment, setEquipment] = useState('salle')

  const handleFinish = () => {
    useStore.getState().setUserGoal({ type: goal, level, frequency, duration, equipment })
    useStore.getState().setOnboardingDone()
    onComplete?.()
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:200,background:'#0C0C10',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40,textAlign:'center'}}>
      {step === 0 && (
        <div style={{maxWidth:320,width:'100%'}}>
          <div style={{fontSize:40,marginBottom:16}}>💎</div>
          <div style={{fontSize:28,fontWeight:700,color:'#fff',marginBottom:8}}>Bienvenue sur NIRIKA</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,.4)',marginBottom:32,lineHeight:1.5}}>Ton coach personnel intelligent. Je vais te poser 3 questions pour personnaliser ton expérience.</div>
          <button onClick={()=>setStep(1)} style={{width:'100%',height:52,borderRadius:16,border:'none',background:'#7ED957',color:'#0C0C10',fontSize:15,fontWeight:600,fontFamily:'inherit',cursor:'pointer'}}>Commencer</button>
        </div>
      )}

      {step === 1 && (
        <div style={{maxWidth:320,width:'100%'}}>
          <div style={{fontSize:14,color:'rgba(255,255,255,.3)',marginBottom:8}}>Question 1/3</div>
          <div style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:24}}>Quel est ton objectif ?</div>
          {[
            {id:'strength',label:'💪 Devenir plus fort',desc:'Force et puissance'},
            {id:'muscle',label:'🏋️ Prendre du muscle',desc:'Hypertrophie et volume'},
            {id:'weight_loss',label:'🔥 Perdre du poids',desc:'Brûler des calories'},
            {id:'cardio',label:'❤️ Améliorer mon cardio',desc:'Endurance et santé'},
            {id:'general',label:'🧘 Retrouver la forme',desc:'Bien-être général'},
          ].map(g=>(
            <button key={g.id} onClick={()=>{setGoal(g.id);setStep(2)}}
              style={{width:'100%',padding:'16px',borderRadius:16,border:'1px solid rgba(255,255,255,.06)',background:goal===g.id?'rgba(126,217,87,.08)':'rgba(255,255,255,.03)',color:'#fff',fontSize:14,fontFamily:'inherit',cursor:'pointer',textAlign:'left',marginBottom:8,transition:'all .2s'}}>
              <div>{g.label}</div><div style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:2}}>{g.desc}</div>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div style={{maxWidth:320,width:'100%'}}>
          <div style={{fontSize:14,color:'rgba(255,255,255,.3)',marginBottom:8}}>Question 2/3</div>
          <div style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:24}}>Quel est ton niveau ?</div>
          {[
            {id:'debutant',label:'🌱 Débutant',desc:'0-6 mois de pratique'},
            {id:'intermediaire',label:'🌿 Intermédiaire',desc:'6 mois - 2 ans'},
            {id:'avance',label:'🌳 Avancé',desc:'2+ ans de pratique'},
          ].map(l=>(
            <button key={l.id} onClick={()=>{setLevel(l.id);setStep(3)}}
              style={{width:'100%',padding:'16px',borderRadius:16,border:'1px solid rgba(255,255,255,.06)',background:level===l.id?'rgba(126,217,87,.08)':'rgba(255,255,255,.03)',color:'#fff',fontSize:14,fontFamily:'inherit',cursor:'pointer',textAlign:'left',marginBottom:8}}>
              {l.label}<div style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:2}}>{l.desc}</div>
            </button>
          ))}
          <button onClick={()=>setStep(1)} style={{background:'none',border:'none',color:'rgba(255,255,255,.2)',fontSize:12,fontFamily:'inherit',cursor:'pointer',marginTop:8}}>← Retour</button>
        </div>
      )}

      {step === 3 && (
        <div style={{maxWidth:320,width:'100%'}}>
          <div style={{fontSize:14,color:'rgba(255,255,255,.3)',marginBottom:8}}>Question 3/3</div>
          <div style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:24}}>Ta routine</div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:'rgba(255,255,255,.3)',marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>Fréquence</div>
            <div style={{display:'flex',gap:8}}>
              {[2,3,4,5].map(f=>(
                <button key={f} onClick={()=>setFrequency(f)} style={{flex:1,height:44,borderRadius:14,border:'none',background:frequency===f?'rgba(126,217,87,.12)':'rgba(255,255,255,.04)',color:frequency===f?'#7ED957':'rgba(255,255,255,.5)',fontSize:14,fontWeight:500,fontFamily:'inherit',cursor:'pointer'}}>{f}×/sem</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:'rgba(255,255,255,.3)',marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>Durée</div>
            <div style={{display:'flex',gap:8}}>
              {[30,45,60].map(d=>(
                <button key={d} onClick={()=>setDuration(d)} style={{flex:1,height:44,borderRadius:14,border:'none',background:duration===d?'rgba(126,217,87,.12)':'rgba(255,255,255,.04)',color:duration===d?'#7ED957':'rgba(255,255,255,.5)',fontSize:14,fontWeight:500,fontFamily:'inherit',cursor:'pointer'}}>{d} min</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:24}}>
            <div style={{fontSize:12,color:'rgba(255,255,255,.3)',marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>Équipement</div>
            <div style={{display:'flex',gap:8}}>
              {[
                {id:'salle',label:'Salle'},
                {id:'maison',label:'Maison'},
                {id:'poids_corps',label:'Poids corps'},
              ].map(e=>(
                <button key={e.id} onClick={()=>setEquipment(e.id)} style={{flex:1,height:44,borderRadius:14,border:'none',background:equipment===e.id?'rgba(126,217,87,.12)':'rgba(255,255,255,.04)',color:equipment===e.id?'#7ED957':'rgba(255,255,255,.5)',fontSize:14,fontWeight:500,fontFamily:'inherit',cursor:'pointer'}}>{e.label}</button>
              ))}
            </div>
          </div>
          <button onClick={handleFinish} style={{width:'100%',height:52,borderRadius:16,border:'none',background:'#7ED957',color:'#0C0C10',fontSize:15,fontWeight:600,fontFamily:'inherit',cursor:'pointer'}}>C'est parti !</button>
          <button onClick={()=>setStep(2)} style={{background:'none',border:'none',color:'rgba(255,255,255,.2)',fontSize:12,fontFamily:'inherit',cursor:'pointer',marginTop:8}}>← Retour</button>
        </div>
      )}
    </div>
  )
}
