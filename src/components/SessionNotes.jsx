import { useState } from 'react'
import { StickyNote, Smile, Meh, Frown, Zap, Battery, BatteryLow, X, Check } from 'lucide-react'
import useStore from '../store/useStore'

const ENERGY_LEVELS = [
  { value: 1, icon: BatteryLow, label: 'Épuisé', color: 'text-red-400' },
  { value: 2, icon: Battery, label: 'Fatigué', color: 'text-orange-400' },
  { value: 3, icon: Zap, label: 'Normal', color: 'text-white/60' },
  { value: 4, icon: Zap, label: 'Énergique', color: 'text-lime' },
  { value: 5, icon: Zap, label: 'Super', color: 'text-lime' },
]

const MOOD_ICONS = [
  { value: 1, icon: Frown, label: 'Difficile', color: 'text-red-400' },
  { value: 2, icon: Meh, label: 'Moyen', color: 'text-orange-400' },
  { value: 3, icon: Smile, label: 'Bien', color: 'text-white/60' },
  { value: 4, icon: Smile, label: 'Très bien', color: 'text-lime' },
  { value: 5, icon: Smile, label: 'Excellent', color: 'text-lime' },
]

export default function SessionNotes({ sessionId, onComplete }) {
  const { addSessionNote, sessionNotes } = useStore()
  const existing = sessionNotes[sessionId]

  const [energy, setEnergy] = useState(existing?.energy || 3)
  const [mood, setMood] = useState(existing?.mood || 3)
  const [pain, setPain] = useState(existing?.pain || '')
  const [notes, setNotes] = useState(existing?.notes || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    addSessionNote(sessionId, { energy, mood, pain, notes })
    setSaved(true)
    setTimeout(() => onComplete?.(), 1000)
  }

  if (saved) {
    return (
      <div className="bg-lime/10 border border-lime/20 rounded-2xl p-4 text-center">
        <Check size={24} className="text-lime mx-auto mb-2" />
        <p className="text-lime font-semibold text-sm">Note enregistrée !</p>
      </div>
    )
  }

  return (
    <div className="bg-dark-card rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <StickyNote size={16} className="text-lime" />
        <p className="text-white font-semibold text-sm">Note de séance</p>
      </div>

      {/* Energy */}
      <div>
        <p className="text-white/50 text-xs mb-2">Énergie</p>
        <div className="flex gap-1.5">
          {ENERGY_LEVELS.map((level) => {
            const Icon = level.icon
            return (
              <button
                key={level.value}
                onClick={() => setEnergy(level.value)}
                className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
                  energy === level.value
                    ? 'bg-lime/20 border border-lime/30'
                    : 'bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={14} className={energy === level.value ? level.color : 'text-white/30'} />
                <span className={`text-[9px] ${energy === level.value ? 'text-white' : 'text-white/30'}`}>
                  {level.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mood */}
      <div>
        <p className="text-white/50 text-xs mb-2">Ressenti</p>
        <div className="flex gap-1.5">
          {MOOD_ICONS.map((level) => {
            const Icon = level.icon
            return (
              <button
                key={level.value}
                onClick={() => setMood(level.value)}
                className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
                  mood === level.value
                    ? 'bg-lime/20 border border-lime/30'
                    : 'bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={14} className={mood === level.value ? level.color : 'text-white/30'} />
                <span className={`text-[9px] ${mood === level.value ? 'text-white' : 'text-white/30'}`}>
                  {level.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Pain */}
      <div>
        <p className="text-white/50 text-xs mb-2">Douleur / inconfort</p>
        <input
          type="text"
          value={pain}
          onChange={(e) => setPain(e.target.value)}
          placeholder="Aucune douleur..."
          className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white text-xs focus:border-lime focus:outline-none placeholder:text-white/20"
        />
      </div>

      {/* Notes */}
      <div>
        <p className="text-white/50 text-xs mb-2">Notes</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Comment s'est passée ta séance..."
          rows={2}
          className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white text-xs focus:border-lime focus:outline-none resize-none placeholder:text-white/20"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-lime text-dark-bg font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2"
      >
        <Check size={16} />
        Enregistrer
      </button>
    </div>
  )
}
