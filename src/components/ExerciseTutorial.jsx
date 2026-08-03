import { useState, useEffect, useRef } from 'react'
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Dumbbell,
  Target,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import useStore from '../store/useStore'

const EXERCISE_TIPS = {
  jumping_jacks: [
    'Garde les bras tendus au-dessus de la tête',
    'Atterrissage souple sur la pointe des pieds',
    'Respire régulièrement tout au long du mouvement',
    'Garde le buste droit, ne cambre pas le dos',
  ],
  high_knees: [
    'Monte les genoux à hauteur des hanches',
    'Bras en mouvement alterné comme en course',
    'Impact minimal : atterris sur la pointe des pieds',
    'Garde le buste légèrement penché en avant',
  ],
  burpees: [
    'Décompose le mouvement : squat → pompe → saut',
    'Garde le dos droit en position de pompe',
    'Explose au saut en levant les bras',
    'Contrôle la descente, ne tombe pas',
  ],
  burpees_simples: [
    'Version sans pompe ni saut pour débuter',
    'Va de la position debout à la planche',
    'Garde les mains sous les épaules',
    'Mouvement fluide et contrôlé',
  ],
  jump_squat: [
    'Descends en squat parallèle minimum',
    'Explose vers le haut en sautant',
    'Atterris doucement et enchaîne directement',
    'Garde les genoux dans l\'axe des pieds',
  ],
  push_up: [
    'Mains légèrement plus larges que les épaules',
    'Corps en ligne droite de la tête aux talons',
    'Descends la poitrine au sol',
    'Contracte les abdos pendant le mouvement',
  ],
  pompees_genoux: [
    'Appuie sur les genoux, pas les hanches',
    'Mains sous les épaules',
    'Descends la poitrine vers le sol',
    'Version idéale pour progresser vers les pompes classiques',
  ],
  pompees_decline: [
    'Pieds surélevés sur une chaise ou banc',
    'Intensifie le travail des pectoraux supérieurs',
    'Garde le corps en ligne droite',
    'Descends lentement pour maximiser l\'amplitude',
  ],
  planche: [
    'Coudes sous les épaules',
    'Corps en ligne droite : tête, épaules, hanches, talons',
    'Contracte les abdos et les fessiers',
    'Ne laisse pas les hanches s\'affaisser',
  ],
  gainage_dynamique: [
    'Position de planche de départ',
    'Alterne les mains pour toucher l\'épaule opposée',
    'Garde les hanches stables, ne bouge pas le buste',
    'Respire régulièrement sans bloquer',
  ],
  mountain_climber: [
    'Position de pompe, mains sous les épaules',
    'Amène les genoux alternativement vers la poitrine',
    'Garde le bassin stable',
    'Vitesse progressive : lent puis rapide',
  ],
  crunch: [
    'Allongé sur le dos, genoux pliés',
    'Contracte les abdos pour soulever les épaules',
    'Ne tire pas sur le cou avec les mains',
    'Expire en montant, inspire en descendant',
  ],
  releve_jambes: [
    'Allongé sur le dos, jambes tendues',
    'Monte les jambes à 90° sans toucher le sol',
    'Garde le bas du dos collé au sol',
    'Contrôle la descente, ne laisse pas tomber les jambes',
  ],
  russian_twist: [
    'Assis, buste légèrement penché en arrière',
    'Pieds décollés du sol si possible',
    'Tourne le buste d\'un côté puis de l\'autre',
    'Garde les mains jointes devant la poitrine',
  ],
  squat: [
    'Pieds à largeur d\'épaules, orteils légèrement pointés vers l\'extérieur',
    'Descends comme si tu t\'asseyais sur une chaise',
    'Garde le dos droit, regard devant',
    'Remonte en poussant sur les talons',
  ],
}

const MUSCLE_LABELS = {
  'Cardio': '❤️ Cardio',
  'Pectoraux': '💪 Pectoraux',
  'Jambes': '🦵 Jambes',
  'Abdominaux': '🎯 Abdos',
  'Dos': '🔙 Dos',
  'Epaules': '🎯 Épaules',
  'Bras': '💪 Bras',
}

const DIFFICULTY_CONFIG = {
  facile: { label: 'Facile', color: 'text-green-400 bg-green-400/10' },
  moyen: { label: 'Moyen', color: 'text-yellow-400 bg-yellow-400/10' },
  difficile: { label: 'Difficile', color: 'text-red-400 bg-red-400/10' },
}

export default function ExerciseTutorial({ exercise, onClose }) {
  const [showTips, setShowTips] = useState(false)
  const [youtubeId, setYoutubeId] = useState(exercise.youtubeId)
  const [searching, setSearching] = useState(!exercise.youtubeId)
  const iframeRef = useRef(null)

  useEffect(() => {
    if (!exercise.youtubeId) {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY
      const settings = JSON.parse(localStorage.getItem('nirika_admin_settings') || '{}')
      if (!apiKey || settings.youtubeEnabled === false) { setSearching(false); return }

      const cacheKey = `yt_cache_${exercise.name}`
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey))
        if (cached && Date.now() - cached.ts < 86400000) {
          if (cached.id) { setYoutubeId(cached.id); setSearching(false); return }
        }
      } catch {}

      const query = `${exercise.name} exercice technique forme`
      fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video&videoEmbeddable=true&key=${apiKey}`)
        .then(r => r.json())
        .then(data => {
          const videoId = data?.items?.[0]?.id?.videoId
          if (videoId) {
            setYoutubeId(videoId)
            try { localStorage.setItem(cacheKey, JSON.stringify({ id: videoId, ts: Date.now() })) } catch {}
          }
        })
        .catch(() => {})
        .finally(() => setSearching(false))
    }
  }, [exercise.youtubeId, exercise.name])

  const tips = EXERCISE_TIPS[exercise.id] || [
    'Garde une bonne forme pendant tout le mouvement',
    'Respire correctement : expire sur l\'effort',
    'Commence doucement et augmente l\'intensité',
    'Arrête si tu ressens une douleur',
  ]

  const muscleLabel = MUSCLE_LABELS[exercise.muscleGroup] || exercise.muscleGroup
  const diffConfig = DIFFICULTY_CONFIG[exercise.difficulty] || DIFFICULTY_CONFIG.moyen

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-dark-card flex items-center justify-center"
        >
          <X size={20} className="text-white" />
        </button>
        <span className="text-white font-semibold text-sm">Tutoriel</span>
        <div className="w-10" />
      </div>

      <div className="overflow-y-auto h-[calc(100vh-65px)] pb-8">
        {/* Video */}
        <div className="relative w-full aspect-video bg-black">
          {searching ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-dark-border border-t-lime rounded-full animate-spin mx-auto mb-3" />
                <p className="text-muted text-sm">Recherche vidéo...</p>
              </div>
            </div>
          ) : youtubeId ? (
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`}
              title={exercise.name}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Dumbbell size={48} className="text-muted mx-auto mb-3" />
                <p className="text-muted text-sm">Vidéo non disponible</p>
              </div>
            </div>
          )}
        </div>

        {/* Exercise Info */}
        <div className="p-4 space-y-4">
          {/* Title & Tags */}
          <div>
            <h2 className="text-white font-bold text-xl mb-2">{exercise.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-dark-card text-muted">
                {muscleLabel}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${diffConfig.color}`}>
                {diffConfig.label}
              </span>
              {exercise.equipment === 'none' && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-lime/10 text-lime">
                  🤸 Sans matériel
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-lime" />
              <span className="text-white font-semibold text-xs">Description</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{exercise.description}</p>
          </div>

          {/* Tips Toggle */}
          <button
            onClick={() => setShowTips(!showTips)}
            className="w-full bg-dark-card rounded-2xl p-4 border border-dark-border text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-yellow-400" />
                <span className="text-white font-semibold text-xs">Conseils de forme</span>
              </div>
              <ChevronRight
                size={16}
                className={`text-muted transition-transform ${showTips ? 'rotate-90' : ''}`}
              />
            </div>

            {showTips && (
              <div className="mt-3 space-y-2">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={12} className="text-lime mt-0.5 flex-shrink-0" />
                    <span className="text-white/60 text-xs leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </button>

          {/* Quick Form Checklist */}
          <div className="bg-gradient-to-r from-lime/10 to-lime/5 rounded-2xl p-4 border border-lime/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={14} className="text-lime" />
              <span className="text-white font-semibold text-xs">Checklist rapide</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-lime" />
                <span className="text-white/60 text-[10px]">Posture correcte</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-lime" />
                <span className="text-white/60 text-[10px]">Respiration</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-lime" />
                <span className="text-white/60 text-[10px]">Amplitude complète</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-lime" />
                <span className="text-white/60 text-[10px]">Vitesse contrôlée</span>
              </div>
            </div>
          </div>

          {/* Start Workout */}
          <button
            onClick={() => { useStore.getState().startSession(exercise.id, exercise.name); onClose() }}
            className="w-full py-3 rounded-xl bg-lime text-dark-bg font-bold text-sm flex items-center justify-center gap-2"
          >
            <Play size={16} fill="currentColor" /> Demarrer l'exercice
          </button>
        </div>
      </div>
    </div>
  )
}
