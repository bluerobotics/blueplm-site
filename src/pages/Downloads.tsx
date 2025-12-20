import { useState, useEffect } from 'react'
import { 
  Download, Monitor, Apple, Box, 
  CheckCircle, Clock, FileDown, ExternalLink,
  Github, Star, GitFork
} from 'lucide-react'

interface Release {
  version: string
  date: string
  assets: {
    windows: string
    mac: string
    linux: string
  }
}

const currentRelease: Release = {
  version: '2.12.0',
  date: '2025-12-19',
  assets: {
    windows: 'https://github.com/bluerobotics/bluePLM/releases/download/v2.12.0/BluePLM-2.12.0-win.exe',
    mac: 'https://github.com/bluerobotics/bluePLM/releases/download/v2.12.0/BluePLM-2.12.0-mac.dmg',
    linux: 'https://github.com/bluerobotics/bluePLM/releases/download/v2.12.0/BluePLM-2.12.0-linux.AppImage',
  },
}

const systemRequirements = {
  windows: ['Windows 10 or later', '64-bit processor', '4 GB RAM minimum', '500 MB disk space'],
  mac: ['macOS 10.15 (Catalina) or later', 'Apple Silicon or Intel', '4 GB RAM minimum', '500 MB disk space'],
  linux: ['Ubuntu 20.04+ or equivalent', '64-bit processor', '4 GB RAM minimum', '500 MB disk space'],
}

const recentReleases = [
  { version: '2.12.0', date: '2025-12-19', highlights: 'Topbar panel toggles, FPS counter improvements' },
  { version: '2.11.0', date: '2025-12-18', highlights: 'Sentry error tracking, macOS update fixes' },
  { version: '2.10.0', date: '2025-12-18', highlights: 'Cascading sidebar panels, extended customization' },
  { version: '2.9.0', date: '2025-12-17', highlights: 'Auto-enabled features, RFQ admin settings' },
  { version: '2.8.0', date: '2025-12-16', highlights: 'Keybindings settings, file operation icons overhaul' },
]

type Platform = 'windows' | 'mac' | 'linux'

export default function Downloads() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('windows')
  const [stats, setStats] = useState<{ stars: number; forks: number } | null>(null)

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('mac')) {
      setSelectedPlatform('mac')
    } else if (userAgent.includes('linux')) {
      setSelectedPlatform('linux')
    }

    // Fetch real GitHub stats
    fetch('https://api.github.com/repos/bluerobotics/bluePLM')
      .then(res => res.json())
      .then(data => {
        if (data.stargazers_count !== undefined) {
          setStats({
            stars: data.stargazers_count,
            forks: data.forks_count,
          })
        }
      })
      .catch(() => {
        // Silently fail - stats just won't show
      })
  }, [])

  const platforms: { id: Platform; name: string; icon: typeof Monitor }[] = [
    { id: 'windows', name: 'Windows', icon: Monitor },
    { id: 'mac', name: 'macOS', icon: Apple },
    { id: 'linux', name: 'Linux', icon: Box },
  ]

  return (
    <div className="relative py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Download BluePLM
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Free, open-source, and ready to use.
          </p>
        </div>

        {/* Main Download Card */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="p-8 rounded-3xl glass">
            {/* Version info */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-display text-2xl font-bold text-white">
                    v{currentRelease.version}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    Latest
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  Released {new Date(currentRelease.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
              <a
                href="https://github.com/bluerobotics/bluePLM/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ocean-400 hover:text-ocean-300 flex items-center gap-1"
              >
                All releases
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Platform selector */}
            <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPlatform === platform.id
                      ? 'bg-gradient-to-r from-ocean-500 to-brand-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <platform.icon className="w-4 h-4" />
                  {platform.name}
                </button>
              ))}
            </div>

            {/* Download button */}
            <a
              href={currentRelease.assets[selectedPlatform]}
              className="group flex items-center justify-center gap-3 w-full py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-ocean-500 to-brand-600 text-white hover:from-ocean-400 hover:to-brand-500 transition-all duration-300 glow mb-6"
            >
              <Download className="w-5 h-5" />
              Download for {platforms.find(p => p.id === selectedPlatform)?.name}
              <FileDown className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" />
            </a>

            {/* System requirements */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3">System Requirements</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {systemRequirements[selectedPlatform].map((req) => (
                  <li key={req} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* GitHub Stats - Only show if we got real data */}
        {stats && (
          <div className="max-w-3xl mx-auto mb-16">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="https://github.com/bluerobotics/bluePLM/stargazers"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-4 rounded-xl glass-light hover:bg-white/5 transition-all"
              >
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="font-display font-bold text-white">{stats.stars}</div>
                  <div className="text-xs text-gray-400">Stars</div>
                </div>
              </a>
              <a
                href="https://github.com/bluerobotics/bluePLM/network/members"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-4 rounded-xl glass-light hover:bg-white/5 transition-all"
              >
                <GitFork className="w-5 h-5 text-ocean-400" />
                <div>
                  <div className="font-display font-bold text-white">{stats.forks}</div>
                  <div className="text-xs text-gray-400">Forks</div>
                </div>
              </a>
            </div>
          </div>
        )}

        {/* Recent Releases */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-white mb-6">Recent Releases</h2>
          <div className="space-y-3">
            {recentReleases.map((release, index) => (
              <a
                key={release.version}
                href={`https://github.com/bluerobotics/bluePLM/releases/tag/v${release.version}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl glass-light hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-600'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white">v{release.version}</span>
                      {index === 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-medium">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{release.highlights}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{new Date(release.date).toLocaleDateString()}</span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <a
              href="https://github.com/bluerobotics/bluePLM/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-ocean-400 hover:text-ocean-300 font-medium"
            >
              <Github className="w-4 h-4" />
              View all releases on GitHub
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
