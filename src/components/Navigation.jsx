import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Home,
  CalendarDays,
  BarChart3,
  Menu,
  X,
  LayoutDashboard,
  CalendarRange,
  Dumbbell,
  HeartPulse,
  MessageSquareMore,
  Shield,
  LogOut,
  Crown,
} from 'lucide-react'

const MAIN_TABS = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
]

const MENU_ITEMS = [
  { id: 'programme', label: 'Programme', icon: CalendarRange },
  { id: 'calisthenics', label: 'Exercices', icon: Dumbbell },
  { id: 'cardio', label: 'Cardio', icon: HeartPulse },
  { id: 'ai', label: 'Coach IA', icon: MessageSquareMore },
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
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute bottom-20 left-3 right-3 bg-dark-card rounded-2xl p-4 space-y-1 animate-fade-in-up border border-dark-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-muted text-xs uppercase tracking-wide">Menu</span>
              <button onClick={() => setMenuOpen(false)}>
                <X size={18} className="text-muted" />
              </button>
            </div>

            {MENU_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuAction(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <Icon size={20} className="text-muted" />
                  <span className="text-white text-sm font-medium">{item.label}</span>
                </button>
              )
            })}

            <div className="border-t border-dark-border my-2" />

            <button
              onClick={() => { setMenuOpen(false); onPricingClick?.() }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
            >
              <Crown size={20} className="text-lime" />
              <span className="text-lime text-sm font-medium">Premium</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => { setMenuOpen(false); onAdminClick?.() }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <Shield size={20} className="text-muted" />
                <span className="text-white text-sm font-medium">Admin</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={() => { setMenuOpen(false); onLogout() }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <LogOut size={20} className="text-red-400" />
                <span className="text-red-400 text-sm font-medium">Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-3 pb-3">
        <nav
          ref={containerRef}
          className="bg-dark-card rounded-2xl px-2 py-2 flex items-center relative border border-dark-border"
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
                className={`relative z-10 flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition-colors duration-200 ${
                  isActive ? 'text-lime' : 'text-muted'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
              </button>
            )
          })}

          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`relative z-10 flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition-colors duration-200 ${
              menuOpen ? 'text-lime' : 'text-muted'
            }`}
          >
            {menuOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={1.5} />}
            <span className="text-[10px] mt-0.5 font-medium">Menu</span>
          </button>
        </nav>
      </div>
    </>
  )
}
