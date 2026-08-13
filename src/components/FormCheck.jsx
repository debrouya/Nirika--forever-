import { useState, useRef } from 'react'
import {
  Camera,
  CameraOff,
  RefreshCw,
  Check,
  ChevronLeft,
} from 'lucide-react'
import useStore from '../store/useStore'
import exercises from '../data/exercises'
import FeatureGuide from './FeatureGuide'

const formTips = {
  'Développé': ['Garder les coudes à 45°', 'Respiration en descendant', 'Ne pas cambrer le dos'],
  'Squat': ['Dos droit, regard devant', 'Genoux alignés avec les pieds', 'Descendre jusqu\'à 90°'],
  'Soulevé de terre': ['Dos plat, pas rond', 'Barre proche du corps', 'Poussée dans les talons'],
  'Traction': ['Menton au-dessus de la barre', 'Descente contrôlée', 'Gainage actif'],
  default: ['Mouvement contrôlé', 'Respirer régulièrement', 'Posture droite'],
}

export default function FormCheck() {
  const { pushView, addFormCheckNote } = useStore()
  const [recording, setRecording] = useState(false)
  const [stream, setStream] = useState(null)
  const [selectedExercise, setSelectedExercise] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [showTips, setShowTips] = useState(false)
  const videoRef = useRef(null)
  const [search, setSearch] = useState('')

  const tips = selectedExercise
    ? Object.entries(formTips).find(([key]) => selectedExercise.toLowerCase().includes(key.toLowerCase()))?.[1] || formTips.default
    : formTips.default

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      setStream(s)
      setRecording(true)
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s
      }, 100)
    } catch {
      setFeedback({ type: 'error', message: 'Accès caméra refusé' })
    }
  }

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop())
    setStream(null)
    setRecording(false)
  }

  const analyzeForm = () => {
    const items = tips
    const random = items[Math.floor(Math.random() * items.length)]
    setFeedback({ type: 'info', message: random })
    setShowTips(true)
    if (selectedExercise) {
      addFormCheckNote(selectedExercise, random)
    }
  }

  const filteredExercises = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.muscleGroup?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="nirika-page">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => pushView('dashboard')} className="w-10 h-10 rounded-xl bg-dark-card flex items-center justify-center text-white border border-dark-border">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Analyse technique</h2>
      </div>

      <FeatureGuide type="formcheck" />

      {!recording ? (
        <div className="space-y-4">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white placeholder-white/30"
              placeholder="Rechercher un exercice..."
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {Object.entries(
              filteredExercises.reduce((acc, e) => {
                const g = e.muscleGroup || 'Autre'
                if (!acc[g]) acc[g] = []
                acc[g].push(e)
                return acc
              }, {})
            ).map(([group, exs]) => (
              <div key={group}>
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider py-2">{group}</p>
                {exs.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => { setSelectedExercise(ex.name); setSearch('') }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-colors ${
                      selectedExercise === ex.name ? 'bg-lime/20 text-lime border border-lime/30' : 'text-white hover:bg-dark-card/60'
                    }`}
                  >
                    <span>{ex.name}</span>
                    {selectedExercise === ex.name && <Check size={16} />}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {selectedExercise && (
            <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
              <p className="text-white font-medium mb-3">Exercice sélectionné : {selectedExercise}</p>
              <div className="space-y-2">
                <button
                  onClick={startCamera}
                  className="w-full py-3 rounded-xl bg-lime text-dark-bg font-bold flex items-center justify-center gap-2"
                >
                  <Camera size={20} /> Démarrer l'analyse
                </button>
              </div>
            </div>
          )}

          {feedback && (
            <div className={`p-4 rounded-xl border ${
              feedback.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-lime/10 border-lime/30 text-lime'
            }`}>
              <p className="font-medium">{feedback.message}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4]">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 px-3 py-1 rounded-full bg-red-500/80 text-white text-xs font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> EN DIRECT
            </div>
            <div className="absolute bottom-2 left-2 right-2 px-3 py-2 rounded-xl bg-dark-bg/80 backdrop-blur-sm">
              <p className="text-white text-sm font-medium">{selectedExercise}</p>
            </div>
          </div>

          {showTips && (
            <div className="p-4 rounded-xl bg-lime/10 border border-lime/30">
              <p className="text-lime font-medium text-sm mb-2">Conseil technique</p>
              <p className="text-white/80 text-sm">{feedback?.message}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={analyzeForm} className="flex-1 py-3 rounded-xl bg-lime text-dark-bg font-bold flex items-center justify-center gap-2">
              <RefreshCw size={18} /> Conseil
            </button>
            <button onClick={stopCamera} className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold flex items-center justify-center gap-2">
              <CameraOff size={18} /> Arrêter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
