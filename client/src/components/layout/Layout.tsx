import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ToastContainer from '../ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { useReaderStore } from '../../store/readerStore';
import { useLibraryStore } from '../../store/libraryStore';

export const Layout: React.FC = () => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();
  const { activeBookId } = useReaderStore();
  const fetchLibrary = useLibraryStore((state) => state.fetchLibrary);
  const navigate = useNavigate();

  // Route guarding: check if authenticated
  useEffect(() => {
    if (isCheckingAuth) return;
    
    if (!isAuthenticated) {
      navigate('/auth/login');
    } else {
      fetchLibrary();
    }
  }, [isAuthenticated, isCheckingAuth, navigate, fetchLibrary]);

  if (isCheckingAuth) {
    return <div className="h-screen w-screen bg-[#090909] flex items-center justify-center text-[#8D8D8D] text-xs tracking-widest font-mono">LOADING VAULT...</div>;
  }

  if (!isAuthenticated) {
    return null; // Prevents flashing content before redirect
  }

  // If a book is open in reader, let the reader render fullscreen.
  // We can either bypass standard layout or let the layout handle reader internally.
  // The prompt says "Reader Layout: This page should become the hero of the application...".
  // Let's hide sidebar/navbar if reader is in fullscreen mode.
  const isReaderOpen = activeBookId !== null;

  return (
    <div className="flex h-screen w-screen bg-[#090909] text-[#F5F5F5] font-sans overflow-hidden">
      {/* Hide navigation elements if reader is open in fullscreen */}
      {!isReaderOpen && <Sidebar />}

      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
        {!isReaderOpen && <Navbar />}
        
        {/* Main Content Area */}
        <main className="flex-grow overflow-y-auto overflow-x-hidden w-full relative">
          <Outlet />
        </main>
      </div>

      {/* Global notification container */}
      <ToastContainer />
    </div>
  );
};

export default Layout;
