import { useState, useEffect } from 'react'
import { Bell, BellOff, X, Check, Clock } from 'lucide-react'
import useStore from '../store/useStore'

const DAYS = [
  { key: 'Lun', label: 'Lundi' },
  { key: 'Mar', label: 'Mardi' },
  { key: 'Mer', label: 'Mercredi' },
  { key: 'Jeu', label: 'Jeudi' },
  { key: 'Ven', label: 'Vendredi' },
  { key: 'Sam', label: 'Samedi' },
  { key: 'Dim', label: 'Dimanche' },
]

export default function TrainingReminders() {
  const { profile, setProfile } = useStore()
  const [enabled, setEnabled] = useState(profile?.reminders?.enabled || false)
  const [time, setTime] = useState(profile?.reminders?.time || '18:00')
  const [selectedDays, setSelectedDays] = useState(profile?.reminders?.days || profile?.availableDays || ['Lun', 'Mar', 'Mer'])
  const [showSettings, setShowSettings] = useState(false)
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default')

  useEffect(() => {
    if (enabled && permission === 'default') {
      Notification.requestPermission().then(p => setPermission(p))
    }
  }, [enabled])

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const saveReminders = () => {
    setProfile({
      reminders: { enabled, time, days: selectedDays }
    })
    setShowSettings(false)

    if (enabled && permission === 'granted') {
      scheduleTestNotification()
    }
  }

  const scheduleTestNotification = () => {
    if (permission === 'granted') {
      new Notification('NIRIKA FOR EVER', {
        body: `Rappels activés ! Tu seras notifié à ${time} les jours sélectionnés.`,
        icon: '/logo.png',
        badge: '/logo.png',
      })
    }
  }

  return (
    <>
      <button
        onClick={() => setShowSettings(true)}
        className="bg-dark-card rounded-2xl p-4 border border-dark-border w-full text-left active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            enabled ? 'bg-lime/10' : 'bg-white/5'
          }`}>
            {enabled ? (
              <Bell size={22} className="text-lime" />
            ) : (
              <BellOff size={22} className="text-muted" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Rappels d'entraînement</p>
            <p className="text-muted text-xs">
              {enabled
                ? `${time} · ${selectedDays.length} jour${selectedDays.length > 1 ? 's' : ''}/semaine`
                : 'Active les rappels pour ne rien oublier'}
            </p>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors ${
            enabled ? 'bg-lime' : 'bg-white/10'
          }`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5 ${
              enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
            }`} />
          </div>
        </div>
      </button>

      {showSettings && (
        <div className="fixed inset-0 z-50 bg-dark-bg/95 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-dark-border">
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-lime" />
              <h2 className="text-white font-bold text-lg">Rappels</h2>
            </div>
            <button onClick={() => setShowSettings(false)} className="p-2">
              <X size={20} className="text-muted" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
            {/* Toggle */}
            <div className="flex items-center justify-between bg-dark-card rounded-xl p-4">
              <div>
                <p className="text-white font-medium text-sm">Activer les rappels</p>
                <p className="text-muted text-xs">Notification push à l'heure prévue</p>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-lime' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5 ${
                  enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {enabled && (
              <>
                {/* Time picker */}
                <div className="bg-dark-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={16} className="text-lime" />
                    <p className="text-white font-medium text-sm">Heure du rappel</p>
                  </div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white text-center text-lg font-mono focus:border-lime focus:outline-none"
                  />
                </div>

                {/* Day selection */}
                <div className="bg-dark-card rounded-xl p-4">
                  <p className="text-white font-medium text-sm mb-3">Jours d'entraînement</p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {DAYS.map(({ key, label }) => {
                      const active = selectedDays.includes(key)
                      return (
                        <button
                          key={key}
                          onClick={() => toggleDay(key)}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                            active
                              ? 'bg-lime text-dark-bg'
                              : 'bg-white/5 text-white/40'
                          }`}
                        >
                          <span className="text-[10px] font-bold">{key}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setSelectedDays(['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'])}
                      className="flex-1 py-1.5 bg-white/5 rounded-lg text-white/50 text-[10px] font-medium"
                    >
                      Semaine
                    </button>
                    <button
                      onClick={() => setSelectedDays(['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'])}
                      className="flex-1 py-1.5 bg-white/5 rounded-lg text-white/50 text-[10px] font-medium"
                    >
                      Tous les jours
                    </button>
                  </div>
                </div>

                {/* Permission warning */}
                {permission !== 'granted' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                    <p className="text-yellow-400 text-xs">
                      ⚠️ Les notifications push ne sont pas autorisées. Autorise-les dans les paramètres de ton navigateur.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {enabled && (
            <div className="p-4 border-t border-dark-border">
              <button
                onClick={saveReminders}
                className="w-full bg-lime text-dark-bg font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Enregistrer
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
