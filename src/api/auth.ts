import { apiClient } from './client';
import type { LoginRequest, LoginResponse, User } from '@/types/auth';

/**
 * Auth API endpoints
 * TODO: Update these endpoints to match your backend API
 */

/**
 * Login with email and password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/v1/auth/login', credentials);
  return response.data;
}

/**
 * Logout (invalidate token on backend)
 */
export async function logout(): Promise<void> {
  await apiClient.post('/v1/auth/logout');
}

/**
 * Get current user profile
 * Used to validate token and fetch user data
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/v1/auth/me');
  return response.data;
}

/**
 * Refresh access token
 * TODO: Implement if you're using refresh tokens
 */
export async function refreshToken(): Promise<string> {
  const response = await apiClient.post<{ token: string }>('/v1/auth/refresh');
  return response.data.token;
}
