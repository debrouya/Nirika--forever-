import '../wiggley.css'
import { useSession } from '../sessionStore.jsx'
import useStore from '../store/useStore'

export default function Wiggley() {
  const { session } = useSession()
  const setCurrentView = useStore((s) => s.setCurrentView)
  if (!session || !session.active) return null
  return (
    <div className="wiggley" onClick={() => setCurrentView('session')}>
      {session.paused ? '⏸️' : '🔥'}
    </div>
  )
}
