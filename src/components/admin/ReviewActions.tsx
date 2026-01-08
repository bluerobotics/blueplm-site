import { useState } from 'react';
import { 
  CheckCircle2, XCircle, AlertTriangle, 
  Loader2, Send, X
} from 'lucide-react';
import type { ExtensionSubmission } from '../../lib/api';

type ActionType = 'approve' | 'reject' | 'request-changes';

interface ReviewActionsProps {
  submission: ExtensionSubmission;
  onApprove: (notes?: string) => Promise<void>;
  onReject: (notes: string) => Promise<void>;
  onRequestChanges: (notes: string) => Promise<void>;
  disabled?: boolean;
}

const actionConfig: Record<ActionType, {
  label: string;
  icon: typeof CheckCircle2;
  colors: string;
  hoverColors: string;
  description: string;
  requiresNotes: boolean;
  minNotesLength?: number;
}> = {
  approve: {
    label: 'Approve',
    icon: CheckCircle2,
    colors: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    hoverColors: 'hover:bg-emerald-500/20 hover:border-emerald-500/50',
    description: 'Approve this extension and publish it.',
    requiresNotes: false,
  },
  reject: {
    label: 'Reject',
    icon: XCircle,
    colors: 'bg-red-500/10 text-red-400 border-red-500/30',
    hoverColors: 'hover:bg-red-500/20 hover:border-red-500/50',
    description: 'Reject this submission. The submitter will be notified with your feedback.',
    requiresNotes: true,
    minNotesLength: 10,
  },
  'request-changes': {
    label: 'Request Changes',
    icon: AlertTriangle,
    colors: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    hoverColors: 'hover:bg-orange-500/20 hover:border-orange-500/50',
    description: 'Request changes from the submitter. They can update and resubmit.',
    requiresNotes: true,
    minNotesLength: 10,
  },
};

export default function ReviewActions({
  submission,
  onApprove,
  onReject,
  onRequestChanges,
  disabled = false,
}: ReviewActionsProps) {
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show actions for pending submissions
  if (submission.status !== 'pending') {
    return null;
  }

  const handleSubmit = async () => {
    if (!activeAction) return;

    const config = actionConfig[activeAction];
    
    // Validate notes
    if (config.requiresNotes && config.minNotesLength && notes.length < config.minNotesLength) {
      setError(`Notes must be at least ${config.minNotesLength} characters`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      switch (activeAction) {
        case 'approve':
          await onApprove(notes || undefined);
          break;
        case 'reject':
          await onReject(notes);
          break;
        case 'request-changes':
          await onRequestChanges(notes);
          break;
      }
      setActiveAction(null);
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setActiveAction(null);
    setNotes('');
    setError(null);
  };

  // Show action form if an action is selected
  if (activeAction) {
    const config = actionConfig[activeAction];
    const Icon = config.icon;
    const notesValid = !config.requiresNotes || (config.minNotesLength && notes.length >= config.minNotesLength);

    return (
      <div className={`p-5 rounded-xl border ${config.colors}`}>
        <div className="flex items-start gap-3 mb-4">
          <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white">{config.label} Submission</h3>
            <p className="text-sm text-gray-400 mt-1">{config.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {config.requiresNotes ? 'Feedback (required)' : 'Notes (optional)'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setError(null);
              }}
              placeholder={config.requiresNotes 
                ? 'Explain why you are taking this action...'
                : 'Add any notes for this action...'
              }
              rows={4}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all resize-none disabled:opacity-50"
            />
            {config.minNotesLength && (
              <div className="flex justify-between items-center mt-1.5">
                <p className={`text-xs ${notes.length < config.minNotesLength ? 'text-gray-500' : 'text-emerald-400'}`}>
                  {notes.length} / {config.minNotesLength} characters minimum
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading || !notesValid}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                font-semibold transition-all duration-200
                ${activeAction === 'approve' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400'
                  : activeAction === 'reject'
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-400 hover:to-rose-400'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-400 hover:to-amber-400'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Confirm {config.label}
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show action buttons
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
        Review Actions
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(actionConfig) as ActionType[]).map((action) => {
          const config = actionConfig[action];
          const Icon = config.icon;

          return (
            <button
              key={action}
              onClick={() => setActiveAction(action)}
              disabled={disabled}
              className={`
                flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                font-medium border transition-all duration-200
                ${config.colors} ${config.hoverColors}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <Icon className="w-5 h-5" />
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
