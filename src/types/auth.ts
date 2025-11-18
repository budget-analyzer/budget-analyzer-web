/**
 * Authentication and authorization types
 */

/**
 * User roles for authorization
 * These come from the JWT claims in the backend
 */
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

/**
 * User profile information from Session Gateway /user endpoint
 * Maps to OAuth2User attributes from Auth0
 */
export interface User {
  sub: string; // User ID (Auth0 subject)
  email: string;
  name?: string;
  picture?: string; // Profile picture URL from Auth0
  emailVerified?: boolean;
  authenticated: boolean;
  registrationId?: string; // OAuth2 registration ID (e.g., "auth0")
  roles?: UserRole[]; // Custom roles (if added to JWT by backend)
}
