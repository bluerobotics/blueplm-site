import { Link } from 'react-router-dom';
import { 
  GitBranch, Mail, Calendar, User, 
  ArrowRight, Cpu, Shield
} from 'lucide-react';
import type { ExtensionSubmission } from '../../lib/api';
import StatusBadge from './StatusBadge';

interface SubmissionCardProps {
  submission: ExtensionSubmission;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export default function SubmissionCard({ submission }: SubmissionCardProps) {
  const isPending = submission.status === 'pending';
  
  return (
    <Link
      to={`/admin/submissions/${submission.id}`}
      className={`
        group relative block p-5 rounded-xl transition-all duration-300
        bg-white/5 border hover:bg-white/10
        ${isPending 
          ? 'border-amber-500/30 hover:border-amber-500/50' 
          : 'border-white/10 hover:border-white/20'
        }
      `}
    >
      {/* Priority indicator for pending */}
      {isPending && (
        <div className="absolute top-0 left-4 w-1 h-8 rounded-b bg-gradient-to-b from-amber-500 to-orange-500" />
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
          ${submission.category === 'native' 
            ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'
            : 'bg-gradient-to-br from-ocean-500/20 to-blue-500/20 border border-ocean-500/30'
          }
        `}>
          {submission.category === 'native' ? (
            <Cpu className="w-6 h-6 text-purple-400" />
          ) : (
            <Shield className="w-6 h-6 text-ocean-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="font-semibold text-white group-hover:text-ocean-300 transition-colors truncate">
                {submission.display_name}
              </h3>
              <p className="text-sm text-gray-500 font-mono truncate">
                {submission.name}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-ocean-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
          </div>

          {/* Status */}
          <div className="mb-3">
            <StatusBadge status={submission.status} size="sm" />
          </div>

          {/* Description */}
          {submission.description && (
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
              {submission.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {submission.submitter_name || submission.submitter_email.split('@')[0]}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {submission.submitter_email}
            </span>
            <a
              href={submission.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 hover:text-ocean-400 transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
              View Repository
            </a>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatRelativeDate(submission.created_at)}
            </span>
          </div>

          {/* Reviewer notes preview for reviewed submissions */}
          {submission.reviewer_notes && submission.status !== 'pending' && (
            <div className="mt-3 p-2 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 line-clamp-1">
                <span className="text-gray-500">Note:</span> {submission.reviewer_notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
