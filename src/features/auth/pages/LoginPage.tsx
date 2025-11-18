import { useEffect } from 'react';
import { useAuth } from '@/features/admin/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Login Page
 *
 * Redirects users to Session Gateway OAuth2 flow.
 * Session Gateway will:
 * 1. Redirect to Auth0 for authentication
 * 2. Handle OAuth callback
 * 3. Store tokens in Redis
 * 4. Set HttpOnly session cookie
 * 5. Redirect back to frontend
 */
export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to admin
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Budget Analyzer
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to access admin features
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={login}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign in with Auth0
          </button>
        </div>
      </div>
    </div>
  );
}
