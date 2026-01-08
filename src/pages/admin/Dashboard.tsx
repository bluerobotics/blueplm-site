import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck, Clock, CheckCircle2, XCircle, AlertTriangle,
  ArrowRight, TrendingUp, Package, Loader2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchSubmissions, fetchPendingCount, type ExtensionSubmission, type SubmissionStatus } from '../../lib/api';
import { SubmissionCard } from '../../components/admin';

interface StatCardProps {
  icon: typeof FileCheck;
  label: string;
  value: number;
  color: string;
  linkTo?: string;
}

function StatCard({ icon: Icon, label, value, color, linkTo }: StatCardProps) {
  const content = (
    <div className={`p-5 rounded-xl bg-white/5 border border-white/10 ${linkTo ? 'hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
        {linkTo && (
          <ArrowRight className="w-5 h-5 text-gray-500 ml-auto" />
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
}

export default function Dashboard() {
  const { getAccessToken } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState<ExtensionSubmission[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<SubmissionStatus, number>>({
    pending: 0,
    approved: 0,
    rejected: 0,
    needs_changes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setError(null);

      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        // Fetch all data in parallel
        const [countResult, submissionsResult] = await Promise.all([
          fetchPendingCount(token),
          fetchSubmissions(token, { limit: 50 }),
        ]);

        setPendingCount(countResult);

        // Calculate status counts
        const counts: Record<SubmissionStatus, number> = {
          pending: 0,
          approved: 0,
          rejected: 0,
          needs_changes: 0,
        };
        submissionsResult.data.forEach((sub) => {
          counts[sub.status]++;
        });
        setStatusCounts(counts);

        // Get most recent pending submissions
        const pending = submissionsResult.data
          .filter((s) => s.status === 'pending')
          .slice(0, 5);
        setRecentSubmissions(pending);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [getAccessToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-ocean-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Failed to Load Dashboard</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-ocean-500 to-brand-600 text-white font-semibold hover:from-ocean-400 hover:to-brand-500 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalSubmissions = statusCounts.pending + statusCounts.approved + statusCounts.rejected + statusCounts.needs_changes;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-400">
          Overview of marketplace submissions and activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Pending Review"
          value={pendingCount}
          color="bg-amber-500/20 text-amber-400"
          linkTo="/admin/submissions?status=pending"
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={statusCounts.approved}
          color="bg-emerald-500/20 text-emerald-400"
          linkTo="/admin/submissions?status=approved"
        />
        <StatCard
          icon={AlertTriangle}
          label="Needs Changes"
          value={statusCounts.needs_changes}
          color="bg-orange-500/20 text-orange-400"
          linkTo="/admin/submissions?status=needs_changes"
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={statusCounts.rejected}
          color="bg-red-500/20 text-red-400"
          linkTo="/admin/submissions?status=rejected"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-5 rounded-xl bg-gradient-to-br from-ocean-500/10 to-purple-500/10 border border-ocean-500/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ocean-500/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-ocean-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{totalSubmissions}</p>
              <p className="text-sm text-gray-400">Total Submissions</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {totalSubmissions > 0 
                  ? Math.round((statusCounts.approved / totalSubmissions) * 100) 
                  : 0}%
              </p>
              <p className="text-sm text-gray-400">Approval Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Pending Submissions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            <h2 className="font-display text-xl font-semibold text-white">
              Pending Review
            </h2>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-black">
                {pendingCount}
              </span>
            )}
          </div>
          {pendingCount > 0 && (
            <Link
              to="/admin/submissions?status=pending"
              className="text-sm text-ocean-400 hover:text-ocean-300 font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {recentSubmissions.length > 0 ? (
          <div className="space-y-3">
            {recentSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">All Caught Up!</h3>
            <p className="text-gray-400">
              There are no submissions pending review at the moment.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
