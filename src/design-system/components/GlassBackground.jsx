import './index.css'

export default function GlassBackground({ children, className = '' }) {
  return <div className={`nirika-glass-bg ${className}`}>{children}</div>
}
