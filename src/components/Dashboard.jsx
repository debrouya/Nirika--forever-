import { useState, useEffect, useMemo } from 'react'
import {
  Flame,
  Dumbbell,
  Repeat2,
  Zap,
  Wind,
  CloudSun,
  AlertTriangle,
  Play,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import useStore from '../store/useStore'
import GlassCard from './GlassCard'

const MUSCLE_LABELS = {
  pecs: 'Pectoraux',
  dos: 'Dos',
  epaules: 'Épaules',
  biceps: 'Biceps',
  triceps: 'Triceps',
  jambes: 'Jambes',
  abdominaux: 'Abdominaux',
  fessiers: 'Fessiers',
}

function getTemperatureEmoji(temp) {
  if (temp < 0) return '🥶'
  if (temp < 10) return '❄️'
  if (temp < 18) return '🌤'
  if (temp < 25) return '☀️'
  if (temp < 32) return '🔥'
  return '🥵'
}

function getAQILevel(aqi) {
  if (aqi <= 50) return { label: 'Bon', color: 'text-green-400' }
  if (aqi <= 100) return { label: 'Modéré', color: 'text-yellow-400' }
  if (aqi <= 150) return { label: 'Mauvais', color: 'text-orange-400' }
  return { label: 'Très mauvais', color: 'text-red-400' }
}

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

export default function Dashboard() {
  const { sessions = [], profile = {}, setCurrentView } = useStore()
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)

  const now = new Date()
  const dayName = now.toLocaleDateString('fr-FR', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const [wRes, aRes] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`
            ),
            fetch(
              `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.latitude}&longitude=${coords.longitude}&current=us_aqi,pm10,pm2_5&timezone=auto`
            ),
          ])
          const wData = await wRes.json()
          const aData = await aRes.json()
          setWeather(wData.current)
          setAirQuality(aData.current)
        } catch {
          // silent
        }
      },
      () => {},
      { timeout: 5000 }
    )
  }, [])

  const todaySessions = useMemo(() => {
    const today = now.toISOString().slice(0, 10)
    return sessions.filter((s) => s.date === today)
  }, [sessions])

  const kpis = useMemo(() => {
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() - now.getDay() + 1)
    thisWeekStart.setHours(0, 0, 0, 0)

    const thisWeek = sessions.filter((s) => new Date(s.date) >= thisWeekStart)

    let streak = 0
    const d = new Date(now)
    while (true) {
      const ds = d.toISOString().slice(0, 10)
      if (sessions.some((s) => s.date === ds)) {
        streak++
        d.setDate(d.getDate() - 1)
      } else break
    }

    const totalReps = thisWeek.reduce((sum, s) => {
      return sum + (s.sets || []).reduce((rs, set) => rs + (set.reps || 0), 0)
    }, 0)

    const totalCalories = thisWeek.reduce((sum, s) => sum + (s.calories || 0), 0)

    return {
      streak,
      weekSessions: thisWeek.length,
      weekReps: totalReps,
      weekCalories: totalCalories,
    }
  }, [sessions])

  const weekProgress = useMemo(() => {
    const days = []
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now)
      const diff = now.getDay() === 0 ? 6 : now.getDay() - i
      d.setDate(now.getDate() - diff)
      const ds = d.toISOString().slice(0, 10)
      const count = sessions.filter((s) => s.date === ds).length
      days.push({
        label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 2).toUpperCase(),
        count,
        isToday: ds === now.toISOString().slice(0, 10),
      })
    }
    return days
  }, [sessions])

  const weeklyEvolution = useMemo(() => {
    const weeks = []
    for (let w = 7; w >= 0; w--) {
      const weekEnd = new Date(now)
      weekEnd.setDate(now.getDate() - w * 7)
      const weekStart = new Date(weekEnd)
      weekStart.setDate(weekEnd.getDate() - 6)

      const weekSessions = sessions.filter((s) => {
        const d = new Date(s.date)
        return d >= weekStart && d <= weekEnd
      })

      weeks.push({
        label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        sessions: weekSessions.length,
        calories: weekSessions.reduce((sum, s) => sum + (s.calories || 0), 0),
        duree: weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      })
    }
    return weeks
  }, [sessions])

  const muscleRepartition = useMemo(() => {
    const counts = {}
    sessions.forEach((s) => {
      const muscle = s.muscleGroup || 'autre'
      counts[muscle] = (counts[muscle] || 0) + 1
    })
    const max = Math.max(...Object.values(counts), 1)
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key, val]) => ({
        key,
        label: MUSCLE_LABELS[key] || key,
        count: val,
        pct: Math.round((val / max) * 100),
      }))
  }, [sessions])

  const maxWeekCount = Math.max(...weekProgress.map((d) => d.count), 1)

  return (
    <div className="space-y-4 p-4">
      {/* Salutation + Quick Start */}
      <div className="animate-fade-in">
        <GlassCard className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/40 text-xs">Bonjour</p>
              <h2 className="text-white font-bold text-xl">
                {profile?.full_name || profile?.name || 'Athlète'} 💪
              </h2>
              <p className="text-white/40 text-sm mt-0.5 capitalize">{dayName} · {dateStr}</p>
            </div>
            <div className="text-right">
              {kpis.streak > 0 && (
                <div className="flex items-center gap-1 bg-orange-500/15 rounded-full px-2.5 py-1">
                  <Flame size={14} className="text-orange-400 animate-streak-fire" />
                  <span className="text-orange-400 text-sm font-bold">{kpis.streak}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Start */}
          <button
            onClick={() => setCurrentView('calisthenics')}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-semibold text-sm flex items-center justify-center gap-2 animate-pulse-glow hover:opacity-90 transition-opacity"
          >
            <Play size={18} fill="white" />
            Commencer ma séance
          </button>

          {todaySessions.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-white/40 text-xs">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>{todaySessions.length} séance{todaySessions.length !== 1 ? 's' : ''} aujourd'hui</span>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Widgets Météo + Air */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in delay-100" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <CloudSun size={14} className="text-yellow-400" />
            <span className="text-white/50 text-[10px] uppercase tracking-wide">Météo</span>
          </div>
          {weather ? (
            <div>
              <p className="text-white text-xl font-bold">
                {getTemperatureEmoji(weather.temperature_2m)} {Math.round(weather.temperature_2m)}°
              </p>
              <div className="flex items-center gap-1 text-white/40 text-xs mt-1">
                <Wind size={10} />
                <span>{Math.round(weather.wind_speed_10m)} km/h</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-5 w-16 rounded animate-shimmer" />
              <div className="h-3 w-12 rounded animate-shimmer" />
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-orange-400" />
            <span className="text-white/50 text-[10px] uppercase tracking-wide">Qualité air</span>
          </div>
          {airQuality ? (
            <div>
              <p className={`text-xl font-bold ${getAQILevel(airQuality.us_aqi).color}`}>
                {airQuality.us_aqi}
              </p>
              <p className="text-white/40 text-xs">{getAQILevel(airQuality.us_aqi).label}</p>
              <p className="text-white/30 text-[10px] mt-0.5">
                PM2.5: {airQuality.pm2_5} · PM10: {airQuality.pm10}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-5 w-10 rounded animate-shimmer" />
              <div className="h-3 w-14 rounded animate-shimmer" />
            </div>
          )}
        </GlassCard>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        {[
          { label: 'Série', value: kpis.streak, icon: Flame, suffix: ' jours', color: 'text-orange-400' },
          { label: 'Séances semaine', value: kpis.weekSessions, icon: Dumbbell, color: 'text-[#10B981]' },
          { label: 'Volume reps', value: kpis.weekReps, icon: Repeat2, suffix: ' reps', color: 'text-blue-400' },
          { label: 'Calories', value: kpis.weekCalories, icon: Zap, suffix: ' kcal', color: 'text-yellow-400' },
        ].map(({ label, value, icon: Icon, suffix, color }) => (
          <GlassCard key={label} className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className={color} />
              <span className="text-white/50 text-[10px] uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-white text-xl font-bold">
              {value}{suffix || ''}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Progression semaine */}
      <div className="animate-fade-in delay-300" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/50 text-[10px] uppercase tracking-wide">Cette semaine</p>
            <span className="text-white/30 text-xs">{kpis.weekSessions}/7 séances</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {weekProgress.map((day) => (
              <div key={day.label} className="flex flex-col items-center gap-1">
                <div className="w-full aspect-square rounded-lg flex items-center justify-center relative overflow-hidden bg-white/5">
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#10B981]/40 to-[#10B981]/10 transition-all duration-500"
                    style={{ height: `${(day.count / maxWeekCount) * 100}%`, bottom: 0, top: 'auto' }}
                  />
                  <span className="relative z-10 text-white text-xs font-bold">{day.count || ''}</span>
                </div>
                <span className={`text-[9px] font-medium ${day.isToday ? 'text-[#10B981]' : 'text-white/30'}`}>
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Charts */}
      <div className="animate-fade-in delay-400" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-[#10B981]" />
            <p className="text-white/50 text-[10px] uppercase tracking-wide">Évolution séances</p>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyEvolution}>
                <XAxis dataKey="label" tick={{ fill: '#ffffff40', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sessions" name="Séances" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="animate-fade-in delay-500" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <GlassCard className="p-4">
          <p className="text-white/50 text-[10px] uppercase tracking-wide mb-3">Calories / semaine</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyEvolution}>
                <defs>
                  <linearGradient id="gradCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#facc15" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: '#ffffff40', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="calories" name="Calories" stroke="#facc15" fill="url(#gradCal)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="animate-fade-in delay-500" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <GlassCard className="p-4">
          <p className="text-white/50 text-[10px] uppercase tracking-wide mb-3">Durée / semaine</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyEvolution}>
                <defs>
                  <linearGradient id="gradDur" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: '#ffffff40', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="duree" name="Durée (min)" stroke="#60a5fa" fill="url(#gradDur)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Répartition musculaire */}
      {muscleRepartition.length > 0 && (
        <div className="animate-fade-in delay-500" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <GlassCard className="p-4">
            <p className="text-white/50 text-[10px] uppercase tracking-wide mb-3">Répartition musculaire</p>
            <div className="space-y-2">
              {muscleRepartition.map((m) => (
                <div key={m.key} className="flex items-center gap-3">
                  <span className="text-white/60 text-xs w-24 truncate">{m.label}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#10B981] to-[#34d399] rounded-full transition-all duration-700"
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                  <span className="text-white/40 text-xs tabular-nums w-6 text-right">{m.count}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
