import { useState } from 'react'
import './GlassNavigation.css'

export default function GlassNavigation({ tabs = [], activeTab, onTabChange, menuItems = [], onMenuItemClick, fab }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const visibleTabs = tabs.slice(0, 5)

  return (
    <>
      {menuOpen && (
        <div className="nirika-nav-menu" onClick={() => setMenuOpen(false)}>
          <div className="nirika-nav-menu-panel" onClick={e => e.stopPropagation()}>
            {menuItems.map((item, i) => (
              <button
                key={item.id || i}
                className="nirika-nav-menu-item"
                onClick={() => { setMenuOpen(false); onMenuItemClick?.(item.id) }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {fab}

      <nav className="nirika-nav">
        {visibleTabs.map((tab, i) => {
          const active = tab.id === activeTab
          const handleClick = () => {
            if (tab.id === 'menu') { setMenuOpen(true); return }
            onTabChange?.(tab.id)
          }
          return (
            <button
              key={tab.id || i}
              className={`nirika-nav-tab ${active ? 'nirika-nav-tab-active' : ''}`}
              onClick={handleClick}
            >
              <span className="nirika-nav-icon">{tab.icon}</span>
              {tab.label && <span className="nirika-nav-label">{tab.label}</span>}
            </button>
          )
        })}
      </nav>
    </>
  )
}
