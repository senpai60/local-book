import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Hourglass, 
  Flame, 
  HardDrive, 
  ChevronRight, 
  Plus, 
  Calendar,
  Bookmark,
  FileText
} from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { useReaderStore } from '../../store/readerStore';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';

export const Dashboard: React.FC = () => {
  const { books, activities } = useLibraryStore();
  const { openBook } = useReaderStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Filter in-progress books (progress > 0 and < 100)
  const inProgressBooks = books.filter(b => b.progress > 0 && b.progress < 100);
  const activeBooks = inProgressBooks.length > 0 ? inProgressBooks : books.slice(0, 2);

  const totalBooks = books.length;
  const completedBooks = books.filter(b => b.progress === 100).length;

  const handleResumeReading = (bookId: string) => {
    openBook(bookId);
    navigate(`/reader`);
  };

  const getRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMin = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bookmark': return <Bookmark className="w-3 h-3 text-white" />;
      case 'note': return <FileText className="w-3 h-3 text-white" />;
      default: return <BookOpen className="w-3 h-3 text-white" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-12 max-w-[1600px] mx-auto flex flex-col gap-12 select-none"
    >
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#1f1f1f] pb-6 gap-4">
        <div>
          <span className="text-[10px] text-[#8D8D8D] uppercase tracking-widest font-mono">
            VAULT STATUS: ONLINE
          </span>
          <h1 className="text-2xl font-serif text-white mt-1 italic tracking-wide">
            Welcome back, {user?.name || 'Kenya'}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate('/library')}
          >
            Library Catalog
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="flex items-center gap-1.5"
            onClick={() => navigate('/upload')}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Volume
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Left Section (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {/* Section: Continue Reading */}
          <div>
            <h2 className="text-[10px] text-[#8D8D8D] uppercase tracking-[0.2em] font-medium border-b border-[#1f1f1f]/50 pb-2 mb-6">
              Continue Reading
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBooks.map((book) => (
                <div 
                  key={book.id}
                  className="group bg-[#121212] border border-[#1f1f1f] p-5 flex flex-col justify-between h-[210px] hover:border-[#8D8D8D]/40 transition-all duration-300"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] text-[#8D8D8D] uppercase tracking-wider font-mono border border-[#1f1f1f] px-1.5 py-0.5">
                        {book.category}
                      </span>
                      <span className="text-[9px] text-[#8D8D8D] font-mono">
                        {book.format.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-serif text-sm text-white mt-4 italic truncate group-hover:text-white transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-[10px] text-[#8D8D8D] font-light mt-0.5">
                      by {book.author}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-end text-[9px] text-[#8D8D8D] mb-1.5 uppercase font-light tracking-wide">
                      <span>{book.progress}% read</span>
                      <span>Page {book.currentPage} of {book.totalPages}</span>
                    </div>
                    <div className="w-full h-[1px] bg-[#1f1f1f] mb-4">
                      <div 
                        className="h-full bg-white transition-all duration-300" 
                        style={{ width: `${book.progress}%` }} 
                      />
                    </div>
                    
                    <button
                      onClick={() => handleResumeReading(book.id)}
                      className="text-[10px] font-sans uppercase tracking-widest text-[#F5F5F5] hover:text-white flex items-center gap-1 group/btn cursor-pointer"
                    >
                      Resume
                      <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Recent Activity Timeline */}
          <div>
            <h2 className="text-[10px] text-[#8D8D8D] uppercase tracking-[0.2em] font-medium border-b border-[#1f1f1f]/50 pb-2 mb-6">
              Recent Vault Activity
            </h2>
            
            <div className="relative border-l border-[#1f1f1f] pl-4 flex flex-col gap-6">
              {activities.slice(0, 5).map((act) => (
                <div key={act.id} className="relative group select-none">
                  {/* Bullet Icon */}
                  <div className="absolute -left-[24px] top-0.5 w-4 h-4 bg-[#090909] border border-[#1f1f1f] group-hover:border-white transition-colors duration-200 flex items-center justify-center">
                    {getActivityIcon(act.type)}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1">
                    <div>
                      <h4 className="text-xs text-[#F5F5F5] font-light">
                        {act.description}
                      </h4>
                      <p className="text-[10px] text-[#8D8D8D] font-light mt-0.5 italic">
                        {act.bookTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-[#8D8D8D] font-mono shrink-0">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{getRelativeTime(act.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Section (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Reading Statistics Cards */}
          <div>
            <h2 className="text-[10px] text-[#8D8D8D] uppercase tracking-[0.2em] font-medium border-b border-[#1f1f1f]/50 pb-2 mb-6">
              Library Metrics
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              
              {/* Stat 1 */}
              <div className="bg-[#121212] border border-[#1f1f1f] p-5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[#8D8D8D]">
                  <span className="text-[10px] uppercase tracking-wider font-light">Total Catalog</span>
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-serif text-white font-light tracking-wide mt-1">
                  {totalBooks} <span className="text-xs text-[#8D8D8D] font-sans">Volumes</span>
                </div>
                <div className="text-[9px] text-[#8D8D8D] font-light font-mono">
                  {completedBooks} completely read
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-[#121212] border border-[#1f1f1f] p-5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[#8D8D8D]">
                  <span className="text-[10px] uppercase tracking-wider font-light">Time Invested</span>
                  <Hourglass className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-serif text-white font-light tracking-wide mt-1">
                  18.4 <span className="text-xs text-[#8D8D8D] font-sans">Hours</span>
                </div>
                <div className="text-[9px] text-[#8D8D8D] font-light font-mono">
                  Avg. 24m per session
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-[#121212] border border-[#1f1f1f] p-5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[#8D8D8D]">
                  <span className="text-[10px] uppercase tracking-wider font-light">Reading Streak</span>
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-serif text-white font-light tracking-wide mt-1">
                  4 <span className="text-xs text-[#8D8D8D] font-sans">Days</span>
                </div>
                <div className="text-[9px] text-[#8D8D8D] font-light font-mono">
                  Active since Thursday
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-[#121212] border border-[#1f1f1f] p-5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[#8D8D8D]">
                  <span className="text-[10px] uppercase tracking-wider font-light">Vault Space</span>
                  <HardDrive className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-serif text-white font-light tracking-wide mt-1">
                  {user ? ((user.storageUsed / (1024 * 1024))).toFixed(0) : '0'} <span className="text-xs text-[#8D8D8D] font-sans">MB</span>
                </div>
                <div className="text-[9px] text-[#8D8D8D] font-light font-mono">
                  {user ? ((user.storageUsed / user.storageLimit) * 100).toFixed(1) : '0'}% of 2 GB quota
                </div>
              </div>

            </div>
          </div>
          
          {/* Quick Upload Tip */}
          <div className="border border-[#1f1f1f] p-5 bg-gradient-to-br from-[#121212] to-[#090909] flex flex-col gap-3">
            <h4 className="text-[9px] text-white uppercase tracking-widest font-mono">
              Knowledge Ingestion
            </h4>
            <p className="text-xs text-[#8D8D8D] font-light leading-relaxed">
              Drag your PDF, EPUB, or TXT volumes directly into the Upload screen. BookVault will check file hashes to avoid duplicates.
            </p>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => navigate('/upload')}
            >
              Upload Console
            </Button>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
