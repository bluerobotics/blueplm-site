import { Download, ExternalLink, Copy, Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { syncExtension } from '../../lib/api'

interface InstallButtonProps {
  extensionName: string  // e.g., "blueplm.google-drive"
  displayName: string    // e.g., "Google Drive Integration"
  version?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function InstallButton({ 
  extensionName,
  displayName,
  version,
  size = 'md' 
}: InstallButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<string | null>(null)
  
  // Use extensionName (not UUID) in deep link, with optional version parameter
  const deepLink = version 
    ? `blueplm://install/${extensionName}?version=${version}`
    : `blueplm://install/${extensionName}`
  
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

  const handleInstall = async () => {
    // Auto-refresh before install to ensure we have the latest version info
    setIsChecking(true)
    setUpdateMessage(null)
    
    try {
      const result = await syncExtension(extensionName)
      
      if (result.updated && result.newVersions.length > 0) {
        // Show message about new versions, but still proceed with install
        setUpdateMessage(`New version${result.newVersions.length > 1 ? 's' : ''} available: ${result.newVersions.join(', ')}`)
        // Clear message after a delay
        setTimeout(() => setUpdateMessage(null), 5000)
      }
    } catch (err) {
      // Don't block install if sync fails - just log it
      console.warn('Pre-install sync failed:', err)
    } finally {
      setIsChecking(false)
    }
    
    // Proceed with opening the deep link
    window.location.href = deepLink
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(deepLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstall}
          disabled={isChecking}
          className={`inline-flex items-center font-semibold rounded-lg bg-gradient-to-r from-ocean-500 to-brand-600 text-white hover:from-ocean-400 hover:to-brand-500 transition-all duration-200 glow-sm disabled:opacity-70 disabled:cursor-wait ${sizeClasses[size]}`}
          title={`Install ${displayName}${version ? ` v${version}` : ''}`}
        >
          {isChecking ? (
            <Loader2 className={`${iconSizes[size]} animate-spin`} />
          ) : (
            <Download className={iconSizes[size]} />
          )}
          <span>{isChecking ? 'Checking...' : 'Install in BluePLM'}</span>
          {!isChecking && <ExternalLink className={`${iconSizes[size]} opacity-60`} />}
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
      
      {/* Update notification */}
      {updateMessage && (
        <div className="px-3 py-2 rounded-lg text-xs bg-ocean-500/10 text-ocean-400 border border-ocean-500/30">
          {updateMessage}
        </div>
      )}
    </div>
  )
}
