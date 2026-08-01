import '../wiggley.css'
import useStore from '../store/useStore'

export default function Wiggley() {
  const activeSession = useStore((s) => s.activeSession)
  const setCurrentView = useStore((s) => s.setCurrentView)
  if (!activeSession) return null
  return (
    <div className="wiggley" onClick={() => setCurrentView('session')}>
      ⚡
    </div>
  )
}
