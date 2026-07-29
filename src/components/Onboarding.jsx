import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react'
import useStore from '../store/useStore'

const ONBOARDING_KEY = 'nirika_onboarding_done'

const STEPS = [
  {
    view: 'dashboard',
    target: '[data-onboard="hero"]',
    title: 'Bienvenue !',
    desc: 'Voici ton tableau de bord personnel. Tout commence ici.',
    icon: '👋',
  },
  {
    view: 'dashboard',
    target: '[data-onboard="quick-actions"]',
    title: 'Accès rapide',
    desc: 'Lance une séance, du cardio, ou explore les exercices en un tap.',
    icon: '⚡',
  },
  {
    view: 'dashboard',
    target: '[data-onboard="daily-workout"]',
    title: 'Workout du Jour',
    desc: 'Un entraînement généré pour toi chaque jour selon ton profil.',
    icon: '🎯',
  },
  {
    view: 'dashboard',
    target: '[data-onboard="recommendations"]',
    title: 'Recommandations',
    desc: 'NIRIKA analyse tes séances et te propose des conseils personnalisés.',
    icon: '🧠',
  },
  {
    view: 'programme',
    target: '[data-onboard="programmes"]',
    title: 'Programmes',
    desc: '15 programmes structurés : PPL, Upper/Lower, Calisthenie... Choisis le tien.',
    icon: '📋',
  },
  {
    view: 'calisthenics',
    target: '[data-onboard="exercices"]',
    title: '81 Exercices',
    desc: 'Chaque exercice a une vidéo, une description et des conseils.',
    icon: '💪',
  },
  {
    view: 'calisthenics',
    target: '[data-onboard="custom-exercises"]',
    title: 'Exercices personnalisés',
    desc: 'Crée tes propres exercices ou laisse l\'IA les générer. Ils s\'intègrent automatiquement à tous tes programmes.',
    icon: '🛠️',
  },
  {
    view: 'calisthenics',
    target: '[data-onboard="tutorials"]',
    title: 'Tutoriels vidéo',
    desc: 'Chaque exercice cherche automatiquement sa vidéo YouTube. Parfait pour apprendre le bon geste.',
    icon: '▶️',
  },
  {
    view: 'cardio',
    target: '[data-onboard="cardio"]',
    title: 'Cardio Intelligent',
    desc: '8 activités avec simulation BPM, zones de fréquence cardiaque et coaching.',
    icon: '❤️',
  },
  {
    view: 'stats',
    target: '[data-onboard="stats"]',
    title: 'Statistiques',
    desc: 'KPIs, tendances, analyse IA et records personnels.',
    icon: '📊',
  },
  {
    view: 'stats',
    target: '[data-onboard="google-fit"]',
    title: 'Google Fit',
    desc: 'Connecte montres et applis santé. Pas, calories, fréquence cardiaque, activité — tout synchronisé.',
    icon: '📱',
  },
  {
    view: 'stats',
    target: '[data-onboard="badges"]',
    title: 'Badges',
    desc: 'Débloque des récompenses en t\'entraînant régulièrement.',
    icon: '🏆',
  },
  {
    view: 'ai',
    target: '[data-onboard="coach"]',
    title: 'Coach NIRIKA',
    desc: 'Configure ton profil pour des programmes adaptés à tes objectifs.',
    icon: '🏋️',
  },
  {
    view: 'ai',
    target: null,
    title: 'Timer Repos Auto',
    desc: 'Entre chaque série, un chronomètre s\'adapte : 30s cardio, 60s poids du corps, 90s force.',
    icon: '⏱️',
  },
  {
    view: 'ai',
    target: null,
    title: 'Mode Rapide',
    desc: 'Pour les experts : timer minimal avec juste le nom et Start/Finish. Zéro distraction.',
    icon: '⚡',
  },
  {
    view: 'profile',
    target: '[data-onboard="premium"]',
    title: 'Premium 7,99€/mois',
    desc: 'Débloque le Coach IA illimité, les statistiques avancées et le bilan forme complet.',
    icon: '👑',
  },
  {
    view: 'fitmatrix',
    target: '[data-onboard="fitmatrix"]',
    title: 'FitMatrix',
    desc: 'Check-in quotidien : sommeil, humeur, eau, pas, calories, force, cardio. Suis tes 7 piliers.',
    icon: '📅',
  },
]

function getStored() {
  try { return localStorage.getItem(ONBOARDING_KEY) === 'true' } catch { return false }
}

function setDone() {
  try { localStorage.setItem(ONBOARDING_KEY, 'true') } catch {}
}

function resetOnboarding() {
  try { localStorage.removeItem(ONBOARDING_KEY) } catch {}
}

export function useOnboarding() {
  const [done, setDoneState] = useState(getStored)
  return {
    done,
    reset: () => { resetOnboarding(); setDoneState(false) },
    complete: () => { setDone(); setDoneState(true) },
  }
}

function findElement(target, retries = 5) {
  return new Promise((resolve) => {
    let attempts = 0
    const check = () => {
      const el = document.querySelector(target)
      if (el || attempts >= retries) {
        resolve(el)
      } else {
        attempts++
        setTimeout(check, 150)
      }
    }
    check()
  })
}

export default function Onboarding({ onComplete }) {
  const { currentView, setCurrentView } = useStore()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [spotRect, setSpotRect] = useState(null)
  const current = STEPS[step]

  const updateSpot = useCallback(async () => {
    if (!current?.target) { setSpotRect(null); return }
    const el = await findElement(current.target)
    if (el) {
      const r = el.getBoundingClientRect()
      setSpotRect({
        top: Math.max(8, r.top - 10),
        left: Math.max(8, r.left - 10),
        width: Math.min(r.width + 20, window.innerWidth - 16),
        height: Math.min(r.height + 20, window.innerHeight - 16),
      })
    } else {
      setSpotRect(null)
    }
  }, [current?.target])

  useEffect(() => {
    if (!current) return
    setVisible(false)
    setSpotRect(null)

    if (currentView !== current.view) {
      setCurrentView(current.view)
    }

    const t = setTimeout(() => {
      updateSpot()
      setVisible(true)
    }, 500)

    return () => clearTimeout(t)
  }, [step])

  useEffect(() => {
    const onResize = () => updateSpot()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [updateSpot])

  const next = () => {
    setVisible(false)
    setTimeout(() => {
      if (step < STEPS.length - 1) {
        setStep(s => s + 1)
      } else {
        setDone()
        onComplete?.()
      }
    }, 250)
  }

  const prev = () => {
    if (step > 0) {
      setVisible(false)
      setTimeout(() => setStep(s => s - 1), 250)
    }
  }

  const skip = () => {
    setDone()
    onComplete?.()
  }

  if (!current) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto">
      {/* Dark overlay with spotlight hole */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="onboard-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotRect && (
              <rect
                x={spotRect.left}
                y={spotRect.top}
                width={spotRect.width}
                height={spotRect.height}
                rx="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.75)"
          mask="url(#onboard-mask)"
        />
      </svg>

      {/* Spotlight border glow */}
      {spotRect && (
        <div
          className="absolute rounded-2xl border-2 border-lime/50 pointer-events-none transition-all duration-500"
          style={{
            top: spotRect.top,
            left: spotRect.left,
            width: spotRect.width,
            height: spotRect.height,
            boxShadow: '0 0 30px rgba(198, 255, 0, 0.25)',
          }}
        />
      )}

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3 z-10">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-lime rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <span className="text-white/40 text-xs font-medium whitespace-nowrap">{step + 1}/{STEPS.length}</span>
        <button onClick={skip} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-1">
          <X size={16} className="text-white/40" />
        </button>
      </div>

      {/* Floating sparkle */}
      {spotRect && (
        <div
          className="absolute z-10 pointer-events-none transition-all duration-500"
          style={{
            top: spotRect.top - 12,
            left: spotRect.left + spotRect.width / 2 - 10,
          }}
        >
          <div className="animate-bounce"><Sparkles size={20} className="text-lime" /></div>
        </div>
      )}

      {/* Tooltip — always at bottom center */}
      <div
        className={`absolute z-20 left-4 right-4 transition-all duration-300 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
        style={{ bottom: '80px' }}
      >
        <div className="bg-dark-card border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/50 max-w-[320px] mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{current.icon}</span>
            <h3 className="text-white font-bold text-base">{current.title}</h3>
          </div>
          <p className="text-white/70 text-sm leading-relaxed mb-5">{current.desc}</p>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={14} />
                Retour
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center gap-1 px-5 py-2 rounded-xl bg-lime text-dark-bg text-sm font-bold hover:brightness-110 transition-all ml-auto active:scale-95"
            >
              {step < STEPS.length - 1 ? 'Suivant' : 'C\'est parti !'}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
