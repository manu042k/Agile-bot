import toast from "react-hot-toast";

/**
 * Centralized error handling utility
 * Extracts user-friendly error messages from API responses
 */

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

/**
 * Extract error message from various error formats
 */
export function getErrorMessage(error: any): string {
  // Axios error with response
  if (error.response?.data) {
    const data = error.response.data;
    
    // Check common error message fields
    if (typeof data === 'string') {
      return data;
    }
    
    if (data.error) {
      return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    }
    
    if (data.detail) {
      return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    }
    
    if (data.message) {
      return data.message;
    }
    
    // If data has multiple fields, try to format them
    if (typeof data === 'object') {
      const firstKey = Object.keys(data)[0];
      if (firstKey && data[firstKey]) {
        const value = data[firstKey];
        return Array.isArray(value) ? value[0] : value;
      }
    }
  }
  
  // Network error
  if (error.code === 'ERR_NETWORK') {
    return 'Network error. Please check your connection.';
  }
  
  // Timeout error
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }
  
  // Generic error message
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Handle error and show toast notification
 * Returns the error message for further use
 */
export function handleError(error: any, defaultMessage?: string): string {
  const message = defaultMessage || getErrorMessage(error);
  
  // Don't show toast for 401 errors (handled by interceptor)
  if (error.response?.status !== 401) {
    toast.error(message);
  }
  
  return message;
}

/**
 * Parse API error into structured format
 */
export function parseApiError(error: any): ApiError {
  return {
    message: getErrorMessage(error),
    status: error.response?.status,
    details: error.response?.data,
  };
}
