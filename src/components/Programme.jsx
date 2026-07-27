import { useState, useEffect, useCallback } from 'react'
import { CalendarRange, Clock, Dumbbell, Target, ChevronRight, ChevronDown, Zap, Flame, Play, Square, CheckCircle, Bell } from 'lucide-react'
import { programs } from '../data/programs'
import exercises from '../data/exercises'
import { getUserProgram, upsertUserProgram, deleteUserProgram } from '../services/supabaseService'
import { useNotifications } from '../hooks/useNotifications'

const exerciseMap = Object.fromEntries(exercises.map(e => [e.id, e]))

const levelColors = {
  debutant: 'text-[#10B981] bg-[#10B981]/10',
  intermediaire: 'text-amber-400 bg-amber-400/10',
  avance: 'text-red-400 bg-red-400/10',
}

const levelLabels = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
}

const goalIcons = {
  masse: { icon: Dumbbell, color: 'text-blue-400' },
  force: { icon: Zap, color: 'text-amber-400' },
  definition: { icon: Target, color: 'text-emerald-400' },
  endurance: { icon: Flame, color: 'text-orange-400' },
}

export default function Programme({ user }) {
  const [expandedId, setExpandedId] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [activeProgram, setActiveProgram] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(null)
  const { permission, requestPermission, scheduleLocal } = useNotifications(user?.id)

  const toggle = (id) => {
    setExpandedId(expandedId === id ? null : id)
    setSelectedDay(null)
  }

  const loadActiveProgram = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    try {
      const { data } = await getUserProgram(user.id)
      setActiveProgram(data)
    } catch {}
    setLoading(false)
  }, [user?.id])

  useEffect(() => { loadActiveProgram() }, [loadActiveProgram])

  const startProgram = async (program) => {
    if (!user?.id) return
    setStarting(program.id)

    const startedAt = new Date()
    const endDate = new Date(startedAt)
    endDate.setDate(endDate.getDate() + program.durationWeeks * 7)

    const data = {
      program_id: program.id,
      program_name: program.name,
      current_week: 1,
      current_day: Object.keys(program.structure)[0] || '',
      started_at: startedAt.toISOString(),
    }

    try {
      await upsertUserProgram(user.id, data)
      setActiveProgram({ ...data, user_id: user.id })
      scheduleProgramNotifications(program, startedAt, endDate)
    } catch {}
    setStarting(null)
  }

  const stopProgram = async () => {
    if (!user?.id) return
    try {
      await deleteUserProgram(user.id)
      setActiveProgram(null)
    } catch {}
  }

  const scheduleProgramNotifications = (program, startDate, endDate) => {
    if (permission !== 'granted') return

    scheduleLocal(
      'NIRIKA — Programme lancé !',
      `${program.name} commence aujourd'hui. Durée : ${program.durationWeeks} semaines. Bonne séance !`,
      5000
    )

    const endMs = endDate.getTime() - Date.now()
    if (endMs > 0 && endMs < 30 * 24 * 60 * 60 * 1000) {
      scheduleLocal(
        'NIRIKA — Dernière semaine !',
        `Plus qu'une semaine pour terminer ${program.name}. Accélère !`,
        Math.max(endMs - 7 * 24 * 60 * 60 * 1000 - Date.now(), 10000)
      )
    }

    scheduleLocal(
      'NIRIKA — Programme terminé !',
      `Bravo ! Tu as terminé ${program.name} ${program.durationWeeks} semaines.`,
      Math.max(endMs - Date.now(), 10000)
    )
  }

  const isProgramActive = (programId) => activeProgram?.program_id === programId

  const getProgress = () => {
    if (!activeProgram) return null
    const program = programs.find(p => p.id === activeProgram.program_id)
    if (!program) return null
    const start = new Date(activeProgram.started_at)
    const now = new Date()
    const totalDays = program.durationWeeks * 7
    const elapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24))
    const week = Math.min(Math.floor(elapsed / 7) + 1, program.durationWeeks)
    const progress = Math.min(Math.round((elapsed / totalDays) * 100), 100)
    return { program, week, progress, totalWeeks: program.durationWeeks }
  }

  const progress = getProgress()

  return (
    <div className="px-4 pt-4 pb-28 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <CalendarRange size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">Programmes</h1>
          <p className="text-white/40 text-xs">{programs.length} programmes disponibles</p>
        </div>
      </div>

      {progress && (
        <div className="glass rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#10B981]" />
              <span className="text-white text-sm font-semibold">En cours</span>
            </div>
            <button
              onClick={stopProgram}
              className="text-red-400/60 hover:text-red-400 text-[10px] flex items-center gap-1 transition-colors"
            >
              <Square size={10} />
              Arrêter
            </button>
          </div>
          <p className="text-white font-medium text-xs mb-1">{progress.program.name}</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-white/40 text-[10px]">Semaine {progress.week}/{progress.totalWeeks}</span>
            <span className="text-white/40 text-[10px]">{progress.progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] rounded-full transition-all duration-500"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {permission !== 'granted' && (
        <button
          onClick={requestPermission}
          className="w-full glass rounded-xl p-3 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0">
            <Bell size={14} className="text-amber-400" />
          </div>
          <div>
            <p className="text-white text-xs font-medium">Active les notifications</p>
            <p className="text-white/30 text-[10px]">Pour recevoir les rappels de tes programmes</p>
          </div>
        </button>
      )}

      {programs.map((program) => {
        const isExpanded = expandedId === program.id
        const days = Object.keys(program.structure)
        const totalExercises = Object.values(program.structure).flat().length
        const active = isProgramActive(program.id)

        return (
          <div
            key={program.id}
            className={`glass rounded-2xl overflow-hidden transition-all duration-300 ${active ? 'ring-1 ring-[#10B981]/30' : ''}`}
          >
            <button
              onClick={() => toggle(program.id)}
              className="w-full p-4 text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-sm">{program.name}</h3>
                    {active && <span className="text-[9px] text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded-full font-medium">En cours</span>}
                  </div>
                  <p className="text-white/40 text-xs mt-1 line-clamp-2">{program.description}</p>

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${levelColors[program.level]}`}>
                      {levelLabels[program.level]}
                    </span>
                    <span className="text-[10px] text-white/30 flex items-center gap-1">
                      <Clock size={10} />
                      {program.durationWeeks} sem
                    </span>
                    <span className="text-[10px] text-white/30 flex items-center gap-1">
                      <CalendarRange size={10} />
                      {program.daysPerWeek}j/sem
                    </span>
                    <span className="text-[10px] text-white/30 flex items-center gap-1">
                      <Dumbbell size={10} />
                      {totalExercises} exos
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {program.goals.map((goal) => {
                      const g = goalIcons[goal]
                      if (!g) return null
                      const Icon = g.icon
                      return (
                        <span key={goal} className={`${g.color}`} title={goal}>
                          <Icon size={12} />
                        </span>
                      )
                    })}
                  </div>
                </div>

                <div className="ml-2 mt-1">
                  {isExpanded
                    ? <ChevronDown size={18} className="text-white/30" />
                    : <ChevronRight size={18} className="text-white/30" />
                  }
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-white/5 pt-3 animate-fade-in">
                <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                      className={`flex-shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        selectedDay === day
                          ? 'bg-white/15 text-white'
                          : 'bg-white/5 text-white/40 hover:text-white/60'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {selectedDay && program.structure[selectedDay] && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    {program.structure[selectedDay].map((item, i) => {
                      const exo = exerciseMap[item.exerciseId]
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">
                              {exo?.name || item.exerciseId}
                            </p>
                            {exo && (
                              <p className="text-white/30 text-[10px]">{exo.muscleGroup}</p>
                            )}
                          </div>
                          <div className="text-right ml-3 flex-shrink-0">
                            <p className="text-white text-[11px] font-medium">{item.sets}x{item.reps}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {!selectedDay && (
                  <p className="text-white/20 text-[10px] text-center py-2">Sélectionne un jour pour voir les exercices</p>
                )}

                <div className="mt-3">
                  {active ? (
                    <button
                      onClick={stopProgram}
                      className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                    >
                      <Square size={14} />
                      Arrêter ce programme
                    </button>
                  ) : activeProgram ? (
                    <div className="text-center py-2">
                      <p className="text-white/20 text-[10px]">Tu as déjà un programme en cours</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => startProgram(program)}
                      disabled={starting === program.id}
                      className="w-full py-2.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#10B981]/20 transition-colors disabled:opacity-50"
                    >
                      {starting === program.id ? (
                        <div className="w-3 h-3 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play size={14} />
                      )}
                      Commencer ce programme
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
