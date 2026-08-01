export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-dark-bg max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-xl safe-top border-b border-dark-border/50">
        <div className="flex items-center gap-3 py-3 px-4">
          <div className="w-12 h-12 rounded-xl bg-dark-card flex items-center justify-center p-0.5 border border-dark-border animate-glow-pulse">
            <img src="/logo.png" alt="Nirika" className="w-full h-full object-cover rounded-[10px]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-tight">
              NIRIKA <span className="text-white">FOR EVER</span>
            </h1>
            <p className="text-[10px] text-lime/60 font-medium tracking-widest uppercase">Ton coach personnel</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 relative z-10">{children}</main>
    </div>
  )
}
