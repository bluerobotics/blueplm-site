import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, ArrowRight, Loader2, AlertCircle, Shield
} from 'lucide-react'
import ExtensionCard, { ExtensionCardData } from '../../components/marketplace/ExtensionCard'
import SearchFilters, { FilterState } from '../../components/marketplace/SearchFilters'
import { fetchExtensions, fetchCategories, type ExtensionListItem, type Category } from '../../lib/api'

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
    iconUrl: ext.icon_url || undefined,
    updatedAt: ext.created_at,
  }
}

export default function MarketplaceIndex() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    verifiedOnly: false,
    sortBy: 'name' // Default to alphabetical
  })

  // API state
  const [extensions, setExtensions] = useState<ExtensionListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true)
      setError(null)
      
      try {
        const [extensionsRes, categoriesRes] = await Promise.all([
          fetchExtensions({ limit: 100, sort: 'name' }),
          fetchCategories(),
        ])
        
        setExtensions(extensionsRes.data)
        setCategories(categoriesRes)
      } catch (err) {
        console.error('Failed to load extensions data:', err)
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

  const categoryNames = categories.map(c => c.name)

  // Loading state
  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-ocean-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading extensions...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Failed to Load Extensions</h1>
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
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
              Extensions
            </h1>
            <p className="text-gray-400">
              {extensions.length} extensions available
            </p>
          </div>
          <Link
            to="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Shield className="w-4 h-4" />
            Maintainer Login
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <SearchFilters 
            filters={filters}
            onFilterChange={setFilters}
            categories={categoryNames}
            totalResults={filteredExtensions.length}
          />
        </div>

        {/* Extensions Grid */}
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
                {filters.search ? 'Try adjusting your search' : 'No extensions available yet'}
              </p>
            </div>
          )}
        </section>

        {/* Submit CTA */}
        <section className="mt-12 p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-white">Have an extension to share?</h3>
            <p className="text-sm text-gray-400">Submit it to the extensions store</p>
          </div>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            Submit Extension
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  )
}
