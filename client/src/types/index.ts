export interface UserPreferences {
  theme: 'dark' | 'light' | 'sepia';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  marginWidth: 'compact' | 'normal' | 'wide';
  lineHeight: 'tight' | 'normal' | 'loose';
  fontFamily: 'serif' | 'sans' | 'mono';
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  joinedAt: string;
  storageUsed: number; // in bytes
  storageLimit: number; // in bytes
  preferences: UserPreferences;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  category: string;
  currentPage: number;
  totalPages: number;
  progress: number; // percentage 0-100
  sizeBytes: number;
  fileHash: string;
  uploadedAt: string;
  description?: string;
  format: 'pdf' | 'epub' | 'txt';
  lastReadAt: string;
  tags: string[];
}

export interface Bookmark {
  id: string;
  bookId: string;
  pageNumber: number;
  label: string;
  note?: string;
  createdAt: string;
}

export interface ReadingNote {
  id: string;
  bookId: string;
  pageNumber: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingActivity {
  id: string;
  bookId: string;
  bookTitle: string;
  type: 'read' | 'bookmark' | 'note' | 'upload';
  description: string;
  timestamp: string;
}

export interface UploadQueueItem {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number; // 0-100
  status: 'pending' | 'hashing' | 'uploading' | 'completed' | 'failed' | 'duplicate';
  fileHash?: string;
  error?: string;
}
