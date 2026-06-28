import React from 'react';
import { Book } from '../../types';
import { BookOpen, MoreVertical, Bookmark } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onClick: () => void;
  onReadClick: (e: React.MouseEvent) => void;
  onMenuClick?: (e: React.MouseEvent) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onClick,
  onReadClick,
  onMenuClick
}) => {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-[#121212] border border-[#1f1f1f] p-4 cursor-pointer transition-all duration-300 hover:border-[#8D8D8D]/40 flex flex-col justify-between h-[340px]"
    >
      {/* Cover container - Book-spine design */}
      <div className="relative w-full h-[200px] bg-[#0c0c0c] border border-[#1f1f1f] flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-[#8D8D8D]/20">
        {book.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          />
        ) : (
          <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-br from-[#121212] to-[#090909]">
            {/* Minimal cover layout */}
            <div className="flex justify-between items-start">
              <span className="text-[8px] text-[#8D8D8D] uppercase tracking-widest font-mono border border-[#1f1f1f] px-1 py-0.5">
                {book.format}
              </span>
              {book.progress > 0 && (
                <Bookmark className="w-3.5 h-3.5 text-[#8D8D8D] fill-current" />
              )}
            </div>
            
            <div className="flex flex-col gap-1.5 my-auto">
              <h4 className="font-serif text-sm text-[#F5F5F5] leading-relaxed line-clamp-3 italic tracking-wide">
                {book.title}
              </h4>
              <p className="text-[10px] text-[#8D8D8D] font-light tracking-wide">
                {book.author}
              </p>
            </div>
            
            <div className="text-[8px] text-[#8D8D8D] tracking-widest uppercase border-t border-[#1f1f1f]/50 pt-1.5">
              {book.category}
            </div>
          </div>
        )}
        
        {/* Floating action overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReadClick(e);
            }}
            className="bg-white text-black p-2.5 rounded-none hover:scale-105 transition-transform duration-250 cursor-pointer flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-light"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Read
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-3 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex justify-between items-start gap-1">
            <h3 className="font-sans text-xs text-[#F5F5F5] font-light truncate group-hover:text-white transition-colors duration-200">
              {book.title}
            </h3>
            {onMenuClick && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuClick(e);
                }}
                className="text-[#8D8D8D] hover:text-[#F5F5F5] p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-[#8D8D8D] font-light truncate mt-0.5">
            {book.author}
          </p>
        </div>
        
        {/* Reading progress */}
        <div className="mt-auto pt-3">
          <div className="flex justify-between text-[8px] text-[#8D8D8D] tracking-wider mb-1 uppercase font-light">
            <span>{book.progress}% read</span>
            <span>{book.currentPage} / {book.totalPages} p.</span>
          </div>
          <div className="w-full h-[1px] bg-[#1f1f1f]">
            <div 
              className="h-full bg-[#8D8D8D] transition-all duration-300 group-hover:bg-[#F5F5F5]"
              style={{ width: `${book.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
