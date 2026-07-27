import { Dumbbell } from 'lucide-react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto relative overflow-hidden bg-dark-bg">
      <header className="sticky top-0 z-40 bg-dark-bg safe-top">
        <div className="flex items-center justify-center gap-2.5 py-3 px-4">
          <div className="w-28 h-28 rounded-3xl bg-dark-card flex items-center justify-center shadow-lg p-3 border border-dark-border">
            <img src="/logo.png" alt="Nirika" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            NIRIKA <span className="text-white">FOR EVER</span>
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 relative z-10">{children}</main>
    </div>
  )
}
