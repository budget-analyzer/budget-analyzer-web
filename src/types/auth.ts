/**
 * Authentication and authorization types
 */

/**
 * User roles for authorization
 */
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

/**
 * User profile information
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  roles: UserRole[];
}

/**
 * JWT token payload structure
 * This should match what your backend returns
 */
export interface TokenPayload {
  sub: string; // User ID
  email: string;
  name?: string;
  roles: UserRole[];
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
}

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response from backend
 */
export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Token refresh response
 */
export interface RefreshTokenResponse {
  token: string;
}
