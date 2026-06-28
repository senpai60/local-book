import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Menu, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  Plus, 
  X
} from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { useReaderStore } from '../../store/readerStore';
import { useToastStore } from '../../store/toastStore';
import { MOCK_CHAPTERS } from '../../constants';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const Reader: React.FC = () => {
  const { books, bookmarks, notes, updateReadingProgress, addBookmark, addNote, removeBookmark } = useLibraryStore();
  const { 
    activeBookId, 
    closeBook, 
    sidebarOpen, 
    sidebarTab, 
    toggleSidebar, 
    setSidebarTab, 
    isFullscreen, 
    setIsFullscreen,
    readerTheme, 
    setReaderTheme,
    fontSize, 
    setReaderPreference,
    marginWidth,
    lineHeight,
    fontFamily
  } = useReaderStore();
  
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [newBookmarkLabel, setNewBookmarkLabel] = useState('');
  const [newBookmarkNote, setNewBookmarkNote] = useState('');
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  
  const [noteContent, setNoteContent] = useState('');
  const readerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageItems, setPageItems] = useState<any[]>([]);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);

  // Fallback: if no active book, find the first available or redirect
  const book = books.find(b => b.id === activeBookId) || books[0];

  useEffect(() => {
    if (!book) {
      addToast('Please select a volume from the Library.', 'info');
      navigate('/library');
    }
  }, [book, navigate, addToast]);

  // Load PDF document using pdfjs in the background
  useEffect(() => {
    if (!book) return;
    
    let active = true;
    setIsDecrypting(true);
    setDecryptionError(null);
    setPdfDoc(null);
    setPageItems([]);

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjs.getDocument({
          url: `/api/v1/books/${book.id}/file`,
          withCredentials: true
        });
        const doc = await loadingTask.promise;
        if (active) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          // Sync the total page count immediately to backend and store
          updateReadingProgress(book.id, book.currentPage, doc.numPages);
        }
      } catch (err: any) {
        console.error("Failed to load PDF document:", err);
        if (active) {
          setDecryptionError(err.message || "Failed to load PDF");
        }
      } finally {
        if (active) {
          setIsDecrypting(false);
        }
      }
    };

    loadPdf();
    return () => {
      active = false;
    };
  }, [book?.id, updateReadingProgress]);

  // Load content (text & images) for the active page
  useEffect(() => {
    if (!pdfDoc || !book) return;

    let active = true;
    const loadPage = async () => {
      try {
        const page = await pdfDoc.getPage(book.currentPage + 1);
        
        // 1. Text extraction and sorting
        const textContent = await page.getTextContent();
        const items = textContent.items;
        
        const linesMap: { [key: number]: any[] } = {};
        items.forEach((item: any) => {
          if (!('str' in item) || !item.str.trim()) return;
          const y = Math.round(item.transform[5]);
          const foundY = Object.keys(linesMap).find(ly => Math.abs(Number(ly) - y) <= 3);
          if (foundY) {
            linesMap[Number(foundY)].push(item);
          } else {
            linesMap[y] = [item];
          }
        });

        const sortedY = Object.keys(linesMap).map(Number).sort((a, b) => b - a);
        const textLines = sortedY.map(y => {
          const lineItems = linesMap[y].sort((a, b) => a.transform[4] - b.transform[4]);
          const str = lineItems.map(item => item.str).join(' ');
          return { type: 'text', y, str: str.replace(/\s+/g, ' ').trim() };
        });

        const paragraphs: any[] = [];
        let currentParagraph = '';
        let paragraphY = 0;

        for (let i = 0; i < textLines.length; i++) {
          const line = textLines[i];
          if (currentParagraph === '') {
            currentParagraph = line.str;
            paragraphY = line.y;
          } else {
            const prevLine = textLines[i - 1];
            const gap = prevLine.y - line.y;
            // Check if Y distance between lines suggests paragraph break, or if line ended early
            const isNewParagraph = gap > 18 || prevLine.str.length < 60;

            if (isNewParagraph) {
              paragraphs.push({
                type: 'paragraph',
                y: paragraphY,
                content: currentParagraph
              });
              currentParagraph = line.str;
              paragraphY = line.y;
            } else {
              if (currentParagraph.endsWith('-')) {
                currentParagraph = currentParagraph.slice(0, -1) + line.str;
              } else {
                currentParagraph += ' ' + line.str;
              }
            }
          }
        }

        if (currentParagraph !== '') {
          paragraphs.push({
            type: 'paragraph',
            y: paragraphY,
            content: currentParagraph
          });
        }

        // 2. Image extraction
        const images: any[] = [];
        try {
          const opList = await page.getOperatorList();
          const OPS = pdfjs.OPS || {
            transform: 12,
            paintImageXObject: 85,
            paintInlineImageXObject: 82
          };
          
          let currentTransform = [1, 0, 0, 1, 0, 0];
          
          for (let i = 0; i < opList.fnArray.length; i++) {
            const fn = opList.fnArray[i];
            const args = opList.argsArray[i];
            
            if (fn === OPS.transform) {
              currentTransform = args;
            } else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) {
              const y = Math.round(currentTransform[5]);
              let imgData: any = null;
              
              if (fn === OPS.paintImageXObject) {
                const imgKey = args[0];
                try {
                  imgData = await new Promise((resolve, reject) => {
                    page.objs.get(imgKey, (obj: any) => {
                      if (obj) resolve(obj);
                      else reject("Failed to get image object");
                    });
                  });
                } catch (e) {
                  console.warn("Could not get image object from page", e);
                }
              } else {
                imgData = args[1];
              }

              if (imgData) {
                const canvas = document.createElement('canvas');
                canvas.width = imgData.width || imgData.naturalWidth || 100;
                canvas.height = imgData.height || imgData.naturalHeight || 100;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  if (imgData instanceof ImageBitmap || imgData instanceof HTMLImageElement || imgData instanceof HTMLCanvasElement) {
                    ctx.drawImage(imgData, 0, 0);
                    const src = canvas.toDataURL();
                    images.push({ type: 'image', y, src });
                  } else if (imgData.data) {
                    const imgDataObj = ctx.createImageData(canvas.width, canvas.height);
                    if (imgData.data.length === canvas.width * canvas.height * 4) {
                      imgDataObj.data.set(imgData.data);
                    } else {
                      let srcIdx = 0;
                      let dstIdx = 0;
                      for (let p = 0; p < canvas.width * canvas.height; p++) {
                        imgDataObj.data[dstIdx] = imgData.data[srcIdx];
                        imgDataObj.data[dstIdx + 1] = imgData.data[srcIdx + 1];
                        imgDataObj.data[dstIdx + 2] = imgData.data[srcIdx + 2];
                        imgDataObj.data[dstIdx + 3] = 255;
                        srcIdx += 3;
                        dstIdx += 4;
                      }
                    }
                    ctx.putImageData(imgDataObj, 0, 0);
                    const src = canvas.toDataURL();
                    images.push({ type: 'image', y, src });
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("Failed to parse operator list for images", err);
        }

        // 3. Sort combination by Y descending
        const combined = [...paragraphs, ...images].sort((a, b) => b.y - a.y);
        if (active) {
          setPageItems(combined);
        }
      } catch (err) {
        console.error("Failed to extract page content:", err);
      }
    };

    loadPage();
    return () => {
      active = false;
    };
  }, [pdfDoc, book?.currentPage]);

  // Listen to fullscreen changes outside trigger (e.g. Esc button press)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setIsFullscreen]);

  const chapters = book ? (MOCK_CHAPTERS[book.id] || []) : [];

  const handlePrevPage = () => {
    if (book && book.currentPage > 0) {
      updateReadingProgress(book.id, book.currentPage - 1, numPages || book.totalPages);
    }
  };

  const handleNextPage = () => {
    if (!book) return;
    const total = numPages || book.totalPages || 1;
    if (book.currentPage < total - 1) {
      updateReadingProgress(book.id, book.currentPage + 1, total);
    }
  };

  const handlePageSelect = (page: number) => {
    if (!book) return;
    const total = numPages || book.totalPages || 1;
    const safePage = Math.min(total - 1, Math.max(0, page));
    updateReadingProgress(book.id, safePage, total);
  };

  // Keyboard page turn triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevPage();
      if (e.key === 'ArrowRight') handleNextPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book?.currentPage, numPages]);

  if (!book) return null;

  // Fullscreen trigger
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        addToast('Fullscreen mode blocked by browser policies.', 'error');
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleCreateBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    addBookmark(
      book.id, 
      book.currentPage, 
      newBookmarkLabel || `Page ${book.currentPage}`, 
      newBookmarkNote
    );
    addToast('Bookmark recorded in vault.', 'success');
    setNewBookmarkLabel('');
    setNewBookmarkNote('');
    setShowBookmarkForm(false);
  };

  const handleSaveNote = () => {
    if (!noteContent.trim()) return;
    addNote(book.id, book.currentPage, noteContent);
    addToast('Note appended to page reference.', 'success');
    setNoteContent('');
  };

  // Format styles map
  const themeClasses = {
    dark: 'reading-theme-dark bg-[#090909] text-[#F5F5F5]',
    light: 'reading-theme-light bg-[#FAFAFA] text-[#1A1A1A]',
    sepia: 'reading-theme-sepia bg-[#F4EBD0] text-[#433422]'
  };

  const borderThemeClasses = {
    dark: 'border-[#1f1f1f]',
    light: 'border-[#EAEAEA]',
    sepia: 'border-[#E3D6B5]'
  };

  const activeTextThemeClasses = {
    dark: 'text-[#8D8D8D]',
    light: 'text-[#666666]',
    sepia: 'text-[#7F6F57]'
  };

  const fontClasses = {
    sans: 'font-sans tracking-wide font-light',
    serif: 'font-serif tracking-relaxed font-light',
    mono: 'font-mono text-xs font-light'
  };

  const sizeClasses = {
    small: 'text-xs sm:text-sm',
    medium: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-loose',
    xlarge: 'text-lg sm:text-xl leading-loose'
  };

  const marginClasses = {
    compact: 'max-w-xl px-4',
    normal: 'max-w-3xl px-8',
    wide: 'max-w-5xl px-12'
  };

  const curBookBookmarks = bookmarks.filter(b => b.bookId === book.id);
  const curBookNotes = notes.filter(n => n.bookId === book.id);

  const getPageBookmarks = curBookBookmarks.filter(b => b.pageNumber === book.currentPage);

  return (
    <div 
      ref={readerRef}
      className={`h-screen w-screen flex relative overflow-hidden transition-colors duration-300 select-none ${themeClasses[readerTheme]}`}
    >
      
      {/* Sidebar Drawers (Left or Right) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 340 }}
            exit={{ width: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`h-full border-r flex flex-col shrink-0 overflow-hidden relative z-30 ${
              readerTheme === 'dark' ? 'bg-[#121212] border-[#1f1f1f]' : 
              readerTheme === 'light' ? 'bg-[#F0F0F0] border-[#EAEAEA]' :
              'bg-[#EFE5CA] border-[#E3D6B5]'
            }`}
          >
            {/* Sidebar Tabs Header */}
            <div className={`flex border-b h-14 shrink-0 ${borderThemeClasses[readerTheme]}`}>
              {(['chapters', 'bookmarks', 'notes'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSidebarTab(tab)}
                  className={`flex-grow text-[10px] uppercase tracking-widest font-light transition-all border-b-2 cursor-pointer ${
                    sidebarTab === tab
                      ? readerTheme === 'dark' ? 'border-white text-white font-normal' : 'border-[#433422] text-[#433422] font-normal'
                      : 'border-transparent text-[#8D8D8D] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sidebar Content Panel */}
            <div className="flex-grow overflow-y-auto p-5 text-xs font-light space-y-4">
              
              {/* Tab: Chapters */}
              {sidebarTab === 'chapters' && (
                <div className="space-y-2">
                  <h4 className={`text-[9px] uppercase tracking-widest font-mono mb-4 ${activeTextThemeClasses[readerTheme]}`}>
                    Chapters Index
                  </h4>
                  {chapters.length > 0 ? (
                    chapters.map((ch, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePageSelect(ch.page)}
                        className={`w-full text-left p-2.5 transition-colors border flex justify-between cursor-pointer ${
                          book.currentPage === ch.page
                            ? readerTheme === 'dark' ? 'border-white text-white bg-white/5' : 'border-[#433422] text-[#433422] bg-black/5'
                            : `${borderThemeClasses[readerTheme]} text-[#8D8D8D] hover:text-[#F5F5F5]`
                        }`}
                      >
                        <span>{ch.title}</span>
                        <span className="font-mono text-[9px]">p. {ch.page}</span>
                      </button>
                    ))
                  ) : (
                    <p className={`italic ${activeTextThemeClasses[readerTheme]}`}>No chapters mapped for this format.</p>
                  )}
                </div>
              )}

              {/* Tab: Bookmarks */}
              {sidebarTab === 'bookmarks' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className={`text-[9px] uppercase tracking-widest font-mono ${activeTextThemeClasses[readerTheme]}`}>
                      Volume Bookmarks ({curBookBookmarks.length})
                    </h4>
                    <button
                      onClick={() => setShowBookmarkForm(!showBookmarkForm)}
                      className="p-1 border border-transparent hover:border-current cursor-pointer text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {showBookmarkForm && (
                    <form onSubmit={handleCreateBookmark} className={`border p-3 space-y-3.5 ${borderThemeClasses[readerTheme]}`}>
                      <Input
                        label="Bookmark Label"
                        placeholder="e.g. Chapter 3 quote"
                        value={newBookmarkLabel}
                        onChange={(e) => setNewBookmarkLabel(e.target.value)}
                        required
                      />
                      <Input
                        label="Annotation (Optional)"
                        placeholder="Write a brief memo..."
                        value={newBookmarkNote}
                        onChange={(e) => setNewBookmarkNote(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <Button variant="ghost" size="sm" onClick={() => setShowBookmarkForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" variant="primary" size="sm">
                          Save Pin
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {curBookBookmarks.map((bmk) => (
                      <div 
                        key={bmk.id}
                        className={`border p-3 relative group flex flex-col gap-1.5 ${borderThemeClasses[readerTheme]}`}
                      >
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => handlePageSelect(bmk.pageNumber)}
                            className="font-medium hover:underline text-left cursor-pointer"
                          >
                            {bmk.label}
                          </button>
                          <button
                            onClick={() => removeBookmark(bmk.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <span className={`text-[9px] font-mono ${activeTextThemeClasses[readerTheme]}`}>
                          Page {bmk.pageNumber}
                        </span>
                        {bmk.note && <p className="italic mt-1 text-[#8D8D8D]">"{bmk.note}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Notes */}
              {sidebarTab === 'notes' && (
                <div className="space-y-4">
                  <h4 className={`text-[9px] uppercase tracking-widest font-mono ${activeTextThemeClasses[readerTheme]}`}>
                    Active Page Notepad
                  </h4>

                  <div className="space-y-2">
                    <textarea
                      placeholder={`Write notes on page ${book.currentPage}...`}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className={`w-full min-h-[90px] bg-transparent border p-2 focus:outline-none focus:border-current text-xs font-light resize-none ${borderThemeClasses[readerTheme]}`}
                    />
                    <div className="flex justify-end">
                      <Button variant="primary" size="sm" onClick={handleSaveNote}>
                        Save Note
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-4 border-t border-[#1f1f1f]/20">
                    <h5 className={`text-[9px] uppercase tracking-widest font-mono ${activeTextThemeClasses[readerTheme]}`}>
                      Stored Notes ({curBookNotes.length})
                    </h5>

                    <div className="space-y-2.5">
                      {curBookNotes.map((note) => (
                        <div key={note.id} className={`border p-3 space-y-1 ${borderThemeClasses[readerTheme]}`}>
                          <div className="flex justify-between text-[9px] font-mono mb-1">
                            <button 
                              onClick={() => handlePageSelect(note.pageNumber)}
                              className={`hover:underline font-medium ${activeTextThemeClasses[readerTheme]}`}
                            >
                              Page {note.pageNumber}
                            </button>
                            <span className={activeTextThemeClasses[readerTheme]}>
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed">
                            {note.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Reading Viewport */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
        
        {/* Minimalist Top Nav Header */}
        <div className={`h-14 border-b px-6 flex items-center justify-between shrink-0 ${borderThemeClasses[readerTheme]} z-20`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                closeBook();
                navigate('/library');
              }}
              className="text-[#8D8D8D] hover:text-white flex items-center gap-1 text-[10px] uppercase tracking-widest font-light transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Vault
            </button>
            <div className={`h-4 w-[1px] ${borderThemeClasses[readerTheme]}`} />
            <span className="text-xs font-serif italic truncate max-w-[200px] sm:max-w-md">
              {book.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Sidebar toggle */}
            <button
              onClick={toggleSidebar}
              className={`p-2 border hover:border-current cursor-pointer transition-colors ${
                sidebarOpen ? 'border-white text-white' : `${borderThemeClasses[readerTheme]} text-[#8D8D8D]`
              }`}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Display preferences overlay */}
            <button
              onClick={() => setShowConfigMenu(!showConfigMenu)}
              className={`p-2 border hover:border-current cursor-pointer transition-colors ${
                showConfigMenu ? 'border-white text-white' : `${borderThemeClasses[readerTheme]} text-[#8D8D8D]`
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Fullscreen control */}
            <button
              onClick={handleToggleFullscreen}
              className={`p-2 border text-[#8D8D8D] hover:text-white cursor-pointer transition-colors ${borderThemeClasses[readerTheme]}`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Configurations Dropdown */}
        <AnimatePresence>
          {showConfigMenu && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`absolute right-6 top-16 border p-5 w-[280px] z-40 space-y-5 select-none ${
                readerTheme === 'dark' ? 'bg-[#121212] border-[#1f1f1f]' : 
                readerTheme === 'light' ? 'bg-[#F0F0F0] border-[#EAEAEA]' :
                'bg-[#EFE5CA] border-[#E3D6B5]'
              }`}
            >
              <div className="flex justify-between items-center border-b border-[#1f1f1f]/20 pb-2">
                <span className="text-[9px] uppercase tracking-widest font-mono text-[#8D8D8D]">
                  Display Parameters
                </span>
                <button onClick={() => setShowConfigMenu(false)} className="text-[#8D8D8D] hover:text-white cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reader Theme */}
              <div className="space-y-1.5">
                <span className="text-[8px] uppercase tracking-wider text-[#8D8D8D] font-mono">Contrast Preset</span>
                <div className="flex gap-1.5">
                  {(['dark', 'light', 'sepia'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setReaderTheme(t)}
                      className={`flex-grow py-1 text-[10px] capitalize tracking-wide border cursor-pointer ${
                        readerTheme === t ? 'border-current font-medium' : 'border-transparent text-[#8D8D8D] hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-1.5">
                <span className="text-[8px] uppercase tracking-wider text-[#8D8D8D] font-mono">Typeface</span>
                <div className="flex gap-1.5">
                  {(['serif', 'sans', 'mono'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setReaderPreference('fontFamily', f)}
                      className={`flex-grow py-1 text-[10px] uppercase tracking-wider border cursor-pointer ${
                        fontFamily === f ? 'border-current font-medium' : 'border-transparent text-[#8D8D8D] hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Sizes */}
              <div className="space-y-1.5">
                <span className="text-[8px] uppercase tracking-wider text-[#8D8D8D] font-mono">Font Scale</span>
                <div className="grid grid-cols-4 gap-1">
                  {(['small', 'medium', 'large', 'xlarge'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setReaderPreference('fontSize', s)}
                      className={`py-1 text-[9px] capitalize border cursor-pointer ${
                        fontSize === s ? 'border-current font-medium' : 'border-transparent text-[#8D8D8D] hover:text-white'
                      }`}
                    >
                      {s.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin Width */}
              <div className="space-y-1.5">
                <span className="text-[8px] uppercase tracking-wider text-[#8D8D8D] font-mono">Column Margins</span>
                <div className="flex gap-1.5">
                  {(['compact', 'normal', 'wide'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setReaderPreference('marginWidth', m)}
                      className={`flex-grow py-1 text-[10px] capitalize tracking-wide border cursor-pointer ${
                        marginWidth === m ? 'border-current font-medium' : 'border-transparent text-[#8D8D8D] hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Centered Document Canvas Area */}
        <div className="flex-grow overflow-y-auto px-6 py-12 flex justify-center items-start">
          
          <div className={`w-full flex flex-col min-h-full justify-between items-center ${marginClasses[marginWidth]}`}>
            
            {/* Top Chapter Breadcrumb indicator */}
            <div className="flex items-center gap-1.5 select-none mb-6">
              <span className={`text-[10px] font-mono tracking-widest uppercase ${activeTextThemeClasses[readerTheme]}`}>
                CHAPTER INDEX
              </span>
              <div className={`w-1 h-1 rounded-full ${readerTheme === 'dark' ? 'bg-[#8D8D8D]' : 'bg-[#433422]'}`} />
              <span className="text-[10px] font-serif italic text-[#8D8D8D]">
                {chapters.find(c => book.currentPage >= c.page)?.title || 'Preface'}
              </span>
            </div>
 
            {/* Immersive animated text display */}
            <div className="w-full flex flex-col justify-center select-text relative">
              {isDecrypting ? (
                <div className="flex items-center justify-center text-[#8D8D8D] font-mono text-xs uppercase tracking-widest h-64">
                  Decrypting Vault Source...
                </div>
              ) : decryptionError ? (
                <div className="text-red-500 font-mono text-xs p-4 text-center">
                  Failed to decrypt physical format: {decryptionError}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={book.currentPage}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.22 }}
                    className={`w-full select-text ${fontClasses[fontFamily]} ${sizeClasses[fontSize]}`}
                    style={{
                      lineHeight: lineHeight === 'tight' ? 1.6 : lineHeight === 'normal' ? 2.1 : 2.5
                    }}
                  >
                    {pageItems.length > 0 ? (
                      pageItems.map((item, idx) => {
                        if (item.type === 'paragraph') {
                          return (
                            <p key={idx} className="mb-6 text-justify tracking-wide first-of-type:indent-0 indent-6">
                              {item.content}
                            </p>
                          );
                        } else if (item.type === 'image') {
                          return (
                            <div key={idx} className="my-8 flex justify-center max-w-full overflow-hidden">
                              <img 
                                src={item.src} 
                                alt="Illustration" 
                                className="max-w-full rounded border border-[#1f1f1f]/20 shadow-lg max-h-[450px] object-contain select-none" 
                              />
                            </div>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <p className="italic text-[#8D8D8D] text-center">Empty page or no extractable content.</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Embedded Bookmark shortcut list on page */}
            {getPageBookmarks.length > 0 && (
              <div className="w-full flex gap-1.5 flex-wrap justify-center mt-6 select-none">
                {getPageBookmarks.map((b) => (
                  <span 
                    key={b.id}
                    className="flex items-center gap-1 text-[8px] tracking-widest font-mono uppercase border border-current px-2 py-0.5"
                  >
                    <Bookmark className="w-2.5 h-2.5 fill-current" />
                    {b.label}
                  </span>
                ))}
              </div>
            )}

            {/* Floating Navigation Footnote bar */}
            <div className="mt-8 select-none text-[10px] font-mono tracking-widest uppercase text-[#8D8D8D] flex items-center gap-1.5 border-t border-[#1f1f1f]/20 pt-4">
              <span>Page {book.currentPage + 1} of {numPages || book.totalPages}</span>
              <span>•</span>
              <span>{Math.round(((book.currentPage + 1) / (numPages || book.totalPages)) * 100)}% Complete</span>
            </div>

          </div>
        </div>

        {/* Immersive Floating Reader Toolbar */}
        <div className="h-16 shrink-0 flex items-center justify-center border-t border-transparent z-20 pointer-events-none select-none mb-6">
          <div className={`pointer-events-auto border h-11 px-4 flex items-center justify-between gap-4 max-w-sm w-full ${
            readerTheme === 'dark' ? 'bg-[#121212]/90 border-[#1f1f1f]' : 
            readerTheme === 'light' ? 'bg-[#F0F0F0]/90 border-[#EAEAEA]' :
            'bg-[#EFE5CA]/90 border-[#E3D6B5]'
          } backdrop-blur-[4px]`}>
            
            <button
              onClick={handlePrevPage}
              disabled={book.currentPage === 0}
              className={`p-1.5 border cursor-pointer shrink-0 transition-colors ${borderThemeClasses[readerTheme]} text-[#8D8D8D] hover:text-white disabled:opacity-30 disabled:hover:text-[#8D8D8D]`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8D8D8D]">
              Page {book.currentPage + 1} of {numPages || book.totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={book.currentPage === (numPages || book.totalPages) - 1}
              className={`p-1.5 border cursor-pointer shrink-0 transition-colors ${borderThemeClasses[readerTheme]} text-[#8D8D8D] hover:text-white disabled:opacity-30 disabled:hover:text-[#8D8D8D]`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Reader;
