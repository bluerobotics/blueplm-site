import { Link } from 'react-router-dom'
import { Download, ArrowRight, Calendar, User } from 'lucide-react'
import VerificationBadge from './VerificationBadge'
import NativeBadge from './NativeBadge'

export interface ExtensionCardData {
  id: string
  name: string
  description: string
  version: string
  publisher: {
    id: string
    name: string
    avatar?: string
  }
  category: string
  verified: boolean
  native?: boolean
  nativePlatform?: string
  downloads: number
  iconUrl?: string
  deprecated?: boolean
  updatedAt: string
}

interface ExtensionCardProps {
  extension: ExtensionCardData
  variant?: 'default' | 'compact' | 'featured'
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export default function ExtensionCard({ 
  extension, 
  variant = 'default' 
}: ExtensionCardProps) {
  const isFeatured = variant === 'featured'
  const isCompact = variant === 'compact'

  return (
    <Link
      to={`/marketplace/extensions/${extension.id}`}
      className={`group relative block rounded-xl transition-all duration-300 ${
        extension.deprecated 
          ? 'opacity-60 hover:opacity-80' 
          : ''
      } ${
        isFeatured 
          ? 'p-6 bg-gradient-to-br from-ocean-500/10 to-purple-500/10 border border-ocean-500/30 hover:border-ocean-500/50 hover:shadow-lg hover:shadow-ocean-500/10' 
          : 'p-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      {/* Deprecated overlay */}
      {extension.deprecated && (
        <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
          Deprecated
        </div>
      )}

      <div className={`flex ${isCompact ? 'gap-3' : 'gap-4'}`}>
        {/* Icon */}
        <div className={`flex-shrink-0 ${isFeatured ? 'w-16 h-16' : isCompact ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
          {extension.iconUrl ? (
            <img 
              src={extension.iconUrl} 
              alt={extension.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className={`font-bold text-white/60 ${isFeatured ? 'text-2xl' : isCompact ? 'text-lg' : 'text-xl'}`}>
              {extension.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-semibold text-white truncate group-hover:text-ocean-300 transition-colors ${isFeatured ? 'text-lg' : 'text-base'}`}>
              {extension.name}
            </h3>
            {!isCompact && (
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-ocean-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            )}
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <VerificationBadge verified={extension.verified} size="sm" />
            {extension.native && (
              <NativeBadge platform={extension.nativePlatform} size="sm" />
            )}
            <span className="text-xs text-gray-500">v{extension.version}</span>
          </div>

          {/* Description */}
          {!isCompact && (
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
              {extension.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <Link 
              to={`/marketplace/publishers/${extension.publisher.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-ocean-400 transition-colors"
            >
              <User className="w-3 h-3" />
              {extension.publisher.name}
            </Link>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {formatNumber(extension.downloads)}
            </span>
            {!isCompact && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(extension.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
