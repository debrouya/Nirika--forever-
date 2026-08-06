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
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute bottom-20 left-3 right-3 rounded-2xl p-4 space-y-1 animate-fade-in-up max-h-[50vh] overflow-y-auto"
            style={{background:'rgba(20,20,30,.85)',backdropFilter:'blur(50px)',WebkitBackdropFilter:'blur(50px)',border:'1px solid rgba(255,255,255,.06)'}}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,padding:'0 4px'}}>
              <span style={{fontSize:11,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:1,fontWeight:500}}>Menu</span>
              <button onClick={()=>setMenuOpen(false)} style={{padding:4,borderRadius:8,background:'none',border:'none',cursor:'pointer'}}>
                <X size={16} style={{color:'rgba(255,255,255,.4)'}} />
              </button>
            </div>

            {CATEGORIES.map((cat, ci) => (
              <div key={ci}>
                {cat.label && (
                  <p style={{fontSize:10,color:'rgba(255,255,255,.2)',textTransform:'uppercase',letterSpacing:1,fontWeight:500,padding:'4px 12px'}}>{cat.label}</p>
                )}
                {cat.items.map((item) => {
                  const Icon = item.icon
                  const onboardAttr = item.id === 'custom-exercises' ? { 'data-onboard': 'custom-exercises' } : {}
                  return (
                    <button
                      key={item.id}
                      {...onboardAttr}
                      onClick={() => handleMenuAction(item.id)}
                      style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px',borderRadius:14,border:'none',background:'transparent',cursor:'pointer',textAlign:'left',fontFamily:'inherit',color:'#fff'}}
                    >
                      <div style={{width:36,height:36,borderRadius:14,background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <Icon size={18} style={{color:'rgba(255,255,255,.5)'}} />
                      </div>
                      <span style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,.8)'}}>{item.label}</span>
                    </button>
                  )
                })}
                {ci < CATEGORIES.length - 1 && <div style={{height:1,background:'rgba(255,255,255,.04)',margin:'8px 0'}} />}
              </div>
            ))}

            <button
              data-onboard="premium"
              onClick={() => { setMenuOpen(false); onPricingClick?.() }}
              style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px',borderRadius:14,border:'none',background:'transparent',cursor:'pointer',textAlign:'left',fontFamily:'inherit',color:'#fff'}}
            >
              <div style={{width:36,height:36,borderRadius:14,background:'rgba(126,217,87,.08)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Crown size={18} style={{color:'#7ED957'}} />
              </div>
              <span style={{fontSize:13,fontWeight:500,color:'#7ED957'}}>Premium</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => { setMenuOpen(false); onAdminClick?.() }}
                style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px',borderRadius:14,border:'none',background:'transparent',cursor:'pointer',textAlign:'left',fontFamily:'inherit',color:'#fff'}}
              >
                <div style={{width:36,height:36,borderRadius:14,background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Shield size={18} style={{color:'rgba(255,255,255,.5)'}} />
                </div>
                <span style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,.8)'}}>Admin</span>
              </button>
            )}

            <a href="/privacy.html" target="_blank" rel="noopener noreferrer"
              style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px',borderRadius:14,textDecoration:'none'}}>
              <div style={{width:36,height:36,borderRadius:14,background:'rgba(255,255,255,.04)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <FileText size={18} style={{color:'rgba(255,255,255,.3)'}} />
              </div>
              <span style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,.4)'}}>Confidentialité</span>
            </a>

            {onLogout && (
              <button onClick={()=>{setMenuOpen(false);onLogout()}}
                style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px',borderRadius:14,border:'none',background:'transparent',cursor:'pointer',textAlign:'left',fontFamily:'inherit'}}>
                <div style={{width:36,height:36,borderRadius:14,background:'rgba(239,68,68,.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <LogOut size={18} style={{color:'#f87171'}} />
                </div>
                <span style={{fontSize:13,fontWeight:500,color:'#f87171'}}>Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-3" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
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
