import GlassCard from '../GlassCard'

export function StreakWidget({ streak = 0, bestStreak = 0, sessionsThisWeek = 0 }) {
  return (
    <GlassCard>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        <div style={{fontSize:36}}>🔥</div>
        <div>
          <div style={{fontSize:'var(--nirika-text-lg)',fontWeight:'var(--nirika-font-bold)',color:'var(--nirika-text)'}}>{streak} jours</div>
          <div style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)'}}>Série actuelle · Record {bestStreak}j · {sessionsThisWeek} séances cette semaine</div>
        </div>
      </div>
    </GlassCard>
  )
}

export function CoachWidget({ score = 72, status = 'Prêt', recommendation }) {
  return (
    <GlassCard>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:48,height:48,borderRadius:'var(--nirika-radius-xs)',background:'rgba(0,0,0,.03)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>✨</div>
          <div>
            <div style={{fontSize:'var(--nirika-text-sm)',fontWeight:'var(--nirika-font-semibold)',color:'var(--nirika-text)'}}>Nirika Coach</div>
            <div style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)'}}>{status} · Score {score}/100</div>
          </div>
        </div>
        {recommendation && <div style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)',maxWidth:120,textAlign:'right',lineHeight:1.4}}>{recommendation}</div>}
      </div>
    </GlassCard>
  )
}

export function ProgramWidget({ name = 'Force Débutant', progress = 0, weeks = 8, daysPerWeek = 3 }) {
  const pct = Math.round(progress * 100)
  return (
    <GlassCard>
      <div style={{fontSize:'var(--nirika-text-sm)',fontWeight:'var(--nirika-font-semibold)',color:'var(--nirika-text)',marginBottom:10}}>{name}</div>
      <div style={{height:4,borderRadius:2,background:'rgba(0,0,0,.05)',overflow:'hidden',marginBottom:8}}>
        <div style={{height:'100%',width:`${pct}%`,borderRadius:2,background:'var(--nirika-accent)',opacity:.5}} />
      </div>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)'}}>
        <span>{pct}%</span>
        <span>{weeks} sem · {daysPerWeek}×/sem</span>
      </div>
    </GlassCard>
  )
}

export function NutritionWidget({ calories = 0, protein = 0, carbs = 0, fat = 0 }) {
  const total = calories || 2000
  return (
    <GlassCard>
      <div style={{fontSize:'var(--nirika-text-sm)',fontWeight:'var(--nirika-font-semibold)',color:'var(--nirika-text)',marginBottom:12}}>Aujourd'hui</div>
      <div style={{fontSize:'var(--nirika-text-xl)',fontWeight:'var(--nirika-font-bold)',color:'var(--nirika-text)',marginBottom:4}}>{calories} <span style={{fontSize:'var(--nirika-text-sm)',color:'var(--nirika-text-soft)',fontWeight:400}}>/ {total} kcal</span></div>
      <div style={{display:'flex',gap:16,fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)'}}>
        <span>P: {protein}g</span><span>G: {carbs}g</span><span>L: {fat}g</span>
      </div>
    </GlassCard>
  )
}

export function StatsWidget({ sessions = 0, volume = 0, duration = 0, records = 0 }) {
  return (
    <GlassCard>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'var(--nirika-text-lg)',fontWeight:'var(--nirika-font-bold)',color:'var(--nirika-text)'}}>{sessions}</div>
          <div style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)'}}>Séances</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'var(--nirika-text-lg)',fontWeight:'var(--nirika-font-bold)',color:'var(--nirika-text)'}}>{Math.round(duration/60)}min</div>
          <div style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)'}}>Durée</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'var(--nirika-text-lg)',fontWeight:'var(--nirika-font-bold)',color:'var(--nirika-text)'}}>{(volume/1000).toFixed(1)}k</div>
          <div style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)'}}>Volume (kg)</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'var(--nirika-text-lg)',fontWeight:'var(--nirika-font-bold)',color:'var(--nirika-text)'}}>{records}</div>
          <div style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)'}}>Records</div>
        </div>
      </div>
    </GlassCard>
  )
}

export function GoalWidget({ goal = 'Force', target = '100 kg développé couché', current = '75 kg', progress = 0 }) {
  return (
    <GlassCard>
      <div style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>{goal}</div>
      <div style={{fontSize:'var(--nirika-text-sm)',fontWeight:'var(--nirika-font-medium)',color:'var(--nirika-text)',marginBottom:4}}>{target}</div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)'}}>{current}</span>
        <span style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-accent)',fontWeight:500}}>{Math.round(progress*100)}%</span>
      </div>
      <div style={{height:3,borderRadius:2,background:'rgba(0,0,0,.05)',overflow:'hidden',marginTop:8}}>
        <div style={{height:'100%',width:`${Math.round(progress*100)}%`,borderRadius:2,background:'var(--nirika-accent)',opacity:.5}} />
      </div>
    </GlassCard>
  )
}
