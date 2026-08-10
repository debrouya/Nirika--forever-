import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Home,
  Play,
  CalendarDays,
  BarChart3,
  Menu,
  X,
  CalendarRange,
  MessageSquareMore,
  Shield,
  LogOut,
  Crown,
  Plus,
  FileText,
  Camera,
} from 'lucide-react'

const MAIN_TABS = [
  { id: 'dashboard', label: 'Accueil', icon: Home },
  { id: 'session', label: 'Séance', icon: Play },
]

const CATEGORIES = [
  {
    label: null,
    items: [
      { id: 'ai', label: 'Coach NIRIKA', icon: MessageSquareMore },
      { id: 'programme', label: 'Programme', icon: CalendarRange },
      { id: 'stats', label: 'Performances', icon: BarChart3 },
      { id: 'calendar', label: 'Calendrier', icon: CalendarDays },
      { id: 'templates', label: 'Templates séance', icon: FileText },
      { id: 'custom-exercises', label: 'Mes exercices', icon: Plus },
    ],
  },
  {
    label: 'Bien-être',
    items: [
      { id: 'photos', label: 'Photos progression', icon: Camera },
      { id: 'form-check', label: 'Analyse technique', icon: Shield },
    ],
  },
]

export default function Navigation({ active, onChange, userRole, isAdmin, onAdminClick, onLogout, onPricingClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 })
  const btnRefs = useRef({})
  const containerRef = useRef(null)

  const updatePill = useCallback((id) => {
    const btn = btnRefs.current[id]
    const container = containerRef.current
    if (!btn || !container) return
    const btnRect = btn.getBoundingClientRect()
    const contRect = container.getBoundingClientRect()
    setPillStyle({
      left: btnRect.left - contRect.left,
      width: btnRect.width,
    })
  }, [])

  useEffect(() => {
    const id = menuOpen ? null : active
    if (id) updatePill(id)
  }, [active, menuOpen, updatePill])

  const handleMainTab = (id) => {
    setMenuOpen(false)
    onChange(id)
  }

  const handleMenuAction = (id) => {
    setMenuOpen(false)
    onChange(id)
  }

  return (
    <>
      {/* Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0" onClick={() => setMenuOpen(false)} style={{zIndex:100,willChange:'transform'}}>
          <div className="absolute inset-0" style={{background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',WebkitBackdropFilter:'blur(4px)',transform:'translateZ(0)'}} />
          <div
            className="absolute bottom-20 left-3 right-3 rounded-2xl p-4 space-y-1 animate-fade-in-up max-h-[50vh] overflow-y-auto"
            style={{background:'rgba(20,20,30,.92)',backdropFilter:'blur(50px)',WebkitBackdropFilter:'blur(50px)',border:'1px solid rgba(255,255,255,.08)',transform:'translateZ(0)'}}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-muted text-xs uppercase tracking-wide font-medium">Menu</span>
              <button onClick={() => setMenuOpen(false)} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
                <X size={16} className="text-muted" />
              </button>
            </div>

            {CATEGORIES.map((cat, ci) => (
              <div key={ci}>
                {cat.label && (
                  <p className="text-muted text-[10px] uppercase tracking-wider font-medium px-3 py-1.5">{cat.label}</p>
                )}
                {cat.items.map((item) => {
                  const Icon = item.icon
                  const onboardAttr = item.id === 'custom-exercises' ? { 'data-onboard': 'custom-exercises' } : {}
                  return (
                    <button
                      key={item.id}
                      {...onboardAttr}
                      onClick={() => handleMenuAction(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all active:scale-[0.98] text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-dark-bg flex items-center justify-center border border-dark-border">
                        <Icon size={18} className="text-muted" />
                      </div>
                      <span className="text-white text-sm font-medium">{item.label}</span>
                    </button>
                  )
                })}
                {ci < CATEGORIES.length - 1 && <div className="border-t border-dark-border my-2" />}
              </div>
            ))}

            <button
              data-onboard="premium"
              onClick={() => { setMenuOpen(false); onPricingClick?.() }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-lime/5 transition-all active:scale-[0.98] text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-lime/10 flex items-center justify-center border border-lime/20">
                <Crown size={18} className="text-lime" />
              </div>
              <span className="text-lime text-sm font-medium">Premium</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => { setMenuOpen(false); onAdminClick?.() }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-dark-bg flex items-center justify-center border border-dark-border">
                  <Shield size={18} className="text-muted" />
                </div>
                <span className="text-white text-sm font-medium">Admin</span>
              </button>
            )}

            <a
              href="/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all active:scale-[0.98] text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-dark-border">
                <FileText size={18} className="text-muted" />
              </div>
              <span className="text-muted text-sm font-medium">Confidentialité</span>
            </a>

            {onLogout && (
              <button
                onClick={() => { setMenuOpen(false); onLogout() }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/5 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <LogOut size={18} className="text-red-400" />
                </div>
                <span className="text-red-400 text-sm font-medium">Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-3" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <nav
          ref={containerRef}
          className="rounded-2xl px-2 py-2 flex items-center relative"
          style={{background:'rgba(255,255,255,.06)',backdropFilter:'blur(60px)',WebkitBackdropFilter:'blur(60px)',border:'1px solid rgba(255,255,255,.04)'}}
        >
          {!menuOpen && (
            <div
              className="absolute top-1 h-[calc(100%-0.5rem)] rounded-xl bg-lime/15 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{ left: pillStyle.left, width: pillStyle.width }}
            />
          )}

          {MAIN_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                ref={(el) => (btnRefs.current[tab.id] = el)}
                onClick={() => handleMainTab(tab.id)}
                className={`relative z-10 flex flex-col items-center justify-center flex-1 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-lime scale-105' : 'text-muted hover:text-white/60'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
                {isActive && (
                  <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-lime" />
                )}
              </button>
            )
          })}

          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`relative z-10 flex flex-col items-center justify-center flex-1 py-2.5 rounded-xl transition-all duration-200 ${
              menuOpen ? 'text-lime scale-105' : 'text-muted hover:text-white/60'
            }`}
          >
            {menuOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={1.5} />}
            <span className="text-[10px] mt-0.5 font-medium">Menu</span>
            {menuOpen && (
              <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-lime" />
            )}
          </button>
        </nav>
      </div>
    </>
  )
}
