import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, BookOpen, LayoutGrid, Library, UploadCloud, Bookmark, User, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/auth/login');
  };

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'Dashboard';
      case '/library': return 'Library';
      case '/upload': return 'Upload Vault';
      case '/bookmarks': return 'Bookmarks';
      case '/profile': return 'Profile';
      case '/settings': return 'Preferences';
      default: return 'BookVault';
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutGrid },
    { name: 'Library', path: '/library', icon: Library },
    { name: 'Upload', path: '/upload', icon: UploadCloud },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-full h-16 bg-[#121212] border-b border-[#1f1f1f] flex items-center justify-between px-6 md:hidden relative select-none z-40">
      <div className="flex items-center gap-2.5">
        <BookOpen className="w-5 h-5 text-white" />
        <span className="text-xs uppercase tracking-widest font-light text-white">
          {getPageTitle(location.pathname)}
        </span>
      </div>

      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="text-[#8D8D8D] hover:text-[#F5F5F5] p-1 cursor-pointer"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 bg-[#121212] border-b border-[#1f1f1f] py-4 px-6 flex flex-col gap-2.5 z-50"
          >
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 py-3 text-xs font-light transition-all border-b border-transparent ${
                    isActive ? 'text-white border-b-[#F5F5F5]' : 'text-[#8D8D8D]'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3.5 py-3 text-xs font-light text-red-500 hover:text-red-400 mt-2 border-t border-[#1f1f1f] pt-4 cursor-pointer text-left w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
