import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Sparkles, TrendingUp, Clock, Package, 
  ArrowRight, Zap, Shield, Puzzle, Loader2, AlertCircle
} from 'lucide-react'
import ExtensionCard, { ExtensionCardData } from '../../components/marketplace/ExtensionCard'
import SearchFilters, { FilterState } from '../../components/marketplace/SearchFilters'
import { fetchExtensions, fetchFeatured, fetchCategories, type ExtensionListItem, type Category } from '../../lib/api'

// Transform API response to card data format
function toCardData(ext: ExtensionListItem): ExtensionCardData {
  return {
    id: ext.id,
    name: ext.display_name,
    description: ext.description || '',
    version: ext.latest_version || '0.0.0',
    publisher: { 
      id: ext.publisher_slug, 
      name: ext.publisher_slug // Will be improved when publisher endpoint is available
    },
    category: ext.categories[0] || 'General',
    verified: ext.verified,
    native: ext.category === 'native',
    nativePlatform: ext.category === 'native' ? ext.tags.find(t => ['SolidWorks', 'Fusion', 'Inventor'].includes(t)) : undefined,
    downloads: ext.download_count,
    updatedAt: ext.created_at,
  }
}

const featuredCategories = [
  { 
    icon: Zap, 
    name: 'CAD', 
    description: 'Connect your CAD tools',
    color: 'from-red-500/20 to-orange-500/20 border-orange-500/30'
  },
  { 
    icon: Puzzle, 
    name: 'ERP', 
    description: 'Sync with your ERP',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
  },
  { 
    icon: Shield, 
    name: 'Sync', 
    description: 'Keep files in sync',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30'
  },
]

export default function MarketplaceIndex() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    verifiedOnly: false,
    sortBy: 'popular'
  })

  // API state
  const [extensions, setExtensions] = useState<ExtensionListItem[]>([])
  const [featured, setFeatured] = useState<ExtensionListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true)
      setError(null)
      
      try {
        const [extensionsRes, featuredRes, categoriesRes] = await Promise.all([
          fetchExtensions({ limit: 50, sort: 'popular' }),
          fetchFeatured(3),
          fetchCategories(),
        ])
        
        setExtensions(extensionsRes.data)
        setFeatured(featuredRes)
        setCategories(categoriesRes)
      } catch (err) {
        console.error('Failed to load marketplace data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load extensions')
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [])

  // Fetch filtered extensions when filters change
  useEffect(() => {
    // Skip if no filters are active and we already have initial data
    const isFiltering = filters.search || filters.category || filters.verifiedOnly || filters.sortBy !== 'popular'
    if (!isFiltering && extensions.length > 0) return

    async function loadFiltered() {
      try {
        const result = await fetchExtensions({
          q: filters.search || undefined,
          categories: filters.category || undefined,
          verified: filters.verifiedOnly || undefined,
          sort: filters.sortBy === 'downloads' ? 'popular' : filters.sortBy,
          limit: 50,
        })
        setExtensions(result.data)
      } catch (err) {
        console.error('Failed to filter extensions:', err)
      }
    }

    // Debounce search
    const timer = setTimeout(loadFiltered, 300)
    return () => clearTimeout(timer)
  }, [filters, extensions.length])

  // Filter and sort extensions (client-side for instant feedback)
  const filteredExtensions = useMemo(() => {
    let result = [...extensions]

    // Search filter (local filtering for instant feedback)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(ext => 
        ext.display_name.toLowerCase().includes(searchLower) ||
        (ext.description?.toLowerCase() || '').includes(searchLower) ||
        ext.publisher_slug.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (filters.category) {
      result = result.filter(ext => ext.categories.includes(filters.category))
    }

    // Verified filter
    if (filters.verifiedOnly) {
      result = result.filter(ext => ext.verified)
    }

    // Sort
    switch (filters.sortBy) {
      case 'popular':
      case 'downloads':
        result.sort((a, b) => b.download_count - a.download_count)
        break
      case 'recent':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'name':
        result.sort((a, b) => a.display_name.localeCompare(b.display_name))
        break
    }

    return result
  }, [extensions, filters])

  // Recently updated
  const recentExtensions = useMemo(() => {
    return [...extensions]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
  }, [extensions])

  const isFiltering = filters.search || filters.category || filters.verifiedOnly || filters.sortBy !== 'popular'
  const categoryNames = categories.map(c => c.name)

  // Loading state
  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-ocean-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading marketplace...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Failed to Load Marketplace</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-ocean-500 to-brand-600 text-white hover:from-ocean-400 hover:to-brand-500 transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-sm mb-6">
            <Package className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300">BluePLM Extension Marketplace</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Extend Your PLM
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Discover powerful extensions to integrate with your tools, automate workflows, 
            and supercharge your product lifecycle management.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-10">
          <SearchFilters 
            filters={filters}
            onFilterChange={setFilters}
            categories={categoryNames}
            totalResults={filteredExtensions.length}
          />
        </div>

        {/* Main Content */}
        {isFiltering ? (
          /* Filtered Results */
          <section>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredExtensions.map((ext) => (
                <ExtensionCard key={ext.id} extension={toCardData(ext)} />
              ))}
            </div>
            {filteredExtensions.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No extensions found</h3>
                <p className="text-gray-400">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </section>
        ) : (
          /* Default Browse View */
          <>
            {/* Category Quick Links */}
            <section className="mb-12">
              <div className="grid gap-4 sm:grid-cols-3">
                {featuredCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setFilters({ ...filters, category: cat.name })}
                    className={`group p-4 rounded-xl bg-gradient-to-br ${cat.color} border hover:scale-[1.02] transition-all duration-300`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <cat.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-white">{cat.name}</h3>
                        <p className="text-sm text-gray-400">{cat.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all ml-auto" />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Featured Extensions */}
            {featured.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h2 className="font-display text-xl font-semibold text-white">Featured</h2>
                  </div>
                  <button 
                    onClick={() => setFilters({ ...filters, verifiedOnly: true })}
                    className="text-sm text-ocean-400 hover:text-ocean-300 font-medium flex items-center gap-1"
                  >
                    View all verified
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.map((ext) => (
                    <ExtensionCard key={ext.id} extension={toCardData(ext)} variant="featured" />
                  ))}
                </div>
              </section>
            )}

            {/* Recently Updated */}
            {recentExtensions.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-ocean-400" />
                    <h2 className="font-display text-xl font-semibold text-white">Recently Updated</h2>
                  </div>
                  <button 
                    onClick={() => setFilters({ ...filters, sortBy: 'recent' })}
                    className="text-sm text-ocean-400 hover:text-ocean-300 font-medium flex items-center gap-1"
                  >
                    See all
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {recentExtensions.map((ext) => (
                    <ExtensionCard key={ext.id} extension={toCardData(ext)} />
                  ))}
                </div>
              </section>
            )}

            {/* All Extensions */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h2 className="font-display text-xl font-semibold text-white">Popular Extensions</h2>
                </div>
                <span className="text-sm text-gray-400">
                  {extensions.length} extensions available
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {extensions.map((ext) => (
                  <ExtensionCard key={ext.id} extension={toCardData(ext)} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Submit CTA */}
        <section className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-ocean-500/10 border border-purple-500/30 text-center">
          <h3 className="font-display text-2xl font-bold text-white mb-3">
            Build Something Amazing?
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Share your extension with the BluePLM community. Get verified and reach thousands of users.
          </p>
          <Link
            to="/marketplace/submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-500 to-ocean-500 text-white hover:from-purple-400 hover:to-ocean-400 transition-all duration-300"
          >
            <Package className="w-5 h-5" />
            Submit Your Extension
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  )
}
