import { Dumbbell } from 'lucide-react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#10B981]/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-72 h-72 bg-surface-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#10B981]/5 rounded-full blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 glass-heavy safe-top">
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
