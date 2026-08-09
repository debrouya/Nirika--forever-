import { useMemo, useCallback, memo } from 'react'
import useCockpitGestures from '../../hooks/useCockpitGestures'
import './Cockpit.css'

const SIZE = 280
const CENTER = SIZE / 2
const R = { outer: 120, mid: 100, inner: 80 }
const circ = (r) => 2 * Math.PI * r
const clamp = (v, min, max) => isNaN(v) ? 0 : Math.min(Math.max(v, min), max)

const COLORS = {
  default: '#7ED957',
  program: '#60a5fa',
  cardio: '#f97316',
  exercise: '#7ED957',
  coach: '#a855f7',
}

const CENTER_CONTENT = {
  program: { label: 'PROGRAM', sub: '/30' },
  cardio: { label: 'RHYTHM', sub: 'bpm' },
  exercise: { label: 'SET', sub: 'reps' },
  coach: { label: 'ANALYSE', sub: '' },
  default: { label: 'PRÊT', sub: '' },
}

function CockpitCore({
  mode = 'default',
  streak = 0,
  bpm = 0,
  reps = 0,
  setNumber = 1,
  programDay = 1,
  programProgress = 0,
  onTap,
  onSwipeLeft,
  onSwipeRight,
  onHold,
}) {
  const color = COLORS[mode] || COLORS.default
  const gestures = useCockpitGestures({ onTap, onSwipeLeft, onSwipeRight, onHold })

  const outerOffset = useMemo(() => circ(R.outer) * (1 - clamp(streak / 30, 0, 1)), [streak])

  const midProgress = useMemo(() => {
    if (mode === 'program') return clamp(programProgress, 0, 1)
    if (mode === 'cardio') return clamp(bpm / 180, 0, 1)
    return 0
  }, [mode, programProgress, bpm])
  const midOffset = useMemo(() => circ(R.mid) * (1 - midProgress), [midProgress])

  const innerProgress = useMemo(() => {
    if (mode === 'exercise') return clamp(reps / 20, 0, 1)
    if (mode === 'cardio') return clamp(bpm / 180, 0, 1)
    return 0
  }, [mode, reps, bpm])
  const innerOffset = useMemo(() => circ(R.inner) * (1 - innerProgress), [innerProgress])

  const center = useMemo(() => {
    const cfg = CENTER_CONTENT[mode] || CENTER_CONTENT.default
    switch (mode) {
      case 'program': return { ...cfg, value: programDay }
      case 'cardio': return { ...cfg, value: bpm }
      case 'exercise': return { ...cfg, value: reps }
      case 'coach': return { ...cfg, value: '...' }
      default: return { ...cfg, value: 'GO' }
    }
  }, [mode, programDay, bpm, reps])

  const rings = useMemo(() => [
    { key: 'outer', r: R.outer, offset: outerOffset, sw: 4 },
    { key: 'mid', r: R.mid, offset: midOffset, sw: 3 },
    { key: 'inner', r: R.inner, offset: innerOffset, sw: 3 },
  ], [outerOffset, midOffset, innerOffset])

  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.count('Cockpit render')
  }

  return (
    <div className={`cockpit ${mode ? `mode-${mode}` : ''}`} {...gestures}>
      <div className="c-glow" style={{ '--glow-color': `${color}10` }} />

      {mode === 'coach' && (
        <><div className="c-particle" /><div className="c-particle" /><div className="c-particle" /></>
      )}

      <svg width={SIZE} height={SIZE} shapeRendering="geometricPrecision">
        {rings.map(({ key, r, offset, sw }) => (
          <g key={key}>
            <circle cx={CENTER} cy={CENTER} r={r} stroke="rgb(255,255,255)" strokeOpacity="0.04" strokeWidth="2" fill="none" />
            <circle cx={CENTER} cy={CENTER} r={r} stroke={color} strokeWidth={sw} fill="none"
              strokeDasharray={circ(r)} strokeDashoffset={offset} className={`ring ring-${key}`}
              style={{ filter: `drop-shadow(0 0 8px ${color}30)`, transition: 'stroke-dashoffset 1.2s ease' }} />
          </g>
        ))}
      </svg>

      <div className="c-core">
        <span className="c-core-label">{center.label}</span>
        <span className="c-core-value">{center.value}</span>
        <span className="c-core-sub">{center.sub}</span>
      </div>

      <div className="c-swipe-hint">← SWIPE →</div>
    </div>
  )
}

export default memo(CockpitCore)
