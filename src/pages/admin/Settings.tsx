import { useAuth } from '../../contexts/AuthContext';
import { Settings as SettingsIcon, User, Shield, ExternalLink } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-400">
          Admin account settings and preferences.
        </p>
      </div>

      {/* Account Info */}
      <section className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-400" />
          Account
        </h2>
        <div className="flex items-center gap-4">
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.name || user.email}
              className="w-16 h-16 rounded-full border-2 border-amber-500/50"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-2xl">
              {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-white">
              {user?.name || user?.email?.split('@')[0]}
            </p>
            <p className="text-gray-400">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-medium border border-amber-500/30">
              <Shield className="w-3 h-3" />
              Admin
            </div>
          </div>
        </div>
      </section>

      {/* Admin Access */}
      <section className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-400" />
          Admin Access
        </h2>
        <p className="text-gray-400 mb-4">
          Your account has admin access because it uses a <strong className="text-white">@bluerobotics.com</strong> email address.
        </p>
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <h3 className="font-medium text-amber-300 mb-2">Admin Capabilities</h3>
          <ul className="space-y-2 text-sm text-amber-200/80">
            <li>• Review and approve extension submissions</li>
            <li>• Reject submissions with feedback</li>
            <li>• Request changes from submitters</li>
            <li>• View all submissions and their history</li>
          </ul>
        </div>
      </section>

      {/* Links */}
      <section className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-gray-400" />
          Resources
        </h2>
        <div className="space-y-3">
          <a
            href="https://docs.blueplm.io/extensions/review-guidelines"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="text-gray-300">Review Guidelines</span>
            <ExternalLink className="w-4 h-4 text-gray-500" />
          </a>
          <a
            href="https://docs.blueplm.io/extensions/security-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="text-gray-300">Security Policy</span>
            <ExternalLink className="w-4 h-4 text-gray-500" />
          </a>
          <a
            href="https://github.com/bluerobotics/blueplm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="text-gray-300">BluePLM Repository</span>
            <ExternalLink className="w-4 h-4 text-gray-500" />
          </a>
        </div>
      </section>
    </div>
  );
}
