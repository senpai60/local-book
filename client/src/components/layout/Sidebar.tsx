import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  Library, 
  UploadCloud, 
  Bookmark, 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutGrid },
    { name: 'Library', path: '/library', icon: Library },
    { name: 'Upload', path: '/upload', icon: UploadCloud },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Helper to format bytes to MB
  const formatMB = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const storagePercentage = user ? (user.storageUsed / user.storageLimit) * 100 : 0;

  return (
    <motion.div
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col h-full bg-[#121212] border-r border-[#1f1f1f] relative select-none shrink-0"
    >
      {/* Brand logo header */}
      <div className="h-16 flex items-center px-5 border-b border-[#1f1f1f] justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <BookOpen className="w-5 h-5 text-white shrink-0" />
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs uppercase tracking-[0.25em] font-light text-white"
            >
              BookVault
            </motion.span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#8D8D8D] hover:text-[#F5F5F5] p-1 border border-transparent hover:border-[#1f1f1f] cursor-pointer shrink-0"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-grow py-6 px-3 flex flex-col gap-1.5">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3.5 px-3 py-2.5 text-xs font-light transition-all duration-200 border-l border-transparent hover:text-white ${
                isActive 
                  ? 'text-white border-l-[#F5F5F5] bg-[#1a1a1a]/40 font-normal' 
                  : 'text-[#8D8D8D]'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="truncate"
              >
                {item.name}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile & Storage block at the bottom */}
      <div className="p-4 border-t border-[#1f1f1f]">
        {user && !isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4"
          >
            {/* Storage Progress */}
            <div className="flex justify-between text-[9px] text-[#8D8D8D] tracking-wider mb-1 font-light uppercase">
              <span>Storage Used</span>
              <span>{formatMB(user.storageUsed)}</span>
            </div>
            <div className="w-full h-[1px] bg-[#1f1f1f]">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* User Card */}
        <div className="flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-none border border-[#1f1f1f] bg-[#090909] text-[#F5F5F5] flex items-center justify-center text-[10px] font-mono shrink-0">
              {user ? getInitials(user.name) : 'KT'}
            </div>
            {!isCollapsed && user && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-xs font-light text-[#F5F5F5] truncate">{user.name}</span>
                <span className="text-[9px] text-[#8D8D8D] truncate font-light font-mono">{user.email}</span>
              </motion.div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            title="Log Out"
            className="text-[#8D8D8D] hover:text-[#F5F5F5] p-1.5 hover:bg-[#1f1f1f] rounded-none shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
