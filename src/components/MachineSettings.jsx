import { useState, useEffect } from 'react'
import { X, Minus, Plus, Check } from 'lucide-react'
import GlassCard from './GlassCard'

const QUICK_WEIGHTS = [10, 20, 30, 40, 50, 60, 80, 100]
const STORAGE_KEY = 'nirika-machine-weights'

function getSavedWeight(exerciseId) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return data[exerciseId] || 20
  } catch {
    return 20
  }
}

function saveWeight(exerciseId, weight) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    data[exerciseId] = weight
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // silent
  }
}

export default function MachineSettings({ exerciseId, currentWeight, onChange }) {
  const [weight, setWeight] = useState(currentWeight ?? getSavedWeight(exerciseId))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (currentWeight !== undefined) setWeight(currentWeight)
    else setWeight(getSavedWeight(exerciseId))
  }, [exerciseId, currentWeight])

  const updateWeight = (val) => {
    const clamped = Math.max(5, Math.min(200, val))
    setWeight(clamped)
    setSaved(false)
  }

  const handleSave = () => {
    saveWeight(exerciseId, weight)
    setSaved(true)
    if (onChange) onChange(weight)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <GlassCard className="w-full max-w-sm p-5 space-y-5 border border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-base">Poids machine</h3>
          <button
            onClick={() => onChange && onChange(weight)}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current weight display */}
        <div className="text-center py-4">
          <p className="text-5xl font-black text-white tabular-nums">{weight}</p>
          <p className="text-white/40 text-sm mt-1">kilogrammes</p>
        </div>

        {/* +/- controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => updateWeight(weight - 5)}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <Minus size={20} />
          </button>

          <div className="flex-1 relative">
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={weight}
              onChange={(e) => updateWeight(parseInt(e.target.value, 10))}
              className="w-full accent-lime h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #34d399 0%, #34d399 ${((weight - 5) / 195) * 100}%, rgba(255,255,255,0.1) ${((weight - 5) / 195) * 100}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
          </div>

          <button
            onClick={() => updateWeight(weight + 5)}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Quick select */}
        <div>
          <p className="text-white/30 text-[10px] uppercase tracking-wide mb-2 text-center">Sélection rapide</p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_WEIGHTS.map((w) => (
              <button
                key={w}
                onClick={() => { updateWeight(w); setSaved(false); }}
                className={`py-2 rounded-xl text-sm font-medium transition-all ${
                  weight === w
                    ? 'bg-lime text-black'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                }`}
              >
                {w}kg
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-lime hover:brightness-110 text-black'
          }`}
        >
          {saved ? (
            <>
              <Check size={16} /> Enregistré
            </>
          ) : (
            'Enregistrer'
          )}
        </button>
      </GlassCard>
    </div>
  )
}
