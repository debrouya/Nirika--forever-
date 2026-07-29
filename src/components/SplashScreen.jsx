import { useState, useEffect } from 'react'

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200)
    const t2 = setTimeout(() => setPhase(2), 800)
    const t3 = setTimeout(() => setPhase(3), 1600)
    const t4 = setTimeout(() => setPhase(4), 2400)
    const t5 = setTimeout(() => onComplete(), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-dark-bg overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute w-80 h-80 rounded-full blur-[100px] transition-all duration-1000 ${
            phase >= 1 ? 'opacity-20' : 'opacity-0'
          }`}
          style={{ background: 'radial-gradient(circle, #C6FF00, transparent)', top: '20%', left: '10%' }}
        />
        <div
          className={`absolute w-60 h-60 rounded-full blur-[80px] transition-all duration-1000 delay-300 ${
            phase >= 2 ? 'opacity-15' : 'opacity-0'
          }`}
          style={{ background: 'radial-gradient(circle, #C6FF00, transparent)', bottom: '25%', right: '5%' }}
        />
      </div>

      {/* Rotating ring */}
      <div className="absolute">
        <div
          className={`w-56 h-56 rounded-full border border-lime/10 transition-all duration-700 ${
            phase >= 1 ? 'opacity-100 animate-ring-spin' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-2 rounded-full border border-lime/5 transition-all duration-700 ${
            phase >= 1 ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ animation: 'ring-spin 30s linear infinite reverse' }}
        />
      </div>

      <div className="text-center relative z-10">
        {/* Logo */}
        <div
          className={`transition-all duration-800 ease-out ${
            phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div className="w-44 h-44 rounded-3xl bg-dark-card flex items-center justify-center mx-auto mb-6 p-5 border border-dark-border animate-glow-pulse">
            <img src="/logo.png" alt="Nirika" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Title */}
        <div
          className={`transition-all duration-700 ease-out ${
            phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h1 className="text-3xl font-black tracking-tight text-white mb-1">
            NIRIKA <span className="text-white">FOR EVER</span>
          </h1>
          <p className="text-sm text-white/40 font-medium">Ton coach personnel</p>
        </div>

        {/* Tagline */}
        <div
          className={`mt-4 transition-all duration-700 ease-out ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-xs text-lime/60 font-medium tracking-widest uppercase">Transforme ton corps</p>
        </div>

        {/* Loading bar */}
        <div
          className={`mt-10 transition-all duration-500 ease-out ${
            phase >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-40 h-1 bg-dark-card rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-lime/60 via-lime to-lime/60 rounded-full transition-all duration-800 ease-out animate-gradient-shift"
              style={{ 
                width: phase >= 4 ? '100%' : phase >= 3 ? '80%' : phase >= 2 ? '40%' : '0%',
                backgroundSize: '200% 100%',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
