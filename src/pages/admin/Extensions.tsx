import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, Filter, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, Package, MoreVertical,
  EyeOff, CheckCircle2, Star, StarOff,
  ExternalLink, Shield, Cpu, Trash2, RotateCcw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchAdminExtensions,
  unpublishExtension,
  restoreExtension,
  deleteExtensionPermanently,
  setExtensionVerified,
  setExtensionFeatured,
  type AdminExtension,
  type ExtensionPublishStatus,
  type AdminExtensionListParams
} from '../../lib/api';

const STATUS_OPTIONS: { value: ExtensionPublishStatus; label: string }[] = [
  { value: 'all', label: 'All Extensions' },
  { value: 'published', label: 'Published' },
  { value: 'unpublished', label: 'Unpublished' },
];

const ITEMS_PER_PAGE = 20;

function ExtensionCard({ 
  extension, 
  onUnpublish,
  onRestore,
  onDeletePermanently,
  onToggleVerified,
  onToggleFeatured,
  isLoading,
}: { 
  extension: AdminExtension;
  onUnpublish: (id: string) => void;
  onRestore: (id: string) => void;
  onDeletePermanently: (id: string, name: string) => void;
  onToggleVerified: (id: string, verified: boolean) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  isLoading: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`
      p-4 rounded-xl border transition-all
      ${extension.published 
        ? 'bg-white/5 border-white/10 hover:border-white/20' 
        : 'bg-red-500/5 border-red-500/20 hover:border-red-500/30'
      }
    `}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
          ${extension.category === 'native' 
            ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'
            : 'bg-gradient-to-br from-ocean-500/20 to-blue-500/20 border border-ocean-500/30'
          }
        `}>
          {extension.icon_url ? (
            <img 
              src={extension.icon_url} 
              alt={extension.display_name}
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : extension.category === 'native' ? (
            <Cpu className="w-6 h-6 text-purple-400" />
          ) : (
            <Shield className="w-6 h-6 text-ocean-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">
              {extension.display_name}
            </h3>
            {!extension.published && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                Unpublished
              </span>
            )}
            {extension.verified && (
              <span title="Verified">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              </span>
            )}
            {extension.featured && (
              <span title="Featured">
                <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-mono mb-2">{extension.name}</p>
          <p className="text-sm text-gray-400 line-clamp-2">{extension.description}</p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span>{extension.download_count.toLocaleString()} downloads</span>
            <span>{extension.version_count} versions</span>
            <span className="text-gray-600">by {extension.publisher.name}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            disabled={isLoading}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {menuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-50 w-48 py-2 rounded-xl bg-[#1a2235] border border-white/10 shadow-xl">
                <Link
                  to={`/marketplace/extensions/${extension.id}`}
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10"
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink className="w-4 h-4" />
                  View in Store
                </Link>
                
                <hr className="my-2 border-white/10" />
                
                <button
                  onClick={() => {
                    onToggleVerified(extension.id, !extension.verified);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10"
                >
                  {extension.verified ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Remove Verified
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Mark as Verified
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    onToggleFeatured(extension.id, !extension.featured);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10"
                >
                  {extension.featured ? (
                    <>
                      <StarOff className="w-4 h-4" />
                      Remove Featured
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4" />
                      Mark as Featured
                    </>
                  )}
                </button>
                
                <hr className="my-2 border-white/10" />
                
                {extension.published ? (
                  <button
                    onClick={() => {
                      onUnpublish(extension.id);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                  >
                    <EyeOff className="w-4 h-4" />
                    Unpublish Extension
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onRestore(extension.id);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restore Extension
                    </button>
                    <button
                      onClick={() => {
                        onDeletePermanently(extension.id, extension.display_name);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Permanently
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Extensions() {
  const { getAccessToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter state from URL
  const initialStatus = (searchParams.get('status') as ExtensionPublishStatus) || 'all';
  const initialSearch = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [status, setStatus] = useState<ExtensionPublishStatus>(initialStatus);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  
  // Data state
  const [extensions, setExtensions] = useState<AdminExtension[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load extensions
  const loadExtensions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = await getAccessToken();
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      const params: AdminExtensionListParams = {
        page,
        limit: ITEMS_PER_PAGE,
        status,
      };
      if (search) params.search = search;

      const result = await fetchAdminExtensions(token, params);
      setExtensions(result.data);
      setTotalPages(result.pagination.total_pages);
      setTotal(result.pagination.total);
    } catch (err) {
      console.error('Failed to load extensions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load extensions');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, status, search, page]);

  // Load on mount and when filters change
  useEffect(() => {
    loadExtensions();
  }, [loadExtensions]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (search) params.set('q', search);
    if (page > 1) params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [status, search, page, setSearchParams]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleStatusChange = (newStatus: ExtensionPublishStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUnpublish = async (id: string) => {
    const token = await getAccessToken();
    if (!token) return;

    setActionLoading(id);
    try {
      await unpublishExtension(token, id);
      setSuccessMessage('Extension unpublished successfully');
      loadExtensions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish extension');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (id: string) => {
    const token = await getAccessToken();
    if (!token) return;

    setActionLoading(id);
    try {
      await restoreExtension(token, id);
      setSuccessMessage('Extension restored successfully');
      loadExtensions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore extension');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePermanently = async (id: string, name: string) => {
    // Confirm before permanent deletion
    const confirmed = window.confirm(
      `Are you sure you want to PERMANENTLY DELETE "${name}"?\n\n` +
      `This will remove the extension and ALL related data (versions, installs, reports) from the database.\n\n` +
      `This action CANNOT be undone!`
    );
    
    if (!confirmed) return;

    const token = await getAccessToken();
    if (!token) return;

    setActionLoading(id);
    try {
      await deleteExtensionPermanently(token, id);
      setSuccessMessage(`Extension "${name}" permanently deleted`);
      loadExtensions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete extension');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVerified = async (id: string, verified: boolean) => {
    const token = await getAccessToken();
    if (!token) return;

    setActionLoading(id);
    try {
      await setExtensionVerified(token, id, verified);
      setSuccessMessage(verified ? 'Extension marked as verified' : 'Verification removed');
      loadExtensions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update verification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    const token = await getAccessToken();
    if (!token) return;

    setActionLoading(id);
    try {
      await setExtensionFeatured(token, id, featured);
      setSuccessMessage(featured ? 'Extension marked as featured' : 'Removed from featured');
      loadExtensions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update featured status');
    } finally {
      setActionLoading(null);
    }
  };

  // Count unpublished on current page
  const unpublishedCount = extensions.filter(e => !e.published).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2">
          Extensions
        </h1>
        <p className="text-gray-400">
          Manage published extensions. Unpublish, restore, verify, or feature extensions.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-sm text-emerald-300">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-ocean-500/50 focus:ring-2 focus:ring-ocean-500/20 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as ExtensionPublishStatus)}
            className="appearance-none pl-12 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-ocean-500/50 focus:ring-2 focus:ring-ocean-500/20 transition-all cursor-pointer"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#0d1526]">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-ocean-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading extensions...</p>
          </div>
        </div>
      ) : extensions.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Extensions Found</h2>
            <p className="text-gray-400">
              {status !== 'all' || search
                ? 'Try adjusting your filters or search term.'
                : 'No extensions have been published yet.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, total)} of {total} extensions
              {status === 'all' && unpublishedCount > 0 && (
                <span className="ml-2 text-red-400">
                  ({unpublishedCount} unpublished on this page)
                </span>
              )}
            </p>
          </div>

          {/* Extensions list */}
          <div className="space-y-3">
            {extensions.map((extension) => (
              <ExtensionCard 
                key={extension.id} 
                extension={extension}
                onUnpublish={handleUnpublish}
                onRestore={handleRestore}
                onDeletePermanently={handleDeletePermanently}
                onToggleVerified={handleToggleVerified}
                onToggleFeatured={handleToggleFeatured}
                isLoading={actionLoading === extension.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-1 px-4">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        pageNum === page
                          ? 'bg-ocean-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
