import { Download, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface InstallButtonProps {
  extensionId: string
  name: string
  version?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function InstallButton({ 
  extensionId, 
  name,
  version,
  size = 'md' 
}: InstallButtonProps) {
  const [copied, setCopied] = useState(false)
  
  const deepLink = `blueplm://install/${extensionId}`
  
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const handleInstall = () => {
    // Try to open the deep link
    window.location.href = deepLink
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(deepLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleInstall}
        className={`inline-flex items-center font-semibold rounded-lg bg-gradient-to-r from-ocean-500 to-brand-600 text-white hover:from-ocean-400 hover:to-brand-500 transition-all duration-200 glow-sm ${sizeClasses[size]}`}
        title={`Install ${name}${version ? ` v${version}` : ''}`}
      >
        <Download className={iconSizes[size]} />
        <span>Install in BluePLM</span>
        <ExternalLink className={`${iconSizes[size]} opacity-60`} />
      </button>
      
      <button
        onClick={handleCopyLink}
        className={`p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 ${size === 'lg' ? 'p-3' : ''}`}
        title="Copy install link"
      >
        {copied ? (
          <Check className={`${iconSizes[size]} text-emerald-400`} />
        ) : (
          <Copy className={iconSizes[size]} />
        )}
      </button>
    </div>
  )
}
