import { useState, useCallback } from 'react'
import {
  LayoutGrid,
  ClipboardList,
  ChevronLeft,
} from 'lucide-react'
import Onboarding from './Onboarding'
import ProgramSelector from './ProgramSelector'
import ProgramDetail from './ProgramDetail'
import WorkoutTracker from './WorkoutTracker'
import PerformanceStats from './PerformanceStats'
import GlassCard from './GlassCard'
import useStore from '../store/useStore'

const MENUS = [
  { id: 'onboarding', label: 'Onboarding', desc: 'Configure ton profil', icon: '🎯' },
  { id: 'programs', label: 'Programmes', desc: 'Choisis un programme', icon: '📋' },
  { id: 'stats', label: 'Performance', desc: 'Ton bilan', icon: '📊' },
]

export default function FitMatrix() {
  const [view, setView] = useState('menu')
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [activeWorkout, setActiveWorkout] = useState(null)
  const { profile } = useStore()

  const handleOnboardingDone = useCallback(() => setView('menu'), [])
  const handleSelectProgram = useCallback((program) => {
    setSelectedProgram(program)
    setView('programDetail')
  }, [])
  const handleStartProgram = useCallback((program) => {
    setSelectedProgram(program)
    setActiveWorkout({ program, currentDayIndex: 0, currentExerciseIndex: 0, sets: [] })
    setView('tracker')
  }, [])
  const handleFinishWorkout = useCallback(() => {
    setActiveWorkout(null)
    setView('menu')
  }, [])
  const handleBackToMenu = useCallback(() => {
    setView('menu')
    setSelectedProgram(null)
    setActiveWorkout(null)
  }, [])

  if (view === 'onboarding') {
    return <Onboarding onDone={handleOnboardingDone} />
  }

  if (view === 'tracker') {
    return (
      <WorkoutTracker
        program={selectedProgram}
        onFinish={handleFinishWorkout}
        onCancel={handleBackToMenu}
      />
    )
  }

  if (view === 'programDetail' && selectedProgram) {
    return (
      <ProgramDetail
        program={selectedProgram}
        onStart={handleStartProgram}
        onBack={() => setView('programs')}
      />
    )
  }

  if (view === 'programs') {
    return (
      <div className="space-y-4 p-4">
        <button
          onClick={handleBackToMenu}
          className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft size={16} /> Retour
        </button>
        <ProgramSelector onSelect={handleSelectProgram} />
      </div>
    )
  }

  if (view === 'stats') {
    return (
      <div className="space-y-4 p-4">
        <button
          onClick={handleBackToMenu}
          className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft size={16} /> Retour
        </button>
        <PerformanceStats />
      </div>
    )
  }

  return (
    <div data-onboard="fitmatrix" className="space-y-4 p-4">
      <GlassCard className="p-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <LayoutGrid size={20} className="text-lime" />
          <h2 className="text-white font-bold text-lg">FitMatrix Pro</h2>
        </div>
        <p className="text-white/50 text-xs">
          {profile.level || 'Intermédiaire'} · {profile.frequency || 3}x / sem
        </p>
      </GlassCard>

      <div className="space-y-2">
        {MENUS.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id === 'programs' ? 'programs' : item.id === 'onboarding' ? 'onboarding' : 'stats')}
            className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="text-left flex-1">
              <p className="text-white font-bold text-sm">{item.label}</p>
              <p className="text-white/40 text-xs">{item.desc}</p>
            </div>
            <ChevronLeft size={16} className="text-white/20 rotate-180" />
          </button>
        ))}
      </div>
    </div>
  )
}
