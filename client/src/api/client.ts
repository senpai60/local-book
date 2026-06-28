import axios from 'axios';

// The base URL will use the proxy configured in Vite during development,
// and the correct relative or absolute path in production.
export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Crucial for sending and receiving httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle common errors like 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local state if unauthorized, could dispatch to a store here
      // if we don't want circular dependencies, we handle it in the store
    }
    return Promise.reject(error);
  }
);
