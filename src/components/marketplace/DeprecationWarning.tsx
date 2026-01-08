import { AlertOctagon, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface DeprecationWarningProps {
  message?: string
  replacementId?: string
  replacementName?: string
}

export default function DeprecationWarning({ 
  message = 'This extension has been deprecated',
  replacementId,
  replacementName
}: DeprecationWarningProps) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-300 mb-1">Deprecated Extension</h4>
          <p className="text-sm text-red-200/80">
            {message}
          </p>
          {replacementId && replacementName && (
            <Link 
              to={`/extensions/${replacementId}`}
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-red-300 hover:text-red-200 transition-colors"
            >
              <span>See replacement: {replacementName}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
