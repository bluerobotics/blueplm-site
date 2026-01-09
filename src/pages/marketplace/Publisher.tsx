import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, Globe, Mail, Calendar,
  CheckCircle2, Package, ChevronRight,
  Shield, ExternalLink, Loader2
} from 'lucide-react'
import ExtensionCard, { ExtensionCardData } from '../../components/marketplace/ExtensionCard'
import { fetchPublisher, type ExtensionListItem } from '../../lib/api'

// Transform API response to card data format
function toCardData(ext: ExtensionListItem): ExtensionCardData {
  return {
    id: ext.id,
    name: ext.display_name,
    description: ext.description || '',
    version: ext.latest_version || '0.0.0',
    publisher: { 
      id: ext.publisher_slug, 
      name: ext.publisher_slug
    },
    category: ext.categories[0] || 'General',
    verified: ext.verified,
    native: ext.category === 'native',
    nativePlatform: ext.category === 'native' ? ext.tags.find(t => ['SolidWorks', 'Fusion', 'Inventor'].includes(t)) : undefined,
    downloads: ext.download_count,
    iconUrl: ext.icon_url || undefined,
    updatedAt: ext.created_at,
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return num.toString()
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
}

interface PublisherData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  support_email: string | null;
  verified: boolean;
  created_at: string;
  extensions: ExtensionListItem[];
  stats: {
    extensions: number;
    totalDownloads: number;
  };
}

export default function Publisher() {
  const { id } = useParams<{ id: string }>()
  
  // API state
  const [publisher, setPublisher] = useState<PublisherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    
    // After guard, id is narrowed to string
    const publisherId = id

    async function loadPublisher() {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchPublisher(publisherId)
        setPublisher(data)
      } catch (err) {
        console.error('Failed to load publisher:', err)
        setError(err instanceof Error ? err.message : 'Failed to load publisher')
      } finally {
        setLoading(false)
      }
    }

    loadPublisher()
  }, [id])

  // Guard for missing ID
  if (!id) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-400">Publisher not found</p>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-ocean-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading publisher...</p>
      </div>
    )
  }

  // Error or not found state
  if (error || !publisher) {
    return (
      <div className="py-16 text-center">
        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Publisher Not Found</h1>
        <p className="text-gray-400 mb-6">
          {error || "The publisher you're looking for doesn't exist."}
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

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-white transition-colors">
            Extensions
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{publisher.name}</span>
        </nav>

        {/* Publisher Header */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Left: Avatar + Info */}
          <div className="flex-1">
            <div className="flex gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                {publisher.logo_url ? (
                  <img 
                    src={publisher.logo_url} 
                    alt={publisher.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl sm:text-5xl font-bold text-white/60">
                    {publisher.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Name + Meta */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    {publisher.name}
                  </h1>
                  {publisher.verified && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified Publisher
                    </span>
                  )}
                </div>

                {publisher.description && (
                  <p className="text-gray-400 mb-4 max-w-2xl">
                    {publisher.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  {publisher.created_at && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(publisher.created_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats + Links */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-white/5 text-center">
                  <p className="text-2xl font-bold text-white">{publisher.stats.extensions}</p>
                  <p className="text-xs text-gray-500">Extensions</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 text-center">
                  <p className="text-2xl font-bold text-white">{formatNumber(publisher.stats.totalDownloads)}</p>
                  <p className="text-xs text-gray-500">Downloads</p>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-2">
                {publisher.website_url && (
                  <a
                    href={publisher.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {publisher.support_email && (
                  <a
                    href={`mailto:${publisher.support_email}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Contact
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Extensions */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-ocean-400" />
              Extensions by {publisher.name}
            </h2>
            <span className="text-sm text-gray-400">
              {publisher.stats.extensions} extension{publisher.stats.extensions !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publisher.extensions.map((ext) => (
              <ExtensionCard key={ext.id} extension={toCardData(ext)} />
            ))}
          </div>

          {publisher.extensions.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No extensions yet</h3>
              <p className="text-gray-400">
                This publisher hasn't published any extensions.
              </p>
            </div>
          )}
        </section>

        {/* Verification Info */}
        {publisher.verified && (
          <section className="mt-12 p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-300 mb-1">Verified Publisher</h3>
                <p className="text-sm text-emerald-200/80">
                  This publisher has been verified by Blue Robotics. Their extensions undergo 
                  additional security review and are held to higher quality standards.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
