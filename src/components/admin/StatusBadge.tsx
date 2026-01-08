import { Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { SubmissionStatus } from '../../lib/api';

interface StatusBadgeProps {
  status: SubmissionStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<SubmissionStatus, {
  label: string;
  icon: typeof Clock;
  colors: string;
}> = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    colors: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    colors: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    colors: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  needs_changes: {
    label: 'Needs Changes',
    icon: AlertTriangle,
    colors: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      ${config.colors}
      ${sizeClasses[size]}
    `}>
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}
