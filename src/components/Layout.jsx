import { Dumbbell } from 'lucide-react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto relative overflow-hidden bg-dark-bg">
      <header className="sticky top-0 z-40 bg-dark-bg safe-top">
        <div className="flex items-center justify-center gap-2.5 py-3 px-4">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md p-1.5">
            <img src="/logo.svg" alt="Nirika" className="w-full h-full" />
          </div>
          <h1 className="text-base font-black tracking-tight text-white">
            NIRIKA <span className="text-white">FOR EVER</span>
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 relative z-10">{children}</main>
    </div>
  )
}
