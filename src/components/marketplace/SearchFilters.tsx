import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

export interface FilterState {
  search: string
  category: string
  verifiedOnly: boolean
  sortBy: 'popular' | 'recent' | 'name' | 'downloads'
}

interface SearchFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  categories: string[]
  totalResults?: number
}

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recent', label: 'Recently Updated' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'downloads', label: 'Most Downloads' },
] as const

export default function SearchFilters({ 
  filters, 
  onFilterChange, 
  categories,
  totalResults 
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [localSearch, setLocalSearch] = useState(filters.search)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange({ ...filters, search: localSearch })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch])

  const activeFilterCount = [
    filters.category !== '',
    filters.verifiedOnly,
    filters.sortBy !== 'popular'
  ].filter(Boolean).length

  const clearFilters = () => {
    setLocalSearch('')
    onFilterChange({
      search: '',
      category: '',
      verifiedOnly: false,
      sortBy: 'popular'
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search extensions..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-ocean-500/50 focus:ring-2 focus:ring-ocean-500/20 transition-all"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
            showFilters || activeFilterCount > 0
              ? 'bg-ocean-500/20 border-ocean-500/50 text-white'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-ocean-500 text-white text-xs font-semibold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 animate-slide-up">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                  className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-ocean-500/50 cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort By */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
                  className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-ocean-500/50 cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Verified Only */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => onFilterChange({ ...filters, verifiedOnly: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-ocean-500 focus:ring-ocean-500/50"
                />
                <span className="text-sm text-white">Verified Only</span>
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-sm text-gray-400">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-ocean-400 hover:text-ocean-300 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      {totalResults !== undefined && (
        <p className="text-sm text-gray-400">
          {totalResults === 0 
            ? 'No extensions found' 
            : `${totalResults} extension${totalResults !== 1 ? 's' : ''} found`
          }
        </p>
      )}
    </div>
  )
}
