import { useState, useMemo } from 'react'
import { Trophy, TrendingUp, Dumbbell, Clock, Flame, X } from 'lucide-react'
import useStore from '../store/useStore'

export default function PersonalRecords({ compact }) {
  const { getPersonalRecords } = useStore()
  const [showAll, setShowAll] = useState(false)
  const records = useMemo(() => getPersonalRecords(), [getPersonalRecords])

  const sortedByWeight = useMemo(() =>
    Object.entries(records)
      .filter(([, r]) => r.maxWeight > 0)
      .sort((a, b) => b[1].maxWeight - a[1].maxWeight)
      .slice(0, 5),
    [records]
  )

  const sortedByVolume = useMemo(() =>
    Object.entries(records)
      .filter(([, r]) => r.maxVolume > 0)
      .sort((a, b) => b[1].maxVolume - a[1].maxVolume)
      .slice(0, 5),
    [records]
  )

  const totalRecords = Object.keys(records).length

  if (compact) {
    return (
      <>
        <button
          onClick={() => setShowAll(true)}
          className="bg-dark-card rounded-2xl p-4 border border-dark-border w-full text-left active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
              <Trophy size={22} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Records Personnels</p>
              <p className="text-muted text-xs">{totalRecords} exercices suivis</p>
            </div>
            {sortedByWeight.length > 0 && (
              <div className="text-right">
                <p className="text-yellow-400 font-bold text-sm">{sortedByWeight[0][1].maxWeight} kg</p>
                <p className="text-muted text-[10px]">Max poids</p>
              </div>
            )}
          </div>
        </button>

        {showAll && (
          <RecordsFullView records={records} onClose={() => setShowAll(false)} />
        )}
      </>
    )
  }

  return <RecordsFullView records={records} />
}

function RecordsFullView({ records, onClose }) {
  const sortedByWeight = useMemo(() =>
    Object.entries(records)
      .filter(([, r]) => r.maxWeight > 0)
      .sort((a, b) => b[1].maxWeight - a[1].maxWeight),
    [records]
  )

  const sortedByVolume = useMemo(() =>
    Object.entries(records)
      .filter(([, r]) => r.maxVolume > 0)
      .sort((a, b) => b[1].maxVolume - a[1].maxVolume),
    [records]
  )

  return (
    <div className={`${onClose ? 'fixed inset-0 z-50 bg-dark-bg/95 flex flex-col' : 'space-y-4'}`}>
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" />
            <h2 className="text-white font-bold text-lg">Records Personnels</h2>
          </div>
          <button onClick={onClose} className="p-2">
            <X size={20} className="text-muted" />
          </button>
        </div>
      )}

      <div className={`${onClose ? 'flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar' : ''}`}>
        {!onClose && (
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" />
            <h2 className="text-white font-semibold text-sm">Records Personnels</h2>
          </div>
        )}

        {Object.keys(records).length === 0 ? (
          <div className="bg-dark-card rounded-2xl p-6 text-center">
            <Trophy size={32} className="text-muted mx-auto mb-2" />
            <p className="text-muted text-sm">Aucun record encore</p>
            <p className="text-white/30 text-xs mt-1">Tes records apparaîtront ici après tes séances</p>
          </div>
        ) : (
          <>
            {/* Top Records - Max Weight */}
            {sortedByWeight.length > 0 && (
              <div className="bg-dark-card rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Dumbbell size={16} className="text-yellow-400" />
                  <p className="text-white font-semibold text-sm">Poids maximum</p>
                </div>
                <div className="space-y-2">
                  {sortedByWeight.map(([id, rec], i) => (
                    <div key={id} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        i === 1 ? 'bg-white/10 text-white/60' :
                        i === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-white/5 text-white/30'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{rec.exerciseName}</p>
                        <p className="text-white/30 text-[10px]">{rec.totalSessions} séances</p>
                      </div>
                      <p className="text-yellow-400 font-bold text-sm">{rec.maxWeight} kg</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Records - Max Volume */}
            {sortedByVolume.length > 0 && (
              <div className="bg-dark-card rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className="text-lime" />
                  <p className="text-white font-semibold text-sm">Volume maximum</p>
                </div>
                <div className="space-y-2">
                  {sortedByVolume.map(([id, rec], i) => (
                    <div key={id} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-lime/20 text-lime' :
                        i === 1 ? 'bg-white/10 text-white/60' :
                        i === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-white/5 text-white/30'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{rec.exerciseName}</p>
                        <p className="text-white/30 text-[10px]">{rec.totalSessions} séances</p>
                      </div>
                      <p className="text-lime font-bold text-sm">{rec.maxVolume.toLocaleString()} kg</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
