import { useState, useEffect } from 'react'
import { Award, X, Lock } from 'lucide-react'
import useStore from '../store/useStore'

const BADGE_DEFINITIONS = {
  first_session: { title: 'Premier Pas', desc: 'Première séance terminée', icon: '🎯', rarity: 'common' },
  five_sessions: { title: 'En Route', desc: '5 séances terminées', icon: '🚀', rarity: 'common' },
  ten_sessions: { title: 'Régulier', desc: '10 séances terminées', icon: '💪', rarity: 'common' },
  twenty_five_sessions: { title: 'Déterminé', desc: '25 séances terminées', icon: '⚡', rarity: 'rare' },
  fifty_sessions: { title: 'Infatigable', desc: '50 séances terminées', icon: '🔥', rarity: 'rare' },
  hundred_sessions: { title: 'Centurion', desc: '100 séances terminées', icon: '👑', rarity: 'epic' },
  streak_3: { title: 'Série de 3', desc: '3 jours consécutifs', icon: '🔗', rarity: 'common' },
  streak_7: { title: 'Une Semaine', desc: '7 jours consécutifs', icon: '🗓️', rarity: 'rare' },
  streak_14: { title: 'Deux Semaines', desc: '14 jours consécutifs', icon: '💎', rarity: 'epic' },
  streak_30: { title: 'Légende', desc: '30 jours consécutifs', icon: '🏆', rarity: 'legendary' },
  calorie_1000: { title: 'Fournaise', desc: '1000 kcal brûlées', icon: '🔥', rarity: 'common' },
  calorie_5000: { title: 'Brûleur', desc: '5000 kcal brûlées', icon: '💥', rarity: 'rare' },
  calorie_10000: { title: 'Inferno', desc: '10 000 kcal brûlées', icon: '🌋', rarity: 'epic' },
  duration_10h: { title: 'Endurant', desc: "10h d'entraînement", icon: '⏱️', rarity: 'common' },
  duration_50h: { title: 'Marathonien', desc: "50h d'entraînement", icon: '🏅', rarity: 'rare' },
  exercises_10: { title: 'Explorateur', desc: '10 exercices différents', icon: '🗺️', rarity: 'common' },
  exercises_30: { title: 'Polyvalent', desc: '30 exercices différents', icon: '🎨', rarity: 'rare' },
  week_4: { title: 'Un Mois', desc: "4 semaines d'inscription", icon: '📅', rarity: 'common' },
  week_12: { title: 'Trimestre', desc: "3 mois d'inscription", icon: '🌟', rarity: 'rare' },
}

const RARITY_COLORS = {
  common: { bg: 'bg-white/10', border: 'border-white/20', text: 'text-white/60', label: 'Commun' },
  rare: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Rare' },
  epic: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', label: 'Épique' },
  legendary: { bg: 'bg-lime/10', border: 'border-lime/30', text: 'text-lime', label: 'Légendaire' },
}

function BadgeUnlockToast({ badge, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-dark-card border border-lime/30 rounded-2xl px-5 py-3 shadow-lg shadow-lime/10 flex items-center gap-3">
        <span className="text-3xl">{badge.icon}</span>
        <div>
          <p className="text-lime text-xs font-bold uppercase">Badge débloqué !</p>
          <p className="text-white font-semibold text-sm">{badge.title}</p>
        </div>
      </div>
    </div>
  )
}

export default function Badges({ compact }) {
  const { badges, checkBadges, markBadgeSeen } = useStore()
  const [showUnlock, setShowUnlock] = useState(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const newBadges = checkBadges()
    if (newBadges.length > 0) {
      setShowUnlock(newBadges[0])
      newBadges.forEach(b => markBadgeSeen(b.id))
    }
  }, [])

  const unlockedIds = Object.keys(badges)
  const unlockedCount = unlockedIds.length
  const totalCount = Object.keys(BADGE_DEFINITIONS).length

  const rarityStats = {}
  Object.keys(BADGE_DEFINITIONS).forEach(id => {
    const def = BADGE_DEFINITIONS[id]
    if (!rarityStats[def.rarity]) rarityStats[def.rarity] = { total: 0, unlocked: 0 }
    rarityStats[def.rarity].total++
    if (badges[id]) rarityStats[def.rarity].unlocked++
  })

  if (compact) {
    return (
      <>
        {showUnlock && <BadgeUnlockToast badge={showUnlock} onDismiss={() => setShowUnlock(null)} />}
        <button
          onClick={() => setShowAll(true)}
          className="bg-dark-card rounded-2xl p-4 border border-dark-border w-full text-left active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center shrink-0">
              <Award size={22} className="text-lime" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Badges</p>
              <p className="text-muted text-xs">{unlockedCount}/{totalCount} débloqués</p>
            </div>
            <div className="flex -space-x-1">
              {unlockedIds.slice(-3).map(id => (
                <span key={id} className="text-lg">{BADGE_DEFINITIONS[id]?.icon}</span>
              ))}
            </div>
          </div>
        </button>

        {showAll && (
          <div className="fixed inset-0 z-50 bg-dark-bg/95 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-lime" />
                <h2 className="text-white font-bold text-lg">Badges</h2>
                <span className="text-muted text-sm">{unlockedCount}/{totalCount}</span>
              </div>
              <button onClick={() => setShowAll(false)} className="p-2">
                <X size={20} className="text-muted" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {Object.entries(BADGE_DEFINITIONS).map(([id, def]) => {
                const unlocked = !!badges[id]
                const colors = RARITY_COLORS[def.rarity]
                return (
                  <div
                    key={id}
                    className={`rounded-2xl p-4 border transition-all ${
                      unlocked ? `${colors.bg} ${colors.border}` : 'bg-white/5 border-white/10 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-3xl ${!unlocked ? 'grayscale' : ''}`}>{unlocked ? def.icon : '🔒'}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold text-sm ${unlocked ? 'text-white' : 'text-white/50'}`}>{def.title}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text} font-medium`}>
                            {colors.label}
                          </span>
                        </div>
                        <p className={`text-xs ${unlocked ? 'text-white/60' : 'text-white/30'}`}>{def.desc}</p>
                        {unlocked && badges[id]?.unlockedAt && (
                          <p className="text-white/30 text-[10px] mt-1">
                            Débloqué le {new Date(badges[id].unlockedAt).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                      {unlocked && (
                        <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center">
                          <span className="text-lime text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="space-y-4">
      {showUnlock && <BadgeUnlockToast badge={showUnlock} onDismiss={() => setShowUnlock(null)} />}

      <div className="flex items-center gap-2">
        <Award size={18} className="text-lime" />
        <h2 className="text-white font-semibold text-sm">Badges</h2>
        <span className="text-muted text-xs ml-auto">{unlockedCount}/{totalCount}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(BADGE_DEFINITIONS).map(([id, def]) => {
          const unlocked = !!badges[id]
          const colors = RARITY_COLORS[def.rarity]
          return (
            <div
              key={id}
              className={`rounded-xl p-3 border text-center ${
                unlocked ? `${colors.bg} ${colors.border}` : 'bg-white/5 border-white/10 opacity-40'
              }`}
            >
              <span className={`text-2xl block mb-1 ${!unlocked ? 'grayscale' : ''}`}>
                {unlocked ? def.icon : '🔒'}
              </span>
              <p className={`text-[11px] font-medium ${unlocked ? 'text-white' : 'text-white/40'}`}>
                {def.title}
              </p>
              <p className={`text-[9px] ${unlocked ? colors.text : 'text-white/20'}`}>
                {def.desc}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
