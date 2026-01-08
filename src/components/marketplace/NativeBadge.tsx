import { Cpu } from 'lucide-react'

interface NativeBadgeProps {
  platform?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function NativeBadge({ 
  platform = 'SolidWorks',
  size = 'md' 
}: NativeBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
    lg: 'text-sm px-2.5 py-1.5 gap-2'
  }

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5'
  }

  return (
    <span 
      className={`inline-flex items-center font-semibold rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-300 border border-orange-500/30 ${sizeClasses[size]}`}
      title={`Native ${platform} integration`}
    >
      <Cpu className={iconSizes[size]} />
      <span>Native</span>
    </span>
  )
}
