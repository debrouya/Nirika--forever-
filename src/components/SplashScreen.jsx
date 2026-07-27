import { useState, useEffect } from 'react'
import { Dumbbell } from 'lucide-react'

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 1200)
    const t3 = setTimeout(() => setPhase(3), 2200)
    const t4 = setTimeout(() => onComplete(), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-b from-[#0F1A1E] to-[#1A2B34]">
      <div className="text-center">
        <div
          className={`transition-all duration-700 ease-out ${
            phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-black/20 p-4">
            <img src="/logo.svg" alt="Nirika" className="w-full h-full" />
          </div>
        </div>

        <div
          className={`transition-all duration-700 ease-out delay-200 ${
            phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-3xl font-black tracking-tight text-white mb-1">
            NIRIKA <span className="text-white">FOR EVER</span>
          </h1>
          <p className="text-sm text-white/40 font-medium">Ton coach personnel</p>
        </div>

        <div
          className={`mt-10 transition-all duration-500 ease-out ${
            phase >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-32 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full transition-all duration-1000 ease-out"
              style={{ width: phase >= 3 ? '100%' : phase >= 2 ? '60%' : '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
