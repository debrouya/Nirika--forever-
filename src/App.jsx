import { useState, useEffect, useCallback } from 'react'
import useStore from './store/useStore'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import { SessionProvider } from './store/sessionContext'
import { LoginView, SignupView, ForgotPasswordView } from './components/Auth'
import { signOut, getSession, getProfile } from './services/supabaseService'
import AdminPanel from './components/AdminPanel'
import Layout from './components/Layout'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import Calisthenics from './components/Calisthenics'
import CustomExercisePanel from './components/CustomExercisePanel'
import Cardio from './components/Cardio'
import AICoach from './components/AICoach'
import Stats from './components/Stats'
import FitMatrix from './components/FitMatrix'
import Calendar from './components/Calendar'
import Programme from './components/Programme'
import SessionPage from './components/SessionPage'
import WorkoutDetail from './components/WorkoutDetail'
import Pricing from './components/Pricing'
import Paywall from './components/Paywall'
import SplashScreen from './components/SplashScreen'
import DailyWorkoutSession from './components/DailyWorkoutSession'
import WarmupCooldown from './components/WarmupCooldown'
import WorkoutTemplates from './components/WorkoutTemplates'
import NutritionTracker from './components/NutritionTracker'
import ProgressPhotos from './components/ProgressPhotos'
import FormCheck from './components/FormCheck'
import Toasts from './components/Toasts'
import Wiggley from './components/Wiggley'
import Onboarding, { useOnboarding } from './components/Onboarding'
import { useSubscription } from './hooks/useSubscription'

const ADMIN_EMAILS = ['jacques.frederic@icloud.com']

function checkAdmin(user) {
  if (!user?.email) return false
  return ADMIN_EMAILS.includes(user.email.toLowerCase())
}

export default function App() {
  const { currentView } = useStore()
  const [authView, setAuthView] = useState('login')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showPaywall, setShowPaywall] = useState(false)
  const [splashDone, setSplashDone] = useState(false)
  const { done: onboardingDone, complete: completeOnboarding } = useOnboarding()

  const supabaseReady = isSupabaseConfigured()
  const { subscription, isPremium } = useSubscription(user?.id)
  const isAdmin = checkAdmin(user) || profile?.role === 'admin'
  const userPerms = profile?.permissions || {}
  const hasAccess = isAdmin || isPremium
  const hasFeature = (key) => isAdmin || isPremium || userPerms[key] === true

  const handleSplashComplete = useCallback(() => setSplashDone(true), [])

  useEffect(() => {
    if (!supabaseReady) {
      setAuthLoading(false)
      return
    }

    getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user.id)
      } else {
        setAuthLoading(false)
      }
    })

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => authSub?.unsubscribe?.()
  }, [supabaseReady])

  const loadProfile = async (userId) => {
    try {
      const { data: { user: freshUser } } = await supabase.auth.getUser()
      if (freshUser) setUser(freshUser)

      let role = 'user'
      if (checkAdmin(freshUser)) {
        role = 'admin'
      } else {
        try {
          const { data: isAdminRpc } = await supabase.rpc('is_admin')
          if (isAdminRpc) role = 'admin'
        } catch (e) {}
      }

      let data = null
      try {
        const result = await getProfile(userId)
        data = result.data
      } catch (e) {}

      const profileData = data || {
        id: userId,
        email: freshUser?.email || '',
        full_name: freshUser?.user_metadata?.full_name || '',
        role: role,
      }
      profileData.role = role

      setProfile(profileData)
    } catch (e) {
      setProfile({
        id: userId,
        email: user?.email || '',
        full_name: '',
        role: checkAdmin(user) ? 'admin' : 'user',
      })
    }
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setProfile(null)
    setAuthView('login')
  }

  if (!splashDone) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/20 p-2.5">
            <img src="/logo.png" alt="Nirika" className="w-full h-full" />
          </div>
          <div className="w-10 h-10 border-2 border-dark-border border-t-lime rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!supabaseReady) {
    return (
      <SessionProvider>
      <Layout>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'profile' && <Profile />}
        {currentView === 'workout-detail' && <WorkoutDetail />}
        {currentView === 'calisthenics' && <Calisthenics isPremium={true} />}
        {currentView === 'cardio' && <Cardio />}
      {currentView === 'ai' && <AICoach isPremium={true} />}
        {currentView === 'stats' && <Stats isPremium={true} />}
        {currentView === 'fitmatrix' && <FitMatrix />}
        {currentView === 'calendar' && <Calendar />}
        {currentView === 'programme' && <Programme isPremium={true} />}
        {currentView === 'session' && <SessionPage />}
        {currentView === 'daily-workout' && <DailyWorkoutSession />}
        {currentView === 'warmup' && <WarmupCooldown />}
        {currentView === 'cooldown' && <WarmupCooldown type="cooldown" />}
        {currentView === 'templates' && <WorkoutTemplates />}
        {currentView === 'nutrition' && <NutritionTracker />}
        {currentView === 'photos' && <ProgressPhotos />}
        {currentView === 'form-check' && <FormCheck />}
        <Navigation active={currentView} onChange={(id) => useStore.getState().setCurrentView(id)} />
      </Layout>
      </SessionProvider>
    )
  }

  if (!user) {
    if (authView === 'signup') return <SignupView onSwitch={() => setAuthView('login')} />
    if (authView === 'forgot') return <ForgotPasswordView onBack={() => setAuthView('login')} />
    return <LoginView
      onSwitch={() => setAuthView('signup')}
      onForgot={() => setAuthView('forgot')}
    />
  }

  if (isAdmin && currentView === 'admin') {
    return <AdminPanel user={user} profile={profile} onLogout={() => useStore.getState().setCurrentView('dashboard')} />
  }

  if (currentView === 'custom-exercises') {
    return <CustomExercisePanel onClose={() => useStore.getState().setCurrentView('calisthenics')} />
  }

  return (
    <SessionProvider>
    <Layout>
        {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'profile' && <Profile user={user} onLogout={handleLogout} />}
      {currentView === 'workout-detail' && <WorkoutDetail />}
      {currentView === 'calisthenics' && <Calisthenics isPremium={hasAccess} onShowPaywall={() => !isAdmin && setShowPaywall(true)} />}
      {currentView === 'cardio' && <Cardio />}
      {currentView === 'ai' && <AICoach isPremium={hasFeature('chat_ia')} onShowPaywall={() => !isAdmin && setShowPaywall(true)} />}
      {currentView === 'stats' && <Stats />}
      {currentView === 'fitmatrix' && <FitMatrix />}
      {currentView === 'calendar' && <Calendar />}
      {currentView === 'programme' && <Programme user={user} isPremium={hasFeature('programmes')} />}
      {currentView === 'session' && <SessionPage />}
      {currentView === 'daily-workout' && <DailyWorkoutSession />}
      {currentView === 'warmup' && <WarmupCooldown />}
      {currentView === 'cooldown' && <WarmupCooldown type="cooldown" />}
      {currentView === 'templates' && <WorkoutTemplates />}
      {currentView === 'nutrition' && <NutritionTracker />}
      {currentView === 'photos' && <ProgressPhotos />}
      {currentView === 'form-check' && <FormCheck />}
      {currentView === 'pricing' && <Pricing subscription={subscription} />}
      {!['dashboard','profile','workout-detail','calisthenics','cardio','ai','stats','fitmatrix','calendar','programme','session','daily-workout','warmup','cooldown','templates','nutrition','photos','form-check','pricing','admin'].includes(currentView) && <Dashboard />}
      <Navigation active={currentView} onChange={(id) => useStore.getState().setCurrentView(id)} isAdmin={isAdmin} userRole={profile?.role} onAdminClick={() => useStore.getState().setCurrentView('admin')} onLogout={handleLogout} onPricingClick={() => useStore.getState().setCurrentView('pricing')} />
      <Wiggley />
      {showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}
      {!onboardingDone && <Onboarding onComplete={completeOnboarding} />}
      <Toasts />
    </Layout>
    </SessionProvider>
  )
}
