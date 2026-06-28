import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5] flex flex-col justify-center items-center px-6 select-none relative overflow-hidden">
      {/* Background visual detail */}
      <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#8D8D8D_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center flex flex-col items-center gap-6 max-w-sm"
      >
        <EyeOff className="w-8 h-8 text-[#8D8D8D]/40" />

        <div className="space-y-2">
          <h1 className="font-serif text-xl italic text-white tracking-wide">
            Presence Blank
          </h1>
          <p className="text-[10px] text-[#8D8D8D] uppercase tracking-widest font-mono">
            Error 404: Out of bounds
          </p>
        </div>

        {/* Minimal Japanese editorial text */}
        <p className="text-xs text-[#8D8D8D] font-light leading-relaxed italic border-t border-b border-[#1f1f1f] py-4 my-2">
          “In the emptiness of shadows, there is no path. Return to the vault of core knowledge.”
        </p>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/')}
        >
          Return to Dashboard
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
