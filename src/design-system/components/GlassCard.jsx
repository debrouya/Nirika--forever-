import './GlassCard.css'

export default function GlassCard({
  children,
  variant = 'default',
  onClick,
  className = '',
  style,
}) {
  const base = 'nirika-card'
  const variants = {
    default: '',
    strong: 'nirika-card-strong',
    cinema: 'nirika-card-cinema',
  }
  const interactive = onClick ? 'nirika-card-interactive' : ''

  return (
    <div
      className={`${base} ${variants[variant] || ''} ${interactive} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  )
}
