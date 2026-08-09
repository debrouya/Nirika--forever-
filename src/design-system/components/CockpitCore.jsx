import { useMemo, useRef, useCallback } from 'react'
import './Cockpit.css'

const R = { outer: 120, mid: 100, inner: 80 }
const CIRC = { outer: 2*Math.PI*R.outer, mid: 2*Math.PI*R.mid, inner: 2*Math.PI*R.inner }

const MODE_CONFIG = {
  default:  { icon: '▶', color: '#7ED957', glow: 'rgba(126,217,87,.06)', outer: .35, mid: .4, inner: .5, className: '' },
  program:  { icon: '📋', color: '#60a5fa', glow: 'rgba(96,165,250,.05)', outer: .5, mid: .3, inner: .2, className: '' },
  cardio:   { icon: '❤️', color: '#f97316', glow: 'rgba(249,115,22,.05)', outer: .2, mid: .5, inner: .3, className: 'c-mode-cardio' },
  exercise: { icon: '💪', color: '#7ED957', glow: 'rgba(126,217,87,.08)', outer: .1, mid: .2, inner: .7, className: 'c-mode-exercise' },
  coach:    { icon: '✨', color: '#c084fc', glow: 'rgba(192,132,252,.05)', outer: .3, mid: .2, inner: .4, className: '' },
}

export default function CockpitCore({
  mode = 'default',
  streak = 0,
  activeSession,
  programProgress = 0,
  cardioIntensity = 0,
  onTap,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
}) {
  const touchStart = useRef({ x: 0, y: 0, time: 0 })
  const longPressTimer = useRef(null)

  const config = MODE_CONFIG[mode] || MODE_CONFIG.default

  const offsets = useMemo(() => ({
    outer: CIRC.outer - (Math.min(100, (streak/30)*100) / 100) * CIRC.outer,
    mid: CIRC.mid - (programProgress * CIRC.mid),
    inner: CIRC.inner - (cardioIntensity * CIRC.inner),
  }), [streak, programProgress, cardioIntensity])

  const handleTouchStart = useCallback((e) => {
    const t = e.touches?.[0] || e
    touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() }
    longPressTimer.current = setTimeout(() => onLongPress?.(), 600)
  }, [onLongPress])

  const handleTouchEnd = useCallback((e) => {
    clearTimeout(longPressTimer.current)
    const t = e.changedTouches?.[0] || e
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    const dt = Date.now() - touchStart.current.time

    if (dt > 500) return
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      dx > 0 ? onSwipeRight?.() : onSwipeLeft?.()
      return
    }
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
      onTap?.()
    }
  }, [onTap, onSwipeLeft, onSwipeRight])

  return (
    <div
      className={`cockpit ${config.className}`}
      style={{ width: 280, height: 280 }}
      onClick={onTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Glow */}
      <div className="c-glow" style={{ '--glow-color': config.glow }} />

      {/* Particles (coach mode) */}
      {mode === 'coach' && (
        <>
          <div className="c-particle" />
          <div className="c-particle" />
          <div className="c-particle" />
        </>
      )}

      {/* SVG Rings */}
      <svg viewBox="0 0 280 280" width="280" height="280">
        {/* Outer — streak */}
        <circle cx="140" cy="140" r={R.outer} className="c-ring c-ring-outer" stroke="rgba(255,255,255,.04)" strokeDasharray={CIRC.outer} strokeDashoffset="0" />
        <circle cx="140" cy="140" r={R.outer} className="c-ring c-ring-outer-active" stroke={config.color}
          strokeDasharray={CIRC.outer} strokeDashoffset={offsets.outer}
          style={{ '--glow': config.glow }} />

        {/* Mid — program / session */}
        <circle cx="140" cy="140" r={R.mid} className="c-ring c-ring-mid" stroke="rgba(255,255,255,.05)" strokeDasharray={CIRC.mid} strokeDashoffset="0" />
        <circle cx="140" cy="140" r={R.mid} className="c-ring c-ring-mid-active" stroke={config.color}
          strokeDasharray={CIRC.mid} strokeDashoffset={offsets.mid}
          style={{ '--glow': config.glow }} />

        {/* Inner — real-time */}
        <circle cx="140" cy="140" r={R.inner} className="c-ring c-ring-inner" stroke="rgba(255,255,255,.06)" strokeDasharray={CIRC.inner} strokeDashoffset="0" />
        <circle cx="140" cy="140" r={R.inner} className="c-ring c-ring-inner-active" stroke={config.color}
          strokeDasharray={CIRC.inner} strokeDashoffset={offsets.inner}
          style={{ '--glow': config.glow }} />
      </svg>

      {/* Core Center */}
      <div className="c-core">
        <span className="c-core-icon">{config.icon}</span>
        <span className="c-core-main">
          {mode === 'default' && (activeSession ? 'REPRENDRE' : 'DÉMARRER')}
          {mode === 'program' && `JOUR ${Math.ceil(programProgress * 30)}/30`}
          {mode === 'cardio' && 'RHYTHM'}
          {mode === 'exercise' && 'SET'}
          {mode === 'coach' && 'ANALYSE'}
        </span>
        <span className="c-core-sub">
          {mode === 'default' && (activeSession ? activeSession.exerciseName : 'une séance')}
          {mode === 'program' && `${Math.round(programProgress * 100)}%`}
          {mode === 'cardio' && `${Math.round(cardioIntensity * 100)} bpm`}
          {mode === 'exercise' && '3 séries'}
          {mode === 'coach' && 'en cours...'}
        </span>
      </div>

      {/* Swipe hint */}
      <div className="c-swipe-hint">← SWIPE →</div>
    </div>
  )
}
