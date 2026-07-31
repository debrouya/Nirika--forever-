import { useState } from 'react'
import { Play, Timer, ChevronLeft } from 'lucide-react'
import { warmupExercises, cooldownExercises } from '../data/warmup'
import useStore from '../store/useStore'
import FeatureGuide from './FeatureGuide'

export default function WarmupCooldown({ type = 'warmup', onDone }) {
  const pushView = useStore((s) => s.pushView)
  const addWarmupSession = useStore((s) => s.addWarmupSession)
  const [current, setCurrent] = useState(0)
  const [activeTimer, setActiveTimer] = useState(null)
  const [allDone, setAllDone] = useState(false)
  const items = type === 'warmup' ? warmupExercises : cooldownExercises

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const startTimer = (duration) => {
    let remaining = duration
    setActiveTimer(remaining)
    const interval = setInterval(() => {
      remaining--
      if (remaining <= 0) {
        clearInterval(interval)
        setActiveTimer(null)
      } else {
        setActiveTimer(remaining)
      }
    }, 1000)
    return () => clearInterval(interval)
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => pushView('dashboard')} className="w-10 h-10 rounded-xl bg-dark-card flex items-center justify-center text-white border border-dark-border">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">
          {type === 'warmup' ? 'Échauffement' : 'Retour au calme'}
        </h2>
      </div>

      <FeatureGuide type="warmup" />

      {allDone ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <span className="text-5xl">{type === 'warmup' ? '🔥' : '🧘'}</span>
          <p className="text-white font-bold text-xl">{type === 'warmup' ? 'Échauffement terminé !' : 'Récupération terminée !'}</p>
          <p className="text-white/50 text-sm">Prêt pour la suite</p>
          <button
            onClick={() => pushView('dashboard')}
            className="px-6 py-3 rounded-xl bg-lime text-dark-bg font-bold"
          >
            Terminer
          </button>
        </div>
      ) : activeTimer !== null ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-8">
          <div className="w-48 h-48 rounded-full bg-dark-card border-2 border-lime flex items-center justify-center">
            <span className="text-5xl font-black text-white tabular-nums">{formatTime(activeTimer)}</span>
          </div>
          <p className="text-lg font-medium text-white/70 text-center">
            {current < items.length ? items[current].name : 'Terminé !'}
          </p>
          <button
            onClick={() => {
              setActiveTimer(null)
              if (current >= items.length - 1) {
                addWarmupSession(type)
                setAllDone(true)
              } else {
                setCurrent((c) => c + 1)
                startTimer(items[current + 1].duration)
              }
            }}
            className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-medium"
          >
            {current >= items.length - 1 ? 'Terminer' : 'Suivant'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-dark-card border border-dark-border">
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-xs text-white/50">{item.duration}s · {item.intensity}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrent(idx)
                  startTimer(item.duration)
                }}
                className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center text-lime"
              >
                <Play size={18} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
