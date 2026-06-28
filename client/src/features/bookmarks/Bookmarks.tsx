import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Search, Trash2, BookOpen, Clock } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { useReaderStore } from '../../store/readerStore';
import { useToastStore } from '../../store/toastStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const Bookmarks: React.FC = () => {
  const { books, bookmarks, removeBookmark } = useLibraryStore();
  const { openBook } = useReaderStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedBookFilter, setSelectedBookFilter] = useState('All');

  // Format date
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Find book details by id
  const getBookDetails = (bookId: string) => {
    return books.find(b => b.id === bookId);
  };

  // Filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((bmk) => {
      const book = getBookDetails(bmk.bookId);
      if (!book) return false;

      // Search matches label, book title, author, or note
      const matchesSearch = 
        bmk.label.toLowerCase().includes(search.toLowerCase()) ||
        (bmk.note && bmk.note.toLowerCase().includes(search.toLowerCase())) ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase());

      const matchesBook = selectedBookFilter === 'All' || bmk.bookId === selectedBookFilter;

      return matchesSearch && matchesBook;
    });
  }, [bookmarks, books, search, selectedBookFilter]);

  const handleJumpToBookmark = (bookId: string, pageNumber: number) => {
    // Save progress updates
    useLibraryStore.getState().updateReadingProgress(bookId, pageNumber);
    openBook(bookId);
    navigate('/reader');
    addToast(`Resumed at page ${pageNumber}.`, 'info');
  };

  const handleDeleteBookmark = (id: string) => {
    removeBookmark(id);
    addToast('Bookmark removed.', 'info');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-12 max-w-[1200px] mx-auto flex flex-col gap-10 select-none"
    >
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[#1f1f1f] pb-4">
        <div>
          <span className="text-[10px] text-[#8D8D8D] uppercase tracking-widest font-mono">
            KNOWLEDGE INDEX
          </span>
          <h1 className="text-xl font-serif text-white mt-1 italic tracking-wide">
            Bookmarks & References
          </h1>
        </div>
        <span className="text-[10px] text-[#8D8D8D] font-mono">
          {filteredBookmarks.length} Entries found
        </span>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-grow w-full">
          <Search className="absolute left-0 top-2.5 w-4 h-4 text-[#8D8D8D]/50" />
          <Input
            type="text"
            placeholder="Search bookmark tags or annotations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 w-full"
          />
        </div>

        {/* Book select filter */}
        <div className="w-full sm:w-[220px] shrink-0">
          <select
            value={selectedBookFilter}
            onChange={(e) => setSelectedBookFilter(e.target.value)}
            className="w-full bg-[#121212] text-xs text-[#8D8D8D] border border-[#1f1f1f] py-2.5 px-3 focus:border-[#F5F5F5] focus:text-[#F5F5F5] focus:outline-none transition-colors duration-200 uppercase tracking-wider font-light rounded-none cursor-pointer"
          >
            <option value="All">All Books</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title.substring(0, 24)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookmarks List */}
      {filteredBookmarks.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredBookmarks.map((bmk) => {
            const book = getBookDetails(bmk.bookId);
            if (!book) return null;

            return (
              <div 
                key={bmk.id}
                className="group bg-[#121212] border border-[#1f1f1f] p-5 hover:border-[#8D8D8D]/30 transition-all duration-300 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                <div className="flex flex-col gap-1.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-3.5 h-3.5 text-[#F5F5F5] fill-current shrink-0" />
                    <span className="text-xs text-white font-medium">
                      {bmk.label}
                    </span>
                    <span className="text-[9px] text-[#8D8D8D] font-mono border border-[#1f1f1f] px-1 py-0.5 uppercase shrink-0">
                      Page {bmk.pageNumber}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-[#8D8D8D] font-light truncate max-w-lg">
                    {book.title} by <span className="italic">{book.author}</span>
                  </p>
                  
                  {bmk.note && (
                    <div className="bg-[#090909] border border-[#1f1f1f] p-2 mt-1.5 text-[10px] text-[#8D8D8D] font-light italic leading-relaxed max-w-2xl border-l-white">
                      "{bmk.note}"
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto shrink-0 select-none">
                  {/* Bookmark creation date */}
                  <span className="text-[9px] text-[#8D8D8D] font-mono flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(bmk.createdAt)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleJumpToBookmark(bmk.bookId, bmk.pageNumber)}
                      className="flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      Jump
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBookmark(bmk.id)}
                      className="text-[#8D8D8D] hover:text-red-500 p-2 border border-transparent hover:border-[#1f1f1f]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-[#1f1f1f] py-24 text-center">
          <Bookmark className="w-8 h-8 text-[#8D8D8D]/30 mx-auto mb-4" />
          <h3 className="text-xs uppercase tracking-widest text-[#F5F5F5] font-light">
            No Bookmarks Found
          </h3>
          <p className="text-[11px] text-[#8D8D8D] font-light max-w-xs mx-auto mt-2">
            Annotate and pin pages inside the immersive reader screen to store references here.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default Bookmarks;
