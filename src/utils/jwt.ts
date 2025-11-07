import type { TokenPayload, User } from '@/types/auth';

/**
 * JWT token utilities
 * Handles parsing, validation, and storage of JWT tokens
 */

const TOKEN_KEY = 'auth_token';

/**
 * Decode JWT token without verification
 * Note: This only decodes the payload, it does NOT verify the signature
 * Signature verification must happen on the backend
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded as TokenPayload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) {
    return true;
  }

  // Check if token expires in next 60 seconds (add buffer for clock skew)
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  return now >= expirationTime - 60000;
}

/**
 * Extract user from token payload
 */
export function getUserFromToken(token: string): User | null {
  const payload = decodeToken(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    roles: payload.roles,
  };
}

/**
 * Store token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Get valid token (returns null if expired or missing)
 */
export function getValidToken(): string | null {
  const token = getToken();
  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    removeToken();
    return null;
  }

  return token;
}
