import { create } from 'zustand';
import { User, UserPreferences } from '../types';
import { MOCK_USER } from '../constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  addStorageUsed: (bytes: number) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load cached session
  const cachedUser = localStorage.getItem('bv_user');
  const user = cachedUser ? JSON.parse(cachedUser) : null;

  return {
    user,
    isAuthenticated: !!user,
    isLoading: false,
    error: null,

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (email.trim() && password.length >= 6) {
        // Authenticate using Mock User or create one if mismatch
        const loggedUser: User = {
          ...MOCK_USER,
          email: email.trim(),
          name: email.split('@')[0],
        };
        localStorage.setItem('bv_user', JSON.stringify(loggedUser));
        set({ user: loggedUser, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        set({ error: 'Invalid credentials. Password must be at least 6 characters.', isLoading: false });
        return false;
      }
    },

    register: async (name, email, password) => {
      set({ isLoading: true, error: null });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (name.trim() && email.trim() && password.length >= 6) {
        const newUser: User = {
          id: `usr_${Math.random().toString(36).substr(2, 9)}`,
          email: email.trim(),
          name: name.trim(),
          joinedAt: new Date().toISOString(),
          storageUsed: 0,
          storageLimit: 2 * 1024 * 1024 * 1024, // 2GB free tier
          preferences: {
            theme: 'dark',
            fontSize: 'medium',
            marginWidth: 'normal',
            lineHeight: 'normal',
            fontFamily: 'serif',
          },
        };
        localStorage.setItem('bv_user', JSON.stringify(newUser));
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        set({ error: 'Please enter valid details. Password must be 6+ characters.', isLoading: false });
        return false;
      }
    },

    logout: () => {
      localStorage.removeItem('bv_user');
      set({ user: null, isAuthenticated: false });
    },

    updatePreferences: (prefs) => {
      set((state) => {
        if (!state.user) return {};
        const updatedUser = {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            ...prefs,
          },
        };
        localStorage.setItem('bv_user', JSON.stringify(updatedUser));
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
        localStorage.setItem('bv_user', JSON.stringify(updatedUser));
        return { user: updatedUser };
      });
    },
  };
});
