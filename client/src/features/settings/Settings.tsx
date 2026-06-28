import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const Settings: React.FC = () => {
  const { user, updatePreferences } = useAuthStore();
  const { addToast } = useToastStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePreferenceChange = (key: 'theme' | 'fontSize' | 'fontFamily', value: string) => {
    updatePreferences({ [key]: value });
    addToast(`Preferences updated: ${key} set to ${value}`, 'info');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast('Please fill out all password fields.', 'error');
      return;
    }
    setIsUpdatingPassword(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsUpdatingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    addToast('Credentials updated successfully.', 'success');
  };

  const handleClearCache = () => {
    if (confirm('CAUTION: This will clear all custom books, bookmarks, and notes, resetting the vault to its factory default values. Do you wish to proceed?')) {
      localStorage.clear();
      addToast('Vault database cache flushed. Reloading catalog...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-12 max-w-[900px] mx-auto flex flex-col gap-10 select-none"
    >
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[#1f1f1f] pb-4">
        <div>
          <span className="text-[10px] text-[#8D8D8D] uppercase tracking-widest font-mono">
            PREFERENCES PANEL
          </span>
          <h1 className="text-xl font-serif text-white mt-1 italic tracking-wide">
            System Settings
          </h1>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-[#121212] border border-[#1f1f1f] p-6 space-y-6">
        <h3 className="text-[10px] text-[#8D8D8D] uppercase tracking-[0.2em] font-medium border-b border-[#1f1f1f]/50 pb-2 flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5" />
          Reading Environment Presets
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Theme */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-mono">
              System Contrast
            </span>
            <div className="flex flex-col gap-1.5 mt-1">
              {['dark', 'light', 'sepia'].map((themeOpt) => (
                <button
                  key={themeOpt}
                  onClick={() => handlePreferenceChange('theme', themeOpt)}
                  className={`text-left px-3 py-2 text-xs font-light transition-all border cursor-pointer capitalize ${
                    user?.preferences.theme === themeOpt
                      ? 'border-[#F5F5F5] text-white bg-transparent'
                      : 'border-[#1f1f1f] text-[#8D8D8D] hover:border-[#8D8D8D]/30'
                  }`}
                >
                  {themeOpt} Mode
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-mono">
              Typeface Family
            </span>
            <div className="flex flex-col gap-1.5 mt-1">
              {[
                { name: 'Inter (Sans-Serif)', val: 'sans' },
                { name: 'Georgia (Serif)', val: 'serif' },
                { name: 'Geist Mono (Monospace)', val: 'mono' }
              ].map((fontOpt) => (
                <button
                  key={fontOpt.val}
                  onClick={() => handlePreferenceChange('fontFamily', fontOpt.val)}
                  className={`text-left px-3 py-2 text-xs font-light transition-all border cursor-pointer ${
                    user?.preferences.fontFamily === fontOpt.val
                      ? 'border-[#F5F5F5] text-white bg-transparent'
                      : 'border-[#1f1f1f] text-[#8D8D8D] hover:border-[#8D8D8D]/30'
                  }`}
                >
                  {fontOpt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Font Sizes */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-mono">
              Type Scale Ratio
            </span>
            <div className="flex flex-col gap-1.5 mt-1">
              {['small', 'medium', 'large', 'xlarge'].map((sizeOpt) => (
                <button
                  key={sizeOpt}
                  onClick={() => handlePreferenceChange('fontSize', sizeOpt)}
                  className={`text-left px-3 py-2 text-xs font-light transition-all border cursor-pointer capitalize ${
                    user?.preferences.fontSize === sizeOpt
                      ? 'border-[#F5F5F5] text-white bg-transparent'
                      : 'border-[#1f1f1f] text-[#8D8D8D] hover:border-[#8D8D8D]/30'
                  }`}
                >
                  {sizeOpt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security settings */}
      <div className="bg-[#121212] border border-[#1f1f1f] p-6 space-y-6">
        <h3 className="text-[10px] text-[#8D8D8D] uppercase tracking-[0.2em] font-medium border-b border-[#1f1f1f]/50 pb-2 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          Credentials & Encryption
        </h3>

        <form onSubmit={handlePasswordReset} className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isUpdatingPassword}
          />
          <Input
            label="New Vault Key"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isUpdatingPassword}
          />
          <div className="sm:col-span-2 flex justify-end mt-2">
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password Key'}
            </Button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="border border-[#1f1f1f] p-6 space-y-6 bg-gradient-to-br from-[#121212] to-[#090909]">
        <h3 className="text-[10px] text-red-500 uppercase tracking-[0.2em] font-medium border-b border-red-500/20 pb-2 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" />
          System Maintenance (Danger Zone)
        </h3>
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h4 className="text-xs text-white font-light">
              Clear Vault Cache & Storage
            </h4>
            <p className="text-[10px] text-[#8D8D8D] font-light leading-relaxed mt-1">
              Flushes local storage indexing, logs out the user, and resets default libraries.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleClearCache}
            className="flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Database
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
