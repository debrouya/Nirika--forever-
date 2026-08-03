import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { signIn, signUp, resetPassword } from '../services/supabaseService'
import GlassCard from './GlassCard'

function InputField({ icon: Icon, type: inputType, placeholder, value, onChange, rightSlot }) {
  return (
    <div className="relative">
      <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white placeholder-white/30 text-sm focus:outline-none focus:border-lime/50 focus:ring-1 focus:ring-lime/20 transition-all"
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  )
}

export function LoginView({ onSwitch, onForgot }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await signIn(email, password)
      if (authError) setError(authError.message)
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[100dvh] px-4">
      <GlassCard className="w-full max-w-sm p-6 space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Connexion</h2>
          <p className="text-white/40 text-sm mt-1">Connecte-toi à ton compte</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <InputField
            icon={Mail}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            icon={Lock}
            type={showPw ? 'text' : 'password'}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightSlot={
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-white/30 hover:text-white/60">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {error && (
            <p className="text-red-400 text-xs text-center bg-red-400/10 rounded-lg py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-lime hover:brightness-110 disabled:opacity-40 text-black font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <button onClick={onForgot} className="w-full text-center text-white/40 text-xs hover:text-white/60 transition-colors">
          Mot de passe oublié ?
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-dark-card px-3 text-white/30">ou</span></div>
        </div>

        <button
          onClick={onSwitch}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 text-sm font-medium transition-all"
        >
          Créer un compte
        </button>
      </GlassCard>
    </div>
  )
}

export function SignupView({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await signUp(email, password)
      if (authError) {
        setError(authError.message)
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] px-4">
        <GlassCard className="w-full max-w-sm p-6 text-center space-y-4">
          <CheckCircle2 size={48} className="mx-auto text-lime" />
          <h2 className="text-xl font-bold text-white">Vérifie ta boîte mail</h2>
          <p className="text-white/40 text-sm">
            Un lien de confirmation a été envoyé à <span className="text-white/60">{email}</span>.
          </p>
          <button
            onClick={onSwitch}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 text-sm font-medium transition-all"
          >
            Retour à la connexion
          </button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[100dvh] px-4">
      <GlassCard className="w-full max-w-sm p-6 space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Créer un compte</h2>
          <p className="text-white/40 text-sm mt-1">Rejoins Nirika For Ever</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <InputField
            icon={Mail}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            icon={Lock}
            type={showPw ? 'text' : 'password'}
            placeholder="Mot de passe (6+ caractères)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightSlot={
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-white/30 hover:text-white/60">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {error && (
            <p className="text-red-400 text-xs text-center bg-red-400/10 rounded-lg py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-lime hover:brightness-110 disabled:opacity-40 text-black font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Création...' : "S'inscrire"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-dark-card px-3 text-white/30">ou</span></div>
        </div>

        <button
          onClick={onSwitch}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 text-sm font-medium transition-all"
        >
          Déjà un compte ? Se connecter
        </button>
      </GlassCard>
    </div>
  )
}

export function ForgotPasswordView({ onBack }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await resetPassword(email)
      if (authError) {
        setError(authError.message)
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] px-4">
        <GlassCard className="w-full max-w-sm p-6 text-center space-y-4">
          <CheckCircle2 size={48} className="mx-auto text-lime" />
          <h2 className="text-xl font-bold text-white">Email envoyé</h2>
          <p className="text-white/40 text-sm">
            Vérifie ta boîte mail pour réinitialiser ton mot de passe.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 text-sm font-medium transition-all"
          >
            Retour à la connexion
          </button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[100dvh] px-4">
      <GlassCard className="w-full max-w-sm p-6 space-y-5">
        <div>
          <button onClick={onBack} className="text-white/40 hover:text-white/70 transition-colors mb-3 flex items-center gap-1 text-sm">
            <ArrowLeft size={14} /> Retour
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Mot de passe oublié</h2>
            <p className="text-white/40 text-sm mt-1">On t'envoie un lien de réinitialisation</p>
          </div>
        </div>

        <form onSubmit={handleReset} className="space-y-3">
          <InputField
            icon={Mail}
            type="email"
            placeholder="Ton email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && (
            <p className="text-red-400 text-xs text-center bg-red-400/10 rounded-lg py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-lime hover:brightness-110 disabled:opacity-40 text-black font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>
      </GlassCard>
    </div>
  )
}
