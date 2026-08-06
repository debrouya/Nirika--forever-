import './GlassBackground.css'

export default function GlassBackground({ children }) {
  return (
    <div className="nirika-bg">
      <div className="nirika-sphere s1" />
      <div className="nirika-sphere s2" />
      <div className="nirika-sphere s3" />
      <div className="nirika-sphere s4" />
      <div className="nirika-sphere s5" />
      <div className="nirika-sphere s6" />
      <div className="nirika-sphere s7" />
      <div className="nirika-sphere s8" />
      <div className="nirika-sphere s9" />
      <div className="nirika-sphere s10" />
      <div className="nirika-sphere s11" />
      <div className="nirika-sphere s12" />
      <div className="nirika-content">{children}</div>
    </div>
  )
}
