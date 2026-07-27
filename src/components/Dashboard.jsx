import { useState, useMemo } from 'react'
import {
  Flame,
  Clock,
  Dumbbell,
  Search,
  ChevronRight,
} from 'lucide-react'
import useStore from '../store/useStore'
import { programs } from '../data/programs'
import exercises from '../data/exercises'

const PLAN_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop',
]

export default function Dashboard() {
  const { profile, setCurrentView } = useStore()
  const [searchQuery, setSearchQuery] = useState('')

  const firstName = profile?.full_name?.split(' ')[0] || profile?.name?.split(' ')[0] || 'Athlète'

  const filteredPrograms = useMemo(() => {
    if (!searchQuery) return programs.slice(0, 4)
    return programs.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="space-y-6 p-4">
      {/* Greeting */}
      <div className="animate-fade-in">
        <p className="text-muted text-sm">Bonjour,</p>
        <h1 className="text-white font-bold text-2xl">Let's Workout</h1>
      </div>

      {/* Search Bar */}
      <div className="animate-fade-in delay-100" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-card text-white pl-10 pr-4 py-3 rounded-xl text-sm outline-none border border-dark-border placeholder:text-muted"
          />
        </div>
      </div>

      {/* Last Week Result */}
      <div className="animate-fade-in delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <h2 className="text-white font-semibold text-lg mb-3">Last Week Result</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-card rounded-2xl p-4 flex flex-col items-center">
            <Flame size={24} className="text-lime mb-2" />
            <span className="text-white text-xl font-bold">2100</span>
            <span className="text-muted text-xs">Cal</span>
          </div>
          <div className="bg-dark-card rounded-2xl p-4 flex flex-col items-center">
            <Clock size={24} className="text-lime mb-2" />
            <span className="text-white text-xl font-bold">21h</span>
            <span className="text-muted text-xs">34 m</span>
          </div>
          <div className="bg-dark-card rounded-2xl p-4 flex flex-col items-center">
            <Dumbbell size={24} className="text-lime mb-2" />
            <span className="text-white text-xl font-bold">1450</span>
            <span className="text-muted text-xs">Kg</span>
          </div>
        </div>
      </div>

      {/* Your Plan */}
      <div className="animate-fade-in delay-300" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-lg">Your Plan</h2>
          <button
            onClick={() => setCurrentView('programme')}
            className="text-lime text-sm font-medium flex items-center gap-1"
          >
            See all <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filteredPrograms.slice(0, 2).map((program, i) => (
            <button
              key={program.id}
              onClick={() => setCurrentView('programme')}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] text-left group"
            >
              <img
                src={PLAN_IMAGES[i % PLAN_IMAGES.length]}
                alt={program.name}
                className="w-full h-full object-cover group-active:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-full">
                <span className="text-white text-[10px] font-medium">{program.daysPerWeek * program.durationWeeks} Variant</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-white font-bold text-sm">{program.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Select Plan */}
      <div className="animate-fade-in delay-400" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <h2 className="text-white font-semibold text-lg mb-3">Select Plan</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['Musculation', 'Calisthenics', 'Cardio', 'Débutant', 'Force', 'Endurance'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSearchQuery(tag)
                setCurrentView('programme')
              }}
              className="px-4 py-2 rounded-full bg-dark-card border border-dark-border text-white text-sm font-medium whitespace-nowrap hover:border-lime/50 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
