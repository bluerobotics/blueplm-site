import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { 
  ArrowLeft, Download, Calendar, Tag, ExternalLink,
  Github, Globe, FileText, Shield, Flag, ChevronRight,
  User, Package, Star, History, CheckCircle2, Loader2, AlertCircle
} from 'lucide-react'
import VerificationBadge from '../../components/marketplace/VerificationBadge'
import NativeBadge from '../../components/marketplace/NativeBadge'
import InstallButton from '../../components/marketplace/InstallButton'
import DeprecationWarning from '../../components/marketplace/DeprecationWarning'
import VersionSelector from '../../components/marketplace/VersionSelector'
import { fetchExtension, fetchExtensionVersions, syncExtension, type ExtensionDetail, type ExtensionVersion } from '../../lib/api'

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return num.toString()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function Extension() {
  const { id } = useParams<{ id: string }>()
  
  // API state
  const [extension, setExtension] = useState<ExtensionDetail | null>(null)
  const [versions, setVersions] = useState<ExtensionVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Version selection state
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!id) return
    
    // After guard, id is narrowed to string
    const extensionId = id

    async function loadExtension() {
      setLoading(true)
      setError(null)

      try {
        const [extData, versionsData] = await Promise.all([
          fetchExtension(extensionId),
          fetchExtensionVersions(extensionId, true), // Include pre-release
        ])
        
        setExtension(extData)
        setVersions(versionsData)
        // Default to latest version
        if (versionsData.length > 0) {
          setSelectedVersion(versionsData[0].version)
        }
      } catch (err) {
        console.error('Failed to load extension:', err)
        setError(err instanceof Error ? err.message : 'Failed to load extension')
      } finally {
        setLoading(false)
      }
    }

    loadExtension()
  }, [id])

  // Handle refresh/sync with GitHub
  const handleRefresh = useCallback(async () => {
    if (!extension) return
    
    setIsRefreshing(true)
    setRefreshMessage(null)
    
    try {
      const result = await syncExtension(extension.name)
      
      if (result.updated && result.newVersions.length > 0) {
        // Reload extension data to get updated versions
        const [extData, versionsData] = await Promise.all([
          fetchExtension(extension.id),
          fetchExtensionVersions(extension.id, true),
        ])
        setExtension(extData)
        setVersions(versionsData)
        setSelectedVersion(versionsData[0]?.version || selectedVersion)
        
        setRefreshMessage({
          type: 'success',
          text: `Found ${result.newVersions.length} new version${result.newVersions.length > 1 ? 's' : ''}: ${result.newVersions.join(', ')}`
        })
      } else {
        setRefreshMessage({
          type: 'success',
          text: 'Already up to date!'
        })
      }
    } catch (err) {
      console.error('Failed to sync extension:', err)
      setRefreshMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to check for updates'
      })
    } finally {
      setIsRefreshing(false)
      // Clear message after 5 seconds
      setTimeout(() => setRefreshMessage(null), 5000)
    }
  }, [extension, selectedVersion])

  // Guard for missing ID
  if (!id) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-400">Extension not found</p>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-ocean-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading extension...</p>
      </div>
    )
  }

  // Error or not found state
  if (error || !extension) {
    return (
      <div className="py-16 text-center">
        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          {error === 'Extension not found' ? 'Extension Not Found' : 'Error Loading Extension'}
        </h1>
        <p className="text-gray-400 mb-6">
          {error === 'Extension not found' 
            ? "The extension you're looking for doesn't exist or has been removed."
            : error || 'Something went wrong. Please try again.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-ocean-400 hover:text-ocean-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Extensions
        </Link>
      </div>
    )
  }

  const currentVersion = selectedVersion || extension.latest_version?.version || '0.0.0'
  const currentVersionData = versions.find(v => v.version === currentVersion)
  const isNative = extension.category === 'native'
  const nativePlatform = isNative ? extension.tags.find(t => ['SolidWorks', 'Fusion', 'Inventor'].includes(t)) : undefined

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-white transition-colors">
            Extensions
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link 
            to={`/?category=${encodeURIComponent(extension.categories[0] || '')}`}
            className="hover:text-white transition-colors"
          >
            {extension.categories[0] || 'Extensions'}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{extension.display_name}</span>
        </nav>

        {/* Deprecation Warning (if applicable) */}
        {extension.deprecation && extension.deprecation.active && (
          <div className="mb-6">
            <DeprecationWarning 
              message={extension.deprecation.reason}
              replacementId={extension.deprecation.replacement_id || undefined}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          {/* Left: Icon + Info */}
          <div className="flex-1">
            <div className="flex gap-6">
              {/* Icon */}
              <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                {extension.icon_url ? (
                  <img 
                    src={extension.icon_url} 
                    alt={extension.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl sm:text-5xl font-bold text-white/60">
                    {extension.display_name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Title + Meta */}
              <div className="flex-1">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                  {extension.display_name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <VerificationBadge verified={extension.verified} size="md" />
                  {isNative && (
                    <NativeBadge platform={nativePlatform} size="md" />
                  )}
                </div>

                {/* Version Selector */}
                {versions.length > 0 && (
                  <div className="mb-3">
                    <VersionSelector
                      versions={versions}
                      selected={currentVersion}
                      onSelect={setSelectedVersion}
                      onRefresh={handleRefresh}
                      isRefreshing={isRefreshing}
                    />
                    {/* Refresh message toast */}
                    {refreshMessage && (
                      <div className={`mt-2 px-3 py-2 rounded-lg text-sm ${
                        refreshMessage.type === 'success' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {refreshMessage.text}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-gray-400 mb-4">
                  {extension.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <Link 
                    to={`/publishers/${extension.publisher.slug}`}
                    className="flex items-center gap-2 hover:text-ocean-400 transition-colors"
                  >
                    {extension.publisher.logo_url ? (
                      <img 
                        src={extension.publisher.logo_url} 
                        alt={extension.publisher.name}
                        className="w-5 h-5 rounded"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span>{extension.publisher.name}</span>
                    {extension.publisher.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </Link>
                  <span className="flex items-center gap-1.5">
                    <Download className="w-4 h-4" />
                    {formatNumber(extension.download_count)} downloads
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Updated {formatDate(extension.updated_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Install Button - Mobile */}
            <div className="mt-6 lg:hidden">
              <InstallButton 
                extensionName={extension.name}
                displayName={extension.display_name}
                version={currentVersion}
                size="lg"
              />
            </div>
          </div>

          {/* Right: Actions Card */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6">
              {/* Install Button - Desktop */}
              <div className="hidden lg:block">
                <InstallButton 
                  extensionName={extension.name}
                  displayName={extension.display_name}
                  version={currentVersion}
                  size="lg"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Downloads</p>
                  <p className="text-lg font-semibold text-white">{formatNumber(extension.stats.total_downloads)}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Rating</p>
                  <p className="text-lg font-semibold text-white flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {extension.stats.avg_rating?.toFixed(1) || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-2">
                {extension.repository_url && (
                  <a
                    href={extension.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    View Source
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {extension.publisher.slug && (
                  <Link
                    to={`/publishers/${extension.publisher.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Publisher Page
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </Link>
                )}
              </div>

              {/* Report */}
              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors">
                <Flag className="w-4 h-4" />
                Report this extension
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h2 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-ocean-400" />
                About
              </h2>
              <div className="prose-custom text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                {extension.long_description || extension.description || 'No description available.'}
              </div>
            </section>

            {/* Changelog for selected version */}
            {currentVersionData?.changelog && (
              <section className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h2 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-ocean-400" />
                  Changelog — v{currentVersion}
                  {currentVersionData.prerelease && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-500/20 text-amber-400">
                      Pre-release
                    </span>
                  )}
                </h2>
                <div className="prose-custom text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {currentVersionData.changelog}
                </div>
              </section>
            )}

            {/* Permissions - shown if native extension */}
            {isNative && (
              <section className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h2 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-ocean-400" />
                  Native Extension
                </h2>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-200/80">
                      <p className="font-medium text-amber-300 mb-1">This is a native extension</p>
                      <p>
                        Native extensions run outside the sandbox and have full system access. 
                        Only install native extensions from publishers you trust.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Version History */}
            {versions.length > 0 && (
              <section className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <History className="w-4 h-4 text-ocean-400" />
                  Version History
                </h3>
                <div className="space-y-3">
                  {versions.slice(0, 5).map((ver, i) => (
                    <div 
                      key={ver.id}
                      className={`flex items-center justify-between py-2 ${i !== 0 ? 'border-t border-white/5' : ''}`}
                    >
                      <div>
                        <span className="font-medium text-white">v{ver.version}</span>
                        {i === 0 && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-emerald-500/20 text-emerald-400">
                            Latest
                          </span>
                        )}
                        {ver.prerelease && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-500/20 text-amber-400">
                            Pre-release
                          </span>
                        )}
                        <p className="text-xs text-gray-500">{formatDate(ver.published_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tags */}
            {extension.tags.length > 0 && (
              <section className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-ocean-400" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {extension.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/5 text-gray-400 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* License */}
            <section className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white mb-2">License</h3>
              <p className="text-sm text-gray-400">{extension.license || 'Not specified'}</p>
            </section>

            {/* Categories */}
            {extension.categories.length > 0 && (
              <section className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-semibold text-white mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {extension.categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/?category=${encodeURIComponent(cat)}`}
                      className="px-2.5 py-1 text-xs font-medium rounded-full bg-ocean-500/20 text-ocean-400 border border-ocean-500/30 hover:bg-ocean-500/30 transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
