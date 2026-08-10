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
  Star,
  Lock,
  Unlock,
  DollarSign,
  Image,
  Bell,
  Globe,
  Heart,
  Key,
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
  adminUpdateUserPermissions,
  adminDeleteUser,
  adminGetExercises,
  adminUpsertExercise,
  adminDeleteExercise,
  adminGetPrograms,
  adminUpsertProgram,
  adminDeleteProgram,
  adminUpdateSecret,
} from '../services/supabaseService'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const TABS = [
  { id: 'dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'subscriptions', label: 'Abonnements', icon: Crown },
  { id: 'exercises', label: 'Exercices', icon: Dumbbell },
  { id: 'programs', label: 'Programmes', icon: Calendar },
  { id: 'motivation', label: 'Motivation', icon: Heart },
  { id: 'activity', label: 'Activité', icon: Activity },
  { id: 'settings', label: 'Réglages', icon: Settings },
]

const MUSCLE_GROUPS = ['Pectoraux', 'Dos', 'Epaules', 'Jambes', 'Abdominaux', 'Bras', 'Cardio']
const EQUIPMENT_TYPES = ['barbell', 'dumbbell', 'cable', 'machine', 'none']
const DIFFICULTY_LEVELS = ['facile', 'moyen', 'difficile']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-card rounded-lg px-3 py-2 text-xs text-white border border-dark-border">
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
      <label className="text-muted text-[10px] uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-dark-bg border border-dark-border rounded-xl py-2 px-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-lime/50 transition-all"
      />
    </div>
  )
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <label className="text-muted text-[10px] uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-dark-bg border border-dark-border rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-lime/50 transition-all appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-dark-card text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, trend }) {
  return (
    <div className="bg-dark-card rounded-2xl p-3 border border-dark-border">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={color} />
        <span className="text-muted text-[10px] uppercase">{label}</span>
        {trend !== undefined && (
          <span className={`ml-auto text-[10px] font-medium ${trend >= 0 ? 'text-lime' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-white text-xl font-black">{value}</p>
    </div>
  )
}

export default function AdminPanel({ user, profile, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [codeVerified, setCodeVerified] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [attempts, setAttempts] = useState(0)

  const handleCodeSubmit = (e) => {
    e.preventDefault()
    const adminCode = import.meta.env.VITE_ADMIN_CODE
    if (!adminCode || codeInput === adminCode) {
      setCodeVerified(true)
      setCodeError('')
    } else {
      const remaining = attempts + 1
      setAttempts(remaining)
      setCodeError(remaining >= 3 ? 'Bloqué — recharge la page' : `Code incorrect (${3-remaining} essais)`)
      if (remaining >= 3) setCodeInput('LOCKED')
    }
    setCodeInput('')
  }

  if (!codeVerified) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100dvh',background:'#0C0C10',padding:24}}>
        <form onSubmit={handleCodeSubmit} style={{maxWidth:320,width:'100%',textAlign:'center'}}>
          <Shield size={40} style={{color:'#7ED957',marginBottom:16}} />
          <div style={{fontSize:20,fontWeight:700,color:'#fff',marginBottom:8}}>Accès Admin</div>
          <input type="password" placeholder="Code d'accès" value={codeInput}
            onChange={e => setCodeInput(e.target.value)}
            disabled={attempts >= 3}
            style={{width:'100%',height:48,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',borderRadius:14,padding:'0 16px',fontSize:14,color:'#fff',fontFamily:'inherit',textAlign:'center',outline:'none',marginBottom:8}} />
          {codeError && <div style={{fontSize:12,color:codeError.includes('Bloqué')?'#f87171':'#facc15',marginBottom:8}}>{codeError}</div>}
          <button type="submit" disabled={attempts >= 3}
            style={{width:'100%',height:48,borderRadius:14,border:'none',background:attempts>=3?'rgba(255,255,255,.04)':'#7ED957',color:attempts>=3?'rgba(255,255,255,.2)':'#0C0C10',fontSize:14,fontWeight:600,cursor:attempts>=3?'not-allowed':'pointer',fontFamily:'inherit'}}>
            {attempts >= 3 ? 'Bloqué' : 'Accéder'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] overflow-y-auto" style={{background:'#0C0C10'}}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-dark-bg border-b border-dark-border safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-lime/20 flex items-center justify-center">
                <Shield size={16} className="text-lime" />
              </div>
              <div>
                <h1 className="text-white font-bold text-sm">Admin Panel</h1>
                <p className="text-muted text-[10px]">NIRIKA FOR EVER</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-muted hover:text-white text-xs transition-colors"
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
                      ? 'bg-lime text-dark-bg'
                      : 'bg-dark-card text-muted hover:bg-dark-border'
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
          {activeTab === 'motivation' && <MotivationTab />}
          {activeTab === 'activity' && <ActivityTab />}
          {activeTab === 'settings' && <SettingsTab />}
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

  useEffect(() => { loadDashboard() }, [])

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
        <RefreshCw size={24} className="text-muted animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Utilisateurs" value={stats?.totalUsers || 0} icon={Users} color="text-lime" />
        <StatCard label="Actifs 7j" value={stats?.active7d || 0} icon={Activity} color="text-blue-400" />
        <StatCard label="Nouveaux 7j" value={stats?.newUsers7d || 0} icon={UserCheck} color="text-yellow-400" />
        <StatCard label="Rétention" value={`${stats?.retention || 0}%`} icon={TrendingUp} color="text-pink-400" />
        <StatCard label="Premium" value={stats?.premiumUsers || 0} icon={Crown} color="text-amber-400" />
        <StatCard label="Séances totales" value={stats?.totalSessions || 0} icon={Dumbbell} color="text-purple-400" />
      </div>

      {sessions.length > 0 && (
        <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-lime" />
            <span className="text-muted text-[10px] uppercase tracking-wide">Séances / jour (14j)</span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessions}>
                <XAxis dataKey="label" tick={{ fill: '#8A8A8A', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Séances" fill="#C6FF00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {stats?.recentSessions?.length > 0 && (
        <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-blue-400" />
            <span className="text-muted text-[10px] uppercase tracking-wide">Activité récente</span>
          </div>
          <div className="space-y-2">
            {stats.recentSessions.slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center gap-3 bg-dark-bg rounded-xl px-3 py-2">
                <Dumbbell size={12} className="text-lime shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">
                    {s.exercise_name || s.activity_name || 'Séance'}
                  </p>
                  <p className="text-muted text-[10px]">
                    {new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
  const [detailUser, setDetailUser] = useState(null)
  const [userStats, setUserStats] = useState({})
  const [permsUser, setPermsUser] = useState(null)
  const [permsValues, setPermsValues] = useState({})
  const [permsSaving, setPermsSaving] = useState(false)

  const handleSavePerms = async () => {
    if (!permsUser) return
    setPermsSaving(true)
    try {
      await adminUpdateUserPermissions(permsUser.id, permsValues)
      setPermsUser(null)
    } catch {}
    setPermsSaving(false)
  }

  const openPerms = (u) => {
    setPermsValues(u.permissions || {})
    setPermsUser(u)
  }

  const PERMS_FEATURES = [
    { key: 'chat_ia', label: 'Chat IA' },
    { key: 'stats_avancees', label: 'Stats avancées' },
    { key: 'programmes', label: 'Programmes illimités' },
    { key: 'exercices', label: 'Tous les exercices' },
  ]

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

  const handleTogglePremium = async (userId, currentRole) => {
    const newRole = currentRole === 'premium' ? 'user' : 'premium'
    await adminUpdateUserRole(userId, newRole)
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
  }

  const filtered = users.filter(
    (u) => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (detailUser) {
    return <UserDetail user={detailUser} stats={userStats[detailUser.id]} onBack={() => setDetailUser(null)} onRoleToggle={handleRoleToggle} onDelete={handleDelete} onTogglePremium={handleTogglePremium} />
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 pl-10 pr-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-lime/50 transition-all"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-muted text-xs">{filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={loadUsers} className="text-muted hover:text-white transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw size={20} className="text-muted animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="bg-dark-card rounded-2xl p-3 border border-dark-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full bg-lime/20 flex items-center justify-center shrink-0">
                    <span className="text-lime text-xs font-bold">
                      {(u.full_name || u.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-xs font-medium truncate">{u.full_name || 'Sans nom'}</p>
                      {u.role === 'admin' && (
                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded-full">ADMIN</span>
                      )}
                      {u.role === 'premium' && (
                        <span className="px-1.5 py-0.5 bg-lime/20 text-lime text-[9px] font-bold rounded-full">PREMIUM</span>
                      )}
                    </div>
                    <p className="text-muted text-[10px] truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { handleToggleExpand(u.id); }}
                    className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-dark-border transition-all"
                  >
                    {expandedUser === u.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    onClick={() => setDetailUser(u)}
                    className="p-1.5 rounded-lg text-muted hover:text-lime hover:bg-lime/10 transition-all"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>

              {expandedUser === u.id && (
                <div className="mt-3 pt-3 border-t border-dark-border space-y-3 animate-fade-in">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-dark-bg rounded-xl p-2 text-center">
                      <p className="text-white font-bold text-sm">{userStats[u.id]?.total_sessions || 0}</p>
                      <p className="text-muted text-[9px]">Séances</p>
                    </div>
                    <div className="bg-dark-bg rounded-xl p-2 text-center">
                      <p className="text-white font-bold text-sm">{userStats[u.id]?.total_cardio || 0}</p>
                      <p className="text-muted text-[9px]">Cardio</p>
                    </div>
                    <div className="bg-dark-bg rounded-xl p-2 text-center">
                      <p className="text-white font-bold text-sm">{Math.round(userStats[u.id]?.total_volume || 0)}kg</p>
                      <p className="text-muted text-[9px]">Volume</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRoleToggle(u.id, u.role)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                          : 'bg-lime/10 text-lime border border-lime/20'
                      }`}
                    >
                      {u.role === 'admin' ? <><UserX size={12} /> Retirer Admin</> : <><UserCheck size={12} /> Promouvoir Admin</>}
                    </button>
                    <button
                      onClick={() => handleTogglePremium(u.id, u.role)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all ${
                        u.role === 'premium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                          : 'bg-lime/10 text-lime border border-lime/20'
                      }`}
                    >
                      {u.role === 'premium' ? <><Lock size={12} /> Retirer Premium</> : <><Unlock size={12} /> Donner Premium</>}
                    </button>
                    <button
                      onClick={() => openPerms(u)}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 transition-all"
                    >
                      <Shield size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted text-xs">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      )}

      {permsUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPermsUser(null)} />
          <div className="relative bg-dark-card rounded-2xl border border-dark-border p-5 w-full max-w-sm mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-blue-400" />
                <h3 className="text-white font-bold text-sm">Permissions</h3>
              </div>
              <button onClick={() => setPermsUser(null)} className="text-muted hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="text-muted text-xs">{permsUser.email}</p>
            <div className="space-y-2">
              {PERMS_FEATURES.map((f) => (
                <label key={f.key} className="flex items-center justify-between bg-dark-bg rounded-xl px-3 py-2.5">
                  <span className="text-white text-xs">{f.label}</span>
                  <button
                    onClick={() => setPermsValues((prev) => ({ ...prev, [f.key]: !prev[f.key] }))}
                    className={`w-10 h-6 rounded-full transition-all relative ${permsValues[f.key] ? 'bg-blue-400' : 'bg-dark-border'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${permsValues[f.key] ? 'left-5' : 'left-1'}`} />
                  </button>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPermsUser(null)} className="flex-1 py-2.5 bg-dark-border text-muted rounded-xl text-xs font-medium transition-all">
                Annuler
              </button>
              <button onClick={handleSavePerms} disabled={permsSaving} className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50">
                {permsSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserDetail({ user, stats, onBack, onRoleToggle, onDelete, onTogglePremium }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1 text-muted hover:text-white text-sm transition-colors">
        <ArrowLeft size={16} /> Retour à la liste
      </button>

      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-lime/20 flex items-center justify-center">
            <span className="text-lime text-xl font-bold">
              {(user.full_name || user.email || '?')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold">{user.full_name || 'Sans nom'}</h2>
              {user.role === 'admin' && (
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded-full">ADMIN</span>
              )}
              {user.role === 'premium' && (
                <span className="px-1.5 py-0.5 bg-lime/20 text-lime text-[9px] font-bold rounded-full">PREMIUM</span>
              )}
            </div>
            <p className="text-muted text-xs">{user.email}</p>
            <p className="text-muted text-[10px] mt-0.5">
              Inscrit le {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-dark-bg rounded-xl p-3 text-center">
            <p className="text-white font-bold text-lg">{stats?.total_sessions || 0}</p>
            <p className="text-muted text-[10px]">Séances</p>
          </div>
          <div className="bg-dark-bg rounded-xl p-3 text-center">
            <p className="text-white font-bold text-lg">{stats?.total_cardio || 0}</p>
            <p className="text-muted text-[10px]">Cardio</p>
          </div>
          <div className="bg-dark-bg rounded-xl p-3 text-center">
            <p className="text-white font-bold text-lg">{Math.round(stats?.total_volume || 0)}kg</p>
            <p className="text-muted text-[10px]">Volume total</p>
          </div>
          <div className="bg-dark-bg rounded-xl p-3 text-center">
            <p className="text-white font-bold text-lg">
              {stats?.last_session ? new Date(stats.last_session).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}
            </p>
            <p className="text-muted text-[10px]">Dernière séance</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onRoleToggle(user.id, user.role)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
              user.role === 'admin'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                : 'bg-lime/10 text-lime border border-lime/20'
            }`}
          >
            {user.role === 'admin' ? <><UserX size={14} /> Retirer Admin</> : <><UserCheck size={14} /> Promouvoir Admin</>}
          </button>
          <button
            onClick={() => onTogglePremium(user.id, user.role)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
              user.role === 'premium'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                : 'bg-lime/10 text-lime border border-lime/20'
            }`}
          >
            {user.role === 'premium' ? <><Lock size={14} /> Retirer Premium</> : <><Unlock size={14} /> Donner Premium</>}
          </button>
          <button
            onClick={() => { if (window.confirm('Supprimer cet utilisateur ?')) onDelete(user.id) }}
            className="flex items-center justify-center gap-1 px-5 py-2.5 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 transition-all"
          >
            <Trash2 size={14} /> Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== SUBSCRIPTIONS ====================

function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])

  useEffect(() => { loadSubscriptions() }, [])

  const loadSubscriptions = async () => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    setLoading(true)
    try {
      const [subRes, usersRes] = await Promise.all([
        supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
        adminGetAllUsers(),
      ])
      setSubscriptions(subRes.data || [])
      setUsers(usersRes.data || [])
    } catch {}
    setLoading(false)
  }

  const tierCounts = useMemo(() => {
    const counts = { free: 0, premium: 0 }
    subscriptions.forEach(s => { counts[s.tier] = (counts[s.tier] || 0) + 1 })
    return counts
  }, [subscriptions])

  const premiumUsers = useMemo(() => {
    return users.filter(u => u.role === 'premium' || u.role === 'admin')
  }, [users])

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={subscriptions.length} icon={Users} color="text-lime" />
        <StatCard label="Free" value={tierCounts.free || 0} icon={UserX} color="text-muted" />
        <StatCard label="Premium" value={tierCounts.premium || 0} icon={Crown} color="text-amber-400" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw size={20} className="text-muted animate-spin" />
        </div>
      ) : (
        <>
          {/* Premium Users */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2">Utilisateurs Premium</h3>
            {premiumUsers.length > 0 ? (
              <div className="space-y-2">
                {premiumUsers.map((u) => (
                  <div key={u.id} className="bg-dark-card rounded-2xl p-3 border border-dark-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center">
                          <Crown size={14} className="text-lime" />
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium">{u.full_name || u.email}</p>
                          <p className="text-muted text-[10px]">{u.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-lime/20 text-lime'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : 'Premium'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-dark-card rounded-2xl p-4 border border-dark-border text-center">
                <Crown size={32} className="text-muted/30 mx-auto mb-2" />
                <p className="text-muted text-xs">Aucun utilisateur premium</p>
              </div>
            )}
          </div>

          {/* All Subscriptions */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2">Historique Stripe</h3>
            {subscriptions.length > 0 ? (
              <div className="space-y-2">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="bg-dark-card rounded-2xl p-3 border border-dark-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          sub.tier === 'premium' ? 'bg-lime/20' : 'bg-dark-bg'
                        }`}>
                          <Crown size={14} className={sub.tier === 'premium' ? 'text-lime' : 'text-muted'} />
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium">{sub.user_id?.slice(0, 8)}...</p>
                          <p className="text-muted text-[10px]">
                            {sub.tier} · {sub.status}
                            {sub.current_period_end && ` · expire ${new Date(sub.current_period_end).toLocaleDateString('fr-FR')}`}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        sub.tier === 'premium' ? 'bg-lime/20 text-lime' : 'bg-dark-bg text-muted'
                      }`}>
                        {sub.tier}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-dark-card rounded-2xl p-4 border border-dark-border text-center">
                <Crown size={32} className="text-muted/30 mx-auto mb-2" />
                <p className="text-muted text-xs">Aucun abonnement Stripe</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
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
        <StatCard label="Total" value={exercisesList.length} icon={Dumbbell} color="text-lime" />
        <StatCard label="Groupes" value={Object.keys(muscleCounts).length} icon={BarChart3} color="text-blue-400" />
      </div>

      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-muted text-[10px] uppercase tracking-wide">
            {isEditing ? 'Modifier' : 'Ajouter'} un exercice
          </p>
          {isEditing && (
            <button onClick={() => { setForm(EmptyExercise()); setIsEditing(false) }} className="text-muted hover:text-white transition-colors">
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
          <label className="text-muted text-[10px] uppercase tracking-wide">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." rows={2} className="w-full bg-dark-bg border border-dark-border rounded-xl py-2 px-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-lime/50 transition-all resize-none" />
        </div>
        <button onClick={handleSave} disabled={!form.name} className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${form.name ? 'bg-lime hover:bg-lime/90 text-dark-bg' : 'bg-dark-bg text-muted cursor-not-allowed'}`}>
          {isEditing ? <><Save size={14} /> Enregistrer</> : <><Plus size={14} /> Ajouter</>}
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 pl-10 pr-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-lime/50 transition-all" />
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8"><RefreshCw size={20} className="text-muted animate-spin" /></div>
        ) : (
          filtered.map((ex) => (
            <div key={ex.id} className="bg-dark-card rounded-xl p-3 flex items-center justify-between border border-dark-border">
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-medium truncate">{ex.name}</p>
                <p className="text-muted text-[10px]">{ex.muscle_group || ex.muscleGroup} · {ex.equipment} · {ex.difficulty}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleEdit(ex)} className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-dark-border transition-all"><Edit size={12} /></button>
                <button onClick={() => handleDeleteExercise(ex.id)} className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
          ))
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-8"><p className="text-muted text-xs">Aucun exercice trouvé</p></div>
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
      <StatCard label="Programmes" value={programsList.length} icon={Calendar} color="text-lime" />

      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-muted text-[10px] uppercase tracking-wide">
            {isEditing ? 'Modifier' : 'Ajouter'} un programme
          </p>
          {isEditing && (
            <button onClick={() => { setForm(EmptyProgram()); setIsEditing(false) }} className="text-muted hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
        <FormInput label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Push / Pull / Legs..." />
        <div className="space-y-1">
          <label className="text-muted text-[10px] uppercase tracking-wide">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." rows={2} className="w-full bg-dark-bg border border-dark-border rounded-xl py-2 px-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-lime/50 transition-all resize-none" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <FormSelect label="Niveau" value={form.level} onChange={(v) => setForm({ ...form, level: v })} options={[{ value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' }, { value: 'avance', label: 'Avancé' }]} />
          <FormInput label="Durée (sem)" value={form.duration_weeks} onChange={(v) => setForm({ ...form, duration_weeks: v })} type="number" placeholder="8" />
          <FormInput label="Jours / sem" value={form.days_per_week} onChange={(v) => setForm({ ...form, days_per_week: v })} type="number" placeholder="3" />
        </div>
        <button onClick={handleSave} disabled={!form.name} className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${form.name ? 'bg-lime hover:bg-lime/90 text-dark-bg' : 'bg-dark-bg text-muted cursor-not-allowed'}`}>
          {isEditing ? <><Save size={14} /> Enregistrer</> : <><Plus size={14} /> Ajouter</>}
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 pl-10 pr-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-lime/50 transition-all" />
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8"><RefreshCw size={20} className="text-muted animate-spin" /></div>
        ) : (
          filtered.map((prog) => (
            <div key={prog.id} className="bg-dark-card rounded-xl p-3 flex items-center justify-between border border-dark-border">
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-medium truncate">{prog.name}</p>
                <p className="text-muted text-[10px]">{prog.level} · {prog.days_per_week || prog.daysPerWeek}x / sem · {prog.duration_weeks || prog.durationWeeks} sem</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleEdit(prog)} className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-dark-border transition-all"><Edit size={12} /></button>
                <button onClick={() => handleDeleteProgram(prog.id)} className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
          ))
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-8"><p className="text-muted text-xs">Aucun programme trouvé</p></div>
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
        <StatCard label="Musculation" value={sessions.length} icon={Dumbbell} color="text-lime" />
        <StatCard label="Cardio" value={cardioSessions.length} icon={Flame} color="text-orange-400" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><RefreshCw size={20} className="text-muted animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {allActivity.map((item, i) => (
            <div key={`${item._type}-${item.id || i}`} className="bg-dark-card rounded-2xl p-3 border border-dark-border">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item._type === 'cardio' ? 'bg-orange-500/20' : 'bg-lime/20'
                }`}>
                  {item._type === 'cardio'
                    ? <Flame size={14} className="text-orange-400" />
                    : <Dumbbell size={14} className="text-lime" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">
                    {item.exercise_name || item.activity_name || 'Séance'}
                  </p>
                  <p className="text-muted text-[10px]">
                    {item._type === 'cardio' ? 'Cardio' : 'Musculation'} · {item.duration || 0}min
                    {item.calories ? ` · ${item.calories}kcal` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-muted text-[10px]">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}
                  </p>
                  <p className="text-muted text-[9px]">
                    {item.user_id?.slice(0, 6)}...
                  </p>
                </div>
              </div>
            </div>
          ))}
          {allActivity.length === 0 && (
            <div className="text-center py-8">
              <Activity size={32} className="text-muted/30 mx-auto mb-2" />
              <p className="text-muted text-xs">Aucune activité</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ==================== SETTINGS ====================

function SettingsTab() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('nirika_admin_settings')
      return saved ? JSON.parse(saved) : {
        monthlyPrice: '4.99',
        yearlyPrice: '39.99',
        yearlyDiscount: '33',
        maxFreePrograms: '3',
        maxFreeExercises: '20',
        coachEnabled: false,
        notificationsEnabled: true,
        youtubeEnabled: true,
        googleFitEnabled: true,
        quickMode: false,
      }
    } catch {
      return {
        monthlyPrice: '7.99',
        yearlyPrice: '69.99',
        yearlyDiscount: '39',
        maxFreePrograms: '3',
        maxFreeExercises: '20',
        coachEnabled: false,
        notificationsEnabled: true,
        youtubeEnabled: true,
        googleFitEnabled: true,
        quickMode: false,
      }
    }
  })
  const [saved, setSaved] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [apiKeySaving, setApiKeySaving] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState('idle')

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return
    setApiKeySaving(true)
    setApiKeyStatus('idle')
    try {
      const result = await adminUpdateSecret('OPENAI_API_KEY', apiKeyInput.trim())
      if (result.success || result.error === undefined) {
        setApiKeyStatus('saved')
        setApiKeyInput('')
        setTimeout(() => setApiKeyStatus('idle'), 3000)
      } else {
        setApiKeyStatus('error')
      }
    } catch {
      setApiKeyStatus('error')
    }
    setApiKeySaving(false)
  }

  const handleSave = () => {
    try { localStorage.setItem('nirika_admin_settings', JSON.stringify(settings)) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-lime" />
          <h3 className="text-white font-semibold text-sm">Tarification</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Prix mensuel (€)" value={settings.monthlyPrice} onChange={(v) => setSettings({ ...settings, monthlyPrice: v })} placeholder="4.99" />
          <FormInput label="Prix annuel (€)" value={settings.yearlyPrice} onChange={(v) => setSettings({ ...settings, yearlyPrice: v })} placeholder="39.99" />
        </div>
        <FormInput label="Remise annuel (%)" value={settings.yearlyDiscount} onChange={(v) => setSettings({ ...settings, yearlyDiscount: v })} placeholder="33" />
      </div>

      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border space-y-4">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-lime" />
          <h3 className="text-white font-semibold text-sm">Freemium</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Programmes gratuits max" value={settings.maxFreePrograms} onChange={(v) => setSettings({ ...settings, maxFreePrograms: v })} placeholder="3" />
          <FormInput label="Exercices gratuits max" value={settings.maxFreeExercises} onChange={(v) => setSettings({ ...settings, maxFreeExercises: v })} placeholder="20" />
        </div>
      </div>

      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border space-y-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-lime" />
          <h3 className="text-white font-semibold text-sm">Fonctionnalités</h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-muted" />
              <span className="text-white text-xs">NIRIKA Coach</span>
            </div>
            <button
              onClick={() => setSettings({ ...settings, coachEnabled: !settings.coachEnabled })}
              className={`w-10 h-6 rounded-full transition-all relative ${settings.coachEnabled ? 'bg-lime' : 'bg-dark-border'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.coachEnabled ? 'left-5' : 'left-1'}`} />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-muted" />
              <span className="text-white text-xs">Notifications push</span>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
              className={`w-10 h-6 rounded-full transition-all relative ${settings.notificationsEnabled ? 'bg-lime' : 'bg-dark-border'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.notificationsEnabled ? 'left-5' : 'left-1'}`} />
            </button>
          </label>

          <label data-onboard="quick-mode" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-muted" />
              <span className="text-white text-xs">Mode rapide (expert)</span>
            </div>
            <button
              onClick={() => setSettings({ ...settings, quickMode: !settings.quickMode })}
              className={`w-10 h-6 rounded-full transition-all relative ${settings.quickMode ? 'bg-lime' : 'bg-dark-border'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.quickMode ? 'left-5' : 'left-1'}`} />
            </button>
          </label>
        </div>
      </div>

      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border space-y-4">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-lime" />
          <h3 className="text-white font-semibold text-sm">Intégrations</h3>
        </div>

        {/* YouTube */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${import.meta.env.VITE_YOUTUBE_API_KEY ? 'bg-green-400' : 'bg-red-400'}`} />
            <div>
              <p className="text-white text-xs font-medium">YouTube Data API</p>
              <p className="text-muted text-[10px]">
                {import.meta.env.VITE_YOUTUBE_API_KEY ? 'Clé configurée' : 'Clé manquante'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, youtubeEnabled: !settings.youtubeEnabled })}
            className={`w-10 h-6 rounded-full transition-all relative ${settings.youtubeEnabled ? 'bg-lime' : 'bg-dark-border'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.youtubeEnabled ? 'left-5' : 'left-1'}`} />
          </button>
        </div>

        {/* Google Fit */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID ? 'bg-green-400' : 'bg-red-400'}`} />
            <div>
              <p className="text-white text-xs font-medium">Google Fit</p>
              <p className="text-muted text-[10px]">
                {import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID ? 'Client ID configuré' : 'Client ID manquant'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, googleFitEnabled: !settings.googleFitEnabled })}
            className={`w-10 h-6 rounded-full transition-all relative ${settings.googleFitEnabled ? 'bg-lime' : 'bg-dark-border'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.googleFitEnabled ? 'left-5' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border space-y-4">
        <div className="flex items-center gap-2">
          <Key size={16} className="text-lime" />
          <h3 className="text-white font-semibold text-sm">Configuration API</h3>
        </div>

        <div className="space-y-2">
          <FormInput
            label="Clé API OpenAI"
            value={apiKeyInput}
            onChange={setApiKeyInput}
            placeholder="sk-..."
            type="password"
          />
          <p className="text-muted text-[10px]">
            {apiKeyStatus === 'saved' ? '✓ Clé mise à jour' : apiKeyStatus === 'error' ? '✗ Erreur lors de la mise à jour' : 'Sauvegardée côté serveur, mets à jour si nécessaire'}
          </p>
          <button
            onClick={handleSaveApiKey}
            disabled={!apiKeyInput.trim() || apiKeySaving}
            className="w-full py-2 rounded-xl bg-lime text-dark-bg text-xs font-bold disabled:opacity-30 transition-all"
          >
            {apiKeySaving ? 'Enregistrement...' : 'Mettre à jour la clé API'}
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          saved ? 'bg-lime/20 text-lime' : 'bg-lime text-dark-bg hover:bg-lime/90'
        }`}
      >
        {saved ? <><Save size={16} /> Enregistré !</> : <><Save size={16} /> Enregistrer les réglages</>}
      </button>
    </div>
  )
}

// ==================== MOTIVATION ====================

const MOTIVATION_KEY = 'nirika_motivation_phrases'
const DEFAULT_PHRASES = [
  "Chaque grand parcours commence par un premier pas. Lance ta première séance !",
  "La régularité fait la différence. Mieux vaut 30 min chaque jour que 3h une fois par semaine.",
  "Ton corps est capable de bien plus que tu ne l'imagines. Pousse tes limites !",
  "Le seul entraînement que tu regrettes, c'est celui que tu n'as pas fait.",
  "La discipline, c'est choisir entre ce que tu veux maintenant et ce que tu veux le plus.",
  "Chaque répétition te rapproche de la version la plus forte de toi-même.",
  "Ne compare pas ton chapitre 1 à quelqu'un d'autre. Chacun son rythme.",
  "La récupération fait partie de l'entraînement. Écoute ton corps.",
  "Tu n'as pas besoin d'être parfait, tu as besoin de commencer. 💪",
  "Le succès, c'est la somme de petits efforts répétés chaque jour. 🔥",
]

function MotivationTab() {
  const [phrases, setPhrases] = useState(() => {
    try {
      const raw = localStorage.getItem(MOTIVATION_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return DEFAULT_PHRASES
  })
  const [newPhrase, setNewPhrase] = useState('')
  const [editIndex, setEditIndex] = useState(null)
  const [editText, setEditText] = useState('')
  const [saved, setSaved] = useState(false)

  const savePhrases = (updated) => {
    setPhrases(updated)
    try { localStorage.setItem(MOTIVATION_KEY, JSON.stringify(updated)) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    window.dispatchEvent(new StorageEvent('storage', { key: MOTIVATION_KEY }))
  }

  const addPhrase = () => {
    const text = newPhrase.trim()
    if (!text) return
    savePhrases([...phrases, text])
    setNewPhrase('')
  }

  const deletePhrase = (index) => {
    if (phrases.length <= 1) return
    savePhrases(phrases.filter((_, i) => i !== index))
    if (editIndex === index) { setEditIndex(null); setEditText('') }
  }

  const saveEdit = () => {
    if (!editText.trim() || editIndex === null) return
    const updated = [...phrases]
    updated[editIndex] = editText.trim()
    savePhrases(updated)
    setEditIndex(null)
    setEditText('')
  }

  const resetDefaults = () => {
    savePhrases(DEFAULT_PHRASES)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-lime" />
          <h3 className="text-white font-semibold text-sm">Phrases de motivation</h3>
        </div>
        <span className="text-muted text-xs">{phrases.length} phrase{phrases.length !== 1 ? 's' : ''}</span>
      </div>

      <p className="text-muted text-xs">
        Ces phrases défilent automatiquement dans la page Stats toutes les 5 secondes.
      </p>

      {/* Add new phrase */}
      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border space-y-3">
        <div className="flex items-center gap-2">
          <Plus size={14} className="text-lime" />
          <span className="text-white font-medium text-xs">Ajouter une phrase</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPhrase()}
            placeholder="Écris ta phrase motivante..."
            className="flex-1 bg-dark-bg border border-dark-border rounded-xl py-2.5 px-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-lime/50 transition-all"
          />
          <button
            onClick={addPhrase}
            disabled={!newPhrase.trim()}
            className="px-4 py-2.5 bg-lime text-dark-bg rounded-xl text-sm font-bold disabled:opacity-30 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Phrases list */}
      <div className="space-y-2">
        {phrases.map((phrase, i) => (
          <div key={i} className="bg-dark-card rounded-xl p-3 border border-dark-border">
            {editIndex === i ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  className="w-full bg-dark-bg border border-lime/50 rounded-xl py-2 px-3 text-white text-sm focus:outline-none transition-all"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 py-1.5 bg-lime text-dark-bg rounded-lg text-xs font-bold transition-all">
                    Enregistrer
                  </button>
                  <button onClick={() => { setEditIndex(null); setEditText('') }} className="flex-1 py-1.5 bg-dark-border text-muted rounded-lg text-xs font-medium transition-all">
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lime text-[10px] font-bold">{i + 1}</span>
                </div>
                <p className="text-white/80 text-xs flex-1 leading-relaxed">{phrase}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditIndex(i); setEditText(phrase) }}
                    className="p-1.5 hover:bg-dark-bg rounded-lg transition-colors"
                  >
                    <Edit size={12} className="text-muted" />
                  </button>
                  <button
                    onClick={() => deletePhrase(i)}
                    disabled={phrases.length <= 1}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={resetDefaults}
          className="flex-1 py-2.5 bg-dark-card border border-dark-border text-muted rounded-xl text-xs font-medium hover:text-white transition-all"
        >
          Réinitialiser par défaut
        </button>
        <button
          onClick={() => { savePhrases(phrases) }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            saved ? 'bg-lime/20 text-lime' : 'bg-lime text-dark-bg'
          }`}
        >
          {saved ? <><Save size={14} /> Enregistré !</> : <><Save size={14} /> Sauvegarder</>}
        </button>
      </div>
    </div>
  )
}
