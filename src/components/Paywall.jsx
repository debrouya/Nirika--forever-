import { useState } from 'react'
import { Crown, X, Check, Zap, BarChart3, Brain, Sparkles } from 'lucide-react'
import { createCheckoutSession } from '../services/supabaseService'

export default function Paywall({ onClose, onUpgrade }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpgrade = async (period) => {
    setLoading(true)
    setError(null)

    const priceId = period === 'monthly'
      ? import.meta.env.VITE_STRIPE_PRICE_MONTHLY
      : import.meta.env.VITE_STRIPE_PRICE_YEARLY

    try {
      const result = await createCheckoutSession(priceId)
      if (result.url) {
        window.location.href = result.url
      } else if (result.error) {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Erreur inconnue')
      }
    } catch {
      setError('Erreur lors de la connexion à Stripe')
    }
    setLoading(false)
  }

  const features = [
    { icon: Brain, text: 'NIRIKA Coach illimité', free: false, premium: true },
    { icon: BarChart3, text: 'Stats avancées & tendances', free: false, premium: true },
    { icon: Zap, text: '15+ programmes d\'entraînement', free: '3', premium: 'Illimité' },
    { icon: Sparkles, text: 'Tous les exercices (69+)', free: '20', premium: '69+' },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative glass-heavy rounded-3xl p-6 w-full max-w-sm mx-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
            <Crown size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Passer à Premium</h2>
          <p className="text-sm text-white/50">Débloque tout le potentiel de NIRIKA</p>
        </div>

        <div className="space-y-3 mb-6">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <f.icon size={16} className="text-[#10B981]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white/90">{f.text}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/30 line-through">{typeof f.free === 'string' ? f.free : '—'}</span>
                <Check size={14} className="text-[#10B981]" />
                <span className="text-[#10B981] font-medium">{typeof f.premium === 'string' ? f.premium : '✓'}</span>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-400 text-center mb-4">{error}</p>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleUpgrade('monthly')}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Mensuel — 4,99€/mois'}
          </button>

          <button
            onClick={() => handleUpgrade('yearly')}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors disabled:opacity-50 relative"
          >
            {loading ? 'Chargement...' : 'Annuel — 39,99€/an'}
            <span className="absolute -top-2 right-4 px-2 py-0.5 bg-[#10B981] text-[10px] text-white font-bold rounded-full">
              -33%
            </span>
          </button>
        </div>

        <p className="text-[10px] text-white/30 text-center mt-4">
          Annulation possible à tout moment. Paiement sécurisé par Stripe.
        </p>
      </div>
    </div>
  )
}
