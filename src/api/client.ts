// src/api/client.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiError, ApiErrorResponse } from '@/types/apiError';
import { getValidToken, removeToken } from '@/utils/jwt';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - inject JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getValidToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      removeToken();
      // Redirect will be handled by React Query error boundaries or useAuth hook
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
