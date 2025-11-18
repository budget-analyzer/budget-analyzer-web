// src/api/client.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiError, ApiErrorResponse } from '@/types/apiError';

/**
 * API Client Configuration
 *
 * Authentication flow:
 * - All requests include session cookies automatically (withCredentials: true)
 * - Session Gateway validates session cookie
 * - Session Gateway adds JWT to Authorization header
 * - Session Gateway forwards request to NGINX
 * - NGINX validates JWT and routes to backend services
 *
 * No need to manually add Authorization header - Session Gateway handles it.
 */

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include session cookies in all requests
  timeout: 10000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Handle 401 Unauthorized - session expired or invalid
    if (error.response?.status === 401) {
      // Redirect to login - Session Gateway will handle OAuth flow
      window.location.href = '/oauth2/authorization/auth0';
    }

    if (error.response?.data) {
      // API returned a structured error
      const apiErrorResponse = error.response.data;
      throw new ApiError(error.response.status, apiErrorResponse, apiErrorResponse.message);
    } else if (error.request) {
      // Request made but no response received
      throw new ApiError(503, {
        type: 'SERVICE_UNAVAILABLE',
        message: 'Unable to reach the server. Please check your connection.',
      });
    } else {
      // Something else happened
      throw new ApiError(500, {
        type: 'INTERNAL_ERROR',
        message: error.message,
      });
    }
  },
);
