import axios from 'axios';
import toast from 'react-hot-toast';

// Base URL configuration for Axios
// Uses environment variable or defaults to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle Network Errors
    if (!error.response) {
      toast.error('Network error. Please check your connection or try again later.');
      return Promise.reject(error);
    }

    // Handle standard API errors
    const data = error.response.data;
    const status = error.response.status;

    if (data && data.error) {
      // If it's a validation error, we might have details
      if (status === 422 && data.details) {
        toast.error(`Validation failed: ${data.details[0]?.message || 'Check input fields'}`);
      } else {
        toast.error(data.error);
      }
    } else {
      toast.error(`An unexpected error occurred (${status})`);
    }

    return Promise.reject(error);
  }
);

export default api;
