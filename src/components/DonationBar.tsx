import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

interface DonationBarProps {
  current?: number
  goal?: number
}

export default function DonationBar({ current = 0, goal = 1000 }: DonationBarProps) {
  const percentage = Math.min((current / goal) * 100, 100)
  
  return (
    <div className="bg-gradient-to-r from-ocean-900/50 to-brand-900/50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Heart className="w-4 h-4 text-pink-500 flex-shrink-0" />
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-sm text-gray-300 whitespace-nowrap">
                Q1 Goal: <span className="font-semibold text-white">${current}</span> / ${goal}
              </span>
              <div className="hidden sm:block flex-1 max-w-xs h-2 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
          <Link
            to="/donate"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 hover:text-pink-200 transition-colors whitespace-nowrap"
          >
            <Heart className="w-3 h-3" />
            Donate
          </Link>
        </div>
      </div>
    </div>
  )
}

