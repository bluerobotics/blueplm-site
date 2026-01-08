import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Callback() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for error in URL params
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      setStatus('error');
      setErrorMessage(errorDescription || error);
      return;
    }

    // Wait for auth to complete
    if (!loading) {
      if (user) {
        if (user.isAdmin) {
          setStatus('success');
          // Brief delay to show success message
          setTimeout(() => {
            navigate('/admin', { replace: true });
          }, 1000);
        } else {
          setStatus('error');
          setErrorMessage('Your account does not have admin access. Only @bluerobotics.com accounts are authorized.');
        }
      } else {
        setStatus('error');
        setErrorMessage('Authentication failed. Please try signing in again.');
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1526] to-[#0f1a2e]">
        <div className="absolute inset-0 grid-pattern opacity-50" />
      </div>

      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-ocean-400 animate-spin mx-auto mb-6" />
            <h1 className="font-display text-2xl font-bold text-white mb-2">
              Completing Sign In
            </h1>
            <p className="text-gray-400">
              Please wait while we verify your credentials...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-400">
              Redirecting to the admin dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-2">
              Authentication Failed
            </h1>
            <p className="text-gray-400 mb-6">
              {errorMessage}
            </p>
            <a
              href="/admin/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-ocean-500 to-brand-600 text-white font-semibold hover:from-ocean-400 hover:to-brand-500 transition-all duration-300"
            >
              Try Again
            </a>
          </>
        )}
      </div>
    </div>
  );
}
