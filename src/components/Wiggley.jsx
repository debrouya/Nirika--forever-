import { useState, useEffect } from 'react'
import '../wiggley.css'
import useStore from '../store/useStore'

export default function Wiggley() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const check = () => {
      const s = useStore.getState().activeSession
      setVisible(!!s)
    }
    check()
    const id = setInterval(check, 1000)
    return () => clearInterval(id)
  }, [])

  if (!visible) return null

  return (
    <div className="wiggley" onClick={() => useStore.getState().setCurrentView('session')}>
      ⚡
    </div>
  )
}
