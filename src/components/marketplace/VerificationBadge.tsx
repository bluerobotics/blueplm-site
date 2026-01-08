import { CheckCircle2, AlertTriangle } from 'lucide-react'

interface VerificationBadgeProps {
  verified: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function VerificationBadge({ 
  verified, 
  size = 'md',
  showLabel = true 
}: VerificationBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2'
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  if (verified) {
    return (
      <span 
        className={`inline-flex items-center font-medium text-emerald-400 ${sizeClasses[size]}`}
        title="Verified by Blue Robotics"
      >
        <CheckCircle2 className={`${iconSizes[size]} text-emerald-400`} />
        {showLabel && <span>Verified</span>}
      </span>
    )
  }

  return (
    <span 
      className={`inline-flex items-center font-medium text-amber-400 ${sizeClasses[size]}`}
      title="Community extension - not verified"
    >
      <AlertTriangle className={`${iconSizes[size]} text-amber-400`} />
      {showLabel && <span>Community</span>}
    </span>
  )
}
