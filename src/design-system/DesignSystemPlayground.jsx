import { useState } from 'react'
import { Play, Sparkles, Zap, Home, User, Dumbbell, Search, ChevronRight, Flame, Settings, MessageSquareMore } from 'lucide-react'
import GlassBackground from './components/GlassBackground'
import GlassCard from './components/GlassCard'
import GlassButton from './components/GlassButton'
import GlassNavigation from './components/GlassNavigation'
import GlassFAB from './components/GlassFAB'
import GlassInput, { GlassSearchBar } from './components/GlassInput'
import GlassModal, { GlassBottomSheet } from './components/GlassModal'
import GlassProgress from './components/GlassProgress'
import GlassAvatar, { GlassBadge } from './components/GlassAvatar'
import GlassWidget, { GlassSection, GlassListItem } from './components/GlassLayout'
import GlassToast from './components/GlassToast'
import GlassLoader, { GlassSkeleton } from './components/GlassLoader'
import { StreakWidget, CoachWidget, ProgramWidget, NutritionWidget, GoalWidget, StatsWidget } from './components/Widgets'

const THEMES = [
  { id: 'pearl', label: 'Pearl', cls: '' },
  { id: 'arctic', label: 'Arctic', cls: 'nirika-theme-arctic' },
  { id: 'emerald', label: 'Emerald', cls: 'nirika-theme-emerald' },
  { id: 'aurora-pink', label: 'Aurora', cls: 'nirika-theme-aurora-pink' },
  { id: 'sunset', label: 'Sunset', cls: 'nirika-theme-sunset' },
  { id: 'amethyst', label: 'Amethyst', cls: 'nirika-theme-amethyst' },
]

function Section({ title, children }) {
  return (
    <div style={{marginBottom:36}}>
      <h3 style={{fontSize:12,fontWeight:600,color:'var(--nirika-text-soft)',textTransform:'uppercase',letterSpacing:1,marginBottom:16,paddingLeft:4}}>{title}</h3>
      {children}
    </div>
  )
}

function Label({ children }) {
  return <span style={{fontSize:10,color:'var(--nirika-text-faint)',display:'block',marginBottom:10}}>{children}</span>
}

export default function DesignSystemPlayground() {
  const [theme, setTheme] = useState('pearl')
  const [modalOpen, setModalOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const applyTheme = (t) => {
    setTheme(t.id)
    document.documentElement.className = t.cls
  }

  return (
    <GlassBackground>
      <div style={{padding:'60px 22px 160px',maxWidth:430,margin:'0 auto',display:'flex',flexDirection:'column',gap:14}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div>
            <h1 style={{fontSize:26,fontWeight:670,color:'var(--nirika-text)',letterSpacing:'-.7px'}}>Design System</h1>
            <span style={{fontSize:12,color:'var(--nirika-text-soft)'}}>NIRIKA — Playground</span>
          </div>
          <GlassAvatar size={44} />
        </div>

        {/* Theme Selector */}
        <GlassCard>
          <div style={{padding:16}}>
            <Label>Thème</Label>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {THEMES.map(t => (
                <button key={t.id}
                  onClick={() => applyTheme(t)}
                  style={{
                    padding:'6px 14px',borderRadius:14,border:'none',fontFamily:'inherit',fontSize:11,fontWeight:500,cursor:'pointer',
                    background: theme===t.id?'rgba(0,0,0,.08)':'rgba(255,255,255,.2)',
                    color:'var(--nirika-text)',
                    backdropFilter:'blur(20px)'
                  }}
                >{t.label}</button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* GlassCard Variants */}
        <Section title="GlassCard">
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div>
              <Label>Default</Label>
              <GlassCard><div style={{padding:20,textAlign:'center',color:'var(--nirika-text-soft)',fontSize:13}}>GlassCard default</div></GlassCard>
            </div>
            <div>
              <Label>Strong</Label>
              <GlassCard variant="strong"><div style={{padding:20,textAlign:'center',color:'var(--nirika-text)',fontSize:13,fontWeight:500}}>GlassCard strong</div></GlassCard>
            </div>
            <div>
              <Label>Cinema (sur fond sombre)</Label>
              <div style={{position:'relative',height:120,borderRadius:24,overflow:'hidden',background:'linear-gradient(135deg,#1a1a2e,#16213e)'}}>
                <GlassCard variant="cinema"><div style={{padding:20,textAlign:'center',color:'rgba(255,255,255,.7)',fontSize:13}}>Cinema overlay</div></GlassCard>
              </div>
            </div>
          </div>
        </Section>

        {/* GlassButton */}
        <Section title="GlassButton">
          <Label>Variants</Label>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <GlassButton>Default</GlassButton>
            <GlassButton variant="primary">Primary</GlassButton>
            <GlassButton variant="dark">Dark</GlassButton>
            <GlassButton variant="icon" icon={Settings} />
          </div>
          <div style={{marginTop:16}}>
            <Label>Sizes</Label>
            <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
              <GlassButton size="sm">Small</GlassButton>
              <GlassButton size="md">Medium</GlassButton>
              <GlassButton size="lg">Large</GlassButton>
              <GlassButton loading>Loading</GlassButton>
              <GlassButton disabled>Disabled</GlassButton>
            </div>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="GlassInput">
          <Label>Input</Label>
          <GlassInput placeholder="Ton prénom..." />
          <div style={{marginTop:14}}>
            <Label>SearchBar</Label>
            <GlassSearchBar placeholder="Rechercher un exercice..." />
          </div>
        </Section>

        {/* Progress */}
        <Section title="GlassProgress">
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <GlassProgress value={35} />
            <GlassProgress value={65} />
            <GlassProgress value={100} />
          </div>
        </Section>

        {/* Avatar + Badge */}
        <Section title="GlassAvatar · GlassBadge">
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <GlassAvatar size={56} />
            <GlassAvatar size={40} />
            <GlassAvatar size={32} />
            <GlassBadge>8 semaines</GlassBadge>
            <GlassBadge>3×/sem</GlassBadge>
          </div>
        </Section>

        {/* GlassSection + GlassListItem */}
        <Section title="GlassSection · GlassListItem">
          <GlassSection title="Exercices récents" action="Voir tout →">
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <GlassListItem icon={<Dumbbell size={22} style={{color:'var(--nirika-text)',opacity:.4}} />} title="Développé couché" subtitle="Pectoraux · 75 kg" right={<ChevronRight size={16} style={{color:'var(--nirika-text)',opacity:.3}} />} />
              <GlassListItem icon={<Dumbbell size={22} style={{color:'var(--nirika-text)',opacity:.4}} />} title="Squat" subtitle="Jambes · 100 kg" right={<ChevronRight size={16} style={{color:'var(--nirika-text)',opacity:.3}} />} />
            </div>
          </GlassSection>
        </Section>

        {/* Widgets */}
        <Section title="Widgets">
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <StreakWidget streak={8} bestStreak={15} sessionsThisWeek={5} />
            <CoachWidget score={78} status="Prêt" recommendation="Haut du corps aujourd'hui" />
            <ProgramWidget name="Force Débutant" progress={.45} weeks={8} daysPerWeek={3} />
            <NutritionWidget calories={1680} protein={135} carbs={195} fat={52} />
            <GoalWidget goal="Force" target="Squat 120 kg" current="100 kg" progress={.83} />
            <StatsWidget sessions={203} volume={18700} duration={6100} records={12} />
          </div>
        </Section>

        {/* Modals */}
        <Section title="GlassModal · GlassBottomSheet">
          <div style={{display:'flex',gap:10}}>
            <GlassButton size="sm" onClick={() => setModalOpen(true)}>Ouvrir Modal</GlassButton>
            <GlassButton size="sm" onClick={() => setSheetOpen(true)}>Ouvrir Sheet</GlassButton>
          </div>
        </Section>

        {/* Loader + Skeleton */}
        <Section title="GlassLoader · GlassSkeleton">
          <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
            <GlassLoader size={32} />
            <GlassLoader size={24} />
            <GlassLoader size={16} />
          </div>
          <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:8}}>
            <GlassSkeleton width="80%" height={14} />
            <GlassSkeleton width="100%" height={14} />
            <GlassSkeleton width="60%" height={14} />
          </div>
        </Section>

        {/* Modals rendered at end */}
        <GlassModal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div style={{textAlign:'center'}}>
            <h3 style={{fontSize:17,fontWeight:600,color:'var(--nirika-text)',marginBottom:8}}>Confirmation</h3>
            <p style={{fontSize:13,color:'var(--nirika-text-soft)',marginBottom:20}}>Veux-tu vraiment faire cette action ?</p>
            <div style={{display:'flex',gap:10}}>
              <GlassButton size="sm" onClick={() => setModalOpen(false)}>Annuler</GlassButton>
              <GlassButton size="sm" variant="primary" onClick={() => setModalOpen(false)}>Confirmer</GlassButton>
            </div>
          </div>
        </GlassModal>

        <GlassBottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
          <GlassSection title="Options">
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <GlassListItem icon={<Settings size={20} style={{color:'var(--nirika-text)',opacity:.4}} />} title="Paramètres" />
              <GlassListItem icon={<MessageSquareMore size={20} style={{color:'var(--nirika-text)',opacity:.4}} />} title="Feedback" />
            </div>
          </GlassSection>
        </GlassBottomSheet>

        {/* Toast */}
        {toast && <GlassToast message={toast} onDismiss={() => setToast(null)} />}
        <GlassButton size="sm" onClick={() => setToast('✨ Action réussie !')} style={{marginBottom:20}}>Afficher Toast</GlassButton>

        {/* FAB + Nav en bas */}
        <GlassNavigation
          tabs={[
            { id: 'home', icon: <Home size={20} />, label: 'Playground' },
            { id: 'session', icon: <Play size={20} /> },
            { id: 'coach', icon: <Sparkles size={20} /> },
          ]}
          activeTab="home"
          fab={<GlassFAB icon={<Sparkles size={20} style={{color:'var(--nirika-text)',opacity:.5}} />} />}
        />

      </div>
    </GlassBackground>
  )
}
