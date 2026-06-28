import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Trash2, 
  BookOpen, 
  Calendar
} from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { useReaderStore } from '../../store/readerStore';
import { useToastStore } from '../../store/toastStore';
import BookCard from '../../components/ui/BookCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Book } from '../../types';

export const Library: React.FC = () => {
  const { 
    books, 
    removeBook, 
    bookmarks,
    notes,
    searchQuery, 
    setSearchQuery,
    selectedCategory, 
    setSelectedCategory,
    sortBy, 
    setSortBy 
  } = useLibraryStore();
  
  const { openBook } = useReaderStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Available categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    books.forEach(b => cats.add(b.category));
    return ['All', ...Array.from(cats)];
  }, [books]);

  // Format bytes to MB
  const formatBytes = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtered and Sorted books
  const processedBooks = useMemo(() => {
    let result = [...books];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q) ||
        b.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(b => b.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      if (sortBy === 'progress') return b.progress - a.progress;
      // Default: recent (lastReadAt)
      return new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime();
    });

    return result;
  }, [books, searchQuery, selectedCategory, sortBy]);

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
  };

  const handleReadBook = (bookId: string) => {
    openBook(bookId);
    navigate('/reader');
  };

  const handleDeleteBook = (bookId: string) => {
    if (confirm('Are you sure you want to remove this book from your vault? This will also remove all associated bookmarks and notes.')) {
      removeBook(bookId);
      addToast('Volume removed from vault.', 'info');
      setSelectedBook(null);
    }
  };

  // Filter bookmarks & notes for selected book
  const bookBookmarks = useMemo(() => {
    if (!selectedBook) return [];
    return bookmarks.filter(b => b.bookId === selectedBook.id);
  }, [bookmarks, selectedBook]);

  const bookNotes = useMemo(() => {
    if (!selectedBook) return [];
    return notes.filter(n => n.bookId === selectedBook.id);
  }, [notes, selectedBook]);

  return (
    <div className="relative min-h-full flex overflow-hidden select-none">
      
      {/* Catalog Grid */}
      <div className="flex-grow p-6 md:p-12 max-w-[1600px] mx-auto flex flex-col gap-8 w-full">
        
        {/* Header and Search */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-[#1f1f1f] pb-4">
            <h1 className="text-xl font-serif text-white italic tracking-wide">
              Library Vault
            </h1>
            <span className="text-[10px] text-[#8D8D8D] font-mono uppercase">
              {processedBooks.length} / {books.length} Volumes displayed
            </span>
          </div>

          <div className="flex gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search className="absolute left-0 top-2.5 w-4 h-4 text-[#8D8D8D]/50" />
              <Input
                type="text"
                placeholder="Search by title, author, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 w-full"
              />
            </div>

            <Button 
              variant={showFilters ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border border-[#1f1f1f] bg-[#121212] p-5 flex flex-col gap-6"
            >
              {/* Categories */}
              <div>
                <span className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-mono">
                  Browse by category
                </span>
                <div className="flex flex-wrap gap-2 mt-3">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 text-[10px] uppercase tracking-widest font-light transition-all border cursor-pointer ${
                        selectedCategory === cat
                          ? 'border-[#F5F5F5] text-white bg-transparent'
                          : 'border-[#1f1f1f] text-[#8D8D8D] hover:border-[#8D8D8D]/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting */}
              <div>
                <span className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-mono">
                  Sort parameters
                </span>
                <div className="flex gap-3 mt-3">
                  {(['recent', 'progress', 'title', 'author'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSortBy(opt)}
                      className={`text-[10px] uppercase tracking-widest font-light transition-colors py-1 cursor-pointer border-b ${
                        sortBy === opt
                          ? 'border-white text-white font-medium'
                          : 'border-transparent text-[#8D8D8D] hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Books Grid */}
        {processedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {processedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => handleBookSelect(book)}
                onReadClick={() => handleReadBook(book.id)}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[#1f1f1f] py-20 text-center flex flex-col items-center justify-center gap-4">
            <span className="text-xs text-[#8D8D8D] font-light uppercase tracking-wider">
              No volumes match your filters
            </span>
            <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Details Side Sheet (Drawer) */}
      <AnimatePresence>
        {selectedBook && (
          <>
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="absolute inset-0 bg-black/40 z-20"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-[450px] bg-[#121212] border-l border-[#1f1f1f] p-6 z-30 flex flex-col h-full overflow-y-auto"
            >
              {/* Close header */}
              <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-4 mb-6">
                <span className="text-[10px] text-[#8D8D8D] uppercase tracking-widest font-mono">
                  Volume Specifications
                </span>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="text-[#8D8D8D] hover:text-[#F5F5F5] p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cover spine simulation */}
              <div className="w-full h-[180px] bg-[#0c0c0c] border border-[#1f1f1f] flex flex-col justify-between p-5 mb-6 relative">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-mono">
                    Format: {selectedBook.format}
                  </span>
                  <span className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-mono">
                    {formatBytes(selectedBook.sizeBytes)}
                  </span>
                </div>
                <div>
                  <h2 className="font-serif text-lg text-white leading-relaxed italic">
                    {selectedBook.title}
                  </h2>
                  <p className="text-xs text-[#8D8D8D] font-light mt-1">
                    by {selectedBook.author}
                  </p>
                </div>
                <div className="border-t border-[#1f1f1f] pt-2 flex justify-between text-[8px] text-[#8D8D8D] tracking-widest uppercase">
                  <span>Category: {selectedBook.category}</span>
                  <span>{selectedBook.currentPage} / {selectedBook.totalPages} Pages</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-8">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => handleReadBook(selectedBook.id)}
                  className="flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  Read Volume
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteBook(selectedBook.id)}
                  title="Remove from Vault"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Meta specifications */}
              <div className="space-y-6">
                
                {/* Description */}
                {selectedBook.description && (
                  <div className="border-b border-[#1f1f1f] pb-4">
                    <h4 className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-mono mb-2">
                      Overview
                    </h4>
                    <p className="text-xs text-[#8D8D8D] font-light leading-relaxed">
                      {selectedBook.description}
                    </p>
                  </div>
                )}

                {/* Technical Meta */}
                <div className="border-b border-[#1f1f1f] pb-4 space-y-3.5">
                  <h4 className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-mono">
                    Technical Specifications
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[9px] text-[#8D8D8D] block uppercase font-light">SHA-256 Integrity</span>
                      <span className="font-mono text-[9px] text-[#F5F5F5] break-all">
                        {selectedBook.fileHash.replace('sha256_', '')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#8D8D8D] block uppercase font-light">Uploaded Date</span>
                      <span className="text-[10px] text-[#F5F5F5] font-light flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-[#8D8D8D]" />
                        {formatDate(selectedBook.uploadedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reading Status */}
                <div className="border-b border-[#1f1f1f] pb-4 space-y-3">
                  <h4 className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-mono">
                    Reading Statistics
                  </h4>
                  <div className="flex items-center gap-5">
                    <div className="text-center bg-[#090909] border border-[#1f1f1f] px-4 py-2">
                      <span className="text-[9px] text-[#8D8D8D] block uppercase font-light">Progress</span>
                      <span className="text-sm font-serif text-white">{selectedBook.progress}%</span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between text-[9px] text-[#8D8D8D] mb-1 uppercase font-light">
                        <span>Current Location</span>
                        <span>p. {selectedBook.currentPage} / {selectedBook.totalPages}</span>
                      </div>
                      <div className="w-full h-[1px] bg-[#1f1f1f]">
                        <div className="h-full bg-white" style={{ width: `${selectedBook.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bookmarks & Notes Lists */}
                {bookBookmarks.length > 0 && (
                  <div className="border-b border-[#1f1f1f] pb-4">
                    <h4 className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-mono mb-2.5">
                      Bookmarked Pages ({bookBookmarks.length})
                    </h4>
                    <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1">
                      {bookBookmarks.map((bmk) => (
                        <div 
                          key={bmk.id}
                          onClick={() => handleReadBook(selectedBook.id)} 
                          className="bg-[#090909] border border-[#1f1f1f] p-2 hover:border-[#8D8D8D]/30 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-[10px] text-white font-light">
                            {bmk.label}
                          </span>
                          <span className="text-[9px] text-[#8D8D8D] font-mono">
                            p. {bmk.pageNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bookNotes.length > 0 && (
                  <div>
                    <h4 className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-mono mb-2.5">
                      Personal Notes ({bookNotes.length})
                    </h4>
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                      {bookNotes.map((note) => (
                        <div key={note.id} className="bg-[#090909] border border-[#1f1f1f] p-2.5">
                          <div className="flex justify-between items-center text-[8px] text-[#8D8D8D] border-b border-[#1f1f1f]/50 pb-1 mb-1.5 font-mono">
                            <span>Page {note.pageNumber}</span>
                            <span>{formatDate(note.updatedAt)}</span>
                          </div>
                          <p className="text-[10px] text-[#8D8D8D] font-light leading-relaxed">
                            "{note.content}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Library;
