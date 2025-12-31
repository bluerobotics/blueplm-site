import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background elements - simplified for performance */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1526] to-[#0f1a2e]">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        {/* Static gradient orbs - no blur for perf */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-ocean-500/5 rounded-full" style={{ filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full" style={{ filter: 'blur(100px)' }} />
      </div>
      
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

