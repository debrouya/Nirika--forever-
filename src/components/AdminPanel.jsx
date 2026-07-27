import { useState, useEffect, useMemo } from 'react'
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Calendar,
  Crown,
  Search,
  ChevronDown,
  ChevronUp,
  Shield,
  Trash2,
  Save,
  X,
  Plus,
  Edit,
  UserCheck,
  UserX,
  Activity,
  Flame,
  TrendingUp,
  RefreshCw,
  ArrowLeft,
  Eye,
  CreditCard,
  BarChart3,
  Clock,
  Zap,
  Mail,
  CalendarDays,
  Settings,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  adminGetAllUsers,
  adminGetUserStats,
  adminUpdateUserRole,
  adminDeleteUser,
  adminGetExercises,
  adminUpsertExercise,
  adminDeleteExercise,
  adminGetPrograms,
  adminUpsertProgram,
  adminDeleteProgram,
} from '../services/supabaseService'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import GlassCard from './GlassCard'

const TABS = [
  { id: 'dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'subscriptions', label: 'Abonnements', icon: Crown },
  { id: 'exercises', label: 'Exercices', icon: Dumbbell },
  { id: 'programs', label: 'Programmes', icon: Calendar },
  { id: 'activity', label: 'Activité', icon: Activity },
]

const MUSCLE_GROUPS = ['Pectoraux', 'Dos', 'Epaules', 'Jambes', 'Abdominaux', 'Bras', 'Cardio']
const EQUIPMENT_TYPES = ['barbell', 'dumbbell', 'cable', 'machine', 'none']
const DIFFICULTY_LEVELS = ['facile', 'moyen', 'difficile']

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

function EmptyExercise() {
  return {
    id: null,
    name: '',
    muscle_group: 'Pectoraux',
    equipment: 'barbell',
    difficulty: 'moyen',
    youtube_id: '',
    description: '',
  }
}

function EmptyProgram() {
  return {
    id: null,
    name: '',
    description: '',
    level: 'debutant',
    duration_weeks: 8,
    days_per_week: 3,
  }
}

function FormInput({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="space-y-1">
      <label className="text-white/40 text-[10px] uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#10B981]/50 transition-all"
      />
    </div>
  )
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <label className="text-white/40 text-[10px] uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-[#10B981]/50 transition-all appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#1A2B34] text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, trend }) {
  return (
    <GlassCard className="p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={color} />
        <span className="text-white/50 text-[10px] uppercase">{label}</span>
        {trend !== undefined && (
          <span className={`ml-auto text-[10px] font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-white text-xl font-black">{value}</p>
    </GlassCard>
  )
}

export default function AdminPanel({ user, profile, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1A1E] to-[#1A2B34]">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 glass-heavy safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <Shield size={16} className="text-[#10B981]" />
              </div>
              <div>
                <h1 className="text-white font-bold text-sm">Admin Panel</h1>
                <p className="text-white/30 text-[10px]">NIRIKA FOR EVER</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-white/40 hover:text-white text-xs transition-colors"
            >
              Retour app
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar px-4 pb-3">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#10B981] text-black'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 pb-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
          {activeTab === 'exercises' && <ExercisesTab />}
          {activeTab === 'programs' && <ProgramsTab />}
          {activeTab === 'activity' && <ActivityTab />}
        </div>
      </div>
    </div>
  )
}

// ==================== DASHBOARD ====================

function DashboardTab() {
  const [stats, setStats] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [usersResult, sessionsResult, cardioResult] = await Promise.all([
        adminGetAllUsers(),
        isSupabaseConfigured()
          ? supabase.from('sessions').select('created_at, exercise_name, sets').order('created_at', { ascending: false }).limit(100)
          : { data: [] },
        isSupabaseConfigured()
          ? supabase.from('cardio_sessions').select('created_at, activity_name, calories, duration').order('created_at', { ascending: false }).limit(100)
          : { data: [] },
      ])

      const users = usersResult.data || []
      const allSessions = [...(sessionsResult.data || []), ...(cardioResult.data || [])]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      const now = new Date()
      const d7 = new Date(now - 7 * 86400000)
      const d30 = new Date(now - 30 * 86400000)

      const totalUsers = users.length
      const active7d = users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= d7).length
      const active30d = users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= d30).length
      const newUsers7d = users.filter(u => u.created_at && new Date(u.created_at) >= d7).length
      const premiumUsers = users.filter(u => u.role === 'admin').length
      const retention = totalUsers > 0 ? Math.round((active30d / totalUsers) * 100) : 0

      // Sessions by day (last 14 days)
      const sessionsByDay = []
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const dateStr = d.toISOString().slice(0, 10)
        const count = allSessions.filter(s => s.created_at?.startsWith(dateStr)).length
        sessionsByDay.push({
          label: `${d.getDate()}/${d.getMonth() + 1}`,
          count,
          isToday: i === 0,
        })
      }

      setStats({
        totalUsers,
        active7d,
        active30d,
        newUsers7d,
        premiumUsers,
        retention,
        totalSessions: allSessions.length,
        recentSessions: allSessions.slice(0, 10),
      })
      setSessions(sessionsByDay)
    } catch {}
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw size={24} className="text-white/30 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Utilisateurs" value={stats?.totalUsers || 0} icon={Users} color="text-[#10B981]" />
        <StatCard label="Actifs 7j" value={stats?.active7d || 0} icon={Activity} color="text-blue-400" />
        <StatCard label="Nouveaux 7j" value={stats?.newUsers7d || 0} icon={UserCheck} color="text-yellow-400" />
        <StatCard label="Rétention" value={`${stats?.retention || 0}%`} icon={TrendingUp} color="text-pink-400" />
        <StatCard label="Premium" value={stats?.premiumUsers || 0} icon={Crown} color="text-amber-400" />
        <StatCard label="Séances totales" value={stats?.totalSessions || 0} icon={Dumbbell} color="text-purple-400" />
      </div>

      {/* Sessions chart */}
      {sessions.length > 0 && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-[#10B981]" />
            <span className="text-white/50 text-[10px] uppercase tracking-wide">Séances / jour (14j)</span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessions}>
                <XAxis dataKey="label" tick={{ fill: '#ffffff40', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Séances" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Recent activity */}
      {stats?.recentSessions?.length > 0 && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-blue-400" />
            <span className="text-white/50 text-[10px] uppercase tracking-wide">Activité récente</span>
          </div>
          <div className="space-y-2">
            {stats.recentSessions.slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                <Dumbbell size={12} className="text-[#10B981] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">
                    {s.exercise_name || s.activity_name || 'Séance'}
                  </p>
                  <p className="text-white/30 text-[10px]">
                    {new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}

// ==================== USERS ====================

function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedUser, setExpandedUser] = useState(null)
  const [userStats, setUserStats] = useState({})
  const [detailUser, setDetailUser] = useState(null)

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setLoading(true)
    const { data } = await adminGetAllUsers()
    setUsers(data || [])
    setLoading(false)
  }

  const loadUserStats = async (userId) => {
    if (userStats[userId]) return
    const { data } = await adminGetUserStats(userId)
    if (data) setUserStats((prev) => ({ ...prev, [userId]: data }))
  }

  const handleToggleExpand = (userId) => {
    if (expandedUser === userId) setExpandedUser(null)
    else { setExpandedUser(userId); loadUserStats(userId) }
  }

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    await adminUpdateUserRole(userId, newRole)
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) return
    await adminDeleteUser(userId)
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  const filtered = users.filter(
    (u) => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (detailUser) {
    return <UserDetail user={detailUser} stats={userStats[detailUser.id]} onBack={() => setDetailUser(null)} onRoleToggle={handleRoleToggle} onDelete={handleDelete} />
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#10B981]/50 transition-all"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white/30 text-xs">{filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={loadUsers} className="text-white/30 hover:text-white transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw size={20} className="text-white/30 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <GlassCard key={u.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#10B981] text-xs font-bold">
                      {(u.full_name || u.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-xs font-medium truncate">{u.full_name || 'Sans nom'}</p>
                      {u.role === 'admin' && (
                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded-full">ADMIN</span>
                      )}
                    </div>
                    <p className="text-white/30 text-[10px] truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { handleToggleExpand(u.id); }}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
                  >
                    {expandedUser === u.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    onClick={() => setDetailUser(u)}
                    className="p-1.5 rounded-lg text-white/30 hover:text-[#10B981] hover:bg-[#10B981]/10 transition-all"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>

              {expandedUser === u.id && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-white font-bold text-sm">{userStats[u.id]?.total_sessions || 0}</p>
                      <p className="text-white/30 text-[9px]">Séances</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-white font-bold text-sm">{userStats[u.id]?.total_cardio || 0}</p>
                      <p className="text-white/30 text-[9px]">Cardio</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-white font-bold text-sm">{Math.round(userStats[u.id]?.total_volume || 0)}kg</p>
                      <p className="text-white/30 text-[9px]">Volume</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRoleToggle(u.id, u.role)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                          : 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/20'
                      }`}
                    >
                      {u.role === 'admin' ? <><UserX size={12} /> Retirer Admin</> : <><UserCheck size={12} /> Promouvoir Admin</>}
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/30 text-xs">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function UserDetail({ user, stats, onBack, onRoleToggle, onDelete }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1 text-white/40 hover:text-white text-sm transition-colors">
        <ArrowLeft size={16} /> Retour à la liste
      </button>

      <GlassCard className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-[#10B981]/20 flex items-center justify-center">
            <span className="text-[#10B981] text-xl font-bold">
              {(user.full_name || user.email || '?')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold">{user.full_name || 'Sans nom'}</h2>
              {user.role === 'admin' && (
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded-full">ADMIN</span>
              )}
            </div>
            <p className="text-white/40 text-xs">{user.email}</p>
            <p className="text-white/30 text-[10px] mt-0.5">
              Inscrit le {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-white font-bold text-lg">{stats?.total_sessions || 0}</p>
            <p className="text-white/30 text-[10px]">Séances</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-white font-bold text-lg">{stats?.total_cardio || 0}</p>
            <p className="text-white/30 text-[10px]">Cardio</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-white font-bold text-lg">{Math.round(stats?.total_volume || 0)}kg</p>
            <p className="text-white/30 text-[10px]">Volume total</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-white font-bold text-lg">
              {stats?.last_session ? new Date(stats.last_session).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}
            </p>
            <p className="text-white/30 text-[10px]">Dernière séance</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onRoleToggle(user.id, user.role)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
              user.role === 'admin'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                : 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/20'
            }`}
          >
            {user.role === 'admin' ? <><UserX size={14} /> Retirer Admin</> : <><UserCheck size={14} /> Promouvoir Admin</>}
          </button>
          <button
            onClick={() => { if (window.confirm('Supprimer cet utilisateur ?')) onDelete(user.id) }}
            className="flex items-center justify-center gap-1 px-5 py-2.5 rounded-xl text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
          >
            <Trash2 size={14} /> Supprimer
          </button>
        </div>
      </GlassCard>
    </div>
  )
}

// ==================== SUBSCRIPTIONS ====================

function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadSubscriptions() }, [])

  const loadSubscriptions = async () => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    setLoading(true)
    try {
      const { data } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false })
      setSubscriptions(data || [])
    } catch {}
    setLoading(false)
  }

  const tierCounts = useMemo(() => {
    const counts = { free: 0, premium: 0 }
    subscriptions.forEach(s => { counts[s.tier] = (counts[s.tier] || 0) + 1 })
    return counts
  }, [subscriptions])

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={subscriptions.length} icon={Users} color="text-[#10B981]" />
        <StatCard label="Free" value={tierCounts.free || 0} icon={UserX} color="text-white/40" />
        <StatCard label="Premium" value={tierCounts.premium || 0} icon={Crown} color="text-amber-400" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw size={20} className="text-white/30 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {subscriptions.map((sub) => (
            <GlassCard key={sub.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    sub.tier === 'premium' ? 'bg-amber-500/20' : 'bg-white/5'
                  }`}>
                    {sub.tier === 'premium'
                      ? <Crown size={14} className="text-amber-400" />
                      : <User size={14} className="text-white/30" />
                    }
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">{sub.user_id?.slice(0, 8)}...</p>
                    <p className="text-white/30 text-[10px]">
                      {sub.tier} · {sub.status}
                      {sub.current_period_end && ` · expires ${new Date(sub.current_period_end).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  sub.tier === 'premium' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/30'
                }`}>
                  {sub.tier}
                </span>
              </div>
            </GlassCard>
          ))}
          {subscriptions.length === 0 && (
            <div className="text-center py-8">
              <Crown size={32} className="text-white/10 mx-auto mb-2" />
              <p className="text-white/30 text-xs">Aucun abonnement</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function User({ size = 14, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// ==================== EXERCISES ====================

function ExercisesTab() {
  const [exercisesList, setExercisesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EmptyExercise())
  const [isEditing, setIsEditing] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { loadExercises() }, [])

  const loadExercises = async () => {
    setLoading(true)
    const { data } = await adminGetExercises()
    setExercisesList(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.name) return
    const payload = {
      id: form.id || undefined,
      name: form.name,
      muscle_group: form.muscle_group,
      equipment: form.equipment,
      difficulty: form.difficulty,
      youtube_id: form.youtube_id,
      description: form.description,
    }
    const { data } = await adminUpsertExercise(payload)
    if (data) {
      if (isEditing) setExercisesList((prev) => prev.map((e) => (e.id === data.id ? data : e)))
      else setExercisesList((prev) => [...prev, data])
    }
    setForm(EmptyExercise())
    setIsEditing(false)
  }

  const handleEdit = (exercise) => {
    setForm({
      id: exercise.id,
      name: exercise.name || '',
      muscle_group: exercise.muscle_group || exercise.muscleGroup || 'Pectoraux',
      equipment: exercise.equipment || 'barbell',
      difficulty: exercise.difficulty || 'moyen',
      youtube_id: exercise.youtube_id || '',
      description: exercise.description || '',
    })
    setIsEditing(true)
  }

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm('Supprimer cet exercice ?')) return
    await adminDeleteExercise(exerciseId)
    setExercisesList((prev) => prev.filter((e) => e.id !== exerciseId))
  }

  const filtered = exercisesList.filter(
    (e) => !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.muscle_group?.toLowerCase().includes(search.toLowerCase())
  )

  const muscleCounts = useMemo(() => {
    const counts = {}
    exercisesList.forEach(e => { counts[e.muscle_group] = (counts[e.muscle_group] || 0) + 1 })
    return counts
  }, [exercisesList])

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total" value={exercisesList.length} icon={Dumbbell} color="text-[#10B981]" />
        <StatCard label="Groupes" value={Object.keys(muscleCounts).length} icon={BarChart3} color="text-blue-400" />
      </div>

      <GlassCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-[10px] uppercase tracking-wide">
            {isEditing ? 'Modifier' : 'Ajouter'} un exercice
          </p>
          {isEditing && (
            <button onClick={() => { setForm(EmptyExercise()); setIsEditing(false) }} className="text-white/30 hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
        <FormInput label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Développé couché..." />
        <div className="grid grid-cols-2 gap-2">
          <FormSelect label="Groupe musculaire" value={form.muscle_group} onChange={(v) => setForm({ ...form, muscle_group: v })} options={MUSCLE_GROUPS.map((m) => ({ value: m, label: m }))} />
          <FormSelect label="Équipement" value={form.equipment} onChange={(v) => setForm({ ...form, equipment: v })} options={EQUIPMENT_TYPES.map((e) => ({ value: e, label: e }))} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FormSelect label="Difficulté" value={form.difficulty} onChange={(v) => setForm({ ...form, difficulty: v })} options={DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d }))} />
          <FormInput label="YouTube ID" value={form.youtube_id} onChange={(v) => setForm({ ...form, youtube_id: v })} placeholder="dQw4w9WgXcQ" />
        </div>
        <div className="space-y-1">
          <label className="text-white/40 text-[10px] uppercase tracking-wide">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#10B981]/50 transition-all resize-none" />
        </div>
        <button onClick={handleSave} disabled={!form.name} className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${form.name ? 'bg-[#10B981] hover:bg-[#059669] text-black' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
          {isEditing ? <><Save size={14} /> Enregistrer</> : <><Plus size={14} /> Ajouter</>}
        </button>
      </GlassCard>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#10B981]/50 transition-all" />
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8"><RefreshCw size={20} className="text-white/30 animate-spin" /></div>
        ) : (
          filtered.map((ex) => (
            <div key={ex.id} className="glass rounded-xl p-3 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-medium truncate">{ex.name}</p>
                <p className="text-white/30 text-[10px]">{ex.muscle_group || ex.muscleGroup} · {ex.equipment} · {ex.difficulty}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleEdit(ex)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"><Edit size={12} /></button>
                <button onClick={() => handleDeleteExercise(ex.id)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
          ))
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-8"><p className="text-white/30 text-xs">Aucun exercice trouvé</p></div>
        )}
      </div>
    </div>
  )
}

// ==================== PROGRAMS ====================

function ProgramsTab() {
  const [programsList, setProgramsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EmptyProgram())
  const [isEditing, setIsEditing] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { loadPrograms() }, [])

  const loadPrograms = async () => {
    setLoading(true)
    const { data } = await adminGetPrograms()
    setProgramsList(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.name) return
    const payload = {
      id: form.id || undefined,
      name: form.name,
      description: form.description,
      level: form.level,
      duration_weeks: parseInt(form.duration_weeks, 10) || 8,
      days_per_week: parseInt(form.days_per_week, 10) || 3,
    }
    const { data } = await adminUpsertProgram(payload)
    if (data) {
      if (isEditing) setProgramsList((prev) => prev.map((p) => (p.id === data.id ? data : p)))
      else setProgramsList((prev) => [...prev, data])
    }
    setForm(EmptyProgram())
    setIsEditing(false)
  }

  const handleEdit = (program) => {
    setForm({
      id: program.id,
      name: program.name || '',
      description: program.description || '',
      level: program.level || 'debutant',
      duration_weeks: program.duration_weeks || program.durationWeeks || 8,
      days_per_week: program.days_per_week || program.daysPerWeek || 3,
    })
    setIsEditing(true)
  }

  const handleDeleteProgram = async (programId) => {
    if (!window.confirm('Supprimer ce programme ?')) return
    await adminDeleteProgram(programId)
    setProgramsList((prev) => prev.filter((p) => p.id !== programId))
  }

  const filtered = programsList.filter(
    (p) => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4 animate-fade-in">
      <StatCard label="Programmes" value={programsList.length} icon={Calendar} color="text-[#10B981]" />

      <GlassCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-[10px] uppercase tracking-wide">
            {isEditing ? 'Modifier' : 'Ajouter'} un programme
          </p>
          {isEditing && (
            <button onClick={() => { setForm(EmptyProgram()); setIsEditing(false) }} className="text-white/30 hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
        <FormInput label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Push / Pull / Legs..." />
        <div className="space-y-1">
          <label className="text-white/40 text-[10px] uppercase tracking-wide">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#10B981]/50 transition-all resize-none" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <FormSelect label="Niveau" value={form.level} onChange={(v) => setForm({ ...form, level: v })} options={[{ value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' }, { value: 'avance', label: 'Avancé' }]} />
          <FormInput label="Durée (sem)" value={form.duration_weeks} onChange={(v) => setForm({ ...form, duration_weeks: v })} type="number" placeholder="8" />
          <FormInput label="Jours / sem" value={form.days_per_week} onChange={(v) => setForm({ ...form, days_per_week: v })} type="number" placeholder="3" />
        </div>
        <button onClick={handleSave} disabled={!form.name} className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${form.name ? 'bg-[#10B981] hover:bg-[#059669] text-black' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
          {isEditing ? <><Save size={14} /> Enregistrer</> : <><Plus size={14} /> Ajouter</>}
        </button>
      </GlassCard>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#10B981]/50 transition-all" />
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8"><RefreshCw size={20} className="text-white/30 animate-spin" /></div>
        ) : (
          filtered.map((prog) => (
            <div key={prog.id} className="glass rounded-xl p-3 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-medium truncate">{prog.name}</p>
                <p className="text-white/30 text-[10px]">{prog.level} · {prog.days_per_week || prog.daysPerWeek}x / sem · {prog.duration_weeks || prog.durationWeeks} sem</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleEdit(prog)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"><Edit size={12} /></button>
                <button onClick={() => handleDeleteProgram(prog.id)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
          ))
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-8"><p className="text-white/30 text-xs">Aucun programme trouvé</p></div>
        )}
      </div>
    </div>
  )
}

// ==================== ACTIVITY ====================

function ActivityTab() {
  const [sessions, setSessions] = useState([])
  const [cardioSessions, setCardioSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadActivity() }, [])

  const loadActivity = async () => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    setLoading(true)
    try {
      const [sRes, cRes] = await Promise.all([
        supabase.from('sessions').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('cardio_sessions').select('*').order('created_at', { ascending: false }).limit(50),
      ])
      setSessions(sRes.data || [])
      setCardioSessions(cRes.data || [])
    } catch {}
    setLoading(false)
  }

  const allActivity = useMemo(() => {
    const items = [
      ...sessions.map(s => ({ ...s, _type: 'musculation' })),
      ...cardioSessions.map(s => ({ ...s, _type: 'cardio' })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return items
  }, [sessions, cardioSessions])

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Musculation" value={sessions.length} icon={Dumbbell} color="text-[#10B981]" />
        <StatCard label="Cardio" value={cardioSessions.length} icon={Flame} color="text-orange-400" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><RefreshCw size={20} className="text-white/30 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {allActivity.map((item, i) => (
            <GlassCard key={`${item._type}-${item.id || i}`} className="p-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item._type === 'cardio' ? 'bg-orange-500/20' : 'bg-[#10B981]/20'
                }`}>
                  {item._type === 'cardio'
                    ? <Flame size={14} className="text-orange-400" />
                    : <Dumbbell size={14} className="text-[#10B981]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">
                    {item.exercise_name || item.activity_name || 'Séance'}
                  </p>
                  <p className="text-white/30 text-[10px]">
                    {item._type === 'cardio' ? 'Cardio' : 'Musculation'} · {item.duration || 0}min
                    {item.calories ? ` · ${item.calories}kcal` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white/30 text-[10px]">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}
                  </p>
                  <p className="text-white/20 text-[9px]">
                    {item.user_id?.slice(0, 6)}...
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
          {allActivity.length === 0 && (
            <div className="text-center py-8">
              <Activity size={32} className="text-white/10 mx-auto mb-2" />
              <p className="text-white/30 text-xs">Aucune activité</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
