import { useState, useEffect } from 'react'
import '../wiggley.css'
import useStore from '../store/useStore'

export default function Wiggley() {
  const [visible, setVisible] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [name, setName] = useState('')

  useEffect(() => {
    const id = setInterval(() => {
      const s = useStore.getState().activeSession
      if (s) {
        setVisible(true)
        setName(s.exerciseName || '')
        setElapsed(Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000))
      } else {
        setVisible(false)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  if (!visible) return null

  const f = (s) => { const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}` }

  return (
    <div className="wiggley" onClick={() => useStore.getState().setCurrentView('session')}>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 }}>
        <span style={{ fontSize: 10, fontWeight: 'bold' }}>{f(elapsed)}</span>
        <span style={{ fontSize: 7, opacity: 0.7 }}>{name.slice(0, 8)}</span>
      </span>
    </div>
  )
}
