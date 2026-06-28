import { create } from 'zustand';
import { UserPreferences } from '../types';

interface ReaderState {
  activeBookId: string | null;
  sidebarOpen: boolean;
  sidebarTab: 'chapters' | 'bookmarks' | 'notes';
  isFullscreen: boolean;
  
  // Custom reading preferences
  readerTheme: 'dark' | 'light' | 'sepia';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  marginWidth: 'compact' | 'normal' | 'wide';
  lineHeight: 'tight' | 'normal' | 'loose';
  fontFamily: 'serif' | 'sans' | 'mono';

  // Actions
  openBook: (bookId: string) => void;
  closeBook: () => void;
  toggleSidebar: () => void;
  setSidebarTab: (tab: 'chapters' | 'bookmarks' | 'notes') => void;
  setIsFullscreen: (val: boolean) => void;
  setReaderTheme: (theme: 'dark' | 'light' | 'sepia') => void;
  setReaderPreference: <K extends keyof Omit<UserPreferences, 'theme'>>(
    key: K,
    value: UserPreferences[K]
  ) => void;
}

export const useReaderStore = create<ReaderState>((set) => {
  // Load standard user settings if available
  const getInitialPreferences = () => {
    try {
      const userCached = localStorage.getItem('bv_user');
      if (userCached) {
        const user = JSON.parse(userCached);
        if (user.preferences) {
          return {
            readerTheme: user.preferences.theme || 'dark',
            fontSize: user.preferences.fontSize || 'medium',
            marginWidth: user.preferences.marginWidth || 'normal',
            lineHeight: user.preferences.lineHeight || 'normal',
            fontFamily: user.preferences.fontFamily || 'serif',
          };
        }
      }
    } catch (e) {
      console.error('Error parsing cached user preferences', e);
    }
    return {
      readerTheme: 'dark' as const,
      fontSize: 'medium' as const,
      marginWidth: 'normal' as const,
      lineHeight: 'normal' as const,
      fontFamily: 'serif' as const,
    };
  };

  const initialPrefs = getInitialPreferences();

  return {
    activeBookId: null,
    sidebarOpen: false,
    sidebarTab: 'chapters',
    isFullscreen: false,
    ...initialPrefs,

    openBook: (bookId) => set({ activeBookId: bookId, sidebarOpen: false }),
    closeBook: () => set({ activeBookId: null, isFullscreen: false }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarTab: (tab) => set({ sidebarTab: tab }),
    setIsFullscreen: (val) => set({ isFullscreen: val }),
    setReaderTheme: (theme) => set({ readerTheme: theme }),
    
    setReaderPreference: (key, value) => set((state) => ({
      ...state,
      [key]: value
    })),
  };
});
