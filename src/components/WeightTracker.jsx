import { useState, useMemo } from 'react'
import { Scale, TrendingDown, TrendingUp, Minus, X, Plus } from 'lucide-react'
import useStore from '../store/useStore'

export default function WeightTracker({ compact }) {
  const { weightHistory, addWeightEntry, profile } = useStore()
  const [showAll, setShowAll] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newWeight, setNewWeight] = useState(profile?.weight || 70)
  const [note, setNote] = useState('')

  const sorted = useMemo(() =>
    [...weightHistory].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [weightHistory]
  )

  const latest = sorted[0]
  const previous = sorted[1]
  const trend = latest && previous ? latest.weight - previous.weight : 0

  const stats = useMemo(() => {
    if (sorted.length === 0) return null
    const weights = sorted.map(e => e.weight)
    return {
      current: weights[0],
      min: Math.min(...weights),
      max: Math.max(...weights),
      avg: Math.round(weights.reduce((a, b) => a + b, 0) / weights.length * 10) / 10,
      change: weights.length > 1 ? Math.round((weights[0] - weights[weights.length - 1]) * 10) / 10 : 0,
    }
  }, [sorted])

  const handleAdd = () => {
    addWeightEntry(parseFloat(newWeight), note)
    setNote('')
    setShowAdd(false)
  }

  if (compact) {
    return (
      <>
        <button
          onClick={() => setShowAll(true)}
          className="bg-dark-card rounded-2xl p-4 border border-dark-border w-full text-left active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Scale size={22} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Suivi du poids</p>
              <p className="text-muted text-xs">{sorted.length} mesure{sorted.length > 1 ? 's' : ''}</p>
            </div>
            {latest && (
              <div className="text-right">
                <p className="text-white font-bold text-sm">{latest.weight} kg</p>
                <p className={`text-[10px] font-medium flex items-center gap-0.5 justify-end ${
                  trend > 0 ? 'text-red-400' : trend < 0 ? 'text-lime' : 'text-muted'
                }`}>
                  {trend > 0 ? <TrendingUp size={10} /> : trend < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                  {trend > 0 ? '+' : ''}{trend} kg
                </p>
              </div>
            )}
          </div>
        </button>

        {showAll && (
          <WeightFullView
            sorted={sorted}
            stats={stats}
            onClose={() => setShowAll(false)}
            onAdd={() => setShowAdd(true)}
          />
        )}

        {showAdd && (
          <AddWeightModal
            newWeight={newWeight}
            setNewWeight={setNewWeight}
            note={note}
            setNote={setNote}
            onAdd={handleAdd}
            onClose={() => setShowAdd(false)}
          />
        )}
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Scale size={18} className="text-blue-400" />
        <h2 className="text-white font-semibold text-sm">Suivi du poids</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="ml-auto p-1.5 rounded-lg bg-lime/10 text-lime"
        >
          <Plus size={14} />
        </button>
      </div>
      <WeightFullView sorted={sorted} stats={stats} onAdd={() => setShowAdd(true)} />

      {showAdd && (
        <AddWeightModal
          newWeight={newWeight}
          setNewWeight={setNewWeight}
          note={note}
          setNote={setNote}
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}

function WeightFullView({ sorted, stats, onClose, onAdd }) {
  const maxWeight = stats?.max || 100
  const minWeight = stats?.min || 50
  const range = maxWeight - minWeight || 10

  return (
    <div className={`${onClose ? 'fixed inset-0 z-50 bg-dark-bg/95 flex flex-col' : 'space-y-4'}`}>
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-blue-400" />
            <h2 className="text-white font-bold text-lg">Suivi du poids</h2>
          </div>
          <button onClick={onClose} className="p-2">
            <X size={20} className="text-muted" />
          </button>
        </div>
      )}

      <div className={`${onClose ? 'flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar' : ''}`}>
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-dark-card rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg">{stats.current} kg</p>
              <p className="text-muted text-[10px]">Actuel</p>
            </div>
            <div className="bg-dark-card rounded-xl p-3 text-center">
              <p className={`font-bold text-lg ${stats.change > 0 ? 'text-red-400' : stats.change < 0 ? 'text-lime' : 'text-white'}`}>
                {stats.change > 0 ? '+' : ''}{stats.change} kg
              </p>
              <p className="text-muted text-[10px]">Depuis le début</p>
            </div>
            <div className="bg-dark-card rounded-xl p-3 text-center">
              <p className="text-lime font-bold text-lg">{stats.min} kg</p>
              <p className="text-muted text-[10px]">Minimum</p>
            </div>
            <div className="bg-dark-card rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg">{stats.max} kg</p>
              <p className="text-muted text-[10px]">Maximum</p>
            </div>
          </div>
        )}

        {/* Mini chart */}
        {sorted.length > 1 && (
          <div className="bg-dark-card rounded-2xl p-4">
            <p className="text-white/50 text-[10px] uppercase tracking-wide mb-3">Évolution</p>
            <div className="flex items-end gap-1 h-24">
              {[...sorted].reverse().slice(-30).map((entry, i) => {
                const height = ((entry.weight - minWeight) / range) * 80 + 20
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-blue-400/30 rounded-t transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-white/30 text-[9px]">
                {sorted.length > 0 && new Date(sorted[sorted.length - 1].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
              <span className="text-white/30 text-[9px]">
                {sorted.length > 0 && new Date(sorted[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        )}

        {/* History list */}
        <div className="bg-dark-card rounded-2xl p-4">
          <p className="text-white/50 text-[10px] uppercase tracking-wide mb-3">Historique</p>
          {sorted.length === 0 ? (
            <p className="text-muted text-xs text-center py-4">Aucune mesure</p>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar">
              {sorted.map((entry) => {
                const idx = sorted.indexOf(entry)
                const prev = sorted[idx + 1]
                const diff = prev ? entry.weight - prev.weight : 0
                return (
                  <div key={entry.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                    <div className="flex-1">
                      <p className="text-white text-xs font-medium">{entry.weight} kg</p>
                      <p className="text-white/30 text-[10px]">
                        {new Date(entry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {entry.note && (
                      <p className="text-white/40 text-[10px] max-w-[100px] truncate">{entry.note}</p>
                    )}
                    {diff !== 0 && (
                      <span className={`text-[10px] font-medium ${diff > 0 ? 'text-red-400' : 'text-lime'}`}>
                        {diff > 0 ? '+' : ''}{Math.round(diff * 10) / 10}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {onAdd && (
          <button
            onClick={onAdd}
            className="w-full bg-lime text-dark-bg font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Ajouter une mesure
          </button>
        )}
      </div>
    </div>
  )
}

function AddWeightModal({ newWeight, setNewWeight, note, setNote, onAdd, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-dark-bg/95 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <Scale size={20} className="text-blue-400" />
          <h2 className="text-white font-bold text-lg">Nouvelle mesure</h2>
        </div>
        <button onClick={onClose} className="p-2">
          <X size={20} className="text-muted" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <div className="bg-dark-card rounded-xl p-4">
          <label className="text-white/50 text-xs mb-2 block">Poids (kg)</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNewWeight(prev => Math.max(30, parseFloat(prev) - 0.5))}
              className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white text-xl"
            >
              −
            </button>
            <input
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              step="0.1"
              className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white text-center text-2xl font-bold focus:border-lime focus:outline-none"
            />
            <button
              onClick={() => setNewWeight(prev => Math.min(200, parseFloat(prev) + 0.5))}
              className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white text-xl"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-dark-card rounded-xl p-4">
          <label className="text-white/50 text-xs mb-2 block">Note (optionnel)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: après séance, à jeun..."
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white text-sm focus:border-lime focus:outline-none placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="p-4 border-t border-dark-border">
        <button
          onClick={onAdd}
          className="w-full bg-lime text-dark-bg font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Scale size={16} />
          Enregistrer
        </button>
      </div>
    </div>
  )
}
