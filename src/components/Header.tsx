import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Github, ExternalLink, MessageCircle } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Downloads', href: '/downloads' },
  { name: 'Forum', href: 'https://discuss.bluerobotics.com/', external: true },
  { name: 'Donate', href: '/donate' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-[#0d1526]/95 border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group z-10">
            <img 
              src="/icon.svg" 
              alt="BluePLM" 
              className="w-10 h-10 rounded-lg self-center"
            />
            <span className="font-brand text-[28px] tracking-tight self-center" style={{ lineHeight: 1 }}>
              <span className="text-white font-bold">Blue</span>
              <span className="text-gradient font-extrabold">PLM</span>
            </span>
          </Link>

          {/* Desktop navigation - centered */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navigation.map((item) => {
              const isActive = !item.external && (
                location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href))
              )
              
              if (item.external) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {item.name}
                  </a>
                )
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'text-white bg-white/10' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* GitHub link */}
          <div className="hidden md:flex items-center gap-3 z-10">
            <a
              href="https://github.com/bluerobotics/bluePLM"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <Link
              to="/downloads"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-ocean-500 to-brand-600 text-white hover:from-ocean-400 hover:to-brand-500 transition-all duration-200 glow-sm"
            >
              Download
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
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
                const isActive = !item.external && (
                  location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href))
                )
                
                if (item.external) {
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {item.name}
                    </a>
                  )
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'text-white bg-white/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
              <hr className="my-2 border-white/10" />
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
  )
}
