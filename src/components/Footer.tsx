import { Link } from 'react-router-dom'
import { Github, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Logo and links row */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link to="/" className="flex items-center gap-2 hover:text-white transition-colors">
              <img 
                src="/icon.svg" 
                alt="BluePLM" 
                className="w-5 h-5 rounded"
              />
              <span className="font-brand font-semibold text-gray-300">BluePLM</span>
            </Link>
            <span className="text-gray-600">·</span>
            <Link to="/downloads" className="hover:text-white transition-colors">
              Downloads
            </Link>
            <Link to="/donate" className="hover:text-white transition-colors">
              Donate
            </Link>
            <a
              href="https://github.com/bluerobotics/bluePLM"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
          
          {/* Copyright */}
          <p className="text-xs text-gray-500 flex items-center gap-1">
            MIT License · Made with <Heart className="w-3 h-3 text-red-500/70" /> by Blue Robotics
          </p>
        </div>
      </div>
    </footer>
  )
}
