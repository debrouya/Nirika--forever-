import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { TrendingUp, Dumbbell, Clock, Flame, Trophy, Target } from 'lucide-react'
import { getProgressionData, calculate1RM, calculateVolume } from '../data/progression'
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

function ScoreRing({ score, size = 100 }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#3B82F6' : score >= 40 ? '#F59E0B' : '#EF4444'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white">{score}</span>
        <span className="text-[8px] text-white/40 uppercase">Score</span>
      </div>
    </div>
  )
}

export default function PerformanceStats() {
  const { sessionHistory, workoutHistory, profile } = useStore()

  const allSessions = useMemo(() => {
    const combined = [
      ...(sessionHistory || []).map((s) => ({
        ...s,
        _type: 'exercise',
        date: s.date || s.startedAt || s.completedAt,
      })),
      ...(workoutHistory || []).map((w) => ({
        ...w,
        _type: w.type || 'cardio',
        date: w.date || w.completedAt,
      })),
    ]
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [sessionHistory, workoutHistory])

  const exerciseSessions = useMemo(() => allSessions.filter((s) => s._type === 'exercise'), [allSessions])
  const totalSessions = allSessions.length
  const totalDuration = allSessions.reduce((sum, s) => sum + (s.duration || s.durationMinutes || 0), 0)
  const totalCalories = allSessions.reduce((sum, s) => sum + (s.calories || 0), 0)
  const totalSets = exerciseSessions.reduce(
    (sum, s) => sum + (s.sets ? s.sets.length : 0),
    0
  )

  const progressionData = useMemo(() => {
    return getProgressionData(exerciseSessions.slice(-20))
  }, [exerciseSessions])

  const exerciseGroupData = useMemo(() => {
    const groups = {}
    exerciseSessions.forEach((s) => {
      const name = s.exerciseName || 'Exercice'
      if (!groups[name]) groups[name] = { name, sessions: 0, maxWeight: 0, totalVolume: 0 }
      groups[name].sessions++
      if (s.sets) {
        const maxW = Math.max(...s.sets.map((set) => set.weight || 0), 0)
        groups[name].maxWeight = Math.max(groups[name].maxWeight, maxW)
        groups[name].totalVolume += calculateVolume(s.sets)
      }
    })
    return Object.values(groups)
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 8)
  }, [exerciseSessions])

  const oneRMData = useMemo(() => {
    return exerciseGroupData
      .filter((g) => g.maxWeight > 0)
      .map((g) => ({
        name: g.name.length > 12 ? g.name.slice(0, 12) + '…' : g.name,
        '1RM estimé': calculate1RM(g.maxWeight, 8),
        'Poids max': g.maxWeight,
      }))
  }, [exerciseGroupData])

  const score = useMemo(() => {
    let s = 30
    s += Math.min(25, totalSessions * 1.5)
    if (profile.level === 'intermediaire') s += 10
    else if (profile.level === 'avance') s += 15
    const uniqueDays = new Set(allSessions.map((s) => {
      const d = new Date(s.date)
      return d.toISOString().slice(0, 10)
    }))
    s += Math.min(15, uniqueDays.size * 2)
    if (profile.frequency >= 4) s += 10
    else if (profile.frequency >= 3) s += 5
    return Math.max(0, Math.min(100, Math.round(s)))
  }, [totalSessions, allSessions, profile])

  const caloriesPerSession = useMemo(() => {
    return allSessions.slice(-10).reverse().map((s, i) => ({
      name: `#${i + 1}`,
      calories: s.calories || 0,
      type: s._type,
    }))
  }, [allSessions])

  return (
    <div className="space-y-4">
      <GlassCard className="p-5 flex items-center gap-4">
        <ScoreRing score={score} />
        <div className="flex-1 space-y-1">
          <p className="text-white/50 text-[10px] uppercase tracking-wide">Score Performance</p>
          <p className="text-white font-bold text-lg">{score}/100</p>
          <p className="text-white/40 text-xs">
            {score >= 80 ? 'Excellent' : score >= 60 ? 'Bon' : score >= 40 ? 'Moyen' : 'À améliorer'}
          </p>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell size={12} className="text-lime" />
            <span className="text-white/40 text-[10px] uppercase">Séances</span>
          </div>
          <p className="text-white text-lg font-bold">{totalSessions}</p>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={12} className="text-orange-400" />
            <span className="text-white/40 text-[10px] uppercase">Calories</span>
          </div>
          <p className="text-white text-lg font-bold">{totalCalories}</p>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={12} className="text-blue-400" />
            <span className="text-white/40 text-[10px] uppercase">Durée totale</span>
          </div>
          <p className="text-white text-lg font-bold">{totalDuration} min</p>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target size={12} className="text-yellow-400" />
            <span className="text-white/40 text-[10px] uppercase">Séries totales</span>
          </div>
          <p className="text-white text-lg font-bold">{totalSets}</p>
        </GlassCard>
      </div>

      {/* Bar chart per exercise */}
      {exerciseGroupData.length > 0 && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-lime" />
            <span className="text-white/50 text-[10px] uppercase tracking-wide">Volume par exercice</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exerciseGroupData.map((g) => ({ name: g.name.length > 8 ? g.name.slice(0, 8) + '…' : g.name, volume: g.totalVolume }))}>
                <XAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" name="Volume" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* 1RM estimates */}
      {oneRMData.length > 0 && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-yellow-400" />
            <span className="text-white/50 text-[10px] uppercase tracking-wide">1RM Estimé</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={oneRMData}>
                <XAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="1RM estimé" name="1RM Estimé" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Poids max" name="Poids max" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Calories per session */}
      {caloriesPerSession.length > 0 && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={14} className="text-orange-400" />
            <span className="text-white/50 text-[10px] uppercase tracking-wide">Calories / séance</span>
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caloriesPerSession}>
                <XAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="calories" name="Calories" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Session history */}
      <GlassCard className="p-4">
        <p className="text-white/50 text-[10px] uppercase tracking-wide mb-3">Historique récent</p>
        <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
          {allSessions.length === 0 && (
            <p className="text-white/30 text-xs text-center py-4">Aucune séance enregistrée</p>
          )}
          {allSessions.slice(0, 10).map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${s._type === 'exercise' ? 'bg-lime' : 'bg-pink-400'}`} />
                <div>
                  <p className="text-white text-xs font-medium">{s.exerciseName || s.activityName || 'Séance'}</p>
                  <p className="text-white/30 text-[10px]">
                    {new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-xs font-bold">{s.calories || 0} kcal</p>
                <p className="text-white/30 text-[10px]">{s.duration || s.durationMinutes || 0} min</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
