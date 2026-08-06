export default function GlassCard({ children, className = '', onClick }) {
  return <div className={`nirika-glass ${className}`} onClick={onClick}>{children}</div>
}
