import { Outlet, Link } from 'react-router-dom'
import Header from '../components/Header'

export default function MarketplaceLayout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1526] to-[#0f1a2e]">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        {/* Extensions-specific gradient orbs - purple tint */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full" style={{ filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-ocean-500/5 rounded-full" style={{ filter: 'blur(100px)' }} />
      </div>
      
      {/* Use shared Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative mt-auto border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <Link to="/" className="flex items-center gap-2 hover:text-white transition-colors">
                <img 
                  src="/icon.svg" 
                  alt="BluePLM" 
                  className="w-4 h-4 rounded"
                />
                <span className="font-medium">Extensions</span>
              </Link>
              <span className="text-gray-600">·</span>
              <Link to="/" className="hover:text-white transition-colors">
                BluePLM.io
              </Link>
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
            </div>
            <p className="text-xs text-gray-500">
              MIT License · © {new Date().getFullYear()} Blue Robotics
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
