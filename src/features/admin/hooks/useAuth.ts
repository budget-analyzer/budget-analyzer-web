import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as authApi from '@/api/auth';
import type { User, LoginRequest, UserRole } from '@/types/auth';
import { getToken, setToken, removeToken, getUserFromToken } from '@/utils/jwt';

// DEV MODE: Set to true to bypass authentication for development/demo
const DEV_MODE_BYPASS_AUTH = true;

// Mock admin user for development
const DEV_MOCK_USER: User = {
  id: 'dev-user-1',
  email: 'admin@budgetanalyzer.dev',
  name: 'Dev Admin',
  roles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
};

/**
 * Authentication hook
 * Manages user authentication state and provides auth operations
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get current user from token or API
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User | null>({
    queryKey: ['auth', 'currentUser'],
    queryFn: async () => {
      // DEV MODE: Return mock user to bypass auth
      if (DEV_MODE_BYPASS_AUTH) {
        return DEV_MOCK_USER;
      }

      const token = getToken();
      if (!token) {
        return null;
      }

      // First try to get user from token (fast, offline-capable)
      const userFromToken = getUserFromToken(token);
      if (userFromToken) {
        // Optionally validate token with backend
        // TODO: Uncomment when backend is ready
        // try {
        //   const userFromApi = await authApi.getCurrentUser();
        //   return userFromApi;
        // } catch (error) {
        //   // Token invalid, clear it
        //   removeToken();
        //   return null;
        // }
        return userFromToken;
      }

      return null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on auth failures
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['auth', 'currentUser'], data.user);
      navigate('/admin');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // TODO: Call backend to invalidate token when implemented
      // await authApi.logout();
    },
    onSuccess: () => {
      removeToken();
      queryClient.setQueryData(['auth', 'currentUser'], null);
      queryClient.clear(); // Clear all cached data
      navigate('/login');
    },
  });

  return {
    // State
    user,
    isLoading,
    isAuthenticated: !!user,
    error,

    // Operations
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // Authorization helpers
    hasRole: (role: UserRole) => user?.roles.includes(role) ?? false,
    hasAnyRole: (...roles: UserRole[]) => roles.some((role) => user?.roles.includes(role)),
    hasAllRoles: (...roles: UserRole[]) => roles.every((role) => user?.roles.includes(role)),
  };
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (!isLoading && !isAuthenticated) {
    navigate('/login', { replace: true });
  }

  return { isLoading };
}

/**
 * Hook to require specific role
 * Redirects to unauthorized page if user doesn't have the role
 */
export function useRequireRole(role: UserRole) {
  const { hasRole, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isLoading) {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (!hasRole(role)) {
      navigate('/unauthorized', { replace: true });
    }
  }

  return { isLoading };
}
