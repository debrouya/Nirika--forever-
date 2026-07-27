import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Flame,
  Dumbbell,
  Clock,
  Zap,
  Calendar,
  Repeat2,
  TrendingUp,
  Heart,
} from 'lucide-react'
import useStore from '../store/useStore'
import GlassCard from './GlassCard'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs text-white border border-white/10">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white/70">
          {p.name}: <span className="text-white font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function Stats({ isPremium, onShowPaywall }) {
  const { sessionHistory, workoutHistory, getStreak } = useStore()

  const allSessions = useMemo(() => {
    const combined = [
      ...(sessionHistory || []).map((s) => ({
        ...s,
        _type: 'exercise',
        date: s.date || s.startedAt || s.completedAt,
      })),
      ...(workoutHistory || []).map((w) => ({
        ...w,
        _type: w.type === 'cardio' ? 'cardio' : 'exercise',
        date: w.completedAt || w.date,
      })),
    ]
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [sessionHistory, workoutHistory])

  const streak = getStreak()
  const totalSessions = allSessions.length
  const totalCalories = allSessions.reduce((sum, s) => sum + (s.calories || 0), 0)
  const totalDuration = allSessions.reduce((sum, s) => sum + (s.duration || s.durationMinutes || 0), 0)

  const exerciseCount = allSessions.filter((s) => s._type === 'exercise').length
  const cardioCount = allSessions.filter((s) => s._type === 'cardio').length

  const totalSets = allSessions.reduce((sum, s) => {
    if (s.sets) return sum + s.sets.length
    return sum
  }, 0)

  const last30Days = useMemo(() => {
    const now = new Date()
    const days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const count = allSessions.filter((s) => {
        const sd = new Date(s.date)
        return sd.toISOString().slice(0, 10) === dateStr
      }).length
      days.push({
        date: dateStr,
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        count,
        isToday: i === 0,
      })
    }
    return days
  }, [allSessions])

  const caloriesPerSession = useMemo(() => {
    return allSessions.slice(0, 15).reverse().map((s, i) => ({
      name: `${i + 1}`,
      calories: s.calories || 0,
      type: s._type,
    }))
  }, [allSessions])

  const maxDayCount = Math.max(...last30Days.map((d) => d.count), 1)

  return (
    <div className="space-y-4 p-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={14} className="text-orange-400" />
            <span className="text-white/50 text-[10px] uppercase">Série</span>
          </div>
          <p className="text-white text-2xl font-black">{streak}</p>
          <p className="text-white/30 text-xs">jours consécutifs</p>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell size={14} className="text-mint-400" />
            <span className="text-white/50 text-[10px] uppercase">Séances</span>
          </div>
          <p className="text-white text-2xl font-black">{totalSessions}</p>
          <p className="text-white/30 text-xs">au total</p>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-yellow-400" />
            <span className="text-white/50 text-[10px] uppercase">Calories</span>
          </div>
          <p className="text-white text-2xl font-black">{totalCalories}</p>
          <p className="text-white/30 text-xs">kcal brûlées</p>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-blue-400" />
            <span className="text-white/50 text-[10px] uppercase">Durée</span>
          </div>
          <p className="text-white text-2xl font-black">{totalDuration}</p>
          <p className="text-white/30 text-xs">minutes</p>
        </GlassCard>
      </div>

      {/* Répartition */}
      <GlassCard className="p-4">
        <p className="text-white/50 text-[10px] uppercase tracking-wide mb-3">Répartition</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-mint-500/20 flex items-center justify-center">
              <Dumbbell size={14} className="text-mint-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-xs">Exercices</span>
                <span className="text-white/40 text-xs">{exerciseCount} ({totalSessions > 0 ? Math.round((exerciseCount / totalSessions) * 100) : 0}%)</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-mint-500 rounded-full transition-all"
                  style={{ width: `${totalSessions > 0 ? (exerciseCount / totalSessions) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <Heart size={14} className="text-pink-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-xs">Cardio</span>
                <span className="text-white/40 text-xs">{cardioCount} ({totalSessions > 0 ? Math.round((cardioCount / totalSessions) * 100) : 0}%)</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full transition-all"
                  style={{ width: `${totalSessions > 0 ? (cardioCount / totalSessions) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Repeat2 size={14} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-xs">Séries totales</span>
                <span className="text-white/40 text-xs">{totalSets}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, totalSets / 2)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 30-day grid */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} className="text-mint-400" />
          <span className="text-white/50 text-[10px] uppercase tracking-wide">30 derniers jours</span>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {last30Days.map((day) => (
            <div
              key={day.date}
              className={`aspect-square rounded-md flex items-center justify-center relative ${
                day.count > 0
                  ? 'bg-mint-500/30'
                  : day.isToday
                  ? 'bg-white/10 border border-white/20'
                  : 'bg-white/5'
              }`}
              title={`${day.label}: ${day.count} séance(s)`}
            >
              <span
                className={`text-[8px] ${
                  day.count > 0 ? 'text-mint-400 font-bold' : day.isToday ? 'text-white' : 'text-white/20'
                }`}
              >
                {day.count || ''}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Bar chart calories — Premium */}
      {caloriesPerSession.length > 0 && (
        <GlassCard className="p-4 relative">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-orange-400" />
            <span className="text-white/50 text-[10px] uppercase tracking-wide">Calories / séance</span>
            {!isPremium && (
              <span className="ml-auto px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded-full">
                Premium
              </span>
            )}
          </div>
          {!isPremium ? (
            <button
              onClick={onShowPaywall}
              className="w-full py-8 rounded-xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors"
            >
              <TrendingUp size={24} className="text-white/30" />
              <span className="text-xs text-white/40">Débloque les graphiques avancés</span>
              <span className="text-[10px] text-[#10B981] font-medium">Passer à Premium</span>
            </button>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caloriesPerSession}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#ffffff40', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="calories" name="Calories" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  )
}
