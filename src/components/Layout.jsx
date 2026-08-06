export default function Layout({ children }) {
  return (
    <div className="h-[100dvh] flex flex-col bg-[#0E0E10] max-w-lg mx-auto overflow-hidden">
      <header className="flex-shrink-0 z-40 backdrop-blur-xl safe-top" style={{background:'rgba(14,14,16,.8)',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
        <div className="flex items-center gap-3 py-3 px-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center p-0.5" style={{background:'rgba(255,255,255,.06)'}}>
            <img src="/logo.png" alt="Nirika" className="w-full h-full object-cover rounded-[10px]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-tight" style={{color:'rgba(255,255,255,.9)'}}>
              NIRIKA <span style={{color:'rgba(255,255,255,.5)'}}>FOR EVER</span>
            </h1>
            <p style={{fontSize:10,color:'rgba(126,217,87,.4)',fontWeight:500,letterSpacing:2,textTransform:'uppercase'}}>Ton coach personnel</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom,0px))] relative z-10 overscroll-contain">{children}</main>
    </div>
  )
}
