import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
            layout
            className="bg-[#121212] border border-[#1f1f1f] p-4 flex items-start gap-3 relative select-none"
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-[#F5F5F5] mt-0.5" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500/80 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#8D8D8D] mt-0.5" />}
            
            <div className="flex-grow pr-4">
              <p className="text-xs text-[#F5F5F5] font-light leading-relaxed">
                {toast.message}
              </p>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#8D8D8D] hover:text-[#F5F5F5] transition-colors p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
