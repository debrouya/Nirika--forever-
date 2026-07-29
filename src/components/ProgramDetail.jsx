import { useMemo } from 'react'
import {
  ChevronLeft,
  Calendar,
  Clock,
  Dumbbell,
  Target,
  Play,
  ChevronRight,
} from 'lucide-react'
import GlassCard from './GlassCard'

const LEVEL_LABELS = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
}

const LEVEL_COLORS = {
  debutant: 'bg-green-500/20 text-green-400',
  intermediaire: 'bg-yellow-500/20 text-yellow-400',
  avance: 'bg-red-500/20 text-red-400',
}

const GOAL_LABELS = {
  masse: 'Masse',
  force: 'Force',
  definition: 'Définition',
  endurance: 'Endurance',
}

export default function ProgramDetail({ program, onStart, onBack }) {
  const stats = useMemo(() => {
    if (!program?.structure) return { totalExercises: 0, totalSets: 0, days: 0, avgDuration: 0 }
    const days = Object.keys(program.structure)
    let totalExercises = 0
    let totalSets = 0
    days.forEach((day) => {
      const exs = program.structure[day] || []
      totalExercises += exs.length
      totalSets += exs.reduce((sum, e) => sum + (e.sets || 0), 0)
    })
    return {
      totalExercises,
      totalSets,
      days: days.length,
      avgDuration: Math.round(totalExercises * 4 + totalSets * 1.5),
    }
  }, [program])

  if (!program) return null

  const dayEntries = Object.entries(program.structure)

  return (
    <div className="space-y-4 p-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors"
      >
        <ChevronLeft size={16} /> Retour
      </button>

      {/* Header */}
      <GlassCard className="p-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${LEVEL_COLORS[program.level] || 'bg-white/10 text-white/50'}`}>
            {LEVEL_LABELS[program.level] || program.level}
          </span>
          {program.goals?.map((g) => (
            <span key={g} className="bg-white/5 rounded-full px-2 py-0.5 text-[10px] text-white/50">
              {GOAL_LABELS[g] || g}
            </span>
          ))}
        </div>
        <h2 className="text-white font-bold text-xl">{program.name}</h2>
        <p className="text-white/50 text-xs leading-relaxed">{program.description}</p>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={12} className="text-lime" />
            <span className="text-white/40 text-[10px] uppercase">Jours / sem</span>
          </div>
          <p className="text-white text-lg font-bold">{program.daysPerWeek}</p>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={12} className="text-blue-400" />
            <span className="text-white/40 text-[10px] uppercase">Durée</span>
          </div>
          <p className="text-white text-lg font-bold">{program.durationWeeks} sem</p>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell size={12} className="text-yellow-400" />
            <span className="text-white/40 text-[10px] uppercase">Exercices</span>
          </div>
          <p className="text-white text-lg font-bold">{stats.totalExercises}</p>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target size={12} className="text-orange-400" />
            <span className="text-white/40 text-[10px] uppercase">Total séries</span>
          </div>
          <p className="text-white text-lg font-bold">{stats.totalSets}</p>
        </GlassCard>
      </div>

      {/* Structure */}
      <div className="space-y-2">
        <p className="text-white/50 text-[10px] uppercase tracking-wide px-1">
          Structure du programme
        </p>
        {dayEntries.map(([dayName, exercises]) => (
          <GlassCard key={dayName} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ChevronRight size={14} className="text-lime" />
                <span className="text-white font-bold text-sm">{dayName}</span>
              </div>
              <span className="text-white/30 text-[10px]">
                {exercises.length} exercice{exercises.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-1.5">
              {exercises.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2"
                >
                  <span className="text-white/70 text-xs">{ex.exerciseId}</span>
                  <span className="text-lime text-[10px] font-bold">
                    {ex.sets}×{ex.reps}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Start */}
      <button
        onClick={() => onStart(program)}
        className="w-full bg-lime hover:brightness-110 text-black font-semibold rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime/20"
      >
        <Play size={18} /> Commencer ce programme
      </button>
    </div>
  )
}
