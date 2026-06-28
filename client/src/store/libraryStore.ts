import { create } from 'zustand';
import { Book, Bookmark, ReadingNote, ReadingActivity, UploadQueueItem } from '../types';
import { INITIAL_BOOKS, MOCK_ACTIVITIES } from '../constants';
import { useAuthStore } from './authStore';

interface LibraryState {
  books: Book[];
  bookmarks: Bookmark[];
  notes: ReadingNote[];
  activities: ReadingActivity[];
  uploadQueue: UploadQueueItem[];
  searchQuery: string;
  selectedCategory: string;
  sortBy: 'recent' | 'progress' | 'title' | 'author';
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSortBy: (sort: 'recent' | 'progress' | 'title' | 'author') => void;
  
  addBook: (book: Omit<Book, 'id' | 'uploadedAt' | 'progress' | 'currentPage'>) => void;
  removeBook: (bookId: string) => void;
  updateReadingProgress: (bookId: string, page: number) => void;
  
  addBookmark: (bookId: string, pageNumber: number, label: string, note?: string) => void;
  removeBookmark: (bookmarkId: string) => void;
  
  addNote: (bookId: string, pageNumber: number, content: string) => void;
  updateNote: (noteId: string, content: string) => void;
  removeNote: (noteId: string) => void;
  
  // Upload actions
  addToUploadQueue: (file: File) => void;
  simulateUpload: (queueId: string, file: File) => Promise<void>;
  clearUploadQueue: () => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => {
  // Load initial data from localStorage or fallback
  const cachedBooks = localStorage.getItem('bv_books');
  const cachedBookmarks = localStorage.getItem('bv_bookmarks');
  const cachedNotes = localStorage.getItem('bv_notes');
  const cachedActivities = localStorage.getItem('bv_activities');

  const books = cachedBooks ? JSON.parse(cachedBooks) : INITIAL_BOOKS;
  const bookmarks = cachedBookmarks ? JSON.parse(cachedBookmarks) : [];
  const notes = cachedNotes ? JSON.parse(cachedNotes) : [];
  const activities = cachedActivities ? JSON.parse(cachedActivities) : MOCK_ACTIVITIES;

  const persistData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Helper function to mock hash generation (simulated SHA-256)
  const generateMockSHA256 = (fileName: string, fileSize: number): string => {
    // Generate a simple deterministic string from filename + size
    let hash = 0;
    const str = fileName + fileSize.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return 'sha256_' + Math.abs(hash).toString(16).padStart(16, '0') + 'd5f788e434b29';
  };

  return {
    books,
    bookmarks,
    notes,
    activities,
    uploadQueue: [],
    searchQuery: '',
    selectedCategory: 'All',
    sortBy: 'recent',

    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedCategory: (cat) => set({ selectedCategory: cat }),
    setSortBy: (sort) => set({ sortBy: sort }),

    addBook: (newBookData) => {
      const id = `bk_${Math.random().toString(36).substr(2, 9)}`;
      const newBook: Book = {
        ...newBookData,
        id,
        currentPage: 0,
        progress: 0,
        uploadedAt: new Date().toISOString(),
      };

      set((state) => {
        const updatedBooks = [newBook, ...state.books];
        const newActivity: ReadingActivity = {
          id: `act_${Date.now()}`,
          bookId: id,
          bookTitle: newBook.title,
          type: 'upload',
          description: `Uploaded new book: ${newBook.title}`,
          timestamp: new Date().toISOString(),
        };
        const updatedActivities = [newActivity, ...state.activities];

        persistData('bv_books', updatedBooks);
        persistData('bv_activities', updatedActivities);

        // Update storage used in AuthStore
        useAuthStore.getState().addStorageUsed(newBook.sizeBytes);

        return { books: updatedBooks, activities: updatedActivities };
      });
    },

    removeBook: (bookId) => {
      set((state) => {
        const bookToRemove = state.books.find(b => b.id === bookId);
        const updatedBooks = state.books.filter(b => b.id !== bookId);
        const updatedBookmarks = state.bookmarks.filter(b => b.bookId !== bookId);
        const updatedNotes = state.notes.filter(n => n.bookId !== bookId);
        
        persistData('bv_books', updatedBooks);
        persistData('bv_bookmarks', updatedBookmarks);
        persistData('bv_notes', updatedNotes);

        if (bookToRemove) {
          // Subtract from storage quota
          const authUser = useAuthStore.getState().user;
          if (authUser) {
            const updatedUser = {
              ...authUser,
              storageUsed: Math.max(0, authUser.storageUsed - bookToRemove.sizeBytes)
            };
            localStorage.setItem('bv_user', JSON.stringify(updatedUser));
            useAuthStore.setState({ user: updatedUser });
          }
        }

        return { 
          books: updatedBooks, 
          bookmarks: updatedBookmarks, 
          notes: updatedNotes 
        };
      });
    },

    updateReadingProgress: (bookId, page) => {
      set((state) => {
        const updatedBooks = state.books.map((book) => {
          if (book.id === bookId) {
            const safePage = Math.min(book.totalPages, Math.max(0, page));
            const progress = Math.round((safePage / book.totalPages) * 100);
            return {
              ...book,
              currentPage: safePage,
              progress,
              lastReadAt: new Date().toISOString(),
            };
          }
          return book;
        });

        persistData('bv_books', updatedBooks);

        // Add reading activity
        const book = state.books.find(b => b.id === bookId);
        if (book) {
          const newActivity: ReadingActivity = {
            id: `act_${Date.now()}`,
            bookId,
            bookTitle: book.title,
            type: 'read',
            description: `Read to page ${page}`,
            timestamp: new Date().toISOString(),
          };
          const updatedActivities = [newActivity, ...state.activities.slice(0, 19)];
          persistData('bv_activities', updatedActivities);
          return { books: updatedBooks, activities: updatedActivities };
        }

        return { books: updatedBooks };
      });
    },

    addBookmark: (bookId, pageNumber, label, note) => {
      const newBookmark: Bookmark = {
        id: `bmk_${Math.random().toString(36).substr(2, 9)}`,
        bookId,
        pageNumber,
        label: label || `Page ${pageNumber}`,
        note,
        createdAt: new Date().toISOString(),
      };

      set((state) => {
        const updatedBookmarks = [newBookmark, ...state.bookmarks];
        persistData('bv_bookmarks', updatedBookmarks);

        // Activity log
        const book = state.books.find(b => b.id === bookId);
        const updatedActivities = [
          {
            id: `act_${Date.now()}`,
            bookId,
            bookTitle: book?.title || 'Unknown Book',
            type: 'bookmark' as const,
            description: `Bookmarked page ${pageNumber}${label ? `: "${label}"` : ''}`,
            timestamp: new Date().toISOString(),
          },
          ...state.activities,
        ];
        persistData('bv_activities', updatedActivities);

        return { bookmarks: updatedBookmarks, activities: updatedActivities };
      });
    },

    removeBookmark: (bookmarkId) => {
      set((state) => {
        const updatedBookmarks = state.bookmarks.filter(b => b.id !== bookmarkId);
        persistData('bv_bookmarks', updatedBookmarks);
        return { bookmarks: updatedBookmarks };
      });
    },

    addNote: (bookId, pageNumber, content) => {
      const newNote: ReadingNote = {
        id: `not_${Math.random().toString(36).substr(2, 9)}`,
        bookId,
        pageNumber,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => {
        const updatedNotes = [newNote, ...state.notes];
        persistData('bv_notes', updatedNotes);

        const book = state.books.find(b => b.id === bookId);
        const updatedActivities = [
          {
            id: `act_${Date.now()}`,
            bookId,
            bookTitle: book?.title || 'Unknown Book',
            type: 'note' as const,
            description: `Added note on page ${pageNumber}`,
            timestamp: new Date().toISOString(),
          },
          ...state.activities,
        ];
        persistData('bv_activities', updatedActivities);

        return { notes: updatedNotes, activities: updatedActivities };
      });
    },

    updateNote: (noteId, content) => {
      set((state) => {
        const updatedNotes = state.notes.map((note) => {
          if (note.id === noteId) {
            return {
              ...note,
              content,
              updatedAt: new Date().toISOString(),
            };
          }
          return note;
        });
        persistData('bv_notes', updatedNotes);
        return { notes: updatedNotes };
      });
    },

    removeNote: (noteId) => {
      set((state) => {
        const updatedNotes = state.notes.filter(n => n.id !== noteId);
        persistData('bv_notes', updatedNotes);
        return { notes: updatedNotes };
      });
    },

    addToUploadQueue: (file) => {
      const id = `upl_${Math.random().toString(36).substr(2, 9)}`;
      const newItem: UploadQueueItem = {
        id,
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        status: 'pending',
      };

      set((state) => ({
        uploadQueue: [...state.uploadQueue, newItem],
      }));

      // Immediately start simulation
      get().simulateUpload(id, file);
    },

    simulateUpload: async (queueId, file) => {
      // 1. Pending -> Hashing (Simulate reading the file to calculate SHA-256 for duplicate check)
      set((state) => ({
        uploadQueue: state.uploadQueue.map((item) =>
          item.id === queueId ? { ...item, status: 'hashing', progress: 10 } : item
        ),
      }));

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const fileHash = generateMockSHA256(file.name, file.size);

      // Check if hash already exists in library (Duplicate Detection)
      const isDuplicate = get().books.some((book) => book.fileHash === fileHash);

      if (isDuplicate) {
        set((state) => ({
          uploadQueue: state.uploadQueue.map((item) =>
            item.id === queueId
              ? {
                  ...item,
                  status: 'duplicate',
                  progress: 100,
                  error: `Duplicate detected. This file already exists in your vault.`,
                }
              : item
          ),
        }));
        return;
      }

      // 2. Hashing -> Uploading (Progress 20% to 100%)
      set((state) => ({
        uploadQueue: state.uploadQueue.map((item) =>
          item.id === queueId ? { ...item, status: 'uploading', progress: 30, fileHash } : item
        ),
      }));

      const totalSteps = 7;
      for (let step = 1; step <= totalSteps; step++) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const currentProgress = 30 + Math.round((step / totalSteps) * 70);
        set((state) => ({
          uploadQueue: state.uploadQueue.map((item) =>
            item.id === queueId ? { ...item, progress: currentProgress } : item
          ),
        }));
      }

      // 3. Uploading -> Completed
      set((state) => ({
        uploadQueue: state.uploadQueue.map((item) =>
          item.id === queueId ? { ...item, status: 'completed', progress: 100 } : item
        ),
      }));

      // Add to catalog
      // Extract author from filename or set default
      let author = 'Unknown';
      let title = file.name.replace(/\.[^/.]+$/, ""); // Strip extension
      
      const splitParts = title.split(' - ');
      if (splitParts.length > 1) {
        author = splitParts[0].trim();
        title = splitParts[1].trim();
      } else {
        const splitByBy = title.split(' by ');
        if (splitByBy.length > 1) {
          title = splitByBy[0].trim();
          author = splitByBy[1].trim();
        }
      }

      // Detect format
      const format = file.name.endsWith('.epub') ? 'epub' : file.name.endsWith('.txt') ? 'txt' : 'pdf';

      get().addBook({
        title,
        author,
        category: 'Philosophy', // Default category
        totalPages: format === 'txt' ? 10 : format === 'epub' ? 90 : 250, // default pages
        sizeBytes: file.size,
        fileHash,
        tags: ['New Upload'],
        format,
        lastReadAt: new Date().toISOString(),
        description: `Uploaded from file: ${file.name}. Calculated SHA-256 checksum: ${fileHash.substring(0, 16)}...`,
      });
    },

    clearUploadQueue: () => {
      set({ uploadQueue: [] });
    },
  };
});
