import { useState, useEffect } from 'react'
import { User, Ruler, Weight, Activity, Target, MapPin, Wrench, LogOut, Save, Bell, BellOff, Check } from 'lucide-react'
import useStore from '../store/useStore'
import GlassCard from './GlassCard'
import { useNotifications } from '../hooks/useNotifications'

const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']
const FREQUENCIES = ['1-2x / sem', '3-4x / sem', '5-6x / sem', 'Tous les jours']
const FREQUENCY_MAP = { '1-2x / sem': 2, '3-4x / sem': 3, '5-6x / sem': 5, 'Tous les jours': 6 }
const GOALS = [
  'Force',
  'Endurance',
  'Hypertrophie',
  'Perte de poids',
  'Flexibilité',
  'Mobilité',
  'Relaxation',
  'Performance sportive',
]
const GOAL_KEY_MAP = {
  'Force': 'force',
  'Endurance': 'endurance',
  'Hypertrophie': 'prise_masse',
  'Perte de poids': 'perte_poids',
  'Flexibilité': 'flexibilite',
  'Mobilité': 'mobilite',
  'Relaxation': 'sante',
  'Performance sportive': 'performance',
}
const GOAL_LABEL_MAP = Object.fromEntries(Object.entries(GOAL_KEY_MAP).map(([k, v]) => [v, k]))
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function FieldGroup({ icon: Icon, label, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-mint-400" />
        <span className="text-white/50 text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-mint-400/50 transition-all"
    />
  )
}

function OptionPills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            value === opt
              ? 'bg-mint-500 text-black'
              : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function Profile({ user, onLogout }) {
  const { profile: storeProfile, setProfile: saveToStore } = useStore()
  const { permission, isSubscribed, requestPermission, subscribe, unsubscribe } = useNotifications(user?.id)
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem('nirika-reminder-time') || '19:00')
  const [reminderEnabled, setReminderEnabled] = useState(() => localStorage.getItem('nirika-reminder-enabled') === 'true')

  const [profile, setProfile] = useState({
    name: '',
    age: '',
    sex: '',
    height: '',
    weight: '',
    level: '',
    frequency: '',
    availableDays: [],
    goals: [],
    injuries: '',
    location: '',
    equipment: '',
  })

  useEffect(() => {
    const saved = localStorage.getItem('nirika-profile')
    if (saved) {
      setProfile(JSON.parse(saved))
    } else if (storeProfile) {
      setProfile((prev) => ({ ...prev, ...storeProfile }))
    }
  }, [])

  const update = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  const toggleDay = (day) => {
    setProfile((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }))
  }

  const toggleGoal = (goal) => {
    setProfile((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }))
  }

  const handleSave = () => {
    localStorage.setItem('nirika-profile', JSON.stringify(profile))
    if (saveToStore) {
      saveToStore({
        ...profile,
        frequency: FREQUENCY_MAP[profile.frequency] || 3,
        goals: (profile.goals || []).map(g => GOAL_KEY_MAP[g] || g),
      })
    }
  }

  const bmi =
    profile.height && profile.weight
      ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
      : null

  return (
    <div className="space-y-4 p-4">
      {/* Avatar + Header */}
      <GlassCard className="p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-mint-500/20 flex items-center justify-center border-2 border-mint-500/30">
          <User size={28} className="text-mint-400" />
        </div>
        <div className="flex-1">
          <TextInput
            value={profile.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Ton nom"
          />
        </div>
      </GlassCard>

      {/* Infos de base */}
      <GlassCard className="p-4 space-y-4">
        <FieldGroup icon={User} label="Informations">
          <div className="grid grid-cols-3 gap-2">
            <TextInput
              type="number"
              value={profile.age}
              onChange={(e) => update('age', e.target.value)}
              placeholder="Âge"
            />
            <OptionPills
              options={['Homme', 'Femme']}
              value={profile.sex}
              onChange={(v) => update('sex', v)}
            />
          </div>
        </FieldGroup>

        <FieldGroup icon={Ruler} label="Morphologie">
          <div className="grid grid-cols-2 gap-2">
            <TextInput
              type="number"
              value={profile.height}
              onChange={(e) => update('height', e.target.value)}
              placeholder="Taille (cm)"
            />
            <TextInput
              type="number"
              value={profile.weight}
              onChange={(e) => update('weight', e.target.value)}
              placeholder="Poids (kg)"
            />
          </div>
          {bmi && (
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <Activity size={14} className="text-blue-400" />
              <span className="text-white/60 text-xs">IMC : </span>
              <span className="text-white font-medium text-sm">{bmi}</span>
              <span className="text-white/40 text-xs">
                ({parseFloat(bmi) < 18.5 ? 'Insuffisant' : parseFloat(bmi) < 25 ? 'Normal' : parseFloat(bmi) < 30 ? 'Surpoids' : 'Obésité'})
              </span>
            </div>
          )}
        </FieldGroup>
      </GlassCard>

      {/* Niveau & Fréquence */}
      <GlassCard className="p-4 space-y-4">
        <FieldGroup icon={Activity} label="Niveau">
          <OptionPills options={LEVELS} value={profile.level} onChange={(v) => update('level', v)} />
        </FieldGroup>

        <FieldGroup icon={Target} label="Fréquence d'entraînement">
          <OptionPills options={FREQUENCIES} value={profile.frequency} onChange={(v) => update('frequency', v)} />
        </FieldGroup>

        <FieldGroup icon={Target} label="Jours disponibles">
          <div className="flex gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                  profile.availableDays.includes(day)
                    ? 'bg-mint-500 text-black'
                    : 'bg-white/5 text-white/40 border border-white/10'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </FieldGroup>
      </GlassCard>

      {/* Objectifs */}
      <GlassCard className="p-4 space-y-4">
        <FieldGroup icon={Target} label="Objectifs">
          <div className="flex flex-wrap gap-2">
            {GOALS.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  profile.goals.includes(goal)
                    ? 'bg-mint-500 text-black'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup icon={Activity} label="Blessures / limitations">
          <TextInput
            value={profile.injuries}
            onChange={(e) => update('injuries', e.target.value)}
            placeholder="Décris tes blessures ou limitations..."
          />
        </FieldGroup>
      </GlassCard>

      {/* Lieu & Équipement */}
      <GlassCard className="p-4 space-y-4">
        <FieldGroup icon={MapPin} label="Lieu d'entraînement">
          <TextInput
            value={profile.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="Salle, extérieur, maison..."
          />
        </FieldGroup>

        <FieldGroup icon={Wrench} label="Équipement disponible">
          <TextInput
            value={profile.equipment}
            onChange={(e) => update('equipment', e.target.value)}
            placeholder="Barres, haltères, machines..."
          />
        </FieldGroup>
      </GlassCard>

      {/* Notifications */}
      <GlassCard className="p-4 space-y-4">
        <FieldGroup icon={Bell} label="Notifications">
          {permission === 'denied' ? (
            <div className="flex items-center gap-2 bg-red-500/10 rounded-xl px-3 py-2">
              <BellOff size={14} className="text-red-400" />
              <span className="text-red-400 text-xs">Notifications bloquées dans les réglages du navigateur</span>
            </div>
          ) : permission === 'granted' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-[#10B981]/10 rounded-xl px-3 py-2">
                <Check size={14} className="text-[#10B981]" />
                <span className="text-[#10B981] text-xs">
                  {isSubscribed ? 'Notifications push activées' : 'Notifications locales activées'}
                </span>
              </div>
              {!isSubscribed && (
                <button
                  onClick={subscribe}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 text-white/60 text-xs font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Bell size={14} /> Activer les notifications push
                </button>
              )}
              {isSubscribed && (
                <button
                  onClick={unsubscribe}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 text-white/40 text-xs font-medium transition-all flex items-center justify-center gap-2"
                >
                  <BellOff size={14} /> Désactiver les notifications push
                </button>
              )}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => {
                      setReminderEnabled(e.target.checked)
                      localStorage.setItem('nirika-reminder-enabled', e.target.checked)
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981] peer-checked:after:bg-white" />
                </label>
                <span className="text-white/60 text-xs">Rappel quotidien</span>
              </div>
              {reminderEnabled && (
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => {
                    setReminderTime(e.target.value)
                    localStorage.setItem('nirika-reminder-time', e.target.value)
                  }}
                  className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-[#10B981]/50"
                />
              )}
            </div>
          ) : (
            <button
              onClick={requestPermission}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-white/60 text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <Bell size={16} /> Activer les notifications
            </button>
          )}
        </FieldGroup>
      </GlassCard>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handleSave}
          className="w-full bg-mint-500 hover:bg-mint-400 text-black font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
        >
          <Save size={16} /> Enregistrer le profil
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Se déconnecter
          </button>
        )}
      </div>
    </div>
  )
}
