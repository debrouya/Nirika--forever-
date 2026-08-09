import { useMemo } from 'react'
import useCockpitGestures from '../hooks/useCockpitGestures'
import './Cockpit.css'

const SIZE = 280
const CENTER = SIZE / 2
const R = { outer: 120, mid: 100, inner: 80 }
const circ = (r) => 2 * Math.PI * r

const COLORS = {
  default: '#7ED957',
  program: '#60a5fa',
  cardio: '#f97316',
  exercise: '#7ED957',
  coach: '#a855f7',
}

export default function CockpitCore({
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

  const outerOffset = circ(R.outer) * (1 - Math.min(streak / 30, 1))

  const midProgress = mode === 'program' ? programProgress : mode === 'cardio' ? Math.min(bpm / 180, 1) : 0
  const midOffset = circ(R.mid) * (1 - midProgress)

  const innerProgress = mode === 'exercise' ? Math.min(reps / 20, 1) : mode === 'cardio' ? Math.min(bpm / 180, 1) : 0
  const innerOffset = circ(R.inner) * (1 - innerProgress)

  const center = useMemo(() => {
    switch (mode) {
      case 'program': return { label: 'PROGRAM', value: programDay, sub: '/30' }
      case 'cardio': return { label: 'RHYTHM', value: bpm, sub: 'bpm' }
      case 'exercise': return { label: `SET ${setNumber}`, value: reps, sub: 'reps' }
      case 'coach': return { label: 'ANALYSE', value: '...', sub: '' }
      default: return { label: 'PRÊT', value: 'GO', sub: '' }
    }
  }, [mode, bpm, reps, setNumber, programDay])

  return (
    <div className={`cockpit ${mode ? `mode-${mode}` : ''}`} {...gestures}>
      <div className="c-glow" style={{ '--glow-color': `${color}10` }} />

      {mode === 'coach' && (
        <>
          <div className="c-particle" /><div className="c-particle" /><div className="c-particle" />
        </>
      )}

      <svg width={SIZE} height={SIZE}>
        {[
          ['outer', R.outer, outerOffset, 4],
          ['mid', R.mid, midOffset, 3],
          ['inner', R.inner, innerOffset, 3],
        ].map(([key, r, offset, stroke]) => (
          <g key={key}>
            <circle cx={CENTER} cy={CENTER} r={r} stroke="rgba(255,255,255,.04)" strokeWidth="2" fill="none" />
            <circle cx={CENTER} cy={CENTER} r={r} stroke={color} strokeWidth={stroke} fill="none"
              strokeDasharray={circ(r)} strokeDashoffset={offset} className={`ring ring-${key}`}
              style={{ filter: `drop-shadow(0 0 ${key==='inner'?12:8}px ${color}30)`, transition: 'stroke-dashoffset 1.5s ease' }} />
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
