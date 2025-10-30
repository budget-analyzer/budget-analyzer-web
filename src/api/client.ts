// src/api/client.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiError, ApiErrorResponse } from '@/types/apiError';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
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
