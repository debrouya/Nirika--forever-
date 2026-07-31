import { useState } from 'react'
import { Lightbulb, X } from 'lucide-react'

const TIPS = {
  nutrition: {
    title: 'Suivi nutritionnel',
    steps: [
      'Règle tes objectifs dans l\'onglet "Objectifs" (calories, protéines...)',
      'Ajoute tes aliments depuis l\'onglet "Aliments"',
      'Consulte ton journal pour voir tes totaux du jour',
    ],
  },
  photos: {
    title: 'Photos de progression',
    steps: [
      'Prends une photo en début de chaque mois',
      'Même endroit, même position pour comparer',
      'Utilise la caméra ou importe une photo existante',
    ],
  },
  templates: {
    title: 'Templates de séance',
    steps: [
      'Crée un template en ajoutant des exercices depuis la liste',
      'Donne un nom à ton template (ex: "Séance dos")',
      'Lance-le en un clic depuis la liste des templates',
    ],
  },
  formcheck: {
    title: 'Analyse technique',
    steps: [
      'Sélectionne un exercice dans la liste',
      'Positionne ton téléphone pour te voir en entier',
      'Reçois des conseils pour améliorer ta forme',
    ],
  },
  warmup: {
    title: 'Échauffement & Retour au calme',
    steps: [
      'Lance chaque exercice un par un',
      'Un timer te guide sur la durée',
      'Termine tous les exercices pour une séance complète',
    ],
  },
}

export default function FeatureGuide({ type, storageKey }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(storageKey || `guide_${type}`) === '1' } catch { return false }
  })

  if (dismissed) return null

  const tip = TIPS[type]
  if (!tip) return null

  return (
    <div className="relative p-4 rounded-xl bg-lime/5 border border-lime/20 mb-4">
      <button
        onClick={() => {
          setDismissed(true)
          try { localStorage.setItem(storageKey || `guide_${type}`, '1') } catch {}
        }}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/5 text-white/30"
      >
        <X size={14} />
      </button>
      <div className="flex items-start gap-2 mb-2">
        <Lightbulb size={16} className="text-lime shrink-0 mt-0.5" />
        <p className="text-lime font-bold text-sm">{tip.title}</p>
      </div>
      <ul className="space-y-1">
        {tip.steps.map((s, i) => (
          <li key={i} className="text-white/60 text-xs flex items-start gap-2">
            <span className="text-lime font-bold">{i + 1}.</span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  )
}
