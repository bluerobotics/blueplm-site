import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileCheck, Settings, LogOut, 
  ChevronRight, Loader2, ShieldAlert, Menu, X,
  Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchPendingCount } from '../lib/api';

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  badge?: number;
}

export default function AdminLayout() {
  const { user, loading, signOut, getAccessToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // Fetch pending count for badge
  useEffect(() => {
    async function loadPendingCount() {
      const token = await getAccessToken();
      if (!token) return;
      
      try {
        const count = await fetchPendingCount(token);
        setPendingCount(count);
      } catch (error) {
        console.error('Failed to fetch pending count:', error);
      }
    }

    if (user?.isAdmin) {
      loadPendingCount();
      // Refresh every 60 seconds
      const interval = setInterval(loadPendingCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user, getAccessToken]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0f1a] via-[#0d1526] to-[#0f1a2e]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-ocean-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not admin (redirect will happen)
  if (!user?.isAdmin) {
    return null;
  }

  const navItems: NavItem[] = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/submissions', icon: FileCheck, label: 'Submissions', badge: pendingCount },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1526] to-[#0f1a2e]">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        {/* Admin-specific gradient orbs - amber/gold tint */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full" style={{ filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-ocean-500/5 rounded-full" style={{ filter: 'blur(100px)' }} />
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 w-64 h-screen flex flex-col 
        bg-[#0a0f1a]/95 border-r border-white/10
        transform transition-transform duration-300 lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo / Header */}
        <div className="p-4 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg">Admin</h1>
              <p className="text-xs text-gray-500">BluePLM Marketplace</p>
            </div>
          </Link>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive(item.to)
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-black">
                  {item.badge}
                </span>
              )}
              {isActive(item.to) && (
                <ChevronRight className="w-4 h-4" />
              )}
            </Link>
          ))}
        </nav>

        {/* Back to Marketplace */}
        <div className="p-3 border-t border-white/10">
          <Link
            to="/marketplace"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Package className="w-5 h-5" />
            <span>Back to Marketplace</span>
          </Link>
        </div>

        {/* User section */}
        <div className="p-3 border-t border-white/10">
          <div className="px-4 py-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name || user.email}
                  className="w-10 h-10 rounded-full border-2 border-amber-500/50"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name || user.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 px-4 py-3 bg-[#0a0f1a]/95 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span className="font-display font-bold text-white">Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
