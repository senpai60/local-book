import { create } from 'zustand';
import { Book, Bookmark, ReadingNote, ReadingActivity, UploadQueueItem } from '../types';
import { useAuthStore } from './authStore';
import { apiClient } from '../api/client';

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
  fetchLibrary: () => Promise<void>;
  fetchBookmarks: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSortBy: (sort: 'recent' | 'progress' | 'title' | 'author') => void;
  
  addBook: (book: Omit<Book, 'id' | 'uploadedAt' | 'progress' | 'currentPage'>) => void;
  removeBook: (bookId: string) => Promise<void>;
  updateReadingProgress: (bookId: string, page: number) => Promise<void>;
  
  addBookmark: (bookId: string, pageNumber: number, label: string, note?: string) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  
  addNote: (bookId: string, pageNumber: number, content: string) => void;
  updateNote: (noteId: string, content: string) => void;
  removeNote: (noteId: string) => void;
  
  // Upload actions
  addToUploadQueue: (file: File) => void;
  simulateUpload: (queueId: string, file: File) => Promise<void>;
  clearUploadQueue: () => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => {
  return {
    books: [],
    bookmarks: [],
    notes: [],
    activities: [],
    uploadQueue: [],
    searchQuery: '',
    selectedCategory: 'All',
    sortBy: 'recent',

    fetchLibrary: async () => {
      try {
        const res = await apiClient.get('/library');
        const libraryData = res.data.data?.docs || res.data.data || [];
        
        // Map backend UserBook structure to frontend Book structure
        const formattedBooks = libraryData.map((item: any) => {
          const book = item.bookId || {};
          return {
            id: book._id || item._id || `bk_${Math.random()}`,
            title: book.title || 'Unknown Title',
            author: book.author || 'Unknown Author',
            coverUrl: book.coverUrl,
            category: book.category || 'Uncategorized',
            currentPage: item.currentPage || 0,
            totalPages: book.totalPages || 1,
            progress: item.progress || 0,
            sizeBytes: book.sizeBytes || 0,
            fileHash: book.fileHash || '',
            uploadedAt: item.dateAdded || new Date().toISOString(),
            description: book.description,
            format: book.format || 'pdf',
            lastReadAt: item.lastOpened || new Date().toISOString(),
            tags: book.tags || [],
          };
        });

        set({ books: formattedBooks });
      } catch (error) {
        console.error('Failed to fetch library:', error);
      }
    },

    fetchBookmarks: async () => {
      try {
        const res = await apiClient.get('/bookmarks');
        set({ bookmarks: res.data.data || [] });
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
      }
    },

    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedCategory: (cat) => set({ selectedCategory: cat }),
    setSortBy: (sort) => set({ sortBy: sort }),

    addBook: (newBookData) => {
       // local update, usually called after upload
       const id = `bk_${Math.random().toString(36).substr(2, 9)}`;
       const newBook: Book = {
         ...newBookData,
         id,
         currentPage: 0,
         progress: 0,
         uploadedAt: new Date().toISOString(),
       };
       set((state) => ({ books: [newBook, ...state.books] }));
    },

    removeBook: async (bookId) => {
      try {
        // Assume API endpoint to remove from library
        await apiClient.delete(`/library/${bookId}`);
        set((state) => ({
          books: state.books.filter(b => b.id !== bookId),
          bookmarks: state.bookmarks.filter(b => b.bookId !== bookId),
          notes: state.notes.filter(n => n.bookId !== bookId)
        }));
      } catch (error) {
        console.error('Failed to remove book:', error);
      }
    },

    updateReadingProgress: async (bookId, page) => {
      try {
        // Assuming backend accepts reading progress update
        await apiClient.post('/progress', { bookId, currentPage: page });
        set((state) => ({
          books: state.books.map((book) => {
            if (book.id === bookId) {
              const safePage = Math.min(book.totalPages || 1, Math.max(0, page));
              const progress = Math.round((safePage / (book.totalPages || 1)) * 100);
              return { ...book, currentPage: safePage, progress, lastReadAt: new Date().toISOString() };
            }
            return book;
          })
        }));
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    },

    addBookmark: async (bookId, pageNumber, label, note) => {
      try {
        const res = await apiClient.post('/bookmarks', { bookId, pageNumber, label, note });
        set((state) => ({ bookmarks: [res.data.data, ...state.bookmarks] }));
      } catch (error) {
        console.error('Failed to add bookmark:', error);
      }
    },

    removeBookmark: async (bookmarkId) => {
      try {
        await apiClient.delete(`/bookmarks/${bookmarkId}`);
        set((state) => ({ bookmarks: state.bookmarks.filter(b => b.id !== bookmarkId) }));
      } catch (error) {
        console.error('Failed to remove bookmark:', error);
      }
    },

    // Notes remain local for now as no backend exists
    addNote: (bookId, pageNumber, content) => {
      const newNote: ReadingNote = {
        id: `not_${Math.random().toString(36).substr(2, 9)}`,
        bookId,
        pageNumber,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({ notes: [newNote, ...state.notes] }));
    },

    updateNote: (noteId, content) => {
      set((state) => ({
        notes: state.notes.map((note) => note.id === noteId ? { ...note, content, updatedAt: new Date().toISOString() } : note)
      }));
    },

    removeNote: (noteId) => {
      set((state) => ({ notes: state.notes.filter(n => n.id !== noteId) }));
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
      set((state) => ({ uploadQueue: [...state.uploadQueue, newItem] }));
      get().simulateUpload(id, file);
    },

    simulateUpload: async (queueId, file) => {
      // We will perform a real upload
      const formData = new FormData();
      formData.append('file', file); // Adjust to match backend 'pdf' or 'file'

      set((state) => ({
        uploadQueue: state.uploadQueue.map((item) =>
          item.id === queueId ? { ...item, status: 'uploading', progress: 10 } : item
        ),
      }));

      try {
        const res = await apiClient.post('/books/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
            set((state) => ({
              uploadQueue: state.uploadQueue.map((item) =>
                item.id === queueId ? { ...item, progress: percentCompleted } : item
              ),
            }));
          }
        });

        set((state) => ({
          uploadQueue: state.uploadQueue.map((item) =>
            item.id === queueId ? { ...item, status: 'completed', progress: 100 } : item
          ),
        }));
        
        // Refetch library after successful upload
        get().fetchLibrary();
      } catch (error: any) {
        console.error('Upload failed:', error);
        set((state) => ({
          uploadQueue: state.uploadQueue.map((item) =>
            item.id === queueId ? { ...item, status: 'failed', error: error.response?.data?.message || 'Upload failed' } : item
          ),
        }));
      }
    },

    clearUploadQueue: () => {
      set({ uploadQueue: [] });
    },
  };
});
