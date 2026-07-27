import { useState, useMemo } from 'react'
import { Search, Filter, ChevronRight, Calendar, Dumbbell } from 'lucide-react'
import { programs } from '../data/programs'
import GlassCard from './GlassCard'

const LEVELS = [
  { value: 'all', label: 'Tous' },
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
]

const GOALS = [
  { value: 'all', label: 'Tous' },
  { value: 'masse', label: 'Masse' },
  { value: 'force', label: 'Force' },
  { value: 'definition', label: 'Définition' },
  { value: 'endurance', label: 'Endurance' },
]

const LEVEL_COLORS = {
  debutant: 'bg-green-500/20 text-green-400',
  intermediaire: 'bg-yellow-500/20 text-yellow-400',
  avance: 'bg-red-500/20 text-red-400',
}

const LEVEL_LABELS = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
}

export default function ProgramSelector({ onSelect }) {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [goalFilter, setGoalFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const matchSearch =
        !search || p.name.toLowerCase().includes(search.toLowerCase())
      const matchLevel = levelFilter === 'all' || p.level === levelFilter
      const matchGoal = goalFilter === 'all' || p.goals.includes(goalFilter)
      return matchSearch && matchLevel && matchGoal
    })
  }, [search, levelFilter, goalFilter])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un programme..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-mint-400/50 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 text-white/40 text-xs hover:text-white/60 transition-colors"
        >
          <Filter size={12} />
          Filtres
          {(levelFilter !== 'all' || goalFilter !== 'all') && (
            <span className="bg-mint-500 text-black rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <GlassCard className="p-3 space-y-3">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wide mb-2">Niveau</p>
            <div className="flex flex-wrap gap-1.5">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevelFilter(l.value)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                    levelFilter === l.value
                      ? 'bg-mint-500 text-black'
                      : 'bg-white/5 text-white/50 border border-white/10'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wide mb-2">Objectif</p>
            <div className="flex flex-wrap gap-1.5">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoalFilter(g.value)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                    goalFilter === g.value
                      ? 'bg-mint-500 text-black'
                      : 'bg-white/5 text-white/50 border border-white/10'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && (
          <GlassCard className="p-6 text-center">
            <p className="text-white/40 text-sm">Aucun programme trouvé</p>
          </GlassCard>
        )}
        {filtered.map((program) => (
          <button
            key={program.id}
            onClick={() => onSelect(program)}
            className="w-full text-left glass rounded-2xl p-4 hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 pr-2">
                <p className="text-white font-bold text-sm mb-0.5">{program.name}</p>
                <p className="text-white/40 text-xs line-clamp-2">{program.description}</p>
              </div>
              <ChevronRight size={16} className="text-white/20 shrink-0 mt-1" />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${LEVEL_COLORS[program.level] || 'bg-white/10 text-white/50'}`}>
                {LEVEL_LABELS[program.level] || program.level}
              </span>
              <span className="bg-white/5 rounded-full px-2 py-0.5 text-[10px] text-white/50 flex items-center gap-1">
                <Calendar size={8} /> {program.daysPerWeek}x / sem
              </span>
              <span className="bg-white/5 rounded-full px-2 py-0.5 text-[10px] text-white/50 flex items-center gap-1">
                <Dumbbell size={8} /> {program.durationWeeks} sem
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
