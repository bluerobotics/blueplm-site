import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, FileCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchSubmissions, 
  type ExtensionSubmission, 
  type SubmissionStatus,
  type SubmissionListParams
} from '../../lib/api';
import { SubmissionCard, StatusBadge } from '../../components/admin';

const STATUS_OPTIONS: { value: SubmissionStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'needs_changes', label: 'Needs Changes' },
  { value: 'rejected', label: 'Rejected' },
];

const ITEMS_PER_PAGE = 20;

export default function Submissions() {
  const { getAccessToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter state from URL
  const initialStatus = searchParams.get('status') as SubmissionStatus | null;
  const initialSearch = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [status, setStatus] = useState<SubmissionStatus | ''>(initialStatus || '');
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  
  // Data state
  const [submissions, setSubmissions] = useState<ExtensionSubmission[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load submissions
  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = await getAccessToken();
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      const params: SubmissionListParams = {
        page,
        limit: ITEMS_PER_PAGE,
      };
      if (status) params.status = status;
      if (search) params.search = search;

      const result = await fetchSubmissions(token, params);
      setSubmissions(result.data);
      setTotalPages(result.pagination.total_pages);
      setTotal(result.pagination.total);
    } catch (err) {
      console.error('Failed to load submissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, status, search, page]);

  // Load on mount and when filters change
  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
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

  const handleStatusChange = (newStatus: SubmissionStatus | '') => {
    setStatus(newStatus);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2">
          Submissions
        </h1>
        <p className="text-gray-400">
          Review and manage extension submissions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or description..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-ocean-500/50 focus:ring-2 focus:ring-ocean-500/20 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as SubmissionStatus | '')}
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

      {/* Active Filters */}
      {(status || search) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {status && (
            <StatusBadge status={status} size="sm" />
          )}
          {search && (
            <span className="px-3 py-1 text-sm rounded-full bg-ocean-500/15 text-ocean-400 border border-ocean-500/30">
              Search: "{search}"
            </span>
          )}
          <button
            onClick={() => {
              setStatus('');
              setSearch('');
              setSearchInput('');
              setPage(1);
            }}
            className="text-sm text-gray-400 hover:text-white underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-ocean-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading submissions...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Failed to Load</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={loadSubmissions}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-ocean-500 to-brand-600 text-white font-semibold hover:from-ocean-400 hover:to-brand-500 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <FileCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Submissions Found</h2>
            <p className="text-gray-400">
              {status || search
                ? 'Try adjusting your filters or search term.'
                : 'No submissions have been made yet.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, total)} of {total} submissions
            </p>
          </div>

          {/* Submissions list */}
          <div className="space-y-3">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
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
