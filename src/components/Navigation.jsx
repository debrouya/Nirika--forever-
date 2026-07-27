import { useState, useRef, useEffect, useCallback } from 'react'
import {
  LayoutDashboard,
  CalendarRange,
  Dumbbell,
  HeartPulse,
  MessageSquareMore,
  CalendarDays,
  BarChart3,
  Shield,
  LogOut,
  Crown,
} from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Board', icon: LayoutDashboard },
  { id: 'programme', label: 'Programme', icon: CalendarRange },
  { id: 'calisthenics', label: 'Exercices', icon: Dumbbell },
  { id: 'cardio', label: 'Cardio', icon: HeartPulse },
  { id: 'ai', label: 'Coach', icon: MessageSquareMore },
  { id: 'calendar', label: 'Calendrier', icon: CalendarDays },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
]

export default function Navigation({ active, onChange, userRole, isAdmin, onAdminClick, onLogout, onPricingClick }) {
  const [visible, setVisible] = useState(true)
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 })
  const [popId, setPopId] = useState(null)
  const lastScrollY = useRef(0)
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
    updatePill(active)
    const handleResize = () => updatePill(active)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [active, updatePill])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      if (y > lastScrollY.current && y > 80) {
        setVisible(false)
      } else {
        setVisible(true)
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleChange = (id) => {
    setPopId(id)
    setTimeout(() => setPopId(null), 300)
    onChange(id)
  }

  return (
    <div
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-3 pb-3 transition-transform duration-300 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <nav
        ref={containerRef}
        className="glass-heavy rounded-2xl px-2 py-2 flex items-center gap-1 relative"
      >
        <div
          className="absolute top-1 h-[calc(100%-0.5rem)] rounded-xl bg-white/10 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ left: pillStyle.left, width: pillStyle.width }}
        />

        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.id
          const isPop = popId === tab.id
          return (
            <button
              key={tab.id}
              ref={(el) => (btnRefs.current[tab.id] = el)}
              onClick={() => handleChange(tab.id)}
              className={`relative z-10 flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-white/40'
              }`}
            >
              <div
                className={`transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isPop ? 'scale-125' : isActive ? 'scale-110' : 'scale-100'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className="text-[10px] mt-0.5 font-medium leading-none">{tab.label}</span>
            </button>
          )
        })}

        {onLogout && (
          <>
            <div className="w-px h-8 bg-white/10 mx-1 self-center" />
            <button
              onClick={onPricingClick}
              className="relative z-10 flex flex-col items-center justify-center py-2 px-2 rounded-xl text-amber-400/60 hover:text-amber-400 transition-colors"
            >
              <Crown size={20} strokeWidth={1.5} />
              <span className="text-[10px] mt-0.5 font-medium">Premium</span>
            </button>
            {isAdmin && (
              <button
                onClick={onAdminClick}
                className="relative z-10 flex flex-col items-center justify-center py-2 px-2 rounded-xl text-white/50 hover:text-mint-400 transition-colors"
              >
                <Shield size={20} strokeWidth={1.5} />
                <span className="text-[10px] mt-0.5 font-medium">Admin</span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="relative z-10 flex flex-col items-center justify-center py-2 px-2 rounded-xl text-white/50 hover:text-red-400 transition-colors"
            >
              <LogOut size={20} strokeWidth={1.5} />
              <span className="text-[10px] mt-0.5 font-medium">Quitter</span>
            </button>
          </>
        )}
      </nav>
    </div>
  )
}
