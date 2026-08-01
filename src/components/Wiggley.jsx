import '../wiggley.css'
import useStore from '../store/useStore'

export default function Wiggley() {
  const activeSession = useStore((s) => s.activeSession)
  if (!activeSession) return null
  return (
    <div className="wiggley" onClick={() => useStore.getState().setCurrentView('session')}>
      ⚡
    </div>
  )
}
