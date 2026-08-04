import { Sparkles } from 'lucide-react'
import useStore from '../store/useStore'

export default function FloatingCoachButton() {
  const setCurrentView = useStore(s => s.setCurrentView)

  return (
    <button
      onClick={() => setCurrentView('ai')}
      className="fixed right-4 bottom-28 z-40 w-16 h-16 rounded-full 
        bg-[#1C1C1E]/90 backdrop-blur-xl
        shadow-[0_4px_20px_rgba(0,0,0,0.08)] 
        active:shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95
        flex items-center justify-center
        transition-all duration-300 ease-out
        animate-coach-float
        group
        border border-white/5"
      aria-label="Nirika Coach"
    >
      <Sparkles size={24} className="text-white/90" />
      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1C1C1E] backdrop-blur-md text-white/80 text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        Nirika Coach
      </span>
    </button>
  )
}
