import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, GitBranch, Mail, Calendar, User, 
  ExternalLink, Cpu, Shield, Loader2, AlertCircle,
  CheckCircle2, FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchSubmission, 
  approveSubmission, 
  rejectSubmission, 
  requestChangesSubmission,
  type ExtensionSubmission 
} from '../../lib/api';
import { StatusBadge, ReviewActions } from '../../components/admin';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Submission() {
  const { id } = useParams<{ id: string }>();
  const { getAccessToken } = useAuth();
  
  const [submission, setSubmission] = useState<ExtensionSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadSubmission = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);

    const token = await getAccessToken();
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      const data = await fetchSubmission(token, id);
      setSubmission(data);
    } catch (err) {
      console.error('Failed to load submission:', err);
      setError(err instanceof Error ? err.message : 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  }, [id, getAccessToken]);

  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  const handleApprove = async (notes?: string) => {
    if (!id) return;
    
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const result = await approveSubmission(token, id, { notes });
    setSubmission(result.submission);
    setActionSuccess('Submission approved! Extension has been published.');
  };

  const handleReject = async (notes: string) => {
    if (!id) return;
    
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const result = await rejectSubmission(token, id, notes);
    setSubmission(result);
    setActionSuccess('Submission rejected. The submitter will be notified.');
  };

  const handleRequestChanges = async (notes: string) => {
    if (!id) return;
    
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const result = await requestChangesSubmission(token, id, notes);
    setSubmission(result);
    setActionSuccess('Changes requested. The submitter will be notified.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-ocean-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            {error === 'Submission not found' ? 'Submission Not Found' : 'Failed to Load'}
          </h1>
          <p className="text-gray-400 mb-6">{error || 'Submission not found'}</p>
          <Link
            to="/admin/submissions"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-ocean-500 to-brand-600 text-white font-semibold hover:from-ocean-400 hover:to-brand-500 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Submissions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        to="/admin/submissions"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Submissions
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center
          ${submission.category === 'native' 
            ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'
            : 'bg-gradient-to-br from-ocean-500/20 to-blue-500/20 border border-ocean-500/30'
          }
        `}>
          {submission.category === 'native' ? (
            <Cpu className="w-8 h-8 text-purple-400" />
          ) : (
            <Shield className="w-8 h-8 text-ocean-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-white mb-1 truncate">
            {submission.display_name}
          </h1>
          <p className="text-lg text-gray-500 font-mono mb-3">{submission.name}</p>
          <StatusBadge status={submission.status} size="md" />
        </div>
      </div>

      {/* Success Message */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-200/80">
              <p className="font-medium text-emerald-300">{actionSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <section className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Description
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {submission.description || 'No description provided.'}
            </p>
          </section>

          {/* Repository */}
          <section className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-gray-400" />
              Repository
            </h2>
            <a
              href={submission.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-ocean-400 hover:text-ocean-300 transition-colors break-all"
            >
              {submission.repository_url}
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>
          </section>

          {/* Review Actions (only for pending) */}
          {submission.status === 'pending' && (
            <section className="p-5 rounded-xl bg-white/5 border border-white/10">
              <ReviewActions
                submission={submission}
                onApprove={handleApprove}
                onReject={handleReject}
                onRequestChanges={handleRequestChanges}
              />
            </section>
          )}

          {/* Reviewer Notes (for reviewed submissions) */}
          {submission.reviewer_notes && submission.status !== 'pending' && (
            <section className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h2 className="font-semibold text-white mb-3">Reviewer Notes</h2>
              <div className="p-4 rounded-lg bg-black/20 border border-white/5">
                <p className="text-gray-300 whitespace-pre-wrap">
                  {submission.reviewer_notes}
                </p>
                {submission.reviewer_email && submission.reviewed_at && (
                  <p className="mt-3 text-sm text-gray-500">
                    — {submission.reviewer_email}, {formatDate(submission.reviewed_at)}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Approved Extension Link */}
          {submission.status === 'approved' && submission.extension_id && (
            <section className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <h2 className="font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Published Extension
              </h2>
              <Link
                to={`/extensions/${submission.extension_id}`}
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View Extension
                <ExternalLink className="w-4 h-4" />
              </Link>
            </section>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Submitter Info */}
          <section className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h2 className="font-semibold text-white mb-4">Submitter</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300">
                  {submission.submitter_name || 'Not provided'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <a 
                  href={`mailto:${submission.submitter_email}`}
                  className="text-ocean-400 hover:text-ocean-300 transition-colors break-all"
                >
                  {submission.submitter_email}
                </a>
              </div>
            </div>
          </section>

          {/* Category */}
          <section className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h2 className="font-semibold text-white mb-4">Category</h2>
            <div className={`
              inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
              ${submission.category === 'native' 
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'bg-ocean-500/15 text-ocean-400 border border-ocean-500/30'
              }
            `}>
              {submission.category === 'native' ? (
                <>
                  <Cpu className="w-4 h-4" />
                  Native Extension
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Sandboxed Extension
                </>
              )}
            </div>
            {submission.category === 'native' && (
              <p className="mt-3 text-xs text-gray-500">
                Native extensions have access to the local system and require additional security review.
              </p>
            )}
          </section>

          {/* Timestamps */}
          <section className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h2 className="font-semibold text-white mb-4">Timeline</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Submitted</p>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {formatDate(submission.created_at)}
                </div>
              </div>
              {submission.reviewed_at && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reviewed</p>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {formatDate(submission.reviewed_at)}
                  </div>
                </div>
              )}
              {submission.updated_at !== submission.created_at && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {formatDate(submission.updated_at)}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ID */}
          <section className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h2 className="font-semibold text-white mb-2">Submission ID</h2>
            <code className="text-xs text-gray-500 font-mono break-all">
              {submission.id}
            </code>
          </section>
        </div>
      </div>
    </div>
  );
}
