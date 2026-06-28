import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast('Please fill out all fields.', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }
    const success = await register(name, email, password);
    if (success) {
      addToast('Vault initialized successfully.', 'success');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5] flex flex-col justify-center px-6 py-12 select-none relative overflow-hidden">
      {/* Background grain texture effect */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#8D8D8D_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col gap-6 items-center"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-white" />
          <span className="text-sm uppercase tracking-[0.3em] font-light text-white">
            BookVault
          </span>
        </div>

        <div className="w-full bg-[#121212] border border-[#1f1f1f] p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-lg font-serif italic text-white tracking-wide">
              Initialize Your Vault
            </h2>
            <p className="text-[10px] text-[#8D8D8D] uppercase tracking-widest font-light mt-1.5">
              Establish a library of pure focus.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g., Kenya Hara"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g., curator@bookvault.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />

            <Input
              label="Password (6+ characters)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-red-500/80 bg-red-950/10 border border-red-950/30 p-3 text-[11px] font-light tracking-wide"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Creating Vault...' : 'Initialize Library'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#1f1f1f] text-center">
            <span className="text-[10px] text-[#8D8D8D] font-light tracking-wide uppercase">
              Already have a vault?{' '}
              <Link 
                to="/auth/login" 
                className="text-white hover:underline transition-all underline-offset-4 ml-1"
              >
                Access Library
              </Link>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
