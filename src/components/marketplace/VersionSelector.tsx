import { useState } from 'react'
import { ChevronDown, RefreshCw, Check } from 'lucide-react'
import type { ExtensionVersion } from '../../lib/api'

interface VersionSelectorProps {
  versions: ExtensionVersion[]
  selected: string
  onSelect: (version: string) => void
  onRefresh: () => void
  isRefreshing: boolean
}

function formatVersionDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function VersionSelector({
  versions,
  selected,
  onSelect,
  onRefresh,
  isRefreshing
}: VersionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedVersion = versions.find(v => v.version === selected)

  return (
    <div className="flex items-center gap-2">
      {/* Version Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors min-w-[160px]"
        >
          <span className="flex-1 text-left">
            v{selected}
            {selectedVersion?.prerelease && (
              <span className="ml-1.5 text-[10px] text-amber-400">(pre)</span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto rounded-lg bg-gray-900 border border-white/10 shadow-xl z-20">
              {versions.map((ver) => (
                <button
                  key={ver.id}
                  onClick={() => {
                    onSelect(ver.version)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors ${
                    ver.version === selected ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">v{ver.version}</span>
                      {ver === versions[0] && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-emerald-500/20 text-emerald-400">
                          Latest
                        </span>
                      )}
                      {ver.prerelease && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-500/20 text-amber-400">
                          Pre-release
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatVersionDate(ver.published_at)}
                    </p>
                  </div>
                  {ver.version === selected && (
                    <Check className="w-4 h-4 text-ocean-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Check for updates"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">
          {isRefreshing ? 'Checking...' : 'Check for updates'}
        </span>
      </button>
    </div>
  )
}
