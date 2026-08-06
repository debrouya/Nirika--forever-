import { Home, Play, Sparkles, Zap, User, Flame, Dumbbell, Apple, ChevronRight } from 'lucide-react'
import GlassBackground from './components/GlassBackground'
import GlassCard from './components/GlassCard'
import GlassButton from './components/GlassButton'
import GlassFAB from './components/GlassFAB'
import GlassNavigation from './components/GlassNavigation'
import { StreakWidget, CoachWidget, ProgramWidget, NutritionWidget, StatsWidget, GoalWidget } from './components/Widgets'

export default function DashboardDS() {
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <GlassBackground>
      <div style={{padding:'52px 22px 130px',maxWidth:430,margin:'0 auto',display:'flex',flexDirection:'column',gap:24,minHeight:'100dvh'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:9,height:9,borderRadius:3,background:'var(--nirika-text)',opacity:.28,transform:'rotate(45deg)'}} />
            <span style={{fontSize:12,fontWeight:600,letterSpacing:1.8,color:'var(--nirika-text)',opacity:.35,textTransform:'uppercase'}}>NIRIKA</span>
          </div>
          <div style={{width:46,height:46,borderRadius:16,background:'rgba(255,255,255,.45)',backdropFilter:'blur(25px)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,boxShadow:'0 .5px 0 rgba(255,255,255,.5) inset'}}>👤</div>
        </div>

        {/* Hero */}
        <div style={{display:'flex',flexDirection:'column',gap:3}}>
          <span style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-soft)'}}>{date}</span>
          <h1 style={{fontSize:'var(--nirika-text-2xl)',fontWeight:'var(--nirika-font-bold)',color:'var(--nirika-text)',letterSpacing:'-.8px',lineHeight:1.1}}>Bonjour Frédéric</h1>
          <span style={{fontSize:15,color:'var(--nirika-text-soft)'}}>Prêt pour ta séance ?</span>
          <span style={{fontSize:'var(--nirika-text-xs)',color:'var(--nirika-text-faint)',marginTop:6,display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:5,height:5,borderRadius:'50%',background:'var(--nirika-accent)',opacity:.6}} />La discipline d&apos;aujourd&apos;hui crée la force de demain.
          </span>
        </div>

        {/* CTA */}
        <GlassCard variant="strong">
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:54,height:54,borderRadius:18,background:'rgba(0,0,0,.04)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 .5px 0 rgba(255,255,255,.4) inset'}}>
              <Play size={26} style={{color:'var(--nirika-text)',fill:'var(--nirika-text)',opacity:.65}} />
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:600,color:'var(--nirika-text)'}}>Démarrer une séance</div>
              <div style={{fontSize:13,color:'var(--nirika-text-soft)'}}>Choisis ton exercice</div>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
          {[
            { icon: Flame, label: 'Cardio', sub: '24' },
            { icon: Zap, label: 'Exercices', sub: '45' },
            { icon: Apple, label: 'Nutrition', sub: '18' },
          ].map((a, i) => (
            <GlassCard key={i}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'16px 0'}}>
                <a.icon size={20} style={{color:'var(--nirika-text)',opacity:.4}} />
                <span style={{fontSize:12,fontWeight:600,color:'var(--nirika-text)'}}>{a.label}</span>
                <span style={{fontSize:10,color:'var(--nirika-text-soft)'}}>{a.sub} séances</span>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Widgets */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <StreakWidget streak={5} bestStreak={12} sessionsThisWeek={4} />
          <CoachWidget score={72} status="Prêt" recommendation="Pectoraux + Triceps aujourd'hui" />
        </div>

        {/* Programme */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <h3 style={{fontSize:14,fontWeight:600,color:'var(--nirika-text)'}}>Ton Programme</h3>
            <span style={{fontSize:13,color:'var(--nirika-text-soft)',cursor:'pointer'}}>Voir tout →</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <ProgramWidget name="Force Débutant" progress={.6} weeks={8} daysPerWeek={3} />
            <ProgramWidget name="Hypertrophie" progress={.35} weeks={12} daysPerWeek={4} />
          </div>
        </div>

        {/* More widgets */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <NutritionWidget calories={1450} protein={120} carbs={180} fat={45} />
          <GoalWidget goal="Force" target="Développé couché 100 kg" current="75 kg" progress={.75} />
        </div>

        <StatsWidget sessions={156} volume={12400} duration={4680} records={8} />

        {/* Navigation */}
        <GlassNavigation
          tabs={[
            { id: 'home', icon: <Home size={20} />, label: 'Accueil' },
            { id: 'session', icon: <Play size={20} /> },
            { id: 'coach', icon: <Sparkles size={20} /> },
            { id: 'exercises', icon: <Dumbbell size={20} /> },
            { id: 'profile', icon: <User size={20} /> },
          ]}
          activeTab="home"
          onTabChange={id => console.log('Tab:', id)}
          fab={<GlassFAB icon={<Sparkles size={22} style={{color:'var(--nirika-text)',opacity:.5}} />} />}
        />

      </div>
    </GlassBackground>
  )
}
