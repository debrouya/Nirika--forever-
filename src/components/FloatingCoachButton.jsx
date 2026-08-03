import { Sparkles } from 'lucide-react'
import useStore from '../store/useStore'

export default function FloatingCoachButton() {
  const setCurrentView = useStore(s => s.setCurrentView)

  return (
    <button
      onClick={() => setCurrentView('ai')}
      className="fixed right-4 bottom-28 z-40 w-16 h-16 rounded-full 
        bg-gradient-to-br from-lime via-lime/90 to-emerald-400 
        shadow-[0_8px_32px_rgba(132,204,22,0.35)] 
        active:shadow-[0_4px_16px_rgba(132,204,22,0.25)] active:scale-95
        flex items-center justify-center
        transition-all duration-300 ease-out
        animate-coach-float
        group"
      style={{
        boxShadow: '0 8px 32px rgba(132,204,22,0.35), 0 2px 8px rgba(0,0,0,0.3)',
      }}
      aria-label="Nirika Coach"
    >
      <Sparkles size={24} className="text-dark-bg" />
      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-dark-card text-lime text-[10px] font-bold px-2.5 py-1 rounded-full border border-lime/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        Nirika Coach
      </span>
    </button>
  )
}
