import { create } from 'zustand';
import { User, UserPreferences } from '../types';
import { apiClient } from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  addStorageUsed: (bytes: number) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post('/auth/login', { email, password });
        const user = response.data.data.user;
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      } catch (error: any) {
        set({
          error: error.response?.data?.message || 'Login failed',
          isLoading: false,
        });
        return false;
      }
    },

    register: async (name, email, password) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post('/auth/register', { name, email, password });
        // After register, we should probably login, or the backend registers and returns user.
        // auth.controller.js register returns user, but doesn't set cookies. We can just return true and let user login.
        set({ isLoading: false });
        return true;
      } catch (error: any) {
        set({
          error: error.response?.data?.message || 'Registration failed',
          isLoading: false,
        });
        return false;
      }
    },

    logout: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        set({ user: null, isAuthenticated: false });
      }
    },

    checkAuth: async () => {
      set({ isLoading: true });
      try {
        const response = await apiClient.get('/auth/profile');
        const user = response.data.data;
        set({ user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    },

    updatePreferences: (prefs) => {
      // In a real app, this should make an API call to update user preferences on the backend.
      // For now, we update local state.
      set((state) => {
        if (!state.user) return {};
        const updatedUser = {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            ...prefs,
          },
        };
        return { user: updatedUser };
      });
    },

    addStorageUsed: (bytes) => {
      set((state) => {
        if (!state.user) return {};
        const updatedUser = {
          ...state.user,
          storageUsed: Math.min(state.user.storageLimit, state.user.storageUsed + bytes),
        };
        return { user: updatedUser };
      });
    },
  };
});
