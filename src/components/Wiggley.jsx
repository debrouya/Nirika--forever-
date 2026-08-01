import '../wiggley.css'
import { useSessionCtx } from '../store/sessionContext'
import useStore from '../store/useStore'

export default function Wiggley() {
  const { session } = useSessionCtx()
  const setCurrentView = useStore((s) => s.setCurrentView)
  if (!session) return null
  return (
    <div className="wiggley" onClick={() => setCurrentView('session')}>
      ⚡
    </div>
  )
}
