export default function GlassCard({ children, className = '' }) {
  return <div className={`bg-dark-card rounded-2xl ${className}`}>{children}</div>
}
