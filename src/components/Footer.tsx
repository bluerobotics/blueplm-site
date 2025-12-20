import { Link } from 'react-router-dom'
import { Github, Youtube, Globe, Heart } from 'lucide-react'

const footerLinks = {
  product: [
    { name: 'Features', href: '/#features' },
    { name: 'Downloads', href: '/downloads' },
    { name: 'Changelog', href: 'https://github.com/bluerobotics/bluePLM/blob/main/CHANGELOG.md' },
    { name: 'Roadmap', href: 'https://github.com/bluerobotics/bluePLM#roadmap' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'Getting Started', href: '/docs/getting-started' },
    { name: 'API Reference', href: '/docs/api' },
    { name: 'Donate', href: '/donate' },
  ],
  community: [
    { name: 'GitHub', href: 'https://github.com/bluerobotics/bluePLM' },
    { name: 'Discussions', href: 'https://github.com/bluerobotics/bluePLM/discussions' },
    { name: 'Issues', href: 'https://github.com/bluerobotics/bluePLM/issues' },
    { name: 'Contributing', href: 'https://github.com/bluerobotics/bluePLM/blob/main/CONTRIBUTING.md' },
  ],
}

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 group mb-4">
              <img 
                src="/icon.svg" 
                alt="BluePLM" 
                className="w-9 h-9 rounded-lg"
              />
              <span className="font-display font-bold text-xl tracking-tight">
                <span className="text-white">Blue</span>
                <span className="text-gradient">PLM</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              Open-source Product Lifecycle Management for everyone who builds. 
              Version control, collaboration, and engineering change management in one place.
            </p>
            
            {/* Blue Robotics attribution */}
            <a
              href="https://bluerobotics.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-4 py-3 rounded-xl glass-light hover:bg-white/5 transition-colors group"
            >
              <img 
                src="https://bluerobotics.com/wp-content/uploads/2016/05/BR-Logo-e1649267636490.png" 
                alt="Blue Robotics" 
                className="h-8 w-auto brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity"
              />
              <div className="text-left">
                <div className="text-xs text-gray-500">Made with 💙 by</div>
                <div className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Blue Robotics</div>
              </div>
            </a>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('http') ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-4">Community</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/bluerobotics/bluePLM"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.youtube.com/bluerobotics"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <Youtube className="w-5 h-5" />
            </a>
            <a
              href="https://bluerobotics.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <Globe className="w-5 h-5" />
            </a>
          </div>
          
          <p className="text-sm text-gray-500 flex items-center gap-1">
            MIT License · Made with <Heart className="w-3.5 h-3.5 text-red-500" /> by the Blue Robotics team
          </p>
        </div>
      </div>
    </footer>
  )
}

