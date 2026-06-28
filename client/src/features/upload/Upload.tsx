import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';

export const UploadPage: React.FC = () => {
  const { uploadQueue, addToUploadQueue, clearUploadQueue } = useLibraryStore();
  const { addToast } = useToastStore();
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    const validExtensions = ['.pdf', '.epub', '.txt'];
    let count = 0;

    files.forEach((file) => {
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (validExtensions.includes(extension)) {
        addToUploadQueue(file);
        count++;
      } else {
        addToast(`Unsupported file type: ${file.name}. Only PDF, EPUB, and TXT are supported.`, 'error');
      }
    });

    if (count > 0) {
      addToast(`Added ${count} file(s) to the processing queue.`, 'success');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-12 max-w-[1600px] mx-auto flex flex-col gap-10 select-none"
    >
      {/* Editorial Header */}
      <div className="flex justify-between items-end border-b border-[#1f1f1f] pb-4">
        <div>
          <span className="text-[10px] text-[#8D8D8D] uppercase tracking-widest font-mono">
            INGESTION PIPELINE
          </span>
          <h1 className="text-xl font-serif text-white mt-1 italic tracking-wide">
            Ingest Knowledge Volumes
          </h1>
        </div>
        {uploadQueue.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearUploadQueue}
            className="flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Clear Queue
          </Button>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`w-full min-h-[260px] border border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 relative ${
          isDragActive 
            ? 'border-[#F5F5F5] bg-[#121212]' 
            : 'border-[#1f1f1f] hover:border-[#8D8D8D]/40 bg-transparent'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.epub,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4 max-w-sm">
          <Upload className={`w-8 h-8 text-[#8D8D8D] transition-transform duration-300 ${isDragActive ? '-translate-y-1 text-white' : ''}`} />
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#F5F5F5] font-light">
              Drag & Drop Volumes
            </h3>
            <p className="text-[11px] text-[#8D8D8D] font-light leading-relaxed mt-2">
              Or click to browse your desktop file catalog.<br />
              Supports PDF, EPUB, and TXT (Max 50MB).
            </p>
          </div>
        </div>
      </div>

      {/* Upload Queue Section */}
      <AnimatePresence>
        {uploadQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <h2 className="text-[10px] text-[#8D8D8D] uppercase tracking-[0.2em] font-medium border-b border-[#1f1f1f]/50 pb-2">
              Queue Status & Integrity Checks
            </h2>

            <div className="flex flex-col gap-3">
              {uploadQueue.map((item) => (
                <div 
                  key={item.id}
                  className="bg-[#121212] border border-[#1f1f1f] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-4 h-4 text-[#8D8D8D] shrink-0" />
                    <div className="overflow-hidden">
                      <h4 className="text-xs text-[#F5F5F5] font-light truncate">
                        {item.fileName}
                      </h4>
                      <p className="text-[9px] text-[#8D8D8D] font-mono mt-0.5">
                        {formatBytes(item.fileSize)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Progress and status */}
                  <div className="flex items-center gap-5 shrink-0 select-none">
                    <div className="text-right">
                      {item.status === 'pending' && (
                        <span className="text-[9px] text-[#8D8D8D] uppercase tracking-wider font-light">
                          Queued
                        </span>
                      )}
                      {item.status === 'hashing' && (
                        <span className="text-[9px] text-[#F5F5F5] uppercase tracking-wider font-light flex items-center gap-1.5 justify-end">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Calculating SHA-256 Checksum
                        </span>
                      )}
                      {item.status === 'uploading' && (
                        <span className="text-[9px] text-[#8D8D8D] uppercase tracking-wider font-light">
                          Uploading Vault ({item.progress}%)
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <span className="text-[9px] text-white uppercase tracking-wider font-light flex items-center gap-1.5 justify-end">
                          <CheckCircle className="w-3 h-3" />
                          Vault Ingested
                        </span>
                      )}
                      {item.status === 'duplicate' && (
                        <span className="text-[9px] text-red-500 uppercase tracking-wider font-light flex items-center gap-1.5 justify-end">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Integrity Conflict: Duplicate
                        </span>
                      )}
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-24 h-[1px] bg-[#1f1f1f] relative overflow-hidden hidden sm:block">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          item.status === 'duplicate' ? 'bg-red-500' : 'bg-white'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UploadPage;
