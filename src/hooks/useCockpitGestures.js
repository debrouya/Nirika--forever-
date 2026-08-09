import { useRef, useEffect } from 'react'

export default function useCockpitGestures({ onTap, onSwipeLeft, onSwipeRight, onHold }) {
  const startX = useRef(0)
  const startTime = useRef(0)
  const holdTimeout = useRef(null)

  useEffect(() => {
    return () => { clearTimeout(holdTimeout.current) }
  }, [])

  const onTouchStart = (e) => {
    if (!e.touches?.length) return
    startX.current = e.touches[0].clientX
    startTime.current = Date.now()
    holdTimeout.current = setTimeout(() => { onHold?.() }, 600)
  }

  const onTouchEnd = (e) => {
    clearTimeout(holdTimeout.current)
    if (!e.changedTouches?.length) return
    const deltaX = e.changedTouches[0].clientX - startX.current
    const duration = Date.now() - startTime.current
    if (Math.abs(deltaX) > 50) {
      deltaX > 0 ? onSwipeRight?.() : onSwipeLeft?.()
    } else if (duration < 200) {
      onTap?.()
    }
  }

  return { onTouchStart, onTouchEnd }
}
