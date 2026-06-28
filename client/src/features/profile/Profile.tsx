import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLibraryStore } from '../../store/libraryStore';

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const { books } = useLibraryStore();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

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

  const storagePercentage = user ? (user.storageUsed / user.storageLimit) * 100 : 0;

  // Category counts
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    books.forEach(b => {
      stats[b.category] = (stats[b.category] || 0) + 1;
    });
    return Object.entries(stats).map(([category, count]) => ({
      category,
      count,
      percent: Math.round((count / books.length) * 100)
    })).sort((a, b) => b.count - a.count);
  }, [books]);

  // Weekly reading data
  const weeklyData = [
    { day: 'Mon', mins: 20 },
    { day: 'Tue', mins: 45 },
    { day: 'Wed', mins: 15 },
    { day: 'Thu', mins: 35 },
    { day: 'Fri', mins: 5 },
    { day: 'Sat', mins: 60 },
    { day: 'Sun', mins: 40 }
  ];

  const maxWeeklyMins = Math.max(...weeklyData.map(d => d.mins));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-12 max-w-[1200px] mx-auto flex flex-col gap-10 select-none"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-[#1f1f1f] pb-8">
        <div className="w-20 h-20 bg-[#121212] border border-[#1f1f1f] text-white flex items-center justify-center text-xl font-serif italic select-none">
          {user ? getInitials(user.name) : 'KT'}
        </div>
        
        <div className="flex-grow text-center sm:text-left">
          <span className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-mono border border-[#1f1f1f] px-2 py-0.5">
            MEMBER TYPE: CURATOR
          </span>
          <h1 className="text-xl font-serif text-white mt-2 tracking-wide font-light">
            {user?.name || 'Kenya Hara'}
          </h1>
          <p className="text-xs text-[#8D8D8D] font-light mt-1 font-mono">
            Joined {user ? formatDate(user.joinedAt) : 'June 2026'}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Left Column (8 cols) */}
        <div className="md:col-span-8 flex flex-col gap-8">
          
          {/* Storage Quota */}
          <div className="bg-[#121212] border border-[#1f1f1f] p-6">
            <h3 className="text-[10px] text-[#8D8D8D] uppercase tracking-[0.2em] font-medium border-b border-[#1f1f1f]/50 pb-2 mb-4 flex items-center justify-between">
              <span>Vault Storage Allocation</span>
              <HardDrive className="w-3.5 h-3.5" />
            </h3>
            
            <div className="flex justify-between text-xs text-[#8D8D8D] mb-2 font-light">
              <span>Used space: {user ? formatBytes(user.storageUsed) : '0 MB'}</span>
              <span>Available limit: {user ? formatBytes(user.storageLimit) : '2.0 GB'}</span>
            </div>
            
            <div className="w-full h-1 bg-[#1f1f1f] relative overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
            
            <p className="text-[10px] text-[#8D8D8D] font-light mt-3 leading-relaxed">
              Your account currently occupies {storagePercentage.toFixed(1)}% of your available vault disk storage. Duplicate detection is performed globally on all uploads to maintain storage efficiency.
            </p>
          </div>

          {/* SVG Weekly Reading Analytics */}
          <div className="bg-[#121212] border border-[#1f1f1f] p-6">
            <h3 className="text-[10px] text-[#8D8D8D] uppercase tracking-[0.2em] font-medium border-b border-[#1f1f1f]/50 pb-2 mb-6">
              Weekly Reading Cadence
            </h3>

            {/* SVG Graph */}
            <div className="relative w-full h-[200px] flex items-end justify-between px-2 pt-4">
              {weeklyData.map((data, idx) => {
                const heightPercent = (data.mins / maxWeeklyMins) * 80 + 10;
                return (
                  <div key={idx} className="flex flex-col items-center flex-grow gap-3 group">
                    <span className="text-[8px] font-mono text-[#8D8D8D] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {data.mins}m
                    </span>
                    <div className="w-5 bg-[#1a1a1a] border border-[#1f1f1f] relative overflow-hidden transition-all duration-300 group-hover:border-[#8D8D8D]/40 h-[140px] flex items-end">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="w-full bg-[#F5F5F5] group-hover:bg-white transition-colors"
                      />
                    </div>
                    <span className="text-[9px] font-mono text-[#8D8D8D] uppercase">
                      {data.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-8">
          
          {/* Category Distribution */}
          <div className="bg-[#121212] border border-[#1f1f1f] p-6">
            <h3 className="text-[10px] text-[#8D8D8D] uppercase tracking-[0.2em] font-medium border-b border-[#1f1f1f]/50 pb-2 mb-4">
              Distribution Index
            </h3>

            {categoryStats.length > 0 ? (
              <div className="space-y-4">
                {categoryStats.map((stat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-light">
                      <span className="text-[#F5F5F5]">{stat.category}</span>
                      <span className="text-[#8D8D8D] font-mono text-[10px]">{stat.count} ({stat.percent}%)</span>
                    </div>
                    <div className="w-full h-[1px] bg-[#1f1f1f]">
                      <div className="h-full bg-[#8D8D8D]" style={{ width: `${stat.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-[#8D8D8D] font-light italic leading-relaxed text-center py-4">
                Catalog empty. No distribution stats available.
              </p>
            )}
          </div>

          {/* Account Credential Validation */}
          <div className="border border-[#1f1f1f] p-5 bg-gradient-to-br from-[#121212] to-[#090909] flex flex-col gap-3">
            <h4 className="text-[9px] text-white uppercase tracking-widest font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              INTEGRITY VERIFICATION
            </h4>
            <p className="text-[10px] text-[#8D8D8D] font-light leading-relaxed">
              Your connection is cryptographically signed. All document sync runs through encrypted client endpoints.
            </p>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
