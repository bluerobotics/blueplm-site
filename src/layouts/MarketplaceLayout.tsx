import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  Menu, X, Github, Package, Store, Home
} from 'lucide-react'

const navigation = [
  { name: 'Browse', href: '/marketplace', icon: Store },
  { name: 'Submit Extension', href: '/marketplace/submit', icon: Package },
]

export default function MarketplaceLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1526] to-[#0f1a2e]">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        {/* Marketplace-specific gradient orbs - purple tint */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full" style={{ filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-ocean-500/5 rounded-full" style={{ filter: 'blur(100px)' }} />
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0d1526]/95 border-b border-white/5">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            {/* Logo */}
            <Link to="/marketplace" className="flex items-center gap-2.5 group z-10">
              <img 
                src="/icon.svg" 
                alt="BluePLM" 
                className="w-10 h-10 rounded-lg"
              />
              <div className="flex flex-col">
                <span className="font-brand text-[22px] tracking-tight leading-none" style={{ transform: 'translateY(2px)' }}>
                  <span className="text-white" style={{ fontWeight: 700 }}>Blue</span>
                  <span style={{ 
                    background: 'linear-gradient(135deg, #0091d9 0%, #57c9ff 50%, #93deff 100%)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}>PLM</span>
                </span>
                <span className="text-[10px] font-medium tracking-widest text-purple-400 uppercase">
                  Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop navigation - centered */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href === '/marketplace' && location.pathname === '/marketplace')
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'text-white bg-white/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Right side links */}
            <div className="hidden md:flex items-center gap-3 z-10">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                Main Site
              </Link>
              <a
                href="https://github.com/bluerobotics/bluePLM"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'text-white bg-white/10' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  )
                })}
                <hr className="my-2 border-white/10" />
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <Home className="w-4 h-4" />
                  Main Site
                </Link>
                <a
                  href="https://github.com/bluerobotics/bluePLM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative mt-auto border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <Link to="/marketplace" className="flex items-center gap-2 hover:text-white transition-colors">
                <img 
                  src="/icon.svg" 
                  alt="BluePLM" 
                  className="w-4 h-4 rounded"
                />
                <span className="font-medium">Marketplace</span>
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
