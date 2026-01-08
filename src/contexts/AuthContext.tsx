import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { createClient, type SupabaseClient, type User, type Session } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: AdminUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

// ============================================================================
// Supabase Client
// ============================================================================

const supabaseUrl = import.meta.env.VITE_STORE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_STORE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabase;
}

// ============================================================================
// Admin Email Check
// ============================================================================

const ADMIN_EMAIL_DOMAIN = '@bluerobotics.com';

function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(ADMIN_EMAIL_DOMAIN);
}

function mapUserToAdmin(user: User | null): AdminUser | null {
  if (!user || !user.email) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    isAdmin: isAdminEmail(user.email),
  };
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const supabase = getSupabase();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setError(error.message);
      } else {
        setSession(session);
        setUser(mapUserToAdmin(session?.user ?? null));
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(mapUserToAdmin(session?.user ?? null));
        setError(null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const supabase = getSupabase();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin/callback`,
        queryParams: {
          // Request access to user's email and profile
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('OAuth error:', error);
      setError(error.message);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setError(null);
    const supabase = getSupabase();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      setError(error.message);
    }
  }, []);

  // Get access token for API calls
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const supabase = getSupabase();
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    return session?.access_token ?? null;
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    loading,
    error,
    signInWithGoogle,
    signOut,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// ============================================================================
// Protected Route Component
// ============================================================================

interface RequireAdminProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAdmin({ children, fallback }: RequireAdminProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return fallback || null;
  }

  if (!user?.isAdmin) {
    return null;
  }

  return <>{children}</>;
}
