import { useState } from 'react'
import { Crown, Check, Zap, BarChart3, Brain, Sparkles, ArrowLeft, Shield } from 'lucide-react'
import { createCheckoutSession } from '../services/supabaseService'
import useStore from '../store/useStore'

export default function Pricing({ subscription }) {
  const setCurrentView = useStore((s) => s.setCurrentView)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('yearly')

  const isPremium = subscription?.tier === 'premium'

  const features = [
    { icon: Brain, text: 'NIRIKA Coach', desc: 'Conseils personnalisés', free: false, premium: true },
    { icon: BarChart3, text: 'Stats avancées', desc: 'Tendances, records, analyse long terme', free: false, premium: true },
    { icon: Zap, text: 'Programmes', desc: 'Accès complet à la bibliothèque', free: '3 max', premium: '15+' },
    { icon: Sparkles, text: 'Exercices', desc: 'Catalogue complet avec vidéos', free: '20', premium: '69+' },
    { icon: Shield, text: 'Support prioritaire', desc: 'Assistance dédiée', free: false, premium: true },
  ]

  const handleUpgrade = async () => {
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
        setError(result.error)
      }
    } catch {
      setError('Erreur lors de la connexion à Stripe')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#0F1A1E] to-[#1A2B34] px-4 py-8">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Retour</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
            <Crown size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">NIRIKA Premium</h1>
          <p className="text-sm text-white/50">Débloque tout le potentiel de ton entraînement</p>
        </div>

        <div className="glass rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Ce que tu débloques</h3>
          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <f.icon size={18} className="text-[#10B981]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{f.text}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{f.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
                  <span className="text-white/30 line-through">{typeof f.free === 'string' ? f.free : '—'}</span>
                  <Check size={12} className="text-[#10B981]" />
                  <span className="text-[#10B981] font-medium">{typeof f.premium === 'string' ? f.premium : '✓'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isPremium ? (
          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#10B981]/20 flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-[#10B981]" />
            </div>
            <p className="text-white font-semibold mb-1">Tu es déjà Premium</p>
            <p className="text-xs text-white/40 mb-4">
              Profite de toutes les fonctionnalités !
            </p>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="py-2 px-4 rounded-xl bg-white/5 text-white text-sm hover:bg-white/10 transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        ) : (
          <>
            <div className="glass rounded-2xl p-5 mb-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    period === 'monthly'
                      ? 'bg-[#10B981] text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setPeriod('yearly')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                    period === 'yearly'
                      ? 'bg-[#10B981] text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  Annuel
                  <span className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-amber-500 text-[9px] text-white font-bold rounded-full">
                    -39%
                  </span>
                </button>
              </div>

              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-white">
                  {period === 'monthly' ? '7,99€' : '5,83€'}
                </span>
                <span className="text-sm text-white/40">
                  /mois
                </span>
                {period === 'yearly' && (
                  <p className="text-xs text-white/30 mt-1">69,99€ facturé annuellement</p>
                )}
              </div>

              {error && (
                <p className="text-xs text-red-400 text-center mb-3">{error}</p>
              )}

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Chargement...' : 'Commencer maintenant'}
              </button>
            </div>

            <p className="text-[10px] text-white/30 text-center">
              Annulation possible à tout moment. Essai gratuit de 7 jours.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
